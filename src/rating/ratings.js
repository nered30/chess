// 내 레이팅(퍼즐 / 대국)을 저장하고 갱신합니다.
import { load, save } from '../storage/storage.js';
import { newRating, updateRating } from './glicko2.js';

function getAll() {
  return load('ratings', { puzzle: newRating(), game: newRating(), history: [] });
}

export function getRatings() {
  return getAll();
}

function apply(kind, opp, score) {
  const all = getAll();
  const before = all[kind].r;
  all[kind] = updateRating(all[kind], opp, score);
  all.history.push({ kind, t: Date.now(), r: all[kind].r });
  if (all.history.length > 500) all.history.splice(0, all.history.length - 500);
  save('ratings', all);
  return { before, after: all[kind].r, diff: all[kind].r - before };
}

/** 퍼즐 결과 반영 (퍼즐 난이도 = 상대 레이팅) */
export function applyPuzzle(puzzleRating, solved) {
  return apply('puzzle', { r: puzzleRating, rd: 80 }, solved ? 1 : 0);
}

/** AI 대국 결과 반영 (AI 단계의 추정 Elo = 상대 레이팅) */
export function applyGame(aiElo, score) {
  return apply('game', { r: aiElo, rd: 60 }, score);
}
