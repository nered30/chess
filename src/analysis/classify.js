// 수 평가(등급) 계산
// 평가값(cp)을 "이길 확률(%)"로 바꾼 뒤, 수를 두고 나서 이길 확률이 얼마나 떨어졌는지로 등급을 매깁니다.
import { isMateCp } from '../engine/uci.js';

export const CLASSES = {
  brilliant: { sym: '!!', label: '탁월수', color: '#26c2a3' },
  great: { sym: '!', label: '좋은 수', color: '#5c8bb0' },
  best: { sym: '★', label: '최선수', color: '#81b64c' },
  excellent: { sym: '', label: '우수', color: '#96bc4b' },
  good: { sym: '', label: '양호', color: '#97af8b' },
  book: { sym: '📖', label: '정석', color: '#a88865' },
  inaccuracy: { sym: '?!', label: '부정확', color: '#f7c045' },
  mistake: { sym: '?', label: '실수', color: '#e58f2a' },
  blunder: { sym: '??', label: '블런더', color: '#ca3431' },
};

// 등급 기준: 이길 확률 손실(%p)
export const THRESHOLDS = { excellent: 3, good: 10, inaccuracy: 20, mistake: 30 };

/** cp(해당 색 기준) → 이길 확률 0~100 */
export function winPct(cp) {
  if (isMateCp(cp)) return cp > 0 ? 100 : 0;
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

/** 수 하나의 정확도(0~100). 이길 확률 손실이 클수록 낮아집니다 */
export function moveAccuracy(winBefore, winAfter) {
  const loss = Math.max(0, winBefore - winAfter);
  const acc = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
  return Math.min(100, Math.max(0, acc));
}

/** 한 판 전체 정확도: 산술평균과 조화평균의 평균 (큰 실수를 더 크게 반영) */
export function gameAccuracy(accs) {
  if (!accs.length) return null;
  const mean = accs.reduce((a, b) => a + b, 0) / accs.length;
  const harmonic = accs.length / accs.reduce((a, b) => a + 1 / Math.max(b, 1), 0);
  return (mean + harmonic) / 2;
}

/**
 * 수 등급을 정합니다. 모든 값은 수를 둔 쪽 기준입니다.
 * @param {object} p
 * @param {number} p.winBefore  최선수를 뒀을 때의 이길 확률
 * @param {number} p.winAfter   실제로 둔 수 이후의 이길 확률
 * @param {number|null} p.winSecond  두 번째로 좋은 수의 이길 확률
 * @param {boolean} p.isBest    엔진 최선수와 같은 수인지
 * @param {boolean} p.sacrifice 기물을 내주는 수인지
 * @param {boolean} p.book      오프닝 정석 포지션인지
 * @param {boolean} p.obvious   공짜 기물을 잡는 것처럼 뻔한 수인지 (좋은 수(!) 제외)
 */
export function classifyMove({ winBefore, winAfter, winSecond = null, isBest, sacrifice = false, book = false, obvious = false }) {
  const loss = Math.max(0, winBefore - winAfter);
  if (book && loss < THRESHOLDS.good) return 'book';
  if (isBest || loss < 0.5) {
    const notDecided = winBefore < 97; // 이미 완전히 이긴 상황이면 특별 등급을 주지 않습니다
    if (sacrifice && notDecided && winAfter >= 50) return 'brilliant';
    if (!obvious && winSecond !== null && notDecided && winBefore - winSecond >= 15) return 'great';
    return 'best';
  }
  if (loss < THRESHOLDS.excellent) return 'excellent';
  if (loss < THRESHOLDS.good) return 'good';
  if (loss < THRESHOLDS.inaccuracy) return 'inaccuracy';
  if (loss < THRESHOLDS.mistake) return 'mistake';
  return 'blunder';
}

// 최선수를 알려줘야 하는 등급
export function needsHint(cls) {
  return cls === 'inaccuracy' || cls === 'mistake' || cls === 'blunder';
}
