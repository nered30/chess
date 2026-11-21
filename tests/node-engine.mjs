// Node 에서 엔진을 띄우는 도우미 (테스트, 실험용)
import { createRequire } from 'node:module';
import { UciEngine } from '../src/engine/uci.js';

const require = createRequire(import.meta.url);

export async function createNodeEngine() {
  const sf = await require('stockfish')('lite-single');
  const transport = { send: (c) => sf.sendCommand(c), onLine: null };
  sf.listener = (line) => transport.onLine?.(line);
  const engine = new UciEngine(transport);
  await engine.init();
  return engine;
}
