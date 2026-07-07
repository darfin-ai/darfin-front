/**
 * 공시 재무제표 표의 행 역할·깊이를 추정해 계정 목록에 계층형 스타일을 적용한다.
 * DART fnlttSinglAcntAll에는 depth 필드가 없어 라벨·concept·순서 휴리스틱을 쓴다.
 */

/** @typedef {'section' | 'category' | 'total' | 'item'} FinancialRowRole */

/**
 * @typedef {Object} FinancialRowStyle
 * @property {FinancialRowRole} role
 * @property {number} depth 0=최상위, 1=중분류, 2=세부 계정
 * @property {boolean} [sectionBreak] 주요 블록(자산/부채/자본) 경계
 */

/** @param {string} label */
function baseName(label) {
  return label.replace(/ \((재무상태표|손익계산서|현금흐름표)\)$/, '');
}

/** @param {string} label */
function normalizeLabel(label) {
  return baseName(label)
    .replace(/\s*\(주\d+\)/g, '')
    .replace(/^[IVXLC]+\.\s*/i, '')
    .replace(/^\d+[\.)]\s*/, '')
    .replace(/^[\[(]?[가-힣]\s*[\])\.]\s*/, '')
    .replace(/\s/g, '');
}

const BS_SECTIONS = new Set(['자산', '부채', '자본']);
const BS_CATEGORIES = new Set([
  '유동자산',
  '비유동자산',
  '유동부채',
  '비유동부채',
  '금융업자산',
  '금융업부채',
]);
const BS_GRAND_TOTALS = new Set([
  '자산총계',
  '부채총계',
  '자본총계',
  '부채및자본총계',
  '부채와자본총계',
  '자본과부채총계',
]);

const IS_TOP_LINES = new Set(['매출액', '매출원가', '판매비와관리비', '영업비용']);
const IS_SUBTOTAL_RE =
  /^(매출총이익|영업이익|.*순이익|.*순손실|법인세비용|.*세전이익|.*세전손실|.*계속영업.*|.*중단영업.*)$/;

const CF_ACTIVITY_RE = /(영업|투자|재무)활동/;
const CF_TOTAL_RE = /(영업|투자|재무)활동.*현금흐름$|^현금및현금성자산의(증가|감소|순증가|순감소)|^현금의(증가|감소|순증가|순감소)/;

/** @param {string} concept */
function conceptCategory(concept) {
  if (!concept) return false;
  return /CurrentAssets|NoncurrentAssets|CurrentLiabilities|NoncurrentLiabilities/i.test(concept);
}

/** @param {string} concept */
function conceptGrandTotal(concept) {
  if (!concept) return false;
  return /(?:^|_)Assets$|(?:^|_)Liabilities$|(?:^|_)Equity$|LiabilitiesAndEquity/i.test(concept);
}

/**
 * @param {import('../../../../mocks/companyAnalysis/types').FinancialMetric[]} metrics
 * @returns {FinancialRowStyle[]}
 */
function classifyBalanceSheet(metrics) {
  /** @type {'assets' | 'liabilities' | 'equity' | null} */
  let section = null;
  let seenLiabilities = false;
  let seenEquity = false;

  return metrics.map((metric) => {
    const norm = normalizeLabel(metric.label);
    const concept = metric.concept ?? '';

    if (BS_SECTIONS.has(norm)) {
      section = norm === '자산' ? 'assets' : norm === '부채' ? 'liabilities' : 'equity';
      if (section === 'liabilities') seenLiabilities = true;
      if (section === 'equity') seenEquity = true;
      return { role: 'section', depth: 0, sectionBreak: true };
    }

    if (BS_GRAND_TOTALS.has(norm) || (norm.endsWith('총계') && !BS_CATEGORIES.has(norm))) {
      return { role: 'total', depth: 0, sectionBreak: false };
    }

    if (BS_CATEGORIES.has(norm) || conceptCategory(concept)) {
      let sectionBreak = false;
      if (norm.includes('부채') && !seenLiabilities) {
        section = 'liabilities';
        seenLiabilities = true;
        sectionBreak = true;
      } else if (norm.includes('자본') && !seenEquity && !norm.includes('부채')) {
        section = 'equity';
        seenEquity = true;
        sectionBreak = true;
      } else if (norm.includes('자산')) {
        section = 'assets';
      }
      return { role: 'category', depth: 1, sectionBreak };
    }

    if (conceptGrandTotal(concept)) {
      return { role: 'total', depth: 0, sectionBreak: false };
    }

    if (!section) {
      if (norm.includes('부채') || norm.includes('차입')) {
        section = 'liabilities';
        seenLiabilities = true;
      } else {
        section = 'assets';
      }
    } else if (section === 'assets' && (norm.includes('유동부채') || norm.includes('비유동부채') || norm === '부채')) {
      section = 'liabilities';
      seenLiabilities = true;
    } else if (section !== 'equity' && (norm.includes('자본금') || norm.includes('이익잉여금') || norm.includes('기타포괄손익'))) {
      section = 'equity';
      seenEquity = true;
    }

    if (norm.endsWith('합계') || norm.endsWith('소계')) {
      return { role: 'total', depth: 1, sectionBreak: false };
    }

    return { role: 'item', depth: 2, sectionBreak: false };
  });
}

/**
 * @param {import('../../../../mocks/companyAnalysis/types').FinancialMetric[]} metrics
 * @returns {FinancialRowStyle[]}
 */
function classifyIncomeStatement(metrics) {
  return metrics.map((metric) => {
    const norm = normalizeLabel(metric.label);

    if (IS_TOP_LINES.has(norm)) {
      return { role: 'category', depth: 0 };
    }
    if (IS_SUBTOTAL_RE.test(norm) || norm.endsWith('총계') || norm.endsWith('합계')) {
      return { role: 'total', depth: 0 };
    }
    if (norm.includes('기타') && norm.includes('손익')) {
      return { role: 'category', depth: 1 };
    }
    return { role: 'item', depth: 1 };
  });
}

/**
 * @param {import('../../../../mocks/companyAnalysis/types').FinancialMetric[]} metrics
 * @returns {FinancialRowStyle[]}
 */
function classifyCashFlow(metrics) {
  return metrics.map((metric) => {
    const norm = normalizeLabel(metric.label);

    if (CF_TOTAL_RE.test(norm) || norm.endsWith('총계')) {
      return { role: 'total', depth: 0 };
    }
    if (CF_ACTIVITY_RE.test(norm)) {
      return { role: 'category', depth: 0 };
    }
    if (norm.endsWith('합계') || norm.endsWith('소계')) {
      return { role: 'total', depth: 1 };
    }
    return { role: 'item', depth: 1 };
  });
}

/**
 * @param {import('../../../../mocks/companyAnalysis/types').FinancialMetric[]} metrics
 * @param {string} [statementType]
 * @returns {FinancialRowStyle[]}
 */
export function buildFinancialRowStyles(metrics, statementType) {
  if (!metrics?.length) return [];
  if (statementType === '재무상태표') return classifyBalanceSheet(metrics);
  if (statementType === '손익계산서') return classifyIncomeStatement(metrics);
  if (statementType === '현금흐름표') return classifyCashFlow(metrics);
  return metrics.map(() => ({ role: 'item', depth: 0 }));
}

/** @param {FinancialRowStyle} style */
export function rowStyleClasses(style) {
  const { role, depth, sectionBreak = false } = style;
  const pad = 12 + depth * 14;

  const row = [
    sectionBreak ? 'border-t-2 border-slate-300' : '',
    {
      section: 'bg-slate-100/90',
      category: 'bg-slate-50/70',
      total: 'border-t border-slate-200 bg-slate-50/90',
      item: '',
    }[role],
  ]
    .filter(Boolean)
    .join(' ');

  const label = {
    section: 'text-xs font-bold uppercase tracking-wider text-slate-600',
    category: 'text-sm font-semibold text-slate-800',
    total: 'text-sm font-bold text-slate-900',
    item: 'text-sm font-normal text-slate-600',
  }[role];

  const value = {
    section: 'text-sm font-bold text-slate-900',
    category: 'text-sm font-semibold text-slate-900',
    total: 'text-sm font-bold text-slate-900',
    item: 'text-sm font-medium text-slate-800',
  }[role];

  const accent =
    role === 'category' ? 'border-l-[3px] border-l-blue-200' : role === 'total' ? 'border-l-[3px] border-l-slate-300' : '';

  return { row: `${row} ${accent}`.trim(), label, value, pad };
}
