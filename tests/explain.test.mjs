// 수 등급 설명 테스트 (실제 엔진 사용)
import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { createNodeEngine } from './node-engine.mjs';
import { evalPosition, judgeMove, uciToObj } from '../src/analysis/analyzer.js';
import { eul, iga } from '../src/analysis/explain.js';

const engine = await createNodeEngine();

async function judge(fen, uci) {
  const c = new Chess(fen);
  c.move(uciToObj(uci));
  const before = await evalPosition(engine, fen, 14);
  const after = await evalPosition(engine, c.fen(), 14);
  return judgeMove({ fenBefore: fen, fenAfter: c.fen(), uci, before, after, ply: 20 });
}

test('조사', () => {
  assert.equal(eul('퀸'), '퀸을');
  assert.equal(eul('나이트'), '나이트를');
  assert.equal(iga('폰'), '폰이');
  assert.equal(iga('나이트'), '나이트가');
});

test('퀸을 공짜로 주는 블런더 → 잃는 기물을 설명', async () => {
  const fen = 'rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
  const j = await judge(fen, 'd1h5');
  assert.equal(j.cls, 'blunder');
  assert.match(j.why, /퀸을 잃게/);
  assert.match(j.why, /블런더/);
  console.log(j.why);
});

test('메이트를 허용하는 블런더', async () => {
  // 1.f3 e5 2.g4?? → Qh4#
  const fen = 'rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2';
  const j = await judge(fen, 'g2g4');
  assert.equal(j.cls, 'blunder');
  assert.match(j.why, /1수 만에 메이트/);
  console.log(j.why);
});

test('메이트를 놓친 수', async () => {
  // 백 Qxf7# 가능 (스콜라 메이트 직전)
  const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';
  const j = await judge(fen, 'h5h4');
  assert.match(j.why, /메이트가 있었어요/);
  console.log(j.why);
});

test('최선수 설명', async () => {
  const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';
  const j = await judge(fen, 'h5f7');
  assert.match(j.why, /체크메이트/);
});

test.after(() => process.exit(0));
