const WINDOWS_1252_BYTES = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

const HANGUL_RE = /[\u3131-\u318e\uac00-\ud7a3]/;
const MOJIBAKE_RE = /[\u0080-\u009f\u00c0-\u00ff\u20ac\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u017d\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u017e\u0178]/;

function byteFromCodePoint(codePoint) {
  if (codePoint <= 0xff) return codePoint;
  return WINDOWS_1252_BYTES.get(codePoint);
}

export function repairMojibake(value) {
  if (typeof value !== 'string' || !MOJIBAKE_RE.test(value)) return value;

  const bytes = [];
  for (const ch of value) {
    const byte = byteFromCodePoint(ch.codePointAt(0));
    if (byte == null) return value;
    bytes.push(byte);
  }

  try {
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    return HANGUL_RE.test(decoded) ? decoded : value;
  } catch {
    return value;
  }
}

export function normalizeUserText(value) {
  if (value == null) return '';
  return repairMojibake(String(value)).trim();
}

export function userDisplayName(user, fallback = '회원') {
  const candidates = [user?.nickname, user?.name, user?.email, fallback];
  for (const candidate of candidates) {
    const normalized = normalizeUserText(candidate);
    if (normalized) return normalized;
  }
  return fallback;
}

export function normalizeUserObject(user) {
  if (!user || typeof user !== 'object') return user;
  return {
    ...user,
    name: normalizeUserText(user.name),
    nickname: normalizeUserText(user.nickname),
    email: normalizeUserText(user.email),
  };
}
