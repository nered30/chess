// 체스판 화면 컴포넌트
// - 탭해서 선택 → 탭해서 이동, 또는 드래그로 이동
// - 마지막 수 / 체크 / 이동 가능한 칸 표시
// - 화살표(최선수 안내) 표시
import { Chess } from 'chess.js';
import './board.css';

const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const FILES = 'abcdefgh';

export class Board {
  /**
   * @param el 넣을 요소
   * @param opts.onMove (from, to, promotion) => void
   * @param opts.canMove () => 'w'|'b'|null  지금 움직일 수 있는 색
   */
  constructor(el, opts = {}) {
    this.el = el;
    this.opts = opts;
    this.orientation = 'w';
    this.chess = new Chess();
    this.selected = null;
    this.lastMove = null;
    this.arrows = [];
    this.marks = {}; // {sq: 'good'|'bad'}
    this.el.classList.add('board-wrap');
    this.el.innerHTML = '<div class="board"></div><svg class="arrows" viewBox="0 0 8 8"></svg><div class="promo hidden"></div>';
    this.boardEl = this.el.querySelector('.board');
    this.svg = this.el.querySelector('.arrows');
    this.promoEl = this.el.querySelector('.promo');
    this._bindPointer();
    this.render();
  }

  setFen(fen) {
    this.chess.load(fen);
    this.selected = null;
    this.render();
  }

  setOrientation(color) {
    this.orientation = color;
    this.render();
  }

  flip() {
    this.setOrientation(this.orientation === 'w' ? 'b' : 'w');
  }

  setLastMove(from, to) {
    this.lastMove = from ? [from, to] : null;
    this.render();
  }

  setArrows(arrows) {
    this.arrows = arrows || [];
    this._renderArrows();
  }

  setMarks(marks) {
    this.marks = marks || {};
    this.render();
  }

  _sqAt(col, row) {
    // col,row: 화면 기준 0~7
    const f = this.orientation === 'w' ? col : 7 - col;
    const r = this.orientation === 'w' ? 7 - row : row;
    return FILES[f] + (r + 1);
  }

  _xy(sq) {
    const f = FILES.indexOf(sq[0]);
    const r = +sq[1] - 1;
    return this.orientation === 'w' ? [f, 7 - r] : [7 - f, r];
  }

  render() {
    const dests = this.selected ? this.chess.moves({ square: this.selected, verbose: true }).map((m) => m.to) : [];
    const checkSq = this.chess.inCheck() ? this._kingSquare(this.chess.turn()) : null;
    let html = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = this._sqAt(col, row);
        const p = this.chess.get(sq);
        const light = (FILES.indexOf(sq[0]) + +sq[1]) % 2 === 1;
        const cls = ['sq', light ? 'light' : 'dark'];
        if (this.lastMove && this.lastMove.includes(sq)) cls.push('last');
        if (sq === this.selected) cls.push('sel');
        if (sq === checkSq) cls.push('check');
        if (dests.includes(sq)) cls.push(p ? 'cap' : 'dest');
        if (this.marks[sq]) cls.push('mark-' + this.marks[sq]);
        let inner = '';
        if (p) inner = `<span class="pc ${p.color}">${GLYPH[p.type]}︎</span>`;
        if (col === 0) inner += `<i class="coord r">${sq[1]}</i>`;
        if (row === 7) inner += `<i class="coord f">${sq[0]}</i>`;
        html += `<div class="${cls.join(' ')}" data-sq="${sq}">${inner}</div>`;
      }
    }
    this.boardEl.innerHTML = html;
    this._renderArrows();
  }

  _kingSquare(color) {
    for (const row of this.chess.board()) for (const s of row) if (s && s.type === 'k' && s.color === color) return s.square;
    return null;
  }

  _renderArrows() {
    let s = '<defs>';
    const colors = [...new Set(this.arrows.map((a) => a.color || '#15781b'))];
    colors.forEach((c, i) => {
      s += `<marker id="ah${i}" markerWidth="4" markerHeight="4" refX="2.05" refY="2" orient="auto"><path d="M0,0 V4 L3,2 Z" fill="${c}"/></marker>`;
    });
    s += '</defs>';
    for (const a of this.arrows) {
      const [x1, y1] = this._xy(a.from);
      const [x2, y2] = this._xy(a.to);
      const i = colors.indexOf(a.color || '#15781b');
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      const ex = x2 + 0.5 - (dx / len) * 0.35;
      const ey = y2 + 0.5 - (dy / len) * 0.35;
      s += `<line x1="${x1 + 0.5}" y1="${y1 + 0.5}" x2="${ex}" y2="${ey}" stroke="${a.color || '#15781b'}" stroke-width="0.17" stroke-linecap="round" opacity="0.85" marker-end="url(#ah${i})"/>`;
    }
    this.svg.innerHTML = s;
  }

  _movable(sq) {
    const color = this.opts.canMove?.();
    const p = this.chess.get(sq);
    return color && p && p.color === color && this.chess.turn() === color;
  }

  _tryMove(from, to) {
    const legal = this.chess.moves({ square: from, verbose: true }).filter((m) => m.to === to);
    if (!legal.length) return false;
    this.selected = null;
    if (legal.some((m) => m.promotion)) {
      this._askPromotion(from, to);
    } else {
      this.opts.onMove?.(from, to);
    }
    return true;
  }

  _askPromotion(from, to) {
    const color = this.chess.turn();
    this.promoEl.innerHTML = ['q', 'r', 'b', 'n']
      .map((p) => `<button data-p="${p}"><span class="pc ${color}">${GLYPH[p]}︎</span></button>`)
      .join('');
    this.promoEl.classList.remove('hidden');
    this.promoEl.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      this.promoEl.classList.add('hidden');
      this.opts.onMove?.(from, to, b.dataset.p);
    };
    this.render();
  }

  _bindPointer() {
    let drag = null;
    const sqFromEvent = (e) => {
      const rect = this.boardEl.getBoundingClientRect();
      const col = Math.floor(((e.clientX - rect.left) / rect.width) * 8);
      const row = Math.floor(((e.clientY - rect.top) / rect.height) * 8);
      if (col < 0 || col > 7 || row < 0 || row > 7) return null;
      return this._sqAt(col, row);
    };
    this.boardEl.addEventListener('pointerdown', (e) => {
      const sq = sqFromEvent(e);
      if (!sq) return;
      if (this.selected && this.selected !== sq && this._tryMove(this.selected, sq)) return;
      if (this._movable(sq)) {
        this.selected = sq;
        this.render();
        const pc = this.boardEl.querySelector(`[data-sq="${sq}"] .pc`);
        if (pc) {
          const ghost = pc.cloneNode(true);
          ghost.classList.add('ghost');
          const size = this.boardEl.getBoundingClientRect().width / 8;
          ghost.style.fontSize = getComputedStyle(pc).fontSize;
          ghost.style.width = ghost.style.height = size + 'px';
          document.body.appendChild(ghost);
          drag = { from: sq, ghost, size, moved: false, pc };
          this._moveGhost(drag, e);
          this.boardEl.setPointerCapture(e.pointerId);
        }
      } else {
        this.selected = null;
        this.render();
      }
    });
    this.boardEl.addEventListener('pointermove', (e) => {
      if (!drag) return;
      drag.moved = true;
      drag.pc.style.opacity = '0.3';
      this._moveGhost(drag, e);
    });
    const end = (e) => {
      if (!drag) return;
      drag.ghost.remove();
      const to = sqFromEvent(e);
      const d = drag;
      drag = null;
      if (d.moved && to && to !== d.from) {
        if (!this._tryMove(d.from, to)) this.render();
      } else {
        this.render();
      }
    };
    this.boardEl.addEventListener('pointerup', end);
    this.boardEl.addEventListener('pointercancel', end);
  }

  _moveGhost(drag, e) {
    drag.ghost.style.left = e.clientX - drag.size / 2 + 'px';
    drag.ghost.style.top = e.clientY - drag.size / 2 + 'px';
  }
}
