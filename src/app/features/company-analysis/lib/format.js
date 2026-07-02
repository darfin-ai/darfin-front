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

/**
 * Formats one series point's value for a FinancialMetric (see mocks/companyAnalysis/types.js) —
 * shared by the trend charts and the trend table so both render the same number the same way.
 * @param {import('../../../../mocks/companyAnalysis/types').FinancialMetric} metric @param {number} value
 */
export function formatFinancialMetricValue(metric, value) {
  return metric.unit === '%' ? formatPercent(value) : formatKrwCompact(value);
}

/**
 * Formats a single value from a NumericDeltaMetric (see mocks/companyAnalysis/types.js)
 * according to its unit — 'count' is a plain integer plus an optional Korean suffix.
 * @param {'KRW'|'%'|'count'} unit @param {number} value @param {string} [unitLabel]
 */
export function formatMetricValue(unit, value, unitLabel = '') {
  if (value == null || Number.isNaN(value)) return '-';
  if (unit === 'KRW') return formatKrwCompact(value);
  if (unit === '%') return `${value.toFixed(1)}%`;
  return `${value.toLocaleString('ko-KR')}${unitLabel}`;
}

/**
 * Formats a current-vs-baseline delta for a NumericDeltaMetric. Percent-unit
 * deltas are expressed in percentage points ("p") rather than run through
 * formatPercent's relative-change semantics, since a swing from e.g. 30% to
 * 35% is a 5%p move, not a 16.7% one.
 * @param {'KRW'|'%'|'count'} unit @param {number} delta @param {string} [unitLabel]
 */
export function formatMetricDelta(unit, delta, unitLabel = '') {
  if (delta == null || Number.isNaN(delta)) return '-';
  const sign = delta > 0 ? '+' : '';
  if (unit === 'KRW') return `${sign}${formatKrwCompact(delta)}`;
  if (unit === '%') return `${sign}${delta.toFixed(1)}%p`;
  return `${sign}${delta.toLocaleString('ko-KR')}${unitLabel}`;
}
