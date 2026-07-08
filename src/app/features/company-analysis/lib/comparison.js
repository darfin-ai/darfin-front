/**
 * 공시 변경 (filing comparison) framework.
 *
 * A quarterly filing isn't compared against a single "previous" filing —
 * different sections need different baselines depending on what's actually
 * comparable:
 *   - QoQ baseline is the immediately preceding filing. For a Q1 report
 *     that's the prior fiscal year's 사업보고서 (there's no Q4 분기보고서 —
 *     annual filings cover Q4).
 *   - YoY baseline is the same-quarter filing one year earlier, so seasonal
 *     effects don't get mistaken for real change.
 * We never diff a 분기보고서's 재무제표 (quarterly figures) against a
 * 사업보고서's (annual figures) as if they were the same kind of number —
 * each SectionDiffEntry says which baseline it was measured against, and
 * DIFF_SECTION_CONFIG below says which baselines make sense per section.
 */

/**
 * One row per (section, comparisonType) pair this feature analyzes.
 * Order here is the display order in the 공시 변경 tab.
 * @type {{ sectionLabel: string, analysisType: import('../../../../mocks/companyAnalysis/types').DiffAnalysisType, goals: Partial<Record<'QoQ'|'YoY', string>> }[]}
 */
export const DIFF_SECTION_CONFIG = [
  { sectionLabel: '회사의 개요', analysisType: 'structural', goals: { QoQ: '조직 구조 변화 감지' } },
  { sectionLabel: '사업의 내용', analysisType: 'text', goals: { QoQ: '사업 전략 변화 감지', YoY: '장기 전략 방향 전환 감지' } },
  { sectionLabel: '위험요인', analysisType: 'text', goals: { QoQ: '신규 공시 위험 감지', YoY: '위험 증가·감소 추세 파악' } },
  { sectionLabel: '재무상태표', analysisType: 'numeric', goals: { QoQ: '연말 대비 재무상태 변화 감지', YoY: '장기 재무상태 추세 파악' } },
  { sectionLabel: '손익계산서', analysisType: 'numeric', goals: { YoY: '핵심 손익 분석', QoQ: '실적 모멘텀 분석' } },
  { sectionLabel: '현금흐름표', analysisType: 'numeric', goals: { YoY: '현금창출 추세 파악', QoQ: '최근 현금흐름 변화 파악' } },
  { sectionLabel: '주석', analysisType: 'text_numeric', goals: { QoQ: '회계·공시 방식 변화 감지', YoY: '장기 공시 항목 변화 감지' } },
  { sectionLabel: '계열회사 현황', analysisType: 'structural', goals: { QoQ: '신규 종속회사·지분 변경 감지' } },
  { sectionLabel: '중요한 계약', analysisType: 'text', goals: { QoQ: '신규 사업 계약 감지' } },
  { sectionLabel: '임원 및 직원', analysisType: 'headcount', goals: { QoQ: '채용·구조조정 감지', YoY: '인력 추세 파악' } },
  { sectionLabel: '주주현황', analysisType: 'ownership', goals: { QoQ: '지분 변동 감지', YoY: '장기 지분 추세 파악' } },
  { sectionLabel: '지배구조', analysisType: 'event', goals: { QoQ: '지배구조 변경 감지' } },
];

function quarterSuffix(period) {
  return /(\d)분기/.exec(period)?.[1] ?? null;
}

function periodYear(period) {
  const match = /^(\d{4})/.exec(period);
  return match ? Number(match[1]) : null;
}

/**
 * Derives the three filings a comparison run needs from a company's
 * recentFilings list (assumed sorted newest-first, as authored in mocks):
 * the current filing, its QoQ baseline (the filing immediately before it),
 * and its YoY baseline (same quarter, one year back).
 * @param {import('../../../../mocks/companyAnalysis/types').RecentFiling[]} recentFilings
 */
export function getFilingContext(recentFilings) {
  const current = recentFilings[0];
  const qoqBaseline = recentFilings[1];
  const currentQuarter = quarterSuffix(current?.period ?? '');
  const currentYear = periodYear(current?.period ?? '');
  const yoyBaseline = recentFilings.find(
    (f, i) => i > 0 && quarterSuffix(f.period) === currentQuarter && periodYear(f.period) === currentYear - 1,
  );
  return { current, qoqBaseline, yoyBaseline };
}

/** @param {import('../../../../mocks/companyAnalysis/types').RecentFiling} [filing] */
export function baselineLabel(filing) {
  if (!filing) return '';
  return `${filing.period} ${filing.type}`;
}

/**
 * Groups a flat SectionDiffEntry[] into the section → comparison-block
 * structure the 공시 변경 tab renders, following DIFF_SECTION_CONFIG's
 * order. Every configured (section, comparisonType) pair is included even
 * with zero matching entries, so the page always shows what was checked —
 * not just what changed.
 * @param {import('../../../../mocks/companyAnalysis/types').SectionDiffEntry[]} diffs
 */
export function groupDiffsBySection(diffs) {
  return DIFF_SECTION_CONFIG.map((config) => {
    const sectionEntries = diffs.filter((d) => d.sectionLabel === config.sectionLabel);
    const blocks = Object.entries(config.goals).map(([comparisonType, goal]) => ({
      comparisonType,
      goal,
      entries: sectionEntries.filter((d) => d.comparisonType === comparisonType),
    }));
    return { sectionLabel: config.sectionLabel, analysisType: config.analysisType, blocks };
  });
}
