import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { isAiReady } from '../lib/aiStatus';

const STATUS_BADGE = {
  added:   { label: '신규', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  removed: { label: '제거됨', className: 'bg-red-50 text-red-600 border border-red-200' },
};

const SEGMENT_COLORS = ['#3b82f6', '#6366f1', '#94a3b8', '#cbd5e1', '#e2e8f0'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { fullName, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-slate-800">{fullName}</p>
      <p className="text-slate-500">매출 비중 <span className="font-bold text-slate-800">{value}%</span></p>
    </div>
  );
}

/** Absolutely-positioned center label inside the donut hole */
function DonutCenterLabel({ segments, activeIdx }) {
  const seg = activeIdx !== null ? segments[activeIdx] : segments[0];
  if (!seg) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-xl font-bold tabular-nums text-slate-900">{seg.revenueShare}%</span>
      <span className="mt-0.5 max-w-[72px] text-center text-[11px] leading-tight text-slate-500">
        {seg.name.split(' ')[0]}
      </span>
    </div>
  );
}

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview, profile: import('../../../../mocks/companyAnalysis/types').CompanyProfile }} props
 */
export function BusinessSegmentPanel({ overview, profile }) {
  const segments = overview.segments ?? [];
  const [activeIdx, setActiveIdx] = useState(null);

  const chartData = segments.map((s) => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    value: s.revenueShare,
  }));

  return (
    <section aria-labelledby="segment-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="segment-heading" className="text-xl font-semibold text-slate-900">
          사업 부문 현황
        </h2>
        {overview.segmentSourceRef && (
          <SourceExcerptDialog
            sectionLabel={overview.segmentSourceRef.sectionLabel}
            excerpt={overview.segmentSourceRef.excerpt}
            sourceRef={overview.segmentSourceRef.sourceRef}
            label="공시 원문 보기"
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          />
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Donut chart with center label */}
          <div className="relative mx-auto h-40 w-40 shrink-0 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="56%"
                  outerRadius="78%"
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, i) => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)}
                  stroke="none"
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.fullName}
                      fill={SEGMENT_COLORS[i] ?? '#e2e8f0'}
                      opacity={activeIdx === null || activeIdx === i ? 1 : 0.35}
                      style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <DonutCenterLabel segments={segments} activeIdx={activeIdx} />
          </div>

          {/* Legend + share list */}
          <div className="flex-1 space-y-1.5">
            {segments.map((seg, i) => (
              <motion.div
                key={seg.name}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
                className={`flex items-start gap-3 rounded-md px-2 py-2 transition-colors duration-150 ${
                  activeIdx === i ? 'bg-slate-50' : ''
                }`}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: SEGMENT_COLORS[i] ?? '#e2e8f0' }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-800">{seg.name}</span>
                    {seg.status !== 'existing' && (
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE[seg.status].className}`}>
                        {STATUS_BADGE[seg.status].label}
                      </span>
                    )}
                    <span className="ml-auto text-sm font-bold tabular-nums text-slate-700">
                      {seg.revenueShare}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{seg.description}</p>
                </div>
              </motion.div>
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
          overview.segmentInsight && (
            <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
              <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-blue-700">So what? </span>
                {overview.segmentInsight}
              </p>
            </div>
          )
        )}

        {/* Governance note */}
        {profile?.governanceNotes && (
          <p className="mt-3 text-xs leading-relaxed text-slate-400">{profile.governanceNotes}</p>
        )}
      </div>
    </section>
  );
}
