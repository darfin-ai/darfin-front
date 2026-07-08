import { Check } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { baselineLabel } from '../lib/comparison';

const MODES = [
  { key: 'all', filingKey: 'current', labelKey: 'compareAll', hintKey: 'compareAllHint' },
  { key: 'QoQ', filingKey: 'qoqBaseline', labelKey: 'compareQoq', hintKey: 'compareQoqHint' },
  { key: 'YoY', filingKey: 'yoyBaseline', labelKey: 'compareYoy', hintKey: 'compareYoyHint' },
];

/**
 * @param {{
 *   filingContext: { current?: import('../../../../mocks/companyAnalysis/types').RecentFiling, qoqBaseline?: import('../../../../mocks/companyAnalysis/types').RecentFiling, yoyBaseline?: import('../../../../mocks/companyAnalysis/types').RecentFiling },
 *   mode: 'all'|'QoQ'|'YoY', onChange: (mode: 'all'|'QoQ'|'YoY') => void, className?: string,
 * }} props
 */
export function ComparisonModeSelector({ filingContext, mode, onChange, className = '' }) {
  const { t } = useLocale();

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">{t('company.panels.comparisonHint')}</p>
      <div role="tablist" aria-label={t('company.panels.comparisonAria')} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
              className={`rounded-md border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 ${
                active
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {active && <Check size={13} className="shrink-0 text-blue-600 dark:text-blue-400" />}
                <span className={`text-xs font-semibold ${active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {t(`company.panels.${m.labelKey}`)}
                </span>
              </span>
              <p className={`mt-0.5 text-sm font-medium ${active ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                {filing ? baselineLabel(filing) : '-'}
              </p>
              <p className={`text-xs ${active ? 'text-blue-600/70 dark:text-blue-400/70' : 'text-slate-400 dark:text-slate-500'}`}>{t(`company.panels.${m.hintKey}`)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
