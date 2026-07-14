import { useLocale } from '../../../shared/i18n';
import { StarredCompanyCard } from './StarredCompanyCard';

/**
 * 관심 기업(watchlist) 목록 — 무료·무제한 별표 북마크.
 * @param {{
 *   items: { corpCode: string, name: string, ticker: string }[],
 *   count: number,
 *   filingDatesByCorp: Record<string, string | null | undefined>,
 *   onUnstar?: (corpCode: string) => void,
 * }} props
 */
export function WatchlistSection({ items, count, filingDatesByCorp, onUnstar }) {
  const { t } = useLocale();
  const isEmpty = count === 0;

  return (
    <section aria-labelledby="watchlist-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="watchlist-heading" className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('company.watchlist.sectionTitle')}
        </h2>
        {!isEmpty && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('company.watchlist.countLabel', { count })}
          </p>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('company.watchlist.emptyHint')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <StarredCompanyCard
              key={item.corpCode}
              company={item}
              latestFilingDate={filingDatesByCorp[item.corpCode]}
              onUnstar={onUnstar}
            />
          ))}
        </div>
      )}
    </section>
  );
}
