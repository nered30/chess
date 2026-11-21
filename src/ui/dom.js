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
    // M2 = 2수 메이트 (백 기준 +), -M2 = 흑이 2수 메이트
    return m === 0 ? '#' : (m > 0 ? 'M' : '-M') + Math.abs(m);
  }
  const v = cpWhite / 100;
  return (v > 0 ? '+' : '') + v.toFixed(1);
}

/** 평가 막대 폭(%) — 백 이길 확률 */
export function whiteBarPct(cpWhite) {
  if (Math.abs(cpWhite) >= 90000) return cpWhite > 0 ? 100 : 0;
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cpWhite)) - 1);
}

/** 엔진 수순을 "12. Nf3 Nc6 13. Bb5" 같은 기보 문자열로 */
export function sanLine(Chess, fen, pv, max = 10) {
  const c = new Chess(fen);
  let no = +fen.split(' ')[5] || 1;
  const out = [];
  for (const [i, uci] of pv.slice(0, max).entries()) {
    let m;
    try {
      m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    } catch {
      break;
    }
    if (m.color === 'w') out.push(`${no}. ${m.san}`);
    else out.push(i === 0 ? `${no}… ${m.san}` : m.san);
    if (m.color === 'b') no++;
  }
  return out.join(' ');
}
