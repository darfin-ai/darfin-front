const TRILLION = 1_000_000_000_000;
const HUNDRED_MILLION = 100_000_000;

/**
 * Compact Korean currency formatting for large KRW figures produced by the
 * DART-scale mock data (already-scaled actual KRW, see mocks/companyAnalysis/types.js).
 * @param {number} value
 */
export function formatKrwCompact(value) {
  if (value == null || Number.isNaN(value)) return '-';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= TRILLION) return `${sign}${(abs / TRILLION).toFixed(1)}조원`;
  if (abs >= HUNDRED_MILLION) return `${sign}${(abs / HUNDRED_MILLION).toFixed(0)}억원`;
  return `${sign}${abs.toLocaleString('ko-KR')}원`;
}

/** @param {number} value @param {number} [digits] */
export function formatPercent(value, digits = 1) {
  if (value == null || Number.isNaN(value)) return '-';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

/** "2026Q1" -> "26.1Q" (compact, for chart axes) */
export function formatQuarterAxis(quarter) {
  const match = /^(\d{4})Q(\d)$/.exec(quarter);
  if (!match) return quarter;
  const [, year, q] = match;
  return `${year.slice(2)}.${q}Q`;
}

/** "2026Q1" -> "2026년 1분기" (full, for labels/tooltips) */
export function formatQuarterFull(quarter) {
  const match = /^(\d{4})Q(\d)$/.exec(quarter);
  if (!match) return quarter;
  const [, year, q] = match;
  return `${year}년 ${q}분기`;
}

/** "2026-05-15" -> "2026.05.15" */
export function formatFilingDate(isoDate) {
  if (!isoDate) return '-';
  return isoDate.replaceAll('-', '.');
}
