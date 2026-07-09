import { useLocale } from '../../../shared/i18n';
import { MonitoredCompanyCard } from './MonitoredCompanyCard';

/**
 * @param {{
 *   items: { corpCode: string, name: string, ticker: string }[],
 *   count: number,
 *   limit: number,
 *   planLabel: string,
 *   filingDatesByCorp: Record<string, string | null | undefined>,
 *   atLimit: boolean,
 * }} props
 */
export function MyAnalysisSection({
  items,
  count,
  limit,
  planLabel,
  filingDatesByCorp,
  atLimit,
}) {
  const { t } = useLocale();
  const isEmpty = count === 0;

  return (
    <section aria-labelledby="my-analysis-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="my-analysis-heading" className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('company.monitoring.myAnalysis')}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t('company.monitoring.quota', { count, limit })}
          <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
          {planLabel}
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('company.monitoring.emptyHint')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <MonitoredCompanyCard
              key={item.corpCode}
              company={item}
              latestFilingDate={filingDatesByCorp[item.corpCode]}
            />
          ))}
        </div>
      )}

      {atLimit && !isEmpty && (
        <p className="mt-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
          {t('company.monitoring.atLimitHint')}
        </p>
      )}
    </section>
  );
}
