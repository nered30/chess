// 폰 안에 데이터를 저장합니다 (localStorage). 실패해도 앱이 멈추지 않게 감쌉니다.
const PREFIX = 'ck.';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* 저장 공간 부족 등은 무시 */
  }
}
