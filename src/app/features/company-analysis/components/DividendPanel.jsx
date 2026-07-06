import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { isAiReady } from '../lib/aiStatus';

function HistoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { year, perShareKrw } = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-slate-500">{year}</p>
      <p className="font-semibold text-slate-900">
        {perShareKrw != null ? `${perShareKrw.toLocaleString()}원` : '미확정'}
      </p>
    </div>
  );
}

function MetricCard({ label, value, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </motion.div>
  );
}

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function DividendPanel({ overview }) {
  const div = overview.dividend;
  if (!div) return null;

  // Chart data: replace null (未확정) with 0 for display but style differently
  const chartData = div.history.map((d) => ({ ...d, displayValue: d.perShareKrw ?? 0 }));
  const maxVal = Math.max(...div.history.map((d) => d.perShareKrw ?? 0), 1);

  return (
    <section aria-labelledby="dividend-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="dividend-heading" className="text-xl font-semibold text-slate-900">
          배당 정보
        </h2>
        {div.sourceRef && (
          <SourceExcerptDialog
            sectionLabel={div.sourceRef.sectionLabel}
            excerpt={div.sourceRef.excerpt}
            sourceRef={div.sourceRef.sourceRef}
            label="공시 원문 보기"
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          />
        )}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="주당 배당금 (연간)"
            value={`${div.perShareKrw.toLocaleString()}원`}
            sub="보통주 기준"
            delay={0}
          />
          <MetricCard
            label="배당수익률"
            value={`${div.yieldPct}%`}
            sub="현재 주가 기준 추정"
            delay={0.06}
          />
          <MetricCard
            label="배당성향"
            value={`${div.payoutRatioPct}%`}
            sub="순이익 대비 배당 비율"
            delay={0.12}
          />
        </div>

        {/* History bar chart */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">연간 주당 배당금 추이 (원)</p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <YAxis domain={[0, maxVal * 1.3]} hide />
                <Tooltip content={<HistoryTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="displayValue" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.year}
                      fill={entry.perShareKrw == null ? '#e2e8f0' : '#3b82f6'}
                      opacity={entry.perShareKrw == null ? 0.5 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-around px-1">
            {chartData.map((d) => (
              <span
                key={d.year}
                className={`text-xs tabular-nums ${d.perShareKrw == null ? 'text-slate-300' : 'text-slate-500'}`}
              >
                {d.year}
              </span>
            ))}
          </div>
        </div>

        {/* So what */}
        {!isAiReady(overview) ? (
          <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-400" />
            <div className="flex-1 space-y-1.5 py-0.5">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ) : (
          div.insight && (
            <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
              <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-blue-700">So what? </span>
                {div.insight}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
