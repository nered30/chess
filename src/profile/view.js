// 기록 화면: 레이팅, 레이팅 변화 그래프, 전적, 데이터 초기화, 라이선스 정보
import { getRatings } from '../rating/ratings.js';
import { isProvisional } from '../rating/glicko2.js';
import { gameStats } from '../play/history.js';
import { load } from '../storage/storage.js';
import { $ } from '../ui/dom.js';

export function mount(root) {
  const R = getRatings();
  const gs = gameStats();
  const ps = load('puzzleStats', { solved: 0, failed: 0 });
  const fmt = (r) => `${r.r}${isProvisional(r) ? '?' : ''}`;
  root.innerHTML = `
    <div class="panel">
      <h2>퍼즐 레이팅</h2>
      <div class="big">${fmt(R.puzzle)}</div>
      <div class="muted">±${R.puzzle.rd} · ${R.puzzle.games}문제 · 성공 ${ps.solved} / 실패 ${ps.failed}</div>
      <canvas class="graph" id="gp" style="margin-top:8px"></canvas>
      <h2>대국 레이팅</h2>
      <div class="big">${fmt(R.game)}</div>
      <div class="muted">±${R.game.rd} · ${gs.win}승 ${gs.draw}무 ${gs.loss}패</div>
      <canvas class="graph" id="gg" style="margin-top:8px"></canvas>
      <div class="muted" style="margin-top:8px">'?' 표시는 아직 판수가 적어서 정확하지 않은 임시 레이팅이에요. 레이팅은 앱 안에서의 추정치예요.</div>
      <h2>데이터</h2>
      <div class="row"><button class="btn" id="reset">모든 기록 초기화</button></div>
      <h2>정보</h2>
      <div class="muted">
        체스 엔진: Stockfish 18 (GPL-3.0) · stockfish.js by Nathan Rugg / Chess.com<br>
        오프닝 이름: lichess-org/chess-openings (CC0)<br>
        기물 그림: cburnett (Colin M.L. Burnett, GPLv2+)<br>
        이 앱은 AGPL-3.0 라이선스로 배포됩니다. 모든 계산은 폰 안에서 이루어져요.
      </div>
    </div>`;
  drawLine($('#gp', root), R.history.filter((h) => h.kind === 'puzzle').map((h) => h.r));
  drawLine($('#gg', root), R.history.filter((h) => h.kind === 'game').map((h) => h.r));
  $('#reset', root).onclick = () => {
    if (!confirm('레이팅, 대국 기록, 퍼즐 기록을 모두 지울까요?')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ck.') && k !== 'ck.pool' && k !== 'ck.seen')
      .forEach((k) => localStorage.removeItem(k));
    mount(root);
  };
}

function drawLine(canvas, vals) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const g = canvas.getContext('2d');
  g.scale(dpr, dpr);
  if (vals.length < 2) {
    g.fillStyle = '#8a8a8a';
    g.font = '12px sans-serif';
    g.fillText('기록이 쌓이면 그래프가 보여요', 8, h / 2 + 4);
    return;
  }
  const min = Math.min(...vals) - 20;
  const max = Math.max(...vals) + 20;
  const y = (v) => h - ((v - min) / (max - min)) * h;
  g.strokeStyle = '#629924';
  g.lineWidth = 2;
  g.beginPath();
  vals.forEach((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    if (i) g.lineTo(x, y(v));
    else g.moveTo(x, y(v));
  });
  g.stroke();
  g.fillStyle = '#8a8a8a';
  g.font = '11px sans-serif';
  g.fillText(String(Math.max(...vals)), 4, 12);
  g.fillText(String(Math.min(...vals)), 4, h - 4);
}
