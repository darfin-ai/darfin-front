import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { SoWhatCallout } from './SoWhatCallout';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { isAiReady } from '../lib/aiStatus';

const SEVERITY_BORDER = {
  high: 'border-l-red-400',
  medium: 'border-l-amber-400',
  low: 'border-l-slate-300 dark:border-l-slate-600',
};

const SEVERITY_DOT = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-300 dark:bg-slate-600',
};

const SEVERITY_TEXT = {
  high: 'text-red-600 dark:text-red-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-slate-500 dark:text-slate-400',
};

const STATUS_BADGE_CLASS = {
  new: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  removed: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900',
};

function RiskSkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-200 dark:border-l-slate-700 bg-white dark:bg-slate-900 p-4">
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function KeyRisksPanel({ overview }) {
  const { t } = useLocale();
  const risks = overview.risks ?? [];
  const ready = isAiReady(overview);

  return (
    <section aria-labelledby="risk-heading">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 id="risk-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t('company.panels.risks')}
        </h2>
        {ready && risks.some((r) => r.status === 'new') && (
          <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {t('company.panels.newRisks', { n: risks.filter((r) => r.status === 'new').length })}
          </span>
        )}
        {!ready && (
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">{t('company.panels.analyzing')}</span>
        )}
      </div>

      {!ready ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <RiskSkeletonCard />
          <RiskSkeletonCard />
          <RiskSkeletonCard />
        </div>
      ) : risks.filter((r) => r.status !== 'removed').length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-400 dark:text-slate-500">
          {t('company.panels.noRisks')}
        </p>
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {risks.filter((r) => r.status !== 'removed').map((risk, i) => (
            <motion.div
              key={risk.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
              className={`flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 bg-white dark:bg-slate-900 p-4 ${SEVERITY_BORDER[risk.severity]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{risk.title}</span>
                {risk.status !== 'existing' && (
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[risk.status]}`}>
                    {t(`company.labels.status.${risk.status}`)}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{risk.description}</p>

              <SoWhatCallout ready={ready} insight={risk.insight} className="mt-3" />

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[risk.severity]}`} />
                  <span className={`text-xs font-medium ${SEVERITY_TEXT[risk.severity]}`}>{t(`company.labels.impact.${risk.severity}`)}</span>
                </div>
                {risk.sourceRef && (
                  <SourceExcerptDialog
                    sectionLabel={risk.sourceRef.sectionLabel}
                    excerpt={risk.sourceRef.excerpt}
                    sourceRef={risk.sourceRef.sourceRef}
                    label={t('company.panels.viewSource')}
                    className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                  />
                )}
              </div>
            </motion.div>
          ))}
      </div>
      )}

      {ready && risks.some((r) => r.status === 'removed') && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t('company.panels.removedRisks')}</p>
          <div className="flex flex-wrap gap-2">
            {risks.filter((r) => r.status === 'removed').map((r) => (
              <span key={r.id} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs text-slate-400 dark:text-slate-500 line-through">
                {r.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
