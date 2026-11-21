// UCI 엔진 래퍼
// UCI = 체스 엔진과 대화하는 표준 텍스트 규약입니다.
// transport 는 { send(cmd), onLine } 형태라서 브라우저(Worker)와 Node(테스트) 모두에서 같은 코드를 씁니다.
//
// 점수 표기 규칙: 이 앱 안에서 평가값은 항상 "정수 cp" 하나로 다룹니다.
//   - cp(centipawn) = 폰 1개 = 100
//   - 메이트는 ±(MATE_BASE - 수 * 100) 로 변환합니다. 예) 3수 메이트 = 99700
export const MATE_BASE = 100000;

export function mateToCp(mate) {
  if (mate === 0) return -MATE_BASE; // 이미 메이트 당한 상태
  return mate > 0 ? MATE_BASE - mate * 100 : -MATE_BASE - mate * 100;
}

export function isMateCp(cp) {
  return Math.abs(cp) >= MATE_BASE - 100 * 100;
}

// 메이트까지 남은 수 (양수 = 이 쪽이 메이트 시킴)
export function cpToMate(cp) {
  if (!isMateCp(cp)) return null;
  return cp > 0 ? Math.round((MATE_BASE - cp) / 100) : -Math.round((MATE_BASE + cp) / 100);
}

export function parseInfo(line) {
  if (!line.startsWith('info ') || !line.includes(' pv ')) return null;
  const t = line.split(' ');
  const info = { multipv: 1, depth: 0, cp: 0, pv: [], bound: null };
  for (let i = 1; i < t.length; i++) {
    switch (t[i]) {
      case 'depth': info.depth = +t[++i]; break;
      case 'multipv': info.multipv = +t[++i]; break;
      case 'score': {
        const kind = t[++i];
        const v = +t[++i];
        info.cp = kind === 'mate' ? mateToCp(v) : v;
        info.mate = kind === 'mate' ? v : null;
        break;
      }
      case 'lowerbound': case 'upperbound': info.bound = t[i]; break;
      case 'pv': info.pv = t.slice(i + 1); i = t.length; break;
    }
  }
  return info;
}

export class UciEngine {
  constructor(transport) {
    this.t = transport;
    this.listeners = new Set();
    this.options = {};
    this.chain = Promise.resolve();
    transport.onLine = (line) => {
      for (const fn of [...this.listeners]) fn(line);
    };
  }

  _waitFor(pred, cmds = []) {
    return new Promise((resolve) => {
      const fn = (line) => {
        if (pred(line)) {
          this.listeners.delete(fn);
          resolve(line);
        }
      };
      this.listeners.add(fn);
      cmds.forEach((c) => this.t.send(c));
    });
  }

  // 명령이 섞이지 않도록 작업을 한 번에 하나씩 실행합니다
  _exclusive(task) {
    const p = this.chain.then(task);
    this.chain = p.catch(() => {});
    return p;
  }

  _ready() {
    return this._waitFor((l) => l === 'readyok', ['isready']);
  }

  _setOptions(opts) {
    for (const [k, v] of Object.entries(opts)) {
      if (this.options[k] !== v) {
        this.t.send(`setoption name ${k} value ${v}`);
        this.options[k] = v;
      }
    }
  }

  init() {
    return this._exclusive(async () => {
      await this._waitFor((l) => l === 'uciok', ['uci']);
      await this._ready();
    });
  }

  newGame() {
    return this._exclusive(async () => {
      this.t.send('ucinewgame');
      await this._ready();
    });
  }

  // 지금 돌고 있는 탐색을 멈춥니다 (대기열은 건드리지 않음)
  stop() {
    this.t.send('stop');
  }

  /**
   * 포지션을 탐색합니다.
   * @returns {{bestmove, lines:[{multipv, depth, cp, mate, pv}], firstDepthOfBest}}
   *   cp 는 "둘 차례인 쪽" 기준 점수입니다.
   */
  search({ fen, moves = [], depth, movetime, nodes, multipv = 1, options = {} }) {
    return this._exclusive(async () => {
      this._setOptions({ MultiPV: multipv, ...options });
      await this._ready();
      const lines = [];
      const bestHistory = []; // 깊이별 1순위 수 (난이도 추정에 사용)
      const onInfo = (line) => {
        const info = parseInfo(line);
        if (!info || info.bound) return;
        lines[info.multipv - 1] = info;
        if (info.multipv === 1) bestHistory.push([info.depth, info.pv[0]]);
      };
      this.listeners.add(onInfo);
      this.t.send(`position fen ${fen}${moves.length ? ' moves ' + moves.join(' ') : ''}`);
      let go = 'go';
      if (depth) go += ` depth ${depth}`;
      if (movetime) go += ` movetime ${movetime}`;
      if (nodes) go += ` nodes ${nodes}`;
      const bm = await this._waitFor((l) => l.startsWith('bestmove'), [go]);
      this.listeners.delete(onInfo);
      const bestmove = bm.split(' ')[1];
      return {
        bestmove: bestmove === '(none)' ? null : bestmove,
        lines: lines.filter(Boolean),
        bestHistory,
      };
    });
  }
}

// 분석용 최대 실력 설정
export const FULL_STRENGTH = { UCI_LimitStrength: false, 'Skill Level': 20 };
