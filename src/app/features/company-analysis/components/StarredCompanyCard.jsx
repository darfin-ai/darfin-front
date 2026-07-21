import { Link } from 'react-router';
import { ChevronRight, Star } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { CompanyAvatar } from './CompanyAvatar';
import { formatRelativeFilingAge } from '../lib/format';

/**
 * @param {{
 *   company: { corpCode: string, name: string, ticker: string },
 *   latestFilingDate?: string | null,
 *   onUnstar?: (corpCode: string) => void,
 * }} props
 */
export function StarredCompanyCard({ company, latestFilingDate, onUnstar }) {
  const { t, locale } = useLocale();
  const avatarCompany = { id: company.corpCode, name: company.name, ticker: company.ticker };
  const filingAge = formatRelativeFilingAge(latestFilingDate, locale);

  return (
    <Link
      to={`/company/${company.corpCode}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 transition-colors hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/30"
    >
      <CompanyAvatar company={avatarCompany} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
          {company.name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-400 dark:text-slate-500">
          {company.ticker}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-slate-400 dark:text-slate-500">
          {t('company.watchlist.latestFilingLine', {
            value: filingAge ?? t('company.watchlist.noFilingsYet'),
          })}
        </span>
      </span>
      {onUnstar && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUnstar(company.corpCode);
          }}
          aria-label={t('company.watchlist.unstarAction', { name: company.name })}
          title={t('company.watchlist.unstarKeepsUnlock')}
          className="shrink-0 rounded-full p-1.5 text-amber-400 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Star className="h-4.5 w-4.5 fill-amber-400" />
        </button>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
    </Link>
  );
}
