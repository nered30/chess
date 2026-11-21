// AI 난이도 단계
// elo 는 대략적인 추정치입니다. 1320 이상은 Stockfish 의 UCI_Elo 기능을 쓰고,
// 그보다 낮은 단계는 Skill Level 과 탐색 깊이를 줄여서 약하게 만듭니다.
export const LEVELS = [
  { id: 1, elo: 600, options: { UCI_LimitStrength: false, 'Skill Level': 0 }, go: { depth: 1 } },
  { id: 2, elo: 850, options: { UCI_LimitStrength: false, 'Skill Level': 2 }, go: { depth: 2 } },
  { id: 3, elo: 1100, options: { UCI_LimitStrength: false, 'Skill Level': 5 }, go: { depth: 4 } },
  { id: 4, elo: 1400, options: { UCI_LimitStrength: true, UCI_Elo: 1400 }, go: { movetime: 400 } },
  { id: 5, elo: 1700, options: { UCI_LimitStrength: true, UCI_Elo: 1700 }, go: { movetime: 500 } },
  { id: 6, elo: 2000, options: { UCI_LimitStrength: true, UCI_Elo: 2000 }, go: { movetime: 600 } },
  { id: 7, elo: 2300, options: { UCI_LimitStrength: true, UCI_Elo: 2300 }, go: { movetime: 800 } },
  { id: 8, elo: 2700, options: { UCI_LimitStrength: true, UCI_Elo: 2700 }, go: { movetime: 1000 } },
  { id: 9, elo: 3100, options: { UCI_LimitStrength: false, 'Skill Level': 20 }, go: { movetime: 1500 } },
];

export function levelById(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[3];
}
