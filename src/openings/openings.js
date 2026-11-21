// 포지션으로 오프닝 이름을 찾습니다. (수순이 달라도 같은 포지션이면 인식)
import TABLE from './openings.json' with { type: 'json' };

export function epd(fen) {
  return fen.split(' ').slice(0, 4).join(' ');
}

export function lookupOpening(fen) {
  const hit = TABLE[epd(fen)];
  return hit ? { eco: hit[0], name: hit[1] } : null;
}

/** 지금까지 둔 포지션들 중 가장 마지막에 인식된 오프닝 */
export function openingOfGame(fens) {
  let found = null;
  for (const f of fens) {
    const o = lookupOpening(f);
    if (o) found = o;
  }
  return found;
}
