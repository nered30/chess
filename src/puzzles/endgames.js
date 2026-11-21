// 엔드게임 무작위 배치
// 기물 조합을 고른 뒤 무작위 칸에 놓고, 규칙상 가능한 포지션만 남깁니다.
import { Chess } from 'chess.js';

// [강한 쪽, 약한 쪽] 기물 조합
export const ENDGAME_SETS = [
  ['KP', 'K'],
  ['KPP', 'KP'],
  ['KPPP', 'KPP'],
  ['KRP', 'KR'],
  ['KRPP', 'KRP'],
  ['KR', 'KP'],
  ['KR', 'KPP'],
  ['KQ', 'KR'],
  ['KQ', 'KP'],
  ['KQP', 'KQ'],
  ['KBP', 'KB'],
  ['KNP', 'KN'],
  ['KBP', 'KN'],
  ['KRB', 'KR'],
  ['KRN', 'KR'],
  ['KBPP', 'KBP'],
  ['KNPP', 'KP'],
];

const FILES = 'abcdefgh';

function sqName(f, r) {
  return FILES[f] + (r + 1);
}

function placeFen(pieces) {
  // pieces: {sq: 'P'|'p'|...}
  const rows = [];
  for (let r = 7; r >= 0; r--) {
    let row = '';
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = pieces[sqName(f, r)];
      if (p) {
        if (empty) row += empty;
        empty = 0;
        row += p;
      } else empty++;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return rows.join('/');
}

function kingsAdjacent(a, b) {
  const df = Math.abs(a.charCodeAt(0) - b.charCodeAt(0));
  const dr = Math.abs(+a[1] - +b[1]);
  return df <= 1 && dr <= 1;
}

/**
 * 무작위 엔드게임 포지션을 만듭니다.
 * @returns {string|null} FEN (규칙에 맞지 않으면 null)
 */
export function randomEndgame(rng = Math.random) {
  const [strong, weak] = ENDGAME_SETS[Math.floor(rng() * ENDGAME_SETS.length)];
  const strongColor = rng() < 0.5 ? 'w' : 'b';
  const pieces = {};
  const kings = [];
  const add = (letters, color) => {
    for (const L of letters) {
      for (let tries = 0; tries < 50; tries++) {
        const isPawn = L === 'P';
        const f = Math.floor(rng() * 8);
        const r = isPawn ? 1 + Math.floor(rng() * 6) : Math.floor(rng() * 8);
        const sq = sqName(f, r);
        if (pieces[sq]) continue;
        if (L === 'K' && kings.some((k) => kingsAdjacent(k, sq))) continue;
        pieces[sq] = color === 'w' ? L : L.toLowerCase();
        if (L === 'K') kings.push(sq);
        break;
      }
    }
  };
  add(strong, strongColor);
  add(weak, strongColor === 'w' ? 'b' : 'w');
  if (kings.length !== 2) return null;

  // 대부분은 강한 쪽이 둘 차례 (이기는 퍼즐), 가끔 약한 쪽 차례 (비기는 퍼즐)
  const turn = rng() < 0.75 ? strongColor : strongColor === 'w' ? 'b' : 'w';
  const board = placeFen(pieces);
  const fen = `${board} ${turn} - - 0 1`;
  const other = `${board} ${turn === 'w' ? 'b' : 'w'} - - 0 1`;
  try {
    const c = new Chess(fen);
    // 둘 차례가 아닌 쪽이 체크 상태면 규칙상 불가능한 포지션
    if (new Chess(other).inCheck()) return null;
    if (c.isGameOver()) return null;
    return fen;
  } catch {
    return null;
  }
}
