// 브라우저(안드로이드 WebView)에서 Web Worker 로 Stockfish 를 띄웁니다.
// 엔진 파일은 public/engine/ 에 복사되어 앱 안에 함께 들어갑니다 (인터넷 불필요).
import { UciEngine } from './uci.js';

const ENGINE_URL = `${import.meta.env.BASE_URL}engine/stockfish-18-lite-single.js`;

export function createEngine() {
  const worker = new Worker(ENGINE_URL);
  const transport = { send: (c) => worker.postMessage(c), onLine: null };
  worker.onmessage = (e) => transport.onLine?.(String(e.data));
  const engine = new UciEngine(transport);
  engine.ready = engine.init();
  return engine;
}

// 대국/분석/퍼즐 판정용 엔진과 퍼즐 생성용 엔진을 따로 둡니다.
// 그래서 퍼즐을 만드는 중에도 대국 AI가 느려지지 않습니다.
let mainEngine = null;
let genEngine = null;

export function getMainEngine() {
  if (!mainEngine) mainEngine = createEngine();
  return mainEngine;
}

export function getGenEngine() {
  if (!genEngine) genEngine = createEngine();
  return genEngine;
}
