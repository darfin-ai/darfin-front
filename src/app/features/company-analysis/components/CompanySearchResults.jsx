import { useLocale } from '../../../shared/i18n';
import { CompanyAvatar } from './CompanyAvatar';

/**
 * @param {{
 *   results: { corpCode: string, name: string, ticker: string, market?: string | null, analyzed: boolean }[],
 *   loading?: boolean,
 *   isStarred?: (corpCode: string) => boolean,
 *   onSelect: (result: { corpCode: string, name: string, ticker: string }) => void,
 *   emptyMessage?: string,
 * }} props
 */
export function CompanySearchResults({ results, loading, isStarred, onSelect, emptyMessage }) {
  const { t } = useLocale();

  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">{t('common.loading')}</p>;
  }

  if (results.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
        {emptyMessage ?? t('company.grid.searchNoResults')}
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">{t('company.grid.searchResults')}</h2>
      <ul className="flex flex-col gap-2">
        {results.map((result) => {
          const company = { id: result.corpCode, name: result.name, ticker: result.ticker, market: result.market };
          const starred = isStarred?.(result.corpCode);

          return (
            <li key={result.corpCode}>
              <button
                type="button"
                onClick={() => onSelect(result)}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-left transition-colors hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/30"
              >
                <CompanyAvatar company={company} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                    {result.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400 dark:text-slate-500">{result.ticker}</span>
                </span>
                {starred ? (
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                    {t('company.watchlist.starredBadge')}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
