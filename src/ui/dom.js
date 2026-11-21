// 작은 DOM 도우미
export function $(sel, root = document) {
  return root.querySelector(sel);
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** 백 기준 cp → "+1.2", "#3" 같은 표시 */
export function fmtEval(cpWhite) {
  if (Math.abs(cpWhite) >= 90000) {
    const m = cpWhite > 0 ? Math.round((100000 - cpWhite) / 100) : -Math.round((100000 + cpWhite) / 100);
    return m === 0 ? '#' : (m > 0 ? '#' : '#-') + Math.abs(m);
  }
  const v = cpWhite / 100;
  return (v > 0 ? '+' : '') + v.toFixed(1);
}

/** 평가 막대 폭(%) — 백 이길 확률 */
export function whiteBarPct(cpWhite) {
  if (Math.abs(cpWhite) >= 90000) return cpWhite > 0 ? 100 : 0;
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cpWhite)) - 1);
}
