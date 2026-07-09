/**
 * 재무 추이(Financial Trends) 탭 UI 검증용 목데이터.
 * DEV에서 companyAnalysisApi.fetchCompanyDetail이 404일 때 병합해 사용한다.
 * 계약은 types.js의 FinancialMetric 참조.
 *
 * corpCode:
 *   88888888 — dense (대형사 스케일: 50+ BS 행, 60–80분기, 연결·별도)
 *   77777777 — sparse (소수 계정·분기, 별도 없음)
 *   99999999 — empty (dartOverview sparse와 동일, 재무 지표 없음)
 */

/** @typedef {import('./types').FinancialMetric} FinancialMetric */
/** @typedef {import('./types').FinancialSeriesPoint} FinancialSeriesPoint */
/** @typedef {import('./types').CompanyDetail} CompanyDetail */

export const DENSE_FINANCIAL_CORP_CODE = '88888888';
export const SPARSE_FINANCIAL_CORP_CODE = '77777777';
export const EMPTY_FINANCIAL_CORP_CODE = '99999999';

const LONG_LABEL = '기타포괄손익-공정가치측정금융자산평가손익';

/** @returns {FinancialSeriesPoint[]} */
function buildQuarters(count = 68, startYear = 2009, startQuarter = 1) {
  /** @type {FinancialSeriesPoint[]} */
  const points = [];
  let year = startYear;
  let quarter = startQuarter;
  for (let i = 0; i < count; i += 1) {
    points.push({ quarter: `${year}Q${quarter}`, value: 0 });
    quarter += 1;
    if (quarter > 4) {
      quarter = 1;
      year += 1;
    }
  }
  return points;
}

/**
 * @param {string} label
 * @param {'재무상태표'|'손익계산서'|'현금흐름표'} statementType
 * @param {number} scale
 * @param {{ quarters?: number, growth?: number, lossAt?: number, concept?: string }} [opts]
 * @returns {FinancialMetric}
 */
function metric(label, statementType, scale, opts = {}) {
  const { quarters = 68, growth = 0.02, lossAt, concept = '' } = opts;
  const template = buildQuarters(quarters);
  const series = template.map((point, index) => {
    let value = scale * (1 + growth) ** index;
    if (lossAt != null && index === lossAt) value = -Math.abs(scale) * 0.35;
    return { ...point, value: Math.round(value) };
  });
  return { concept, label, statementType, unit: 'KRW', series };
}

/** @returns {FinancialMetric[]} */
function buildBalanceSheetMetrics() {
  const assetItems = [
    '현금및현금성자산',
    '단기금융상품',
    '매출채권',
    '미수금',
    '재고자산',
    '기타유동금융자산',
    '기타유동자산',
    '장기금융상품',
    '장기투자증권',
    '유형자산',
    '무형자산',
    '투자부동산',
    '이연법인세자산',
    '기타비유동금융자산',
    '기타비유동자산',
    '관계기업투자',
    '종속기업투자',
    '사용권자산',
    '리스채권',
    '파생금융자산',
    '보험계약자산',
    '순확정급여자산',
    '이연수수료자산',
    '건설중인자산',
    '생물자산',
    '매각예정비유동자산',
    '단기대여금',
    '장기대여금',
    '선급금',
    '선급비용',
    '당기법인세자산',
    '기타포괄손익-공정가치측정금융자산',
    LONG_LABEL,
  ];

  const liabilityItems = [
    '매입채무',
    '단기차입금',
    '유동성장기부채',
    '미지급금',
    '선수금',
    '기타유동금융부채',
    '기타유동부채',
    '사채',
    '장기차입금',
    '퇴직급여부채',
    '이연법인세부채',
    '기타비유동금융부채',
    '기타비유동부채',
    '리스부채',
    '파생금융부채',
    '충당부채',
    '당기법인세부채',
  ];

  const equityItems = [
    '자본금',
    '자본잉여금',
    '이익잉여금',
    '기타자본항목',
    '기타포괄손익누계액',
    '비지배지분',
  ];

  return [
    metric('자산', '재무상태표', 0),
    metric('유동자산', '재무상태표', 0),
    ...assetItems.slice(0, 18).map((name, i) => metric(name, '재무상태표', 8_000_000_000_000 * (1 + i * 0.04))),
    metric('비유동자산', '재무상태표', 0),
    ...assetItems.slice(18).map((name, i) => metric(name, '재무상태표', 12_000_000_000_000 * (1 + i * 0.03))),
    metric('자산총계', '재무상태표', 450_000_000_000_000, { concept: 'ifrs-full_Assets' }),
    metric('부채', '재무상태표', 0),
    metric('유동부채', '재무상태표', 0),
    ...liabilityItems.slice(0, 9).map((name, i) => metric(name, '재무상태표', 5_000_000_000_000 * (1 + i * 0.05))),
    metric('비유동부채', '재무상태표', 0),
    ...liabilityItems.slice(9).map((name, i) => metric(name, '재무상태표', 7_000_000_000_000 * (1 + i * 0.04))),
    metric('부채총계', '재무상태표', 120_000_000_000_000, { concept: 'ifrs-full_Liabilities' }),
    metric('자본', '재무상태표', 0),
    ...equityItems.map((name, i) => metric(name, '재무상태표', 40_000_000_000_000 * (1 + i * 0.06))),
    metric('자본총계', '재무상태표', 330_000_000_000_000, { concept: 'ifrs-full_Equity' }),
  ];
}

/** @returns {FinancialMetric[]} */
function buildIncomeStatementMetrics() {
  const profitLines = [
    '매출총이익',
    '판매비와관리비',
    '영업외수익',
    '영업외비용',
    '금융수익',
    '금융비용',
    '법인세비용',
    '당기순이익',
    '지배기업소유주지분순이익',
    '비지배지분순이익',
    '기타영업외이익',
    '기타영업외손실',
    '지분법이익',
    '지분법손실',
    '계속영업이익',
    '중단영업이익',
  ];

  return [
    metric('매출액', '손익계산서', 75_000_000_000_000),
    metric('매출원가', '손익계산서', 48_000_000_000_000),
    metric('영업이익', '손익계산서', 12_000_000_000_000, { lossAt: 42 }),
    ...profitLines.map((name, i) => metric(name, '손익계산서', 3_000_000_000_000 * (1 + i * 0.1))),
  ];
}

/** @returns {FinancialMetric[]} */
function buildCashFlowMetrics() {
  const cfDetail = [
    '당기순이익',
    '감가상각비',
    '무형자산상각비',
    '퇴직급여',
    '이자비용',
    '이자수익',
    '법인세비용',
    '운전자본변동',
    '유형자산의취득',
    '무형자산의취득',
    '현금및현금성자산의증가',
  ];

  return [
    metric('영업활동현금흐름', '현금흐름표', 18_000_000_000_000),
    ...cfDetail.slice(0, 8).map((name, i) => metric(name, '현금흐름표', 2_000_000_000_000 * (1 + i * 0.08))),
    metric('투자활동현금흐름', '현금흐름표', -9_000_000_000_000),
    ...cfDetail.slice(8, 10).map((name, i) => metric(name, '현금흐름표', -1_500_000_000_000 * (1 + i * 0.1))),
    metric('재무활동현금흐름', '현금흐름표', -4_500_000_000_000),
    metric(cfDetail[10], '현금흐름표', -800_000_000_000),
  ];
}

/** @returns {FinancialMetric[]} */
export function buildDenseFinancials() {
  return [
    ...buildBalanceSheetMetrics(),
    ...buildIncomeStatementMetrics(),
    ...buildCashFlowMetrics(),
  ];
}

/** @returns {FinancialMetric[]} */
function buildDenseSeparateFinancials() {
  return buildDenseFinancials().map((m) => ({
    ...m,
    label: `${m.label} (별도)`,
    series: m.series.map((p) => ({ ...p, value: Math.round(p.value * 0.82) })),
  }));
}

/** @returns {FinancialMetric[]} */
function buildSparseFinancials() {
  return [
    metric('매출액', '손익계산서', 1_200_000_000_000, { quarters: 3 }),
    metric('영업이익', '손익계산서', 180_000_000_000, { quarters: 3 }),
    metric('자산총계', '재무상태표', 3_500_000_000_000, { quarters: 2 }),
    metric('영업활동현금흐름', '현금흐름표', 220_000_000_000, { quarters: 2 }),
  ];
}

/**
 * @param {string} corpCode
 * @param {string} name
 * @returns {CompanyDetail}
 */
function shellDetail(corpCode, name) {
  return {
    company: {
      id: corpCode,
      name,
      ticker: corpCode.slice(0, 6),
      sector: '반도체·전자',
      latestFilingType: '사업보고서',
      latestFilingDate: '2026-03-30',
      changeSummary: '',
    },
    scores: [],
    financials: [],
    findings: [],
    profile: { businessSummary: '' },
    mdnaHistory: [],
    recentFilings: [],
  };
}

/**
 * DEV 전용: 백엔드 없이 재무 추이 UI를 확인할 수 있는 CompanyDetail 껍데기.
 * @param {string} corpCode
 * @returns {CompanyDetail|null}
 */
export async function mockDevFinancialDetailFor(corpCode) {
  if (corpCode === DENSE_FINANCIAL_CORP_CODE) {
    return {
      ...shellDetail(corpCode, '다핀전자(재무·dense)'),
      financials: buildDenseFinancials(),
      financialsSeparate: buildDenseSeparateFinancials(),
    };
  }
  if (corpCode === SPARSE_FINANCIAL_CORP_CODE) {
    return {
      ...shellDetail(corpCode, '다핀소재(재무·sparse)'),
      financials: buildSparseFinancials(),
    };
  }
  if (corpCode === EMPTY_FINANCIAL_CORP_CODE) {
    const { DART_OVERVIEW_FIXTURES } = await import('./dartOverview');
    return {
      ...shellDetail(corpCode, '다핀바이오(목)'),
      financials: [],
      financialsSeparate: [],
      dartOverview: DART_OVERVIEW_FIXTURES.sparse,
    };
  }
  return null;
}
