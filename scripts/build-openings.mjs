// 오프닝 데이터 빌드 스크립트
// 출처: lichess-org/chess-openings (CC0 퍼블릭 도메인)
// 각 오프닝의 수순을 실제로 두어서 "포지션(EPD) → 오프닝 이름" 표를 만듭니다.
// 포지션 기준이라 수순이 달라도 같은 포지션이면 같은 오프닝으로 인식합니다.
import { Chess } from 'chess.js';
import { writeFileSync } from 'node:fs';

const BASE = 'https://raw.githubusercontent.com/lichess-org/chess-openings/master/';
const FILES = ['a.tsv', 'b.tsv', 'c.tsv', 'd.tsv', 'e.tsv'];

function epd(fen) {
  return fen.split(' ').slice(0, 4).join(' ');
}

const table = {};
for (const f of FILES) {
  const res = await fetch(BASE + f);
  if (!res.ok) throw new Error(`${f}: HTTP ${res.status}`);
  const lines = (await res.text()).trim().split('\n').slice(1);
  for (const line of lines) {
    const [eco, name, pgn] = line.split('\t');
    const chess = new Chess();
    chess.loadPgn(pgn);
    const key = epd(chess.fen());
    // 같은 포지션이면 더 긴(구체적인) 이름을 남깁니다
    if (!table[key] || table[key][1].length < name.length) table[key] = [eco, name];
  }
}
writeFileSync('src/openings/openings.json', JSON.stringify(table));
console.log('openings:', Object.keys(table).length);
