// 퍼즐 자동 생성기
//
// 방법
//  1) 메이트/전술: 엔진끼리 일부러 약하게 대국시켜서 실수가 나오게 합니다.
//     대국 중 "강제 메이트"나 "결정적인 한 수"가 생긴 포지션을 후보로 모읍니다.
//  2) 엔드게임: 기물을 무작위로 배치합니다.
//  3) 모든 후보는 더 깊은 탐색으로 다시 검사해서 "정답이 하나뿐인" 것만 퍼즐로 씁니다.
//
// 매번 무작위로 새로 만들기 때문에 미리 저장된 퍼즐이 아닙니다.
import { Chess } from 'chess.js';
import { FULL_STRENGTH } from '../engine/uci.js';
import { uciToObj } from '../analysis/analyzer.js';
import { randomEndgame } from './endgames.js';

export const KINDS = {
  mate1: { label: '1수 메이트', goal: 'mate', n: 1 },
  mate2: { label: '2수 메이트', goal: 'mate', n: 2 },
  mate3: { label: '3수 메이트', goal: 'mate', n: 3 },
  mate4: { label: '4수 메이트', goal: 'mate', n: 4 },
  mate5: { label: '5수 메이트', goal: 'mate', n: 5 },
  tactic: { label: '전술', goal: 'win' },
  endgame: { label: '엔드게임', goal: 'win' },
};

const BASE_RATING = { mate1: 700, mate2: 1200, mate3: 1600, mate4: 1900, mate5: 2100, tactic: 1300, endgame: 1500 };

function search(engine, fen, depth, multipv = 1) {
  return engine.search({ fen, depth, multipv, options: FULL_STRENGTH });
}

function play(fen, uci) {
  const c = new Chess(fen);
  const m = c.move(uciToObj(uci));
  return { fen: c.fen(), move: m, chess: c };
}

/** 난이도(퍼즐 레이팅) 추정 */
async function estimateRating(engine, kind, fen, solution, extra = 0, rng = Math.random) {
  let r = BASE_RATING[kind] + extra;
  const first = new Chess(fen).move(uciToObj(solution[0]));
  const quiet = !first.captured && !first.san.includes('+') && !first.san.includes('#');
  if (quiet) r += 150; // 조용한 첫 수는 찾기 어렵습니다
  if (first.san.includes('+')) r -= 80; // 체크는 먼저 떠올리기 쉽습니다
  // 얕은 탐색으로도 바로 보이는 수면 쉬운 퍼즐
  const shallow = await search(engine, fen, 3);
  r += shallow.bestmove === solution[0] ? -120 : 150;
  r += Math.round((rng() - 0.5) * 80);
  return Math.max(500, Math.min(2900, r));
}

/* ---------------- 메이트 ---------------- */

async function verifyMate(engine, cand, rng) {
  const deep = await search(engine, cand.fen, 22, 2);
  const [top, second] = deep.lines;
  if (!top || !(top.mate > 0) || top.mate > 5) return null;
  const n = top.mate;
  // 2수 이상 메이트는 첫 수가 유일해야 합니다
  if (n >= 2 && second && second.mate > 0 && second.mate <= n) return null;

  const solution = [];
  let fen = cand.fen;
  for (let k = 0; k < n; k++) {
    let mv = k === 0 ? top.pv[0] : null;
    if (!mv) {
      const r = await search(engine, fen, 10 + 2 * (n - k));
      const l = r.lines[0];
      if (!l || !(l.mate > 0) || l.mate > n - k) return null;
      mv = r.bestmove;
    }
    const p = play(fen, mv);
    solution.push(mv);
    fen = p.fen;
    if (k === n - 1) {
      if (!p.chess.isCheckmate()) return null;
      break;
    }
    if (p.chess.isGameOver()) return null;
    const reply = await search(engine, fen, 10 + 2 * (n - k));
    if (!reply.bestmove) return null;
    solution.push(reply.bestmove);
    fen = play(fen, reply.bestmove).fen;
  }
  const kind = 'mate' + n;
  return {
    kind,
    goal: 'mate',
    fen: cand.fen,
    startFen: cand.prevFen,
    setup: cand.setup,
    solution,
    rating: await estimateRating(engine, kind, cand.fen, solution, 0, rng),
  };
}

/* ---------------- 전술 ---------------- */

async function verifyTactic(engine, cand, rng) {
  const deep = await search(engine, cand.fen, 16, 2);
  const [top, second] = deep.lines;
  if (!top || top.mate) return null;
  if (top.cp < 200 || (second && top.cp - second.cp < 180)) return null;
  const first = top.pv[0];
  // 방금 잡힌 기물을 다시 잡기만 하는 쉬운 수는 제외
  if (cand.setup && cand.setupCaptured && first.slice(2, 4) === cand.setup.slice(2, 4)) return null;

  const solution = [first];
  const cps = [top.cp];
  let fen = play(cand.fen, first).fen;
  for (let k = 1; k < 4; k++) {
    if (new Chess(fen).isGameOver()) break;
    const reply = await search(engine, fen, 14);
    if (!reply.bestmove) break;
    const afterReply = play(fen, reply.bestmove).fen;
    if (new Chess(afterReply).isGameOver()) break;
    const r = await search(engine, afterReply, 14, 2);
    const [t2, s2] = r.lines;
    const unique = t2 && (t2.mate > 0 || (t2.cp >= 200 && (!s2 || t2.cp - s2.cp >= 150)));
    if (!unique) break;
    solution.push(reply.bestmove, r.bestmove);
    cps.push(t2.cp);
    fen = play(afterReply, r.bestmove).fen;
  }
  const playerMoves = (solution.length + 1) / 2;
  return {
    kind: 'tactic',
    goal: 'win',
    fen: cand.fen,
    startFen: cand.prevFen,
    setup: cand.setup,
    solution,
    cps,
    rating: await estimateRating(engine, 'tactic', cand.fen, solution, 150 * (playerMoves - 1), rng),
  };
}

/* ---------------- 셀프 대국 수확 ---------------- */

/**
 * 엔진끼리 한 판을 두면서 퍼즐 후보를 모으고, 검증된 퍼즐 목록을 돌려줍니다.
 * @param want Set<kind> 필요한 퍼즐 종류
 */
export async function harvestGame(engine, { want, rng = Math.random, shouldStop = () => false, isSeen = () => false }) {
  const c = new Chess();
  const skills = { w: 1 + Math.floor(rng() * 9), b: 1 + Math.floor(rng() * 9) };
  const openingPlies = 6 + Math.floor(rng() * 6);
  const hist = []; // {fen, uci, captured}
  const cands = [];
  let prevMine = 0; // 직전 포지션의 평가(지금 둘 차례 기준)
  let mateChainSide = null;

  for (let ply = 0; ply < 140 && !c.isGameOver(); ply++) {
    if (shouldStop()) return [];
    const fen = c.fen();
    const turn = c.turn();
    let mv;
    if (ply < openingPlies) {
      // 오프닝은 괜찮은 수들 중 무작위로 골라 매번 다른 대국이 되게 합니다
      const r = await engine.search({ fen, depth: 6, multipv: 5, options: FULL_STRENGTH });
      const best = r.lines[0]?.cp ?? 0;
      const ok = r.lines.filter((l) => l.cp >= best - 70);
      mv = ok[Math.floor(rng() * ok.length)]?.pv[0] || r.bestmove;
    } else {
      const r = await engine.search({
        fen,
        depth: 8,
        multipv: 2,
        options: { UCI_LimitStrength: false, 'Skill Level': skills[turn] },
      });
      mv = r.bestmove;
      const [top, second] = r.lines;
      const last = hist[hist.length - 1];
      const base = { fen, prevFen: last?.fen, setup: last?.uci, setupCaptured: last?.captured, ply, turn };
      if (top && last && !isSeen(fen)) {
        if (top.mate > 0 && top.mate <= 5) {
          if (mateChainSide !== turn) {
            // 같은 메이트 흐름에서는 가장 처음(가장 긴) 포지션만 씁니다
            mateChainSide = turn;
            cands.push({ ...base, type: 'mate' });
            // 더 긴 메이트가 필요하면 2수, 4수 전 같은 쪽 포지션도 깊게 검사합니다
            if (want.has('mate4') || want.has('mate5')) {
              for (const back of [2, 4]) {
                const h = hist.length - back;
                if (h >= 1 && h > openingPlies) {
                  cands.push({ fen: hist[h].fen, prevFen: hist[h - 1].fen, setup: hist[h - 1].uci, setupCaptured: hist[h - 1].captured, type: 'mate' });
                }
              }
            }
          }
        } else {
          if (!top.mate) mateChainSide = null;
          if (!top.mate && top.cp >= 220 && prevMine <= 60 && (!second || top.cp - second.cp >= 200)) {
            cands.push({ ...base, type: 'tactic' });
          }
        }
      }
      prevMine = top ? -top.cp : 0;
    }
    if (!mv) break;
    const m = c.move(uciToObj(mv));
    hist.push({ fen, uci: mv, captured: !!m.captured });
  }

  // 후보 검증
  const out = [];
  const gotKinds = new Set();
  for (const cand of cands) {
    if (shouldStop()) break;
    if (!cand.prevFen) continue;
    let p = null;
    if (cand.type === 'mate') p = await verifyMate(engine, cand, rng);
    else if (want.has('tactic') && !gotKinds.has('tactic')) p = await verifyTactic(engine, cand, rng);
    if (p && want.has(p.kind) && !gotKinds.has(p.kind)) {
      gotKinds.add(p.kind);
      out.push(p);
    }
  }
  return out;
}

/* ---------------- 엔드게임 ---------------- */

const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9 };

function endgameGoal(top, second) {
  if (!top) return null;
  if (top.cp >= 300 && (!second || second.cp <= 100)) return 'win';
  if (Math.abs(top.cp) <= 60 && second && second.cp <= -300) return 'draw';
  return null;
}

export async function generateEndgame(engine, { rng = Math.random, tries = 120, shouldStop = () => false, isSeen = () => false } = {}) {
  for (let t = 0; t < tries; t++) {
    if (shouldStop()) return null;
    const fen = randomEndgame(rng);
    if (!fen || isSeen(fen)) continue;
    // 빠른 1차 검사 후, 통과한 것만 깊게 확인합니다
    const quick = await search(engine, fen, 12, 2);
    if (!endgameGoal(quick.lines[0], quick.lines[1])) continue;
    const r = await search(engine, fen, 18, 2);
    const [top, second] = r.lines;
    const goal = endgameGoal(top, second);
    if (!goal) continue;
    if (top.mate > 0 && top.mate <= 2) continue; // 너무 짧은 메이트는 제외
    // 지키지 않은 큰 기물을 그냥 잡는 수는 너무 쉬우므로 제외
    const first = new Chess(fen).move(uciToObj(top.pv[0]));
    if (first.captured && PIECE_VALUE[first.captured] >= 3) continue;

    const solution = [top.pv[0]];
    let cur = play(fen, top.pv[0]).fen;
    for (let k = 1; k < 3; k++) {
      if (new Chess(cur).isGameOver()) break;
      const reply = await search(engine, cur, 16);
      if (!reply.bestmove) break;
      const next = play(cur, reply.bestmove).fen;
      if (new Chess(next).isGameOver()) break;
      const r2 = await search(engine, next, 16);
      if (!r2.bestmove) break;
      solution.push(reply.bestmove, r2.bestmove);
      cur = play(next, r2.bestmove).fen;
    }
    return {
      kind: 'endgame',
      goal,
      fen,
      startFen: null,
      setup: null,
      solution,
      rating: await estimateRating(engine, 'endgame', fen, solution, goal === 'draw' ? 200 : 0, rng),
    };
  }
  return null;
}
