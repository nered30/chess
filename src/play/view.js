// 대국 화면: AI 와 대국 + 코치 모드(내 수를 바로 평가하고, 실수면 최선수 안내)
import { Chess } from 'chess.js';
import { Board } from '../board/board.js';
import { getMainEngine } from '../engine/browser.js';
import { LEVELS, levelById } from '../engine/levels.js';
import { evalPosition, judgeMove, uciToObj } from '../analysis/analyzer.js';
import { CLASSES, needsHint } from '../analysis/classify.js';
import { openingOfGame } from '../openings/openings.js';
import { applyGame, getRatings } from '../rating/ratings.js';
import { isProvisional } from '../rating/glicko2.js';
import { load, save } from '../storage/storage.js';
import { renderMoves } from '../ui/movelist.js';
import { $, esc } from '../ui/dom.js';
import { saveGame } from './history.js';

const START = new Chess().fen();

// 진행 중인 대국 (탭을 옮겨도 유지됩니다)
let state = null;

export function mount(root, ctx) {
  const prefs = load('playPrefs', { level: 4, color: 'w', coach: true });
  const engine = getMainEngine();

  if (state) buildGameScreen();
  else showSetup();

  function showSetup() {
    const r = getRatings().game;
    root.innerHTML = `
      <div class="panel">
        <h2>AI 와 대국</h2>
        <div class="muted">내 대국 레이팅: <b>${r.r}${isProvisional(r) ? '?' : ''}</b></div>
        <h2>AI 수준</h2>
        <div class="row" id="levels">${LEVELS.map((l) => `<button class="btn ${l.id === prefs.level ? 'sel' : ''}" data-l="${l.id}">${l.id}</button>`).join('')}</div>
        <div class="muted" id="lvinfo"></div>
        <h2>내 색</h2>
        <div class="row" id="colors">
          ${[['w', '백'], ['random', '랜덤'], ['b', '흑']].map(([c, t]) => `<button class="btn grow ${prefs.color === c ? 'sel' : ''}" data-c="${c}">${t}</button>`).join('')}
        </div>
        <h2>코치 모드</h2>
        <div class="row" id="coach">
          <button class="btn grow ${prefs.coach ? 'sel' : ''}" data-v="1">켜기</button>
          <button class="btn grow ${!prefs.coach ? 'sel' : ''}" data-v="0">끄기</button>
        </div>
        <div class="muted" style="margin-top:6px">켜면 내가 둔 수마다 등급을 알려주고, 실수하면 최선수를 보여줘요.</div>
        <div class="row" style="margin-top:20px"><button class="btn primary grow" id="start">대국 시작</button></div>
      </div>`;
    const info = () => {
      const l = levelById(prefs.level);
      $('#lvinfo', root).textContent = `레벨 ${l.id} · 약 ${l.elo} Elo (추정)`;
    };
    info();
    $('#levels', root).onclick = (e) => {
      const b = e.target.closest('[data-l]');
      if (!b) return;
      prefs.level = +b.dataset.l;
      root.querySelectorAll('#levels .btn').forEach((x) => x.classList.toggle('sel', x === b));
      info();
    };
    $('#colors', root).onclick = (e) => {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      prefs.color = b.dataset.c;
      root.querySelectorAll('#colors .btn').forEach((x) => x.classList.toggle('sel', x === b));
    };
    $('#coach', root).onclick = (e) => {
      const b = e.target.closest('[data-v]');
      if (!b) return;
      prefs.coach = b.dataset.v === '1';
      root.querySelectorAll('#coach .btn').forEach((x) => x.classList.toggle('sel', x === b));
    };
    $('#start', root).onclick = () => {
      save('playPrefs', prefs);
      const color = prefs.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : prefs.color;
      startGame(color, levelById(prefs.level), prefs.coach);
    };
  }

  async function startGame(color, level, coach) {
    state = {
      chess: new Chess(),
      moves: [],
      sans: [],
      cls: [],
      fens: [START],
      color,
      level,
      coach,
      rated: true,
      over: false,
      thinking: false,
      evalCache: {},
      coachHtml: coach ? '코치가 내 수를 평가해 줄게요.' : '',
    };
    buildGameScreen();
    await engine.ready;
    await engine.newGame();
    if (color === 'b') aiMove();
  }

  // 대국 화면을 (다시) 그립니다
  function buildGameScreen() {
    const { level, coach, color } = state;
    root.innerHTML = `
      <div class="bar"><span class="name">Stockfish 레벨 ${level.id}</span><span class="muted">약 ${level.elo}</span></div>
      <div id="board"></div>
      <div class="bar"><span class="name">나</span><span class="muted" id="status"></span></div>
      <div class="opening" id="opening"></div>
      <div class="coach" id="coachbox" ${coach ? '' : 'hidden'}>${state.coachHtml}</div>
      <div class="moves" id="moves"></div>
      <div class="panel row" id="actions"></div>`;
    state.board = new Board($('#board', root), {
      canMove: () => (state && !state.over && !state.thinking ? state.color : null),
      onMove: (from, to, promo) => userMove(from, to, promo),
    });
    state.board.setOrientation(color);
    state.board.setFen(state.chess.fen());
    const last = state.moves[state.moves.length - 1];
    if (last) state.board.setLastMove(last.slice(0, 2), last.slice(2, 4));
    if (state.arrows) state.board.setArrows(state.arrows);
    renderActions();
    renderInfo();
  }

  function setCoach(html, color) {
    state.coachHtml = html;
    const box = visible() && $('#coachbox', root);
    if (box) {
      box.innerHTML = html;
      if (color) box.style.borderLeftColor = color;
    }
  }

  function setArrows(arrows) {
    state.arrows = arrows;
    state.board.setArrows(arrows);
  }

  // 다른 탭이 열려 있으면 화면은 그리지 않습니다 (대국 상태만 갱신)
  const visible = () => root.dataset.view === 'play' && $('#board', root);

  function renderInfo() {
    if (!visible()) return;
    const s = state;
    renderMoves($('#moves', root), s.sans, { cls: s.cls });
    const op = openingOfGame(s.fens);
    $('#opening', root).innerHTML = op ? `<b>${esc(op.eco)}</b> ${esc(op.name)}` : '';
    let st = '';
    if (s.over) st = s.resultText;
    else if (s.thinking) st = 'AI 생각 중…';
    else st = s.chess.turn() === s.color ? '내 차례' : '';
    $('#status', root).textContent = st;
  }

  function renderActions() {
    if (!visible()) return;
    const s = state;
    const el = $('#actions', root);
    if (s.over) {
      el.innerHTML = `<button class="btn primary grow" id="an">분석하기</button><button class="btn grow" id="new">새 대국</button><button class="btn" id="flip">⇅</button>`;
      $('#an', root).onclick = () => ctx.go('analysis', { startFen: START, moves: s.moves, title: s.title });
      $('#new', root).onclick = () => {
        state = null;
        showSetup();
      };
    } else {
      el.innerHTML = `<button class="btn" id="flip">⇅</button><button class="btn grow" id="undo">무르기</button><button class="btn grow" id="resign">기권</button>`;
      $('#undo', root).onclick = takeback;
      $('#resign', root).onclick = () => {
        if (confirm('기권할까요?')) finish(0, '기권했어요');
      };
    }
    $('#flip', root).onclick = () => s.board.flip();
  }

  function applyMove(uci) {
    const s = state;
    const m = s.chess.move(uciToObj(uci));
    s.moves.push(uci);
    s.sans.push(m.san);
    s.cls.push(null);
    s.fens.push(s.chess.fen());
    s.board.setFen(s.chess.fen());
    s.board.setLastMove(m.from, m.to);
    return m;
  }

  async function userMove(from, to, promo) {
    const s = state;
    if (!s || s.over || s.thinking) return;
    const uci = from + to + (promo || '');
    const fenBefore = s.chess.fen();
    applyMove(uci);
    setArrows([]);
    const idx = s.moves.length - 1;
    s.thinking = true;
    renderInfo();
    if (checkEnd()) return;
    if (s.coach) await coachMove(idx, fenBefore, uci);
    if (state !== s || s.over) return;
    await aiMove();
  }

  async function coachMove(idx, fenBefore, uci) {
    const s = state;
    setCoach('평가 중…');
    const before = s.evalCache[fenBefore] || (await evalPosition(engine, fenBefore, 12));
    const fenAfter = s.fens[idx + 1];
    const after = await evalPosition(engine, fenAfter, 12);
    s.evalCache[fenAfter] = after;
    if (state !== s) return;
    const j = judgeMove({ fenBefore, fenAfter, uci, before, after, ply: idx });
    s.cls[idx] = j.cls;
    const c = CLASSES[j.cls];
    let html = `<b style="color:${c.color}">${esc(s.sans[idx])}${c.sym && c.sym !== '📖' ? c.sym : ''} — ${c.label}</b>`;
    if (needsHint(j.cls) && j.bestSan) {
      html += `<br>최선수는 <b>${esc(j.bestSan)}</b> 였어요. (판 위 화살표)`;
      setArrows([{ from: j.best.slice(0, 2), to: j.best.slice(2, 4), color: '#15781b' }]);
    }
    setCoach(html, c.color);
    renderInfo();
  }

  async function aiMove() {
    const s = state;
    s.thinking = true;
    renderInfo();
    const res = await engine.search({ fen: START, moves: s.moves, options: s.level.options, ...s.level.go });
    if (state !== s || s.over) return;
    s.thinking = false;
    if (res.bestmove) {
      applyMove(res.bestmove);
      // 코치 모드: AI 수 이후 포지션 평가를 미리 저장해 두면 내 다음 수 평가가 빨라집니다
    }
    renderInfo();
    checkEnd();
  }

  function takeback() {
    const s = state;
    if (s.thinking || s.over) return;
    // 내 차례가 될 때까지 되돌립니다
    let n = s.chess.turn() === s.color ? 2 : 1;
    n = Math.min(n, s.moves.length);
    if (!n || (s.color === 'b' && s.moves.length - n < 1)) return;
    for (let i = 0; i < n; i++) {
      s.chess.undo();
      s.moves.pop();
      s.sans.pop();
      s.cls.pop();
      s.fens.pop();
    }
    s.rated = false; // 무르기를 쓰면 레이팅에 반영하지 않습니다
    s.board.setFen(s.chess.fen());
    s.board.setLastMove(null);
    setArrows([]);
    setCoach('무르기를 해서 이 대국은 레이팅에 반영되지 않아요.');
    renderInfo();
  }

  function checkEnd() {
    const s = state;
    const c = s.chess;
    if (!c.isGameOver()) return false;
    if (c.isCheckmate()) {
      const winner = c.turn() === 'w' ? 'b' : 'w';
      finish(winner === s.color ? 1 : 0, winner === s.color ? '체크메이트! 이겼어요' : '체크메이트 당했어요');
    } else {
      let why = '무승부';
      if (c.isStalemate()) why = '스테일메이트 무승부';
      else if (c.isThreefoldRepetition()) why = '3회 반복 무승부';
      else if (c.isInsufficientMaterial()) why = '기물 부족 무승부';
      finish(0.5, why);
    }
    return true;
  }

  function finish(score, text) {
    const s = state;
    s.over = true;
    s.thinking = false;
    engine.stop();
    let ratingText = '';
    if (s.rated && s.moves.length >= 4) {
      const r = applyGame(s.level.elo, score);
      ratingText = ` · 레이팅 ${r.after} (${r.diff >= 0 ? '+' : ''}${r.diff})`;
    } else {
      ratingText = ' · 레이팅 미반영';
    }
    s.resultText = text + ratingText;
    s.title = `레벨 ${s.level.id} 상대 (${s.color === 'w' ? '백' : '흑'}) · ${text}`;
    saveGame({
      startFen: START,
      moves: s.moves,
      color: s.color,
      level: s.level.id,
      score,
      rated: s.rated,
      title: s.title,
      opening: openingOfGame(s.fens)?.name || null,
    });
    renderActions();
    renderInfo();
  }

  // 탭을 옮겨도 AI 계산은 계속되고, 돌아오면 이어서 둡니다
  return () => {};
}
