// 수 등급 이유 설명
// 엔진이 보여준 수순(pv)을 실제로 따라 두면서 "무엇을 잃는지/얻는지/메이트인지"를 찾아 문장으로 만듭니다.
import { Chess } from 'chess.js';
import { cpToMate } from '../engine/uci.js';
import { lookupOpening } from '../openings/openings.js';
import { THRESHOLDS } from './classify.js';

const NAME = { p: '폰', n: '나이트', b: '비숍', r: '룩', q: '퀸', k: '킹' };
const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function toObj(uci) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

/** 받침에 맞는 조사: 퀸을 / 나이트를 */
export function eul(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return word + (hasBatchim ? '을' : '를');
}

export function iga(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return word + (hasBatchim ? '이' : '가');
}

export function iro(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0 && code % 28 !== 8; // ㄹ 받침은 '로'
  return word + (hasBatchim ? '으로' : '로');
}

/**
 * 수순을 따라 둬 보면서 정보를 모읍니다.
 * @param color 기준이 되는 쪽 ('w'|'b')
 * @returns {sans, lost:[piece], won:[piece], net} net = 기준 쪽 기물 득실 (점수)
 */
export function followLine(fen, pv, plies, color) {
  const c = new Chess(fen);
  const sans = [];
  const lost = [];
  const won = [];
  let net = 0;
  for (const uci of pv.slice(0, plies)) {
    let m;
    try {
      m = c.move(toObj(uci));
    } catch {
      break;
    }
    sans.push(m.san);
    if (m.captured) {
      if (m.color === color) {
        won.push(m.captured);
        net += VALUE[m.captured];
      } else {
        lost.push(m.captured);
        net -= VALUE[m.captured];
      }
    }
    if (m.promotion) net += (m.color === color ? 1 : -1) * (VALUE[m.promotion] - 1);
  }
  return { sans, lost, won, net, chess: c };
}

function biggest(pieces) {
  return pieces.reduce((a, b) => (VALUE[b] > VALUE[a] ? b : a), pieces[0]);
}

function sanOf(fen, uci) {
  try {
    return new Chess(fen).move(toObj(uci)).san;
  } catch {
    return uci;
  }
}

const pct = (v) => Math.round(v);

/**
 * @param p.fenBefore, p.fenAfter, p.uci
 * @param p.before  {cp, best, pv}  수를 둔 쪽 기준
 * @param p.after   {cp, pv}        상대 기준
 * @param p.cls, p.winBefore, p.winAfter, p.winSecond
 * @returns {string} 줄바꿈(\n)으로 구분된 설명
 */
export function explainMove(p) {
  const { fenBefore, fenAfter, uci, before, after, cls, winBefore, winAfter, winSecond } = p;
  const me = fenBefore.split(' ')[1];
  const opp = me === 'w' ? 'b' : 'w';
  const loss = Math.max(0, winBefore - winAfter);
  const played = new Chess(fenBefore).move(toObj(uci));
  const bestSan = before.best ? sanOf(fenBefore, before.best) : null;
  const lines = [];

  if (cls === 'book') {
    const op = lookupOpening(fenAfter);
    lines.push(op ? `${op.name} 정석 수순이에요.` : '오프닝 정석 수순이에요.');
    return lines.join('\n');
  }

  if (cls === 'inaccuracy' || cls === 'mistake' || cls === 'blunder') {
    // 1) 상대가 어떻게 응징하는지
    const oppMate = cpToMate(after.cp);
    if (oppMate !== null && oppMate > 0) {
      const l = followLine(fenAfter, after.pv, Math.min(2 * oppMate - 1, 5), opp);
      lines.push(`이 수 다음 상대가 ${oppMate}수 만에 메이트할 수 있어요. (${l.sans.join(' ')}${l.sans.length < 2 * oppMate - 1 ? ' …' : ''})`);
    } else {
      const l = followLine(fenAfter, after.pv, 4, me);
      if (l.net <= -1 && l.lost.length) {
        const piece = NAME[biggest(l.lost)];
        const reply = l.sans[0];
        lines.push(`상대가 ${iro(reply)} 응수하면 ${eul(piece)} 잃게 돼요. (${l.sans.join(' ')})`);
        // 옮긴 기물을 지키지 않은 칸에 둔 경우
        const pc = new Chess(fenAfter);
        if (pc.isAttacked(played.to, opp) && !pc.isAttacked(played.to, me) && played.piece !== 'k') {
          lines.push(`옮긴 ${iga(NAME[played.piece])} 아무도 지켜주지 않는 칸에 놓였어요.`);
        }
      }
    }
    // 2) 놓친 기회
    const myMate = cpToMate(before.cp);
    if (myMate !== null && myMate > 0 && bestSan) {
      lines.push(`${bestSan}부터 시작하는 ${myMate}수 메이트가 있었어요!`);
    } else if (bestSan) {
      const g = followLine(fenBefore, before.pv, 4, me);
      if (g.net >= 2 && g.won.length) {
        lines.push(`최선수 ${iro(bestSan)} ${eul(NAME[biggest(g.won)])} 얻을 수 있었어요. (${g.sans.join(' ')})`);
      }
    }
    // 기물 손실이나 메이트 같은 뚜렷한 이유가 없으면 포지션 문제
    if (!lines.length) lines.push('당장 기물을 잃지는 않지만 포지션이 나빠지는 수예요.');
    const label = { inaccuracy: '?! 부정확', mistake: '? 실수', blunder: '?? 블런더' }[cls];
    const range = {
      inaccuracy: `${THRESHOLDS.good}~${THRESHOLDS.inaccuracy}%p`,
      mistake: `${THRESHOLDS.inaccuracy}~${THRESHOLDS.mistake}%p`,
      blunder: `${THRESHOLDS.mistake}%p 이상`,
    }[cls];
    lines.push(`이길 확률 ${pct(winBefore)}% → ${pct(winAfter)}% (−${pct(loss)}%p). ${range} 떨어지면 ${label}예요.`);
    return lines.join('\n');
  }

  if (cls === 'brilliant') {
    const l = followLine(fenAfter, after.pv, 4, me);
    const given = l.lost.length ? NAME[biggest(l.lost)] : '기물';
    lines.push(`${eul(given)} 일부러 내주는 희생수예요.`);
    const myMate = cpToMate(-after.cp);
    if (myMate !== null && myMate > 0) lines.push(`희생 다음에 ${myMate}수 메이트로 이어져요.`);
    else lines.push(`기물을 내줘도 이길 확률은 ${pct(winAfter)}%로 오히려 유리해요.`);
    lines.push('어려운 희생이면서 최선수라서 탁월수(!!)예요.');
    return lines.join('\n');
  }

  if (cls === 'great') {
    lines.push(`다른 수를 두면 이길 확률이 ${pct(winBefore - winSecond)}%p 이상 떨어져요.`);
    lines.push('이 포지션에서 사실상 유일하게 좋은 수라서 좋은 수(!)예요.');
    return lines.join('\n');
  }

  // 최선수 / 우수 / 양호
  if (cls === 'best') {
    if (played.san.includes('#')) lines.push('체크메이트! 엔진이 고른 최선수예요.');
    else {
      lines.push('엔진이 고른 최선수예요.');
      const myMate = cpToMate(-after.cp);
      if (myMate !== null && myMate > 0) lines.push(`${myMate}수 메이트로 이어져요.`);
      else if (played.captured) lines.push(`${eul(NAME[played.captured])} 잡는 수예요.`);
    }
  } else {
    lines.push(`최선수${bestSan ? `(${bestSan})` : ''}와 거의 차이 없는 수예요. (−${pct(loss)}%p)`);
  }
  return lines.join('\n');
}
