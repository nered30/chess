// Glicko-2 레이팅 계산
// Elo 를 개선한 방식으로, 레이팅(r) 외에 "얼마나 확실한지(rd)"도 함께 관리합니다.
// 처음에는 rd 가 커서 레이팅이 크게 움직이고, 판수가 쌓일수록 안정됩니다.
const SCALE = 173.7178;
const TAU = 0.5;

export function newRating() {
  return { r: 1500, rd: 250, vol: 0.06, games: 0 };
}

function g(phi) {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function E(mu, muj, phij) {
  return 1 / (1 + Math.exp(-g(phij) * (mu - muj)));
}

/**
 * @param player {r, rd, vol}
 * @param opp    {r, rd}  상대(AI 단계나 퍼즐 난이도)
 * @param score  1 승리, 0.5 무승부, 0 패배
 */
export function updateRating(player, opp, score) {
  const mu = (player.r - 1500) / SCALE;
  const phi = player.rd / SCALE;
  const muj = (opp.r - 1500) / SCALE;
  const phij = (opp.rd ?? 60) / SCALE;
  const sigma = player.vol;

  const gj = g(phij);
  const e = E(mu, muj, phij);
  const v = 1 / (gj * gj * e * (1 - e));
  const delta = v * gj * (score - e);

  // 변동성(vol) 갱신 — Glickman 논문의 반복 계산
  const a = Math.log(sigma * sigma);
  const f = (x) => {
    const ex = Math.exp(x);
    return (ex * (delta * delta - phi * phi - v - ex)) / (2 * (phi * phi + v + ex) ** 2) - (x - a) / (TAU * TAU);
  };
  let A = a;
  let B;
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0) k++;
    B = a - k * TAU;
  }
  let fA = f(A);
  let fB = f(B);
  for (let i = 0; i < 100 && Math.abs(B - A) > 1e-6; i++) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA /= 2;
    }
    B = C;
    fB = fC;
  }
  const newSigma = Math.exp(A / 2);

  const phiStar = Math.sqrt(phi * phi + newSigma * newSigma);
  const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const newMu = mu + newPhi * newPhi * gj * (score - e);

  return {
    r: Math.round(newMu * SCALE + 1500),
    rd: Math.max(45, Math.round(newPhi * SCALE)),
    vol: newSigma,
    games: (player.games || 0) + 1,
  };
}

/** rd 가 크면 아직 "임시" 레이팅으로 표시합니다 */
export function isProvisional(rating) {
  return rating.rd > 110;
}
