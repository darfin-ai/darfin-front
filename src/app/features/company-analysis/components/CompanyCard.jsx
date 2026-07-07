import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/badge';
import { formatFilingDate } from '../lib/format';
import { dominantScoreChange, changeLevel, CHANGE_LEVEL_STYLES, SCORE_COMPONENT_LABELS } from '../lib/scoring';

/**
 * @param {{ company: import('../../../../mocks/companyAnalysis/types').Company, scores: import('../../../../mocks/companyAnalysis/types').ScoreComponent[], index?: number, isWatched?: boolean, onToggleWatch?: (id: string) => void }} props
 */
export function CompanyCard({ company, scores, index = 0, isWatched = false, onToggleWatch }) {
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
        {onToggleWatch && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWatch(company.id);
            }}
            aria-pressed={isWatched}
            aria-label={isWatched ? `${company.name} 관심기업에서 삭제` : `${company.name} 관심기업에 추가`}
            className="absolute right-4 top-4 rounded-full p-1 text-slate-300 dark:text-slate-600 transition-colors hover:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Star className={`h-5 w-5 ${isWatched ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        )}

        <div className="flex items-start justify-between gap-3 pr-6">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {company.name}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {[company.ticker, company.sector].filter(Boolean).join(' · ')}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 text-slate-600 dark:text-slate-400 dark:border-slate-700">
            {company.latestFilingType}
          </Badge>
        </div>

        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{formatFilingDate(company.latestFilingDate)} 제출</p>

        <div className="mt-4 flex items-start gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
              {company.changeSummary || <span className="text-slate-400 dark:text-slate-500">최근 공시의 변동 요약을 준비 중이에요.</span>}
            </p>
            {level !== 'flat' && dominant.key && (
              <p className={`mt-1 text-xs font-medium ${style.text}`}>
                {SCORE_COMPONENT_LABELS[dominant.key]} 신호 감지
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
