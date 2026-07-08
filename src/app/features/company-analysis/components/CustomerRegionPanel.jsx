import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { SoWhatCallout } from './SoWhatCallout';
import { isAiReady } from '../lib/aiStatus';

const CUSTOMER_STATUS_BADGE_CLASS = {
  new: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  removed: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900',
};

function DeltaIcon({ delta }) {
  if (delta > 0) return <TrendingUp size={13} className="text-red-500 dark:text-red-400" />;
  if (delta < 0) return <TrendingDown size={13} className="text-blue-500 dark:text-blue-400" />;
  return <Minus size={13} className="text-slate-400 dark:text-slate-500" />;
}

const SOURCE_CHIP =
  'rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300';

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function CustomerRegionPanel({ overview }) {
  const { t } = useLocale();
  const customers = overview.customers ?? [];
  const regions   = overview.regions   ?? [];
  const maxShare  = Math.max(...regions.map((r) => r.share), 1);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <section aria-labelledby="customer-heading" className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="customer-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t('company.panels.customers')}
          </h2>
          {overview.customerSourceRef && (
            <SourceExcerptDialog
              sectionLabel={overview.customerSourceRef.sectionLabel}
              excerpt={overview.customerSourceRef.excerpt}
              sourceRef={overview.customerSourceRef.sourceRef}
              label={t('company.panels.viewSource')}
              className={SOURCE_CHIP}
            />
          )}
        </div>

        <div className="flex flex-1 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="space-y-3 flex-1">
            {customers.length === 0 && (
              <p className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                {t('company.panels.noCustomers')}
              </p>
            )}
            {customers.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
                className="flex items-start gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                    {c.status !== 'existing' && (
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${CUSTOMER_STATUS_BADGE_CLASS[c.status]}`}>
                        {t(`company.labels.status.${c.status}`)}
                      </span>
                    )}
                    <span className="ml-auto text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {c.revenueShare}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{c.note}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            {t('company.panels.customerDisclosureNote')}
          </p>

          {overview.customerInsight && (
            <SoWhatCallout ready insight={overview.customerInsight} />
          )}
        </div>
      </section>

      <section aria-labelledby="region-heading" className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="region-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t('company.panels.regions')}
          </h2>
          {overview.regionSourceRef && (
            <SourceExcerptDialog
              sectionLabel={overview.regionSourceRef.sectionLabel}
              excerpt={overview.regionSourceRef.excerpt}
              sourceRef={overview.regionSourceRef.sourceRef}
              label={t('company.panels.viewSource')}
              className={SOURCE_CHIP}
            />
          )}
        </div>

        <div className="flex flex-1 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex-1 space-y-3">
            {regions.length === 0 && (
              <p className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                {t('company.panels.noRegionData')}
              </p>
            )}
            {regions.map((r, i) => (
              <motion.div
                key={r.region}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{r.region}</span>
                  <div className="flex items-center gap-1.5">
                    <DeltaIcon delta={r.delta} />
                    <span className={`text-xs font-medium tabular-nums ${
                      r.delta > 0
                        ? 'text-red-500 dark:text-red-400'
                        : r.delta < 0
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {r.delta > 0 ? `+${r.delta}` : r.delta}pp
                    </span>
                    <span className="w-9 text-right text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                      {r.share}%
                    </span>
                  </div>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full bg-blue-400 dark:bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.share / maxShare) * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05 + 0.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{t('company.panels.ppNote')}</p>

          <SoWhatCallout ready={isAiReady(overview)} insight={overview.regionInsight} />
        </div>
      </section>
    </div>
  );
}
