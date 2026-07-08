const TRILLION = 1_000_000_000_000;
const HUNDRED_MILLION = 100_000_000;

/**
 * Compact currency formatting for large KRW figures produced by the
 * DART-scale mock data (already-scaled actual KRW, see mocks/companyAnalysis/types.js).
 * @param {number} value
 * @param {'ko'|'en'} [locale]
 */
export function formatKrwCompact(value, locale = 'ko') {
  if (value == null || Number.isNaN(value)) return '-';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (locale === 'en') {
    if (abs >= TRILLION) return `${sign}${(abs / TRILLION).toFixed(1)}T KRW`;
    if (abs >= HUNDRED_MILLION) return `${sign}${(abs / HUNDRED_MILLION).toFixed(0)}00M KRW`;
    return `${sign}${abs.toLocaleString('en-US')} KRW`;
  }
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

/** "2026Q1" -> "26Q1" (compact, for chart axes) */
export function formatQuarterAxis(quarter) {
  const match = /^(\d{4})Q(\d)$/.exec(quarter);
  if (!match) return quarter;
  const [, year, q] = match;
  return `${year.slice(2)}Q${q}`;
}

/** "2026Q1" -> "2026년 1분기" / "Q1 2026" (full, for labels/tooltips) */
export function formatQuarterFull(quarter, locale = 'ko') {
  const match = /^(\d{4})Q(\d)$/.exec(quarter);
  if (!match) return quarter;
  const [, year, q] = match;
  if (locale === 'en') return `Q${q} ${year}`;
  return `${year}년 ${q}분기`;
}

/** "2026-05-15" -> "2026.05.15" */
export function formatFilingDate(isoDate) {
  if (!isoDate) return '-';
  return isoDate.replaceAll('-', '.');
}

/** ISO date or YYYYMMDD → relative label for monitored cards. */
export function formatRelativeFilingAge(dateInput, locale = 'ko') {
  if (!dateInput) return null;
  const normalized = String(dateInput).length === 8 && !String(dateInput).includes('-')
    ? `${dateInput.slice(0, 4)}-${dateInput.slice(4, 6)}-${dateInput.slice(6, 8)}`
    : dateInput;
  const filed = new Date(normalized);
  if (Number.isNaN(filed.getTime())) return null;
  const days = Math.floor((Date.now() - filed.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return locale === 'en' ? 'Today' : '오늘';
  }
  if (days === 1) {
    return locale === 'en' ? '1 day ago' : '1일 전';
  }
  return locale === 'en' ? `${days} days ago` : `${days}일 전`;
}

/**
 * Formats one series point's value for a FinancialMetric (see mocks/companyAnalysis/types.js) —
 * shared by the trend charts and the trend table so both render the same number the same way.
 * @param {import('../../../../mocks/companyAnalysis/types').FinancialMetric} metric @param {number} value @param {'ko'|'en'} [locale]
 */
export function formatFinancialMetricValue(metric, value, locale = 'ko') {
  return metric.unit === '%' ? formatPercent(value) : formatKrwCompact(value, locale);
}

/**
 * Formats a single value from a NumericDeltaMetric (see mocks/companyAnalysis/types.js)
 * according to its unit — 'count' is a plain integer plus an optional Korean suffix.
 * @param {'KRW'|'%'|'count'} unit @param {number} value @param {string} [unitLabel] @param {'ko'|'en'} [locale]
 */
export function formatMetricValue(unit, value, unitLabel = '', locale = 'ko') {
  if (value == null || Number.isNaN(value)) return '-';
  if (unit === 'KRW') return formatKrwCompact(value, locale);
  if (unit === '%') return `${value.toFixed(1)}%`;
  return `${value.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR')}${unitLabel}`;
}

/**
 * Formats a current-vs-baseline delta for a NumericDeltaMetric. Percent-unit
 * deltas are expressed in percentage points ("p") rather than run through
 * formatPercent's relative-change semantics, since a swing from e.g. 30% to
 * 35% is a 5%p move, not a 16.7% one.
 * @param {'KRW'|'%'|'count'} unit @param {number} delta @param {string} [unitLabel] @param {'ko'|'en'} [locale]
 */
export function formatMetricDelta(unit, delta, unitLabel = '', locale = 'ko') {
  if (delta == null || Number.isNaN(delta)) return '-';
  const sign = delta > 0 ? '+' : '';
  if (unit === 'KRW') return `${sign}${formatKrwCompact(delta, locale)}`;
  if (unit === '%') return `${sign}${delta.toFixed(1)}%p`;
  return `${sign}${delta.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR')}${unitLabel}`;
}
