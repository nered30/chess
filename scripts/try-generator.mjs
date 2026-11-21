// 퍼즐 생성기를 Node 에서 돌려보는 실험 스크립트
import { createNodeEngine } from '../tests/node-engine.mjs';
import { harvestGame, generateEndgame, KINDS } from '../src/puzzles/generator.js';

const engine = await createNodeEngine();
const games = +(process.argv[2] || 3);
const t0 = Date.now();
const found = [];
for (let g = 0; g < games; g++) {
  const ps = await harvestGame(engine, { want: new Set(Object.keys(KINDS)) });
  found.push(...ps);
  console.log(`game ${g + 1}: ${((Date.now() - t0) / 1000).toFixed(1)}s`, ps.map((p) => `${p.kind}(${p.rating}) ${p.solution.join(' ')}`).join(' | '));
}
const eg = await generateEndgame(engine);
console.log('endgame', ((Date.now() - t0) / 1000).toFixed(1) + 's', eg && `${eg.goal} ${eg.fen} ${eg.solution.join(' ')} r${eg.rating}`);
process.exit(0);
