// Stockfish 엔진 파일을 public/engine/ 으로 복사합니다 (앱에 함께 포함됨)
import { copyFileSync, mkdirSync } from 'node:fs';

const SRC = 'node_modules/stockfish/bin/';
const DST = 'public/engine/';
mkdirSync(DST, { recursive: true });
for (const f of ['stockfish-18-lite-single.js', 'stockfish-18-lite-single.wasm']) {
  copyFileSync(SRC + f, DST + f);
}
copyFileSync('node_modules/stockfish/Copying.txt', DST + 'COPYING-stockfish.txt');
console.log('engine copied');
