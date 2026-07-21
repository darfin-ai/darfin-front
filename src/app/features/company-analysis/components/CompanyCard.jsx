import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { Badge } from '../../../shared/components/ui/badge';
import { formatFilingDate } from '../lib/format';
import { CompanyAvatar } from './CompanyAvatar';
import { scoreComponentLabel } from '../lib/i18n';
import { dominantScoreChange, changeLevel, CHANGE_LEVEL_STYLES } from '../lib/scoring';

/**
 * @param {{ company: import('../../../../mocks/companyAnalysis/types').Company, scores: import('../../../../mocks/companyAnalysis/types').ScoreComponent[], index?: number }} props
 */
export function CompanyCard({ company, scores, index = 0 }) {
  const { t } = useLocale();
  const dominant = dominantScoreChange(scores);
  const level = changeLevel(dominant.normalized);
  const style = CHANGE_LEVEL_STYLES[level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/company/${company.id}`}
        className="group relative block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-shadow hover:shadow-md dark:hover:shadow-none dark:hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
      >
        <div className="flex items-start justify-between gap-3 pr-6">
          <div className="flex min-w-0 items-start gap-3">
            <CompanyAvatar company={company} size={36} />
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {company.name}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {[company.ticker, company.sector].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-slate-600 dark:text-slate-400 dark:border-slate-700">
            {company.latestFilingType}
          </Badge>
        </div>

        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{formatFilingDate(company.latestFilingDate)} {t('company.labels.filed')}</p>

        <div className="mt-4 flex items-start gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
              {company.changeSummary || <span className="text-slate-400 dark:text-slate-500">{t('company.grid.summaryPending')}</span>}
            </p>
            {level !== 'flat' && dominant.key && (
              <p className={`mt-1 text-xs font-medium ${style.text}`}>
                {scoreComponentLabel(t, dominant.key)} {t('company.labels.signalDetected')}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
