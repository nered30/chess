// 퍼즐 화면
import { Chess } from 'chess.js';
import { Board } from '../board/board.js';
import { getMainEngine } from '../engine/browser.js';
import { uciToObj } from '../analysis/analyzer.js';
import { applyPuzzle, getRatings } from '../rating/ratings.js';
import { isProvisional } from '../rating/glicko2.js';
import { load, save } from '../storage/storage.js';
import { $, esc } from '../ui/dom.js';
import { KINDS } from './generator.js';
import { counts, onPoolChange, setPriority, takePuzzle } from './pool.js';
import { judgeAttempt, opponentReply } from './judge.js';

const MODES = [['mix', '맞춤'], ...Object.entries(KINDS).map(([k, v]) => [k, v.label])];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function mount(root, ctx) {
  const engine = getMainEngine();
  let mode = load('puzzleMode', 'mix');
  let cur = null; // 현재 퍼즐 상태
  let alive = true;
  let unsub = null;

  root.innerHTML = `
    <div class="bar"><span class="name">퍼즐</span><span class="muted" id="prating"></span></div>
    <div class="panel row" id="modes" style="padding-top:0">${MODES.map(([k, t]) => `<button class="btn" data-m="${k}">${t}</button>`).join('')}</div>
    <div id="board"></div>
    <div class="coach" id="msg"></div>
    <div class="panel row" id="actions"></div>
    <div class="panel muted" id="pool"></div>`;

  const board = new Board($('#board', root), {
    canMove: () => (cur && cur.state === 'play' && !cur.busy ? cur.color : null),
    onMove: (from, to, promo) => userMove(from + to + (promo || '')),
  });

  $('#modes', root).onclick = (e) => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    mode = b.dataset.m;
    save('puzzleMode', mode);
    next();
  };

  function renderHeader() {
    const r = getRatings().puzzle;
    $('#prating', root).textContent = `퍼즐 레이팅 ${r.r}${isProvisional(r) ? '?' : ''}`;
    root.querySelectorAll('#modes .btn').forEach((x) => x.classList.toggle('sel', x.dataset.m === mode));
  }

  function renderPool() {
    const c = counts();
    $('#pool', root).textContent = '준비된 퍼즐: ' + Object.entries(KINDS).map(([k, v]) => `${v.label} ${c[k]}`).join(' · ');
  }

  function msg(html, color) {
    const el = $('#msg', root);
    el.innerHTML = html;
    el.style.borderLeftColor = color || 'var(--dim)';
  }

  function actions(html) {
    $('#actions', root).innerHTML = html;
  }

  function goalText(p, color) {
    const side = color === 'w' ? '백' : '흑';
    const n = p.n ?? KINDS[p.kind]?.n;
    if (p.kind === 'sacmate') return `${side} 차례 · <b>${n}수 안에 메이트</b>하세요<br><span class="muted">과감한 희생이 숨어 있어요!</span>`;
    if (p.kind === 'opening') {
      const op = p.opening ? ` (${esc(p.opening)})` : '';
      const goal = p.goal === 'mate' ? `${n}수 안에 메이트` : '이기는 수';
      return `${side} 차례 · 오프닝 함정${op}<br><b>${goal}</b>를 찾으세요`;
    }
    if (p.goal === 'best') return `${side} 차례 · <b>최선의 수</b>를 찾으세요<br><span class="muted">다른 수를 두면 크게 불리해져요</span>`;
    if (p.goal === 'mate') return `${side} 차례 · <b>${n}수 안에 메이트</b>하세요`;
    if (p.goal === 'draw') return `${side} 차례 · <b>비기는 수</b>를 찾으세요`;
    if (p.kind === 'endgame') return `${side} 차례 · <b>이기는 수</b>를 찾으세요 (엔드게임)`;
    return `${side} 차례 · <b>가장 좋은 수</b>를 찾으세요`;
  }

  async function next() {
    renderHeader();
    renderPool();
    board.setArrows([]);
    board.setMarks({});
    const myRating = getRatings().puzzle.r;
    const p = takePuzzle(mode, myRating);
    if (!p) {
      cur = null;
      setPriority(mode);
      msg('새 퍼즐을 만드는 중이에요… 어려운 퍼즐(4~5수 메이트)은 시간이 조금 걸려요.');
      actions('');
      unsub?.();
      unsub = onPoolChange(() => {
        renderPool();
        const c = counts();
        const ready = mode === 'mix' ? Object.values(c).some(Boolean) : c[mode] > 0;
        if (!cur && ready) {
          unsub();
          unsub = null;
          next();
        }
      });
      return;
    }
    setPriority(null);
    const color = new Chess(p.fen).turn();
    cur = {
      p,
      color,
      fen: p.fen,
      idx: 0, // solution 안에서 다음에 둘 수의 위치
      engineMode: false,
      failed: false,
      hinted: false,
      state: 'play',
      busy: true,
      playerMovesLeft: Math.ceil(p.solution.length / 2),
    };
    board.setOrientation(color);
    if (p.startFen && p.setup) {
      board.setFen(p.startFen);
      board.setLastMove(null);
      await sleep(500);
      if (!alive || cur?.p !== p) return;
      board.setFen(p.fen);
      board.setLastMove(p.setup.slice(0, 2), p.setup.slice(2, 4));
    } else {
      board.setFen(p.fen);
      board.setLastMove(null);
    }
    cur.busy = false;
    msg(`${goalText(p, color)}<br><span class="muted">난이도 ${p.rating}</span>`);
    actions(`<button class="btn grow" id="hint">힌트</button><button class="btn grow" id="sol">정답 보기</button><button class="btn" id="skip">건너뛰기</button>`);
    $('#hint', root).onclick = hint;
    $('#sol', root).onclick = showSolution;
    $('#skip', root).onclick = () => {
      if (cur && cur.state === 'play') finish(false, true);
      next();
    };
  }

  function hint() {
    if (!cur || cur.state !== 'play' || cur.engineMode) return;
    cur.hinted = true;
    const mv = cur.p.solution[cur.idx];
    board.setMarks({ [mv.slice(0, 2)]: 'good' });
    msg('힌트: 표시된 기물을 움직여 보세요. (힌트를 쓰면 실패로 기록돼요)');
  }

  async function userMove(uci) {
    const c = cur;
    if (!c || c.state !== 'play' || c.busy) return;
    c.busy = true;
    board.setMarks({});
    const expected = c.engineMode ? null : c.p.solution[c.idx];
    const before = c.fen;
    // 일단 판에 보여주기
    const chess = new Chess(before);
    let m;
    try {
      m = chess.move(uciToObj(uci));
    } catch {
      c.busy = false;
      return;
    }
    board.setFen(chess.fen());
    board.setLastMove(m.from, m.to);
    if (uci !== expected && !chess.isCheckmate()) msg('확인 중…');
    const j = await judgeAttempt(engine, c.p, before, uci, expected, c.playerMovesLeft);
    if (!alive || cur !== c) return;
    if (!j.ok) {
      board.setMarks({ [m.to]: 'bad' });
      msg('<span class="err">틀렸어요.</span> 다시 해보거나 정답을 확인하세요.', 'var(--bad)');
      if (!c.failed) {
        c.failed = true;
        const r = applyPuzzle(c.p.rating, false);
        renderHeader();
        msg(`<span class="err">틀렸어요.</span> 레이팅 ${r.after} (${r.diff}) · 다시 해보거나 정답을 확인하세요.`, 'var(--bad)');
      }
      await sleep(700);
      if (cur !== c) return;
      board.setFen(before);
      board.setMarks({});
      c.busy = false;
      return;
    }
    board.setMarks({ [m.to]: 'good' });
    c.fen = chess.fen();
    c.playerMovesLeft--;
    if (j.alt) c.engineMode = true;
    c.idx++;
    if (j.mate || c.playerMovesLeft <= 0 || chess.isGameOver()) {
      finish(true);
      return;
    }
    msg('<span class="ok">좋아요!</span> 계속하세요.', 'var(--accent)');
    // 상대 응수
    await sleep(350);
    const reply = c.engineMode ? await opponentReply(engine, c.fen) : c.p.solution[c.idx];
    if (!alive || cur !== c) return;
    if (!reply) {
      finish(true);
      return;
    }
    const c2 = new Chess(c.fen);
    const rm = c2.move(uciToObj(reply));
    c.fen = c2.fen();
    c.idx++;
    board.setMarks({});
    board.setFen(c.fen);
    board.setLastMove(rm.from, rm.to);
    c.busy = false;
  }

  function finish(success, skipped = false) {
    const c = cur;
    c.state = 'done';
    let text;
    if (success && !c.failed && !c.hinted) {
      const r = applyPuzzle(c.p.rating, true);
      text = `<span class="ok">정답이에요!</span> 레이팅 ${r.after} (+${r.diff})`;
    } else if (success) {
      if (c.hinted && !c.failed) applyPuzzle(c.p.rating, false);
      text = '<span class="ok">풀었어요.</span> (힌트/오답이 있어서 실패로 기록)';
    } else {
      if (!c.failed) applyPuzzle(c.p.rating, false);
      text = '정답을 확인했어요.';
    }
    const stats = load('puzzleStats', { solved: 0, failed: 0 });
    if (success && !c.failed && !c.hinted) stats.solved++;
    else stats.failed++;
    save('puzzleStats', stats);
    renderHeader();
    if (skipped) return;
    const theme = c.p.theme ? ` · ${esc(c.p.theme)}` : '';
    msg(`${text}<br><span class="muted">${esc(KINDS[c.p.kind]?.label || '퍼즐')}${theme} · 난이도 ${c.p.rating}</span>`, success ? 'var(--accent)' : 'var(--dim)');
    actions(`<button class="btn primary grow" id="next">다음 퍼즐</button><button class="btn" id="an">분석</button>`);
    $('#next', root).onclick = next;
    $('#an', root).onclick = () => {
      const moves = [];
      let start = c.p.fen;
      if (c.p.startFen && c.p.setup) {
        start = c.p.startFen;
        moves.push(c.p.setup);
      }
      ctx.go('analysis', { startFen: start, moves: moves.concat(c.p.solution), title: `퍼즐 (${KINDS[c.p.kind]?.label || ''})` });
    };
  }

  async function showSolution() {
    const c = cur;
    if (!c || c.state !== 'play' || c.busy) return;
    c.busy = true;
    finish(false);
    // 처음부터 정답 수순을 보여줍니다
    let fen = c.p.fen;
    board.setFen(fen);
    board.setMarks({});
    for (const mv of c.p.solution) {
      await sleep(700);
      if (!alive || cur !== c) return;
      const ch = new Chess(fen);
      const m = ch.move(uciToObj(mv));
      fen = ch.fen();
      board.setFen(fen);
      board.setLastMove(m.from, m.to);
    }
  }

  renderHeader();
  next();

  return () => {
    alive = false;
    unsub?.();
    // 풀던 퍼즐을 그냥 떠나면 레이팅은 바꾸지 않습니다
  };
}
