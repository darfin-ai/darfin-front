/**
 * DartOverview 섹션에서 파생 지표를 계산하는 헬퍼.
 * DART se/nm 라벨은 회사마다 표기가 조금씩 달라 includes 매칭을 쓴다.
 */

/** 최대주주측 기말 합계 지분율 (%): nm === "계" row 우선, 없으면 합산 */
export function majorHolderTotalStake(section) {
  const rows = section?.rows ?? [];
  if (rows.length === 0) return null;
  const totalRow = rows.find((r) => r.nm === '계' || r.nm === '합계');
  if (totalRow?.trmendQotaRt != null) return totalRow.trmendQotaRt;
  const sum = rows.reduce((acc, r) => acc + (r.trmendQotaRt ?? 0), 0);
  return sum > 0 ? sum : null;
}

/** 개별 주주 rows (합계 row 제외) */
export function majorHolderRows(section) {
  return (section?.rows ?? []).filter((r) => r.nm !== '계' && r.nm !== '합계');
}

/** 소액주주 현황 첫 row */
export function minorityRow(section) {
  return section?.rows?.[0] ?? null;
}

/** 보통주 유통주식 비율 (%) = 유통주식수 / 발행주식총수 */
export function floatRatio(stockTotals) {
  const row = (stockTotals?.rows ?? []).find((r) => r.se.includes('보통주'));
  if (!row || row.istcTotqy == null || row.distbStockCo == null || row.istcTotqy === 0) return null;
  return (row.distbStockCo / row.istcTotqy) * 100;
}

/** alotMatter rows에서 se 라벨/주식종류로 값 하나 뽑기 */
export function dividendValue(dividends, seKeyword, stockKnd = null, term = 'thstrm') {
  const rows = dividends?.rows ?? [];
  const row = rows.find(
    (r) => r.se.includes(seKeyword) && (stockKnd == null || r.stockKnd === stockKnd),
  );
  return row ? row[term] : null;
}

/** 직원 총계: { total, regular, contract } */
export function employeeTotals(section) {
  const rows = section?.rows ?? [];
  if (rows.length === 0) return null;
  return rows.reduce(
    (acc, r) => ({
      total: acc.total + (r.sm ?? 0),
      regular: acc.regular + (r.rgllbrCo ?? 0),
      contract: acc.contract + (r.cnttkCo ?? 0),
    }),
    { total: 0, regular: 0, contract: 0 },
  );
}

/** 최근 연도 감사의견 row (분기 검토 행은 adtOpinion이 비어 있으므로 건너뜀) */
export function latestAuditOpinion(section) {
  const rows = [...(section?.rows ?? [])];
  rows.sort((a, b) => String(b.bsnsYear).localeCompare(String(a.bsnsYear)));
  const withOpinion = rows.find((r) => r.adtOpinion != null && String(r.adtOpinion).trim() !== '');
  return withOpinion ?? rows[0] ?? null;
}

/** 감사의견이 적정인지 (한정/부적정/의견거절이면 false) */
export function isCleanOpinion(opinion) {
  return opinion != null && opinion.includes('적정') && !opinion.includes('부적정');
}

const _DART_SECTION_KEYS = [
  'dividends',
  'majorShareholders',
  'majorShareholderChanges',
  'minorityShareholders',
  'employees',
  'treasuryStock',
  'capitalChanges',
  'stockTotals',
  'executives',
  'auditOpinions',
];

/** DartOverview에 표시할 섹션 데이터가 하나라도 있는지 */
export function hasDartOverviewData(dartOverview) {
  if (!dartOverview) return false;
  return _DART_SECTION_KEYS.some((key) => (dartOverview[key]?.rows?.length ?? 0) > 0);
}
