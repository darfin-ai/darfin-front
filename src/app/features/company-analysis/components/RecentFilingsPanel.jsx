import { ExternalLink } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';

const TYPE_BADGE = {
  '사업보고서': 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  '반기보고서': 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  '분기보고서': 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

function fmt(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * @param {{ filings: import('../../../../mocks/companyAnalysis/types').RecentFiling[] }} props
 */
export function RecentFilingsPanel({ filings }) {
  const { t } = useLocale();
  const rows = filings ?? [];

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 lg:h-64">
      <h2 className="mb-3 shrink-0 text-sm font-medium text-slate-900 dark:text-slate-100">{t('company.panels.recentFilings')}</h2>
      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
          {t('company.panels.noRecentFilings')}
        </p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto pr-1 dark:divide-slate-800">
          {rows.map((f) => (
            <li key={f.id}>
              <a
                href={f.dartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TYPE_BADGE[f.type] ?? TYPE_BADGE['분기보고서']}`}>
                  {f.type}
                </span>
                <span className="flex-1 whitespace-nowrap text-sm font-medium text-slate-700 transition-colors group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400">
                  {f.period}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-slate-500">{fmt(f.date)}</span>
                <ExternalLink size={12} className="shrink-0 text-slate-300 transition-colors group-hover:text-blue-400 dark:text-slate-600" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
