import { Link } from 'react-router';
import { Star } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { avatarLabel, avatarGradientForCompany } from '../lib/avatar';

/**
 * @param {{
 *   company: import('../../../../mocks/companyAnalysis/types').Company,
 *   compact?: boolean,
 *   isWatched?: boolean,
 *   onToggleWatch?: (id: string) => void,
 * }} props
 */
export function CompanyQuickLinkTile({ company, compact = false, isWatched = false, onToggleWatch }) {
  const { t } = useLocale();

  return (
    <Link
      to={`/company/${company.id}`}
      className={`group flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
        compact ? 'p-2 pr-1.5' : 'p-3 pr-2'
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${avatarGradientForCompany(company)} ${
          compact ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'
        }`}
      >
        {avatarLabel(company)}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {company.name}
        </span>
        <span className={`block truncate text-slate-400 dark:text-slate-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {company.ticker}
        </span>
      </span>
      {onToggleWatch && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWatch(company.id);
          }}
          aria-pressed={isWatched}
          aria-label={isWatched ? t('company.grid.removeWatchlist', { name: company.name }) : t('company.grid.addWatchlist', { name: company.name })}
          className="shrink-0 rounded-full p-1 text-slate-300 dark:text-slate-600 transition-colors hover:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Star className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${isWatched ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      )}
    </Link>
  );
}
