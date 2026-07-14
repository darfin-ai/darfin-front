/**
 * AI분석 리스크 상태 표시 유틸 — 백엔드 risk_states.state 값(한국어 라벨)과
 * i18n 키/색상 매핑. 값 자체가 계약(types.js RiskState)이므로 여기서만 변환한다.
 */

/** 백엔드 state 값 → i18n 키 (company.risk.states.*) */
export const RISK_STATE_KEYS = {
  신규발생: 'new',
  악화: 'worsening',
  지속: 'persisting',
  개선: 'improving',
  해소: 'resolved',
  정상: 'normal',
  데이터부족: 'insufficient',
};

/** 카테고리 → i18n 키 (company.risk.categories.*) */
export const RISK_CATEGORY_KEYS = {
  liquidity: 'liquidity',
  leverage: 'leverage',
  earnings_quality: 'earningsQuality',
  going_concern: 'goingConcern',
  governance: 'governance',
  operational: 'operational',
};

/** 상태 배지/셀 색상 (Tailwind) — 나쁨=red, 주의=amber, 개선=blue, 정상=emerald, 부족=slate */
export const RISK_STATE_STYLES = {
  신규발생: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    cell: 'bg-red-400 dark:bg-red-500',
  },
  악화: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    cell: 'bg-red-500 dark:bg-red-600',
  },
  지속: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    cell: 'bg-amber-400 dark:bg-amber-500',
  },
  개선: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    cell: 'bg-blue-400 dark:bg-blue-500',
  },
  해소: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    cell: 'bg-emerald-300 dark:bg-emerald-600',
  },
  정상: {
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    cell: 'bg-emerald-200 dark:bg-emerald-800',
  },
  데이터부족: {
    badge: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
    cell: 'bg-slate-200 dark:bg-slate-700',
  },
};

/** 정상/해소/데이터부족 외에는 "문제 있음" — 카드 강조·streak 문구 대상 */
export function isFlaggedState(state) {
  return state === '신규발생' || state === '악화' || state === '지속' || state === '개선';
}
