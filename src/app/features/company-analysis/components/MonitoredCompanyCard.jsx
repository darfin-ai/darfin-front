import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { avatarLabel, avatarGradientForCompany } from '../lib/avatar';
import { formatRelativeFilingAge } from '../lib/format';

/**
 * @param {{
 *   company: { corpCode: string, name: string, ticker: string },
 *   latestFilingDate?: string | null,
 * }} props
 */
export function MonitoredCompanyCard({ company, latestFilingDate }) {
  const { t, locale } = useLocale();
  const avatarCompany = { id: company.corpCode, name: company.name, ticker: company.ticker };
  const filingAge = formatRelativeFilingAge(latestFilingDate, locale);

  return (
    <Link
      to={`/company/${company.corpCode}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 transition-colors hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/30"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${avatarGradientForCompany(avatarCompany)}`}
      >
        {avatarLabel(avatarCompany)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
          {company.name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-emerald-600 dark:text-emerald-400">
          {t('company.monitoring.statusActive')}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-slate-400 dark:text-slate-500">
          {t('company.monitoring.latestFilingLine', {
            value: filingAge ?? t('company.monitoring.noFilingsYet'),
          })}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
    </Link>
  );
}
