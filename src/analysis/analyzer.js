// 대국 분석기: 모든 포지션을 엔진으로 평가해서 수마다 등급, 정확도, 최선수를 계산합니다.
import { Chess } from 'chess.js';
import { FULL_STRENGTH, MATE_BASE } from '../engine/uci.js';
import { lookupOpening } from '../openings/openings.js';
import { classifyMove, gameAccuracy, moveAccuracy, winPct } from './classify.js';

const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/** color 쪽의 기물 점수 - 상대 기물 점수 */
export function materialBalance(chess, color) {
  let s = 0;
  for (const row of chess.board()) {
    for (const sq of row) {
      if (sq) s += (sq.color === color ? 1 : -1) * VALUE[sq.type];
    }
  }
  return s;
}

/**
 * 희생수 판정: 수를 둔 뒤 엔진 최선 수순(pv)을 따라가면서
 * 수를 둔 쪽의 기물 점수가 2점 이상 줄어드는 순간이 있으면 희생으로 봅니다.
 */
export function isSacrifice(fenBefore, uci, pvAfter) {
  const c = new Chess(fenBefore);
  const me = c.turn();
  const start = materialBalance(c, me);
  try {
    c.move(uciToObj(uci));
    let min = materialBalance(c, me);
    for (const m of pvAfter.slice(0, 4)) {
      c.move(uciToObj(m));
      min = Math.min(min, materialBalance(c, me));
    }
    return start - min >= 2;
  } catch {
    return false;
  }
}

export function uciToObj(uci) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

/** 포지션 하나 평가. 결과 cp 는 "둘 차례인 쪽" 기준 */
export async function evalPosition(engine, fen, depth = 14) {
  const c = new Chess(fen);
  if (c.isCheckmate()) return { cp: -MATE_BASE, best: null, secondCp: null, pv: [] };
  if (c.isDraw() || c.isStalemate()) return { cp: 0, best: null, secondCp: null, pv: [] };
  const res = await engine.search({ fen, depth, multipv: 2, options: FULL_STRENGTH });
  const [l1, l2] = res.lines;
  return {
    cp: l1 ? l1.cp : 0,
    best: res.bestmove,
    pv: l1 ? l1.pv : [],
    secondCp: l2 ? l2.cp : null,
  };
}

/**
 * 수 하나를 평가합니다. before/after 평가값을 넘기면 재사용합니다.
 */
export function judgeMove({ fenBefore, fenAfter, uci, before, after, ply }) {
  // before.cp: 수를 둔 쪽 기준, after.cp: 상대 기준 → 부호를 뒤집습니다
  const winBefore = winPct(before.cp);
  const winAfter = winPct(-after.cp);
  const winSecond = before.secondCp == null ? null : winPct(before.secondCp);
  const isBest = before.best === uci;
  const book = ply < 30 && !!lookupOpening(fenAfter);
  const sacrifice = isBest ? isSacrifice(fenBefore, uci, after.pv) : false;
  let obvious = false;
  try {
    const m = new Chess(fenBefore).move(uciToObj(uci));
    obvious = !!m.captured && VALUE[m.captured] >= 3; // 기물을 잡는 수는 찾기 쉬운 편
  } catch {
    obvious = false;
  }
  const cls = classifyMove({ winBefore, winAfter, winSecond, isBest, sacrifice, book, obvious });
  let bestSan = null;
  if (before.best && !isBest) {
    try {
      bestSan = new Chess(fenBefore).move(uciToObj(before.best)).san;
    } catch {
      bestSan = null;
    }
  }
  return {
    cls,
    loss: Math.max(0, winBefore - winAfter),
    acc: moveAccuracy(winBefore, winAfter),
    best: before.best,
    bestSan,
  };
}

/**
 * 대국 전체 분석
 * @param engine UciEngine
 * @param game {startFen, moves:[uci]}
 * @returns {moves:[{san, uci, cls, acc, best, bestSan, evalWhite}], accuracy:{w,b}, counts:{w:{},b:{}}}
 */
export async function analyzeGame(engine, game, { depth = 14, onProgress, shouldStop } = {}) {
  const c = new Chess(game.startFen);
  const fens = [c.fen()];
  const sans = [];
  for (const m of game.moves) {
    sans.push(c.move(uciToObj(m)).san);
    fens.push(c.fen());
  }
  const evals = [];
  for (let i = 0; i < fens.length; i++) {
    if (shouldStop?.()) return null;
    evals.push(await evalPosition(engine, fens[i], depth));
    onProgress?.(i + 1, fens.length);
  }
  const out = [];
  const accs = { w: [], b: [] };
  const counts = { w: {}, b: {} };
  for (let i = 0; i < game.moves.length; i++) {
    const color = fens[i].split(' ')[1];
    const j = judgeMove({
      fenBefore: fens[i],
      fenAfter: fens[i + 1],
      uci: game.moves[i],
      before: evals[i],
      after: evals[i + 1],
      ply: i,
    });
    accs[color].push(j.acc);
    counts[color][j.cls] = (counts[color][j.cls] || 0) + 1;
    // 그래프/평가 막대용: 백 기준 평가값
    const afterTurn = fens[i + 1].split(' ')[1];
    const evalWhite = afterTurn === 'w' ? evals[i + 1].cp : -evals[i + 1].cp;
    out.push({ san: sans[i], uci: game.moves[i], color, ...j, evalWhite });
  }
  const startTurn = fens[0].split(' ')[1];
  return {
    fens,
    startEvalWhite: startTurn === 'w' ? evals[0].cp : -evals[0].cp,
    moves: out,
    bests: evals.map((e) => e.best),
    accuracy: { w: gameAccuracy(accs.w), b: gameAccuracy(accs.b) },
    counts,
  };
}
