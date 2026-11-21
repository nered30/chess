// 앱 시작점: 탭 전환 + 백그라운드 퍼즐 생성 시작
import './ui/style.css';
import { mount as mountPlay } from './play/view.js';
import { mount as mountPuzzle } from './puzzles/view.js';
import { mount as mountAnalysis } from './analysis/view.js';
import { mount as mountProfile } from './profile/view.js';
import { getGenEngine, getMainEngine } from './engine/browser.js';
import { startGenerator } from './puzzles/pool.js';

const VIEWS = { play: mountPlay, puzzle: mountPuzzle, analysis: mountAnalysis, profile: mountProfile };
const root = document.getElementById('view');
const tabs = document.getElementById('tabs');
let unmount = null;

function go(tab, payload) {
  unmount?.();
  root.dataset.view = tab;
  root.innerHTML = '';
  tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  unmount = VIEWS[tab](root, { go }, payload) || null;
  window.scrollTo(0, 0);
}

tabs.onclick = (e) => {
  const b = e.target.closest('[data-tab]');
  if (b) go(b.dataset.tab);
};

getMainEngine();
go('play');

// 앱이 켜지고 잠시 뒤부터 퍼즐을 미리 만들어 둡니다
setTimeout(() => startGenerator(getGenEngine()), 1500);
