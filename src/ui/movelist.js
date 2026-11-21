// 기보(수 목록) 표시
import { CLASSES } from '../analysis/classify.js';
import { esc } from './dom.js';

/**
 * @param el     넣을 요소
 * @param sans   SAN 목록
 * @param opts.cls      수마다 등급 (없으면 null)
 * @param opts.cur      현재 선택된 수 인덱스 (-1 = 시작)
 * @param opts.startBlack 흑부터 시작하는 포지션인지
 * @param opts.onClick  (idx) => void
 */
export function renderMoves(el, sans, { cls = [], cur = sans.length - 1, startBlack = false, firstNo = 1, onClick } = {}) {
  const cells = [];
  let i = 0;
  let no = firstNo;
  if (startBlack && sans.length) {
    cells.push(`<div class="no">${no}</div><div class="mv">…</div>`);
    cells.push(cell(0));
    i = 1;
    no++;
  }
  function cell(k) {
    const c = cls[k] && CLASSES[cls[k]];
    const sym = c && c.sym ? `<span class="sym" style="color:${c.color}">${c.sym}</span>` : '';
    return `<div class="mv${k === cur ? ' cur' : ''}" data-i="${k}">${esc(sans[k])}${sym}</div>`;
  }
  for (; i < sans.length; i += 2) {
    cells.push(`<div class="no">${no++}</div>`);
    cells.push(cell(i));
    cells.push(i + 1 < sans.length ? cell(i + 1) : '<div class="mv"></div>');
  }
  el.innerHTML = cells.join('');
  el.onclick = (e) => {
    const m = e.target.closest('[data-i]');
    if (m && onClick) onClick(+m.dataset.i);
  };
  const curEl = el.querySelector('.cur');
  if (curEl) curEl.scrollIntoView({ block: 'nearest' });
  else el.scrollTop = el.scrollHeight;
}
