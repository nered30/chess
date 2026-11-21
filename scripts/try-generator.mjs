// 퍼즐 생성기를 Node 에서 돌려보는 실험 스크립트: node scripts/try-generator.mjs [판수]
import { createNodeEngine } from '../tests/node-engine.mjs';
import { harvestGame, KINDS } from '../src/puzzles/generator.js';

const engine = await createNodeEngine();
const games = +(process.argv[2] || 3);
const t0 = Date.now();
const tally = {};
for (let g = 0; g < games; g++) {
  const want = new Set(Object.keys(KINDS).filter((k) => k !== 'endgame'));
  const ps = await harvestGame(engine, { want });
  for (const p of ps) {
    tally[p.kind] = (tally[p.kind] || 0) + 1;
    console.log(`${p.kind}${p.theme ? '[' + p.theme + ']' : ''}${p.opening ? '{' + p.opening + '}' : ''} r${p.rating} ${p.fen} | ${p.solution.join(' ')}`);
  }
}
console.log(`${games}판 ${((Date.now() - t0) / 1000).toFixed(0)}초`, tally);
process.exit(0);
