// 분석 화면: 저장된 대국/PGN/FEN 을 불러와 수마다 등급, 정확도, 최선수를 보여줍니다.
import { Chess } from 'chess.js';
import { Board } from '../board/board.js';
import { getMainEngine } from '../engine/browser.js';
import { listGames } from '../play/history.js';
import { lookupOpening } from '../openings/openings.js';
import { renderMoves } from '../ui/movelist.js';
import { $, esc, fmtEval, whiteBarPct } from '../ui/dom.js';
import { analyzeGame } from './analyzer.js';
import { CLASSES, needsHint } from './classify.js';

const ORDER = ['brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'blunder'];

// 마지막 분석 결과를 기억해서 탭을 옮겨도 다시 계산하지 않습니다
let last = null;

export function mount(root, ctx, payload) {
  const engine = getMainEngine();
  let alive = true;
  let runId = 0; // 분석을 새로 시작하거나 취소하면 바뀝니다
  let running = false;

  if (payload) {
    runAnalysis(payload);
  } else if (last) {
    showResult(last.game, last.result);
  } else {
    showPicker();
  }

  function showPicker() {
    const games = listGames();
    root.innerHTML = `
      <div class="panel">
        <h2>PGN 또는 FEN 붙여넣기</h2>
        <textarea id="pgn" placeholder="1. e4 e5 2. Nf3 ... 또는 FEN"></textarea>
        <div class="row" style="margin-top:6px"><button class="btn primary grow" id="go">분석하기</button></div>
        <div class="muted err" id="err"></div>
        <h2>내 대국</h2>
      </div>
      <div id="games">${
        games.length
          ? games
              .map(
                (g, i) =>
                  `<div class="list-item" data-i="${i}"><span>${esc(g.title || '대국')}<br><span class="muted">${esc(g.opening || '')}</span></span><span class="muted">${new Date(g.date).toLocaleDateString()}</span></div>`,
              )
              .join('')
          : '<div class="panel muted">아직 둔 대국이 없어요.</div>'
      }</div>`;
    $('#games', root).onclick = (e) => {
      const it = e.target.closest('[data-i]');
      if (!it) return;
      const g = games[+it.dataset.i];
      runAnalysis({ startFen: g.startFen, moves: g.moves, title: g.title });
    };
    $('#go', root).onclick = () => {
      const text = $('#pgn', root).value.trim();
      try {
        runAnalysis(parseInput(text));
      } catch (e) {
        $('#err', root).textContent = '읽을 수 없는 PGN/FEN 이에요.';
      }
    };
  }

  function parseInput(text) {
    const c = new Chess();
    if (/^[rnbqkpRNBQKP1-8]+(\/[rnbqkpRNBQKP1-8]+){7}\s/.test(text)) {
      c.load(text);
      return { startFen: c.fen(), moves: [], title: 'FEN 포지션' };
    }
    c.loadPgn(text);
    const startFen = c.getHeaders().FEN || new Chess().fen();
    const moves = c.history({ verbose: true }).map((m) => m.from + m.to + (m.promotion || ''));
    return { startFen, moves, title: 'PGN 대국' };
  }

  async function runAnalysis(game) {
    root.innerHTML = `
      <div class="panel"><h2>${esc(game.title || '분석')}</h2><div class="muted" id="pg">엔진 분석 중… 0%</div></div>
      <div class="progress"><div id="bar"></div></div>
      <div class="panel row"><button class="btn" id="cancel">취소</button></div>`;
    const my = ++runId;
    $('#cancel', root).onclick = () => {
      runId++;
      engine.stop();
      showPicker();
    };
    await engine.ready;
    running = true;
    const result = await analyzeGame(engine, game, {
      depth: 14,
      shouldStop: () => my !== runId || !alive,
      onProgress: (i, n) => {
        if (!alive || !$('#bar', root)) return;
        const pct = Math.round((i / n) * 100);
        $('#bar', root).style.width = pct + '%';
        $('#pg', root).textContent = `엔진 분석 중… ${pct}% (${i}/${n})`;
      },
    });
    if (my !== runId) return;
    running = false;
    if (!result || !alive) return;
    last = { game, result };
    showResult(game, result);
  }

  function showResult(game, res) {
    const n = res.moves.length;
    let idx = n - 1; // -1 = 시작 포지션
    const startBlack = res.fens[0].split(' ')[1] === 'b';
    const firstNo = +res.fens[0].split(' ')[5] || 1;
    root.innerHTML = `
      <div class="evalbar"><div id="ev"></div></div>
      <div id="board"></div>
      <div class="bar"><span class="muted" id="evtxt"></span><span class="row"><button class="btn" id="flip">⇅</button><button class="btn" id="first">⏮</button><button class="btn" id="prev">◀</button><button class="btn" id="next">▶</button><button class="btn" id="lastb">⏭</button></span></div>
      <div class="opening" id="opening"></div>
      <div class="coach" id="info"></div>
      <div class="moves" id="moves"></div>
      <canvas class="graph" id="graph" style="margin-top:8px"></canvas>
      <div class="panel" id="summary"></div>
      <div class="panel row"><button class="btn grow" id="new">다른 대국 분석</button></div>`;
    const board = new Board($('#board', root), { canMove: () => null });
    if (startBlack && n === 0) board.setOrientation('b');

    $('#flip', root).onclick = () => board.flip();
    $('#first', root).onclick = () => go(-1);
    $('#prev', root).onclick = () => go(Math.max(-1, idx - 1));
    $('#next', root).onclick = () => go(Math.min(n - 1, idx + 1));
    $('#lastb', root).onclick = () => go(n - 1);
    $('#new', root).onclick = () => {
      last = null;
      showPicker();
    };

    renderSummary(res);
    drawGraph(res, $('#graph', root), (i) => go(i));

    function go(i) {
      idx = i;
      const fen = res.fens[idx + 1];
      board.setFen(fen);
      const mv = res.moves[idx];
      board.setLastMove(mv ? mv.uci.slice(0, 2) : null, mv ? mv.uci.slice(2, 4) : null);
      const evw = idx < 0 ? res.startEvalWhite : mv.evalWhite;
      $('#ev', root).style.width = whiteBarPct(evw) + '%';
      $('#evtxt', root).textContent = `평가 ${fmtEval(evw)}`;
      const op = lookupOpening(fen);
      $('#opening', root).innerHTML = op ? `<b>${esc(op.eco)}</b> ${esc(op.name)}` : '';

      // 화살표: 이 수가 실수였다면 "뒀어야 할 최선수"(빨간 수 대신 초록), 아니면 지금 포지션의 최선수(파랑)
      const arrows = [];
      let html = '';
      if (mv) {
        const c = CLASSES[mv.cls];
        const no = Math.floor((idx + (startBlack ? 1 : 0)) / 2) + firstNo;
        const dots = mv.color === 'w' ? '.' : '…';
        html = `<b style="color:${c.color}">${no}${dots} ${esc(mv.san)}${c.sym && c.sym !== '📖' ? c.sym : ''} — ${c.label}</b> <span class="muted">정확도 ${Math.round(mv.acc)}%</span>`;
        if (mv.why) html += `<div class="why">${esc(mv.why).replace(/\n/g, '<br>')}</div>`;
        if (needsHint(mv.cls) && mv.bestSan) {
          html += `<div class="muted">초록 화살표 = 최선수 ${esc(mv.bestSan)}</div>`;
          arrows.push({ from: mv.best.slice(0, 2), to: mv.best.slice(2, 4), color: '#15781b' });
        }
      } else {
        html = '<span class="muted">시작 포지션</span>';
      }
      const nextBest = res.bests[idx + 1];
      if (nextBest) {
        arrows.push({ from: nextBest.slice(0, 2), to: nextBest.slice(2, 4), color: '#003088' });
        html += '<br><span class="muted">파란 화살표 = 지금 포지션의 엔진 최선수</span>';
      }
      board.setArrows(arrows);
      $('#info', root).innerHTML = html;
      $('#info', root).style.borderLeftColor = mv ? CLASSES[mv.cls].color : 'var(--dim)';
      renderMoves($('#moves', root), res.moves.map((m) => m.san), {
        cls: res.moves.map((m) => m.cls),
        cur: idx,
        startBlack,
        firstNo,
        onClick: go,
      });
    }

    go(idx);
  }

  function renderSummary(res) {
    const row = (cls) => {
      const c = CLASSES[cls];
      return `<div class="stat"><span style="color:${c.color}">${c.sym && c.sym !== '📖' ? c.sym + ' ' : ''}${c.label}</span><span><b>${res.counts.w[cls] || 0}</b> · <b>${res.counts.b[cls] || 0}</b></span></div>`;
    };
    const acc = (v) => (v == null ? '-' : Math.round(v) + '%');
    $('#summary', root).innerHTML = `
      <div class="stat"><span>정확도 (백 · 흑)</span><span><b>${acc(res.accuracy.w)}</b> · <b>${acc(res.accuracy.b)}</b></span></div>
      ${ORDER.map(row).join('')}`;
  }

  function drawGraph(res, canvas, onPick) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    const vals = [res.startEvalWhite, ...res.moves.map((m) => m.evalWhite)].map((v) => whiteBarPct(v) / 100);
    const x = (i) => (vals.length < 2 ? 0 : (i / (vals.length - 1)) * w);
    g.fillStyle = '#ddd';
    g.beginPath();
    g.moveTo(0, h);
    vals.forEach((v, i) => g.lineTo(x(i), h - v * h));
    g.lineTo(w, h);
    g.fill();
    g.strokeStyle = '#555';
    g.beginPath();
    g.moveTo(0, h / 2);
    g.lineTo(w, h / 2);
    g.stroke();
    res.moves.forEach((m, i) => {
      if (m.cls === 'blunder' || m.cls === 'mistake' || m.cls === 'brilliant') {
        g.fillStyle = CLASSES[m.cls].color;
        g.beginPath();
        g.arc(x(i + 1), h - vals[i + 1] * h, 3, 0, Math.PI * 2);
        g.fill();
      }
    });
    canvas.onclick = (e) => {
      const r = canvas.getBoundingClientRect();
      const i = Math.round(((e.clientX - r.left) / r.width) * (vals.length - 1)) - 1;
      onPick(Math.max(-1, Math.min(res.moves.length - 1, i)));
    };
  }

  return () => {
    alive = false;
    if (running) {
      runId++;
      engine.stop();
    }
  };
}
