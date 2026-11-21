// 순수 로직 단위 테스트 (엔진 없이)
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyMove, winPct, moveAccuracy, gameAccuracy } from '../src/analysis/classify.js';
import { newRating, updateRating } from '../src/rating/glicko2.js';
import { mateToCp, cpToMate, parseInfo } from '../src/engine/uci.js';
import { randomEndgame } from '../src/puzzles/endgames.js';
import { lookupOpening } from '../src/openings/openings.js';
import { isSacrifice } from '../src/analysis/analyzer.js';
import { Chess } from 'chess.js';

test('winPct: 0cp = 50%, 메이트 = 100/0', () => {
  assert.equal(winPct(0), 50);
  assert.equal(winPct(mateToCp(3)), 100);
  assert.equal(winPct(mateToCp(-2)), 0);
});

test('메이트 변환 왕복', () => {
  for (const m of [1, 2, 5, -1, -4]) assert.equal(cpToMate(mateToCp(m)), m);
  assert.equal(cpToMate(350), null);
});

test('UCI info 파싱', () => {
  const i = parseInfo('info depth 12 seldepth 18 multipv 2 score mate -3 nodes 1 pv e2e4 e7e5');
  assert.equal(i.multipv, 2);
  assert.equal(i.mate, -3);
  assert.deepEqual(i.pv, ['e2e4', 'e7e5']);
});

test('수 등급 기준', () => {
  assert.equal(classifyMove({ winBefore: 60, winAfter: 25, isBest: false }), 'blunder');
  assert.equal(classifyMove({ winBefore: 60, winAfter: 38, isBest: false }), 'mistake');
  assert.equal(classifyMove({ winBefore: 60, winAfter: 48, isBest: false }), 'inaccuracy');
  assert.equal(classifyMove({ winBefore: 60, winAfter: 55, isBest: false }), 'good');
  assert.equal(classifyMove({ winBefore: 60, winAfter: 59, isBest: false }), 'excellent');
  assert.equal(classifyMove({ winBefore: 60, winAfter: 60, isBest: true }), 'best');
  assert.equal(classifyMove({ winBefore: 60, winAfter: 60, isBest: true, winSecond: 30 }), 'great');
  assert.equal(classifyMove({ winBefore: 60, winAfter: 60, isBest: true, winSecond: 30, obvious: true }), 'best');
  assert.equal(classifyMove({ winBefore: 60, winAfter: 60, isBest: true, sacrifice: true }), 'brilliant');
  assert.equal(classifyMove({ winBefore: 99, winAfter: 99, isBest: true, sacrifice: true }), 'best');
});

test('정확도', () => {
  assert.ok(moveAccuracy(50, 50) > 99);
  assert.ok(moveAccuracy(80, 20) < 10);
  assert.ok(gameAccuracy([100, 100, 10]) < gameAccuracy([100, 100, 100]));
});

test('Glicko-2: 이기면 오르고 지면 내려감', () => {
  const r = newRating();
  assert.ok(updateRating(r, { r: 1500, rd: 60 }, 1).r > 1500);
  assert.ok(updateRating(r, { r: 1500, rd: 60 }, 0).r < 1500);
  const d = 1500 - updateRating(r, { r: 1100, rd: 60 }, 0).r;
  assert.ok(d < 350, `첫 패배 하락폭이 너무 큼: ${d}`);
});

test('무작위 엔드게임은 항상 규칙에 맞음', () => {
  let ok = 0;
  for (let i = 0; i < 300; i++) {
    const fen = randomEndgame();
    if (!fen) continue;
    const c = new Chess(fen);
    assert.ok(!c.isGameOver());
    ok++;
  }
  assert.ok(ok > 100);
});

test('오프닝 인식 (수순이 달라도 같은 포지션)', () => {
  const a = new Chess();
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'].forEach((m) => a.move(m));
  assert.match(lookupOpening(a.fen()).name, /Ruy Lopez/);
  const b = new Chess();
  ['Nf3', 'Nc6', 'e4', 'e5', 'Bb5'].forEach((m) => b.move(m));
  assert.match(lookupOpening(b.fen()).name, /Ruy Lopez/);
});

test('희생수 판정', () => {
  // Bxf7+ 로 비숍을 내주는 수 (상대가 Kxf7 로 잡음)
  const fen = 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
  assert.equal(isSacrifice(fen, 'c4f7', ['e8f7']), true);
  assert.equal(isSacrifice(fen, 'e1g1', ['e8g8']), false);
});

test('희생 판정: 퀸을 내주고 메이트', async () => {
  const { findSacrifice } = await import('../src/puzzles/generator.js');
  // 백 Qxh7+ Kxh7 Rh3# 형태 (퀸 희생)
  const fen = '5rk1/5ppp/8/8/8/7R/5PPP/3Q2K1 w - - 0 1';
  const c = new Chess(fen);
  assert.ok(c.moves().length > 0);
  assert.equal(findSacrifice('6k1/5ppp/8/8/8/8/5PPP/3QR1K1 w - - 0 1', ['e1e8']), null);
  // 퀸이 잡히는 수순
  assert.equal(findSacrifice('r5k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1', ['d1d8', 'a8d8']), '퀸');
});

test('희생 판정: 상대가 안 잡아도 내준 기물은 희생', async () => {
  const { findSacrifice } = await import('../src/puzzles/generator.js');
  // 백 Qh7+?? 처럼 지켜지지 않는 칸으로 퀸을 보내는 수 (상대 킹이 잡을 수 있음)
  assert.equal(findSacrifice('6k1/5pp1/8/8/8/8/5PPP/3Q2K1 w - - 0 1', ['d1d8']), null);
  // Qh5 … a6, Qh7+ : 킹이 잡을 수 있는 칸에 퀸을 둠
  assert.equal(findSacrifice('6k1/p4pp1/8/8/8/8/5PPP/3Q2K1 w - - 0 1', ['d1h5', 'a7a6', 'h5h7']), '퀸');
});
