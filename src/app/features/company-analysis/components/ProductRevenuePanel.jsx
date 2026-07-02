import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { SourceExcerptDialog } from './SourceExcerptDialog';

const BAR_COLORS = [
  'bg-blue-500',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-indigo-300',
  'bg-slate-400',
  'bg-slate-300',
  'bg-slate-200',
];

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function ProductRevenuePanel({ overview }) {
  const products = overview.products ?? [];
  const maxShare = Math.max(...products.map((p) => p.share), 1);

  return (
    <section aria-labelledby="product-heading" className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id="product-heading" className="text-base font-semibold text-slate-900">
          주요 제품·서비스
        </h2>
        {overview.productSourceRef && (
          <SourceExcerptDialog
            sectionLabel={overview.productSourceRef.sectionLabel}
            excerpt={overview.productSourceRef.excerpt}
            sourceRef={overview.productSourceRef.sourceRef}
            label="공시 원문 보기"
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          />
        )}
      </div>

      <div className="space-y-2.5">
        {products.map((product, i) => (
          <div key={product.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-sm text-slate-700">{product.name}</span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-800">
                {product.share}%
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className={`absolute left-0 top-0 h-full rounded-full ${BAR_COLORS[i] ?? 'bg-slate-300'}`}
                initial={{ width: 0 }}
                animate={{ width: `${(product.share / maxShare) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.05 + 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">매출액 기준 비중 (2026Q1)</p>

      {overview.productInsight && (
        <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
          <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500" />
          <p className="text-sm leading-relaxed text-slate-700">
            <span className="font-semibold text-blue-700">So what? </span>
            {overview.productInsight}
          </p>
        </div>
      )}
    </section>
  );
}
