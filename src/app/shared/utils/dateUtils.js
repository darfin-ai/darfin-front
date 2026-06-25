/**
 * Returns a Korean relative time string from an ISO date string.
 * @param {string} dateStr
 * @returns {string}
 */
export function formatRelativeKorean(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((nowDay - dateDay) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return '오늘';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 28) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

/**
 * Formats an ISO date string as YYYY.MM.DD.
 * @param {string} dateStr
 * @returns {string}
 */
export function formatKorDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
