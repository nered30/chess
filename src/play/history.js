// 둔 대국 기록 저장
import { load, save } from '../storage/storage.js';

const MAX = 100;

export function listGames() {
  return load('games', []);
}

export function saveGame(game) {
  const games = listGames();
  games.unshift({ id: Date.now(), date: new Date().toISOString(), ...game });
  save('games', games.slice(0, MAX));
}

export function gameStats() {
  const s = { win: 0, draw: 0, loss: 0 };
  for (const g of listGames()) {
    if (g.score === 1) s.win++;
    else if (g.score === 0.5) s.draw++;
    else if (g.score === 0) s.loss++;
  }
  return s;
}
