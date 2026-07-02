import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { SourceExcerptDialog } from './SourceExcerptDialog';

const CUSTOMER_STATUS_BADGE = {
  new:     { label: '신규', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  removed: { label: '제거됨', className: 'bg-red-50 text-red-600 border border-red-200' },
};

function DeltaIcon({ delta }) {
  if (delta > 0) return <TrendingUp size={13} className="text-blue-500" />;
  if (delta < 0) return <TrendingDown size={13} className="text-red-400" />;
  return <Minus size={13} className="text-slate-400" />;
}

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function CustomerRegionPanel({ overview }) {
  const customers = overview.customers ?? [];
  const regions   = overview.regions   ?? [];
  const maxShare  = Math.max(...regions.map((r) => r.share), 1);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 주요 고객 */}
      <section aria-labelledby="customer-heading" className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 id="customer-heading" className="text-base font-semibold text-slate-900">
            주요 고객
          </h2>
          {overview.customerSourceRef && (
            <SourceExcerptDialog
              sectionLabel={overview.customerSourceRef.sectionLabel}
              excerpt={overview.customerSourceRef.excerpt}
              sourceRef={overview.customerSourceRef.sourceRef}
              label="공시 원문"
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            />
          )}
        </div>

        <div className="space-y-3 flex-1">
          {customers.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
              className="flex items-start gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                  {c.status !== 'existing' && (
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${CUSTOMER_STATUS_BADGE[c.status].className}`}>
                      {CUSTOMER_STATUS_BADGE[c.status].label}
                    </span>
                  )}
                  <span className="ml-auto text-sm font-bold tabular-nums text-slate-700">
                    {c.revenueShare}%
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{c.note}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          매출 비중 10% 이상 고객은 의무 공시 대상 (일부 익명 처리)
        </p>

        {overview.customerInsight && (
          <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-blue-700">So what? </span>
              {overview.customerInsight}
            </p>
          </div>
        )}
      </section>

      {/* 지역별 매출 */}
      <section aria-labelledby="region-heading" className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 id="region-heading" className="text-base font-semibold text-slate-900">
            지역별 매출
          </h2>
          {overview.regionSourceRef && (
            <SourceExcerptDialog
              sectionLabel={overview.regionSourceRef.sectionLabel}
              excerpt={overview.regionSourceRef.excerpt}
              sourceRef={overview.regionSourceRef.sourceRef}
              label="공시 원문"
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            />
          )}
        </div>

        <div className="flex-1 space-y-3">
          {regions.map((r, i) => (
            <motion.div
              key={r.region}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm text-slate-700">{r.region}</span>
                <div className="flex items-center gap-1.5">
                  <DeltaIcon delta={r.delta} />
                  <span className={`text-xs font-medium tabular-nums ${
                    r.delta > 0 ? 'text-blue-500' : r.delta < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {r.delta > 0 ? `+${r.delta}` : r.delta}pp
                  </span>
                  <span className="w-9 text-right text-sm font-semibold tabular-nums text-slate-800">
                    {r.share}%
                  </span>
                </div>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.share / maxShare) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 + 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400">pp = 전분기 대비 비중 변화 (percentage point)</p>

        {overview.regionInsight && (
          <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-blue-700">So what? </span>
              {overview.regionInsight}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
