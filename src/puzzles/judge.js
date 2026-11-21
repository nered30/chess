// 퍼즐 풀이 판정
// 저장된 정답과 같으면 정답. 다르더라도 엔진이 보기에 목표(메이트/승리/무승부)를
// 똑같이 달성하는 수라면 정답으로 인정합니다.
import { Chess } from 'chess.js';
import { FULL_STRENGTH, cpToMate } from '../engine/uci.js';
import { uciToObj } from '../analysis/analyzer.js';

/**
 * @param puzzle      퍼즐
 * @param fenBefore   사용자가 두기 전 포지션
 * @param uci         사용자가 둔 수
 * @param expected    저장된 정답 수 (엔진 모드면 null)
 * @param movesLeft   이 수를 포함해 사용자가 둬야 할 남은 수
 * @returns {Promise<{ok:boolean, mate:boolean, alt:boolean}>}
 */
export async function judgeAttempt(engine, puzzle, fenBefore, uci, expected, movesLeft) {
  const c = new Chess(fenBefore);
  try {
    c.move(uciToObj(uci));
  } catch {
    return { ok: false, mate: false, alt: false };
  }
  if (c.isCheckmate()) return { ok: true, mate: true, alt: uci !== expected };
  if (uci === expected) return { ok: true, mate: false, alt: false };

  const fenAfter = c.fen();
  if (c.isGameOver()) return { ok: puzzle.goal === 'draw', mate: false, alt: true };

  const depth = puzzle.goal === 'mate' ? 10 + 2 * movesLeft : 14;
  const r = await engine.search({ fen: fenAfter, depth, options: FULL_STRENGTH });
  const top = r.lines[0];
  if (!top) return { ok: false, mate: false, alt: true };
  const mine = -top.cp; // 상대 기준 점수를 내 기준으로
  let ok = false;
  if (puzzle.goal === 'mate') {
    const m = cpToMate(mine);
    ok = m !== null && m > 0 && m <= movesLeft - 1;
  } else if (puzzle.goal === 'win') {
    const idx = Math.floor(puzzle.solution.indexOf(expected) / 2);
    const target = puzzle.cps?.[idx] ?? 300;
    ok = mine >= 200 && mine >= Math.min(target, 600) - 150;
  } else if (puzzle.goal === 'draw') {
    ok = mine >= -80;
  }
  return { ok, mate: false, alt: true };
}

/** 엔진 모드에서 상대(퍼즐 속 상대방)의 응수 */
export async function opponentReply(engine, fen) {
  const r = await engine.search({ fen, depth: 14, options: FULL_STRENGTH });
  return r.bestmove;
}
