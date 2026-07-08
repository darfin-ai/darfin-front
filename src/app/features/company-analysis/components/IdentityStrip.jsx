import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { avatarLabel, avatarGradientForCompany } from '../lib/avatar';

/**
 * @param {{ company: import('../../../../mocks/companyAnalysis/types').Company, score?: number | null }} props
 */
export function IdentityStrip({ company, score = null }) {
  const { t } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-16 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur"
    >
      <div className="container flex items-center gap-3 py-3">
        <Link
          to="/company"
          className="flex shrink-0 items-center gap-1 rounded-md text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">{t('company.identity.back')}</span>
        </Link>

        <div className="h-6 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${avatarGradientForCompany(company)}`}
          aria-hidden="true"
        >
          {avatarLabel(company)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h1 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-100">{company.name}</h1>
            <span className="text-sm text-slate-400 dark:text-slate-500 tabular-nums">{company.ticker}</span>
            {company.market && (
              <span className="rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                {t(`company.markets.${company.market}`)}
              </span>
            )}
          </div>
          {company.sector && (
            <div className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{company.sector}</div>
          )}
        </div>

        {score != null && (
          <div className="shrink-0 text-right">
            <div className="text-xs text-slate-400 dark:text-slate-500">{t('company.identity.aiScore')}</div>
            <div className="text-base font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{score}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
