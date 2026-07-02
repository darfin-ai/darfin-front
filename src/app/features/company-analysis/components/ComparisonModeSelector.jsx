import { Check } from 'lucide-react';
import { baselineLabel } from '../lib/comparison';

const MODES = [
  { key: 'all', filingKey: 'current', label: '전체 비교', hint: '기준 공시' },
  { key: 'QoQ', filingKey: 'qoqBaseline', label: 'QoQ만 보기', hint: '직전 공시 대비' },
  { key: 'YoY', filingKey: 'yoyBaseline', label: 'YoY만 보기', hint: '전년 동기 대비' },
];

/**
 * Filters the sections/comparisons shown below to just one baseline —
 * clicking "QoQ만 보기" hides every section that has no QoQ row at all
 * (계열회사 현황, 중요한 계약, 지배구조, ...), not just the YoY half of
 * sections that have both.
 * @param {{
 *   filingContext: { current?: import('../../../../mocks/companyAnalysis/types').RecentFiling, qoqBaseline?: import('../../../../mocks/companyAnalysis/types').RecentFiling, yoyBaseline?: import('../../../../mocks/companyAnalysis/types').RecentFiling },
 *   mode: 'all'|'QoQ'|'YoY', onChange: (mode: 'all'|'QoQ'|'YoY') => void, className?: string,
 * }} props
 */
export function ComparisonModeSelector({ filingContext, mode, onChange, className = '' }) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium text-slate-500">비교 기준을 선택하면 해당 항목만 볼 수 있어요.</p>
      <div role="tablist" aria-label="공시 비교 기준" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {MODES.map((m) => {
          const filing = filingContext[m.filingKey];
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(m.key)}
              className={`rounded-md border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                active
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {active && <Check size={13} className="shrink-0 text-blue-600" />}
                <span className={`text-xs font-semibold ${active ? 'text-blue-700' : 'text-slate-500'}`}>
                  {m.label}
                </span>
              </span>
              <p className={`mt-0.5 text-sm font-medium ${active ? 'text-blue-900' : 'text-slate-800'}`}>
                {filing ? baselineLabel(filing) : '-'}
              </p>
              <p className={`text-xs ${active ? 'text-blue-600/70' : 'text-slate-400'}`}>{m.hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
