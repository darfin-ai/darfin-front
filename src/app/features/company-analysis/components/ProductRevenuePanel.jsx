import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { SoWhatCallout } from './SoWhatCallout';
import { isAiReady } from '../lib/aiStatus';

const BAR_COLORS = [
  'bg-blue-500',
  'bg-blue-400',
  'bg-violet-400',
  'bg-violet-300',
  'bg-slate-400',
  'bg-slate-300',
  'bg-slate-200 dark:bg-slate-600',
];

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function ProductRevenuePanel({ overview }) {
  const { t } = useLocale();
  const products = overview.products ?? [];
  const maxShare = Math.max(...products.map((p) => p.share), 1);

  return (
    <section aria-labelledby="product-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="product-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t('company.panels.products')}
        </h2>
        {overview.productSourceRef && (
          <SourceExcerptDialog
            sectionLabel={overview.productSourceRef.sectionLabel}
            excerpt={overview.productSourceRef.excerpt}
            sourceRef={overview.productSourceRef.sourceRef}
            label={t('company.panels.viewSourceFull')}
            className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
          />
        )}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="space-y-2.5">
          {products.map((product, i) => (
            <div key={product.name}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-sm text-slate-700 dark:text-slate-300">{product.name}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {product.share}%
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  className={`absolute left-0 top-0 h-full rounded-full ${BAR_COLORS[i] ?? 'bg-slate-300 dark:bg-slate-600'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(product.share / maxShare) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 + 0.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{t('company.panels.revenueShareNote')}</p>

        <SoWhatCallout ready={isAiReady(overview)} insight={overview.productInsight} />
      </div>
    </section>
  );
}
