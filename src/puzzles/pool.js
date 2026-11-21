// 퍼즐 저장소 + 백그라운드 생성 루프
// 종류별로 몇 개씩 미리 만들어 두고, 풀 때마다 꺼내 씁니다.
// 한 번 나온 포지션은 기록해서 다시 나오지 않게 합니다.
import { load, save } from '../storage/storage.js';
import { epd } from '../openings/openings.js';
import { KINDS, harvestGame, generateEndgame } from './generator.js';

const TARGET = 3; // 종류별로 미리 만들어 둘 개수
const SEEN_MAX = 5000;

let pool = load('pool', {});
let seen = new Set(load('seen', []));
const listeners = new Set();
let priority = null; // 지금 사용자가 기다리는 종류
let paused = false;
let running = false;

for (const k of Object.keys(KINDS)) pool[k] ||= [];

function persist() {
  save('pool', pool);
  save('seen', [...seen].slice(-SEEN_MAX));
  listeners.forEach((fn) => fn(counts()));
}

export function isSeen(fen) {
  return seen.has(epd(fen));
}

export function counts() {
  return Object.fromEntries(Object.keys(KINDS).map((k) => [k, pool[k].length]));
}

export function onPoolChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * 퍼즐 하나를 꺼냅니다.
 * kind 가 'mix' 면 모든 종류 중에서 내 레이팅과 가장 가까운 퍼즐을 고릅니다.
 */
export function takePuzzle(kind, myRating) {
  let list;
  if (kind === 'mix') {
    list = Object.keys(KINDS).flatMap((k) => pool[k]);
  } else {
    list = pool[kind] || [];
  }
  if (!list.length) return null;
  const pick = list.reduce((a, b) => (Math.abs(b.rating - myRating) < Math.abs(a.rating - myRating) ? b : a));
  pool[pick.kind] = pool[pick.kind].filter((p) => p !== pick);
  seen.add(epd(pick.fen));
  persist();
  return pick;
}

function add(p) {
  const key = epd(p.fen);
  if (seen.has(key) || pool[p.kind].some((q) => epd(q.fen) === key)) return;
  if (pool[p.kind].length >= TARGET + 2) return;
  pool[p.kind].push(p);
  persist();
}

/** 사용자가 특정 종류를 기다리면 그 종류부터 만듭니다 */
export function setPriority(kind) {
  priority = kind;
}

export function setPaused(v) {
  paused = v;
}

function lacking() {
  const need = Object.keys(KINDS).filter((k) => pool[k].length < TARGET);
  if (priority && priority !== 'mix' && pool[priority].length === 0) return [priority];
  return need;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 백그라운드 생성 시작 (앱 켜져 있는 동안 계속) */
export async function startGenerator(engine) {
  if (running) return;
  running = true;
  await engine.ready;
  const hidden = () => typeof document !== 'undefined' && document.hidden;
  const shouldStop = () => paused || hidden();
  for (;;) {
    if (shouldStop()) {
      await sleep(1000);
      continue;
    }
    const need = lacking();
    if (!need.length) {
      await sleep(3000);
      continue;
    }
    try {
      if (need.includes('endgame') && (need.length === 1 || Math.random() < 0.3)) {
        const p = await generateEndgame(engine, { tries: 40, shouldStop, isSeen });
        if (p) add(p);
      } else {
        const want = new Set(need.filter((k) => k !== 'endgame'));
        const found = await harvestGame(engine, { want, shouldStop, isSeen });
        found.forEach(add);
      }
    } catch (e) {
      console.warn('puzzle generator', e);
      await sleep(1000);
    }
    await sleep(50);
  }
}
