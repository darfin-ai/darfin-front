import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { SourceExcerptDialog } from './SourceExcerptDialog';

// Colour palette: each ownership type gets a distinct but harmonious colour
const HOLDER_COLORS = {
  controlling:    '#1e40af',  // deep blue — controlling block
  foreign:        '#3b82f6',  // blue — foreign institutions
  nps:            '#6366f1',  // indigo — NPS / domestic institution
  retail:         '#94a3b8',  // slate — retail / misc
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, detail, share } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-slate-800">{name}</p>
      <p className="text-xs text-slate-500">{detail}</p>
      <p className="mt-1 text-slate-500">지분율 <span className="font-bold text-slate-800">{share}%</span></p>
    </div>
  );
}

function DonutCenter({ shareholders, activeIdx }) {
  const h = activeIdx !== null ? shareholders[activeIdx] : shareholders[1]; // default: foreign (largest)
  if (!h) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-xl font-bold tabular-nums text-slate-900">{h.share}%</span>
      <span className="mt-0.5 max-w-[72px] text-center text-[11px] leading-tight text-slate-500">
        {h.name.split(' ')[0]}
      </span>
    </div>
  );
}

export function ShareholderPanel({ overview }) {
  const shareholders = overview.shareholders ?? [];
  const [activeIdx, setActiveIdx] = useState(null);

  const chartData = shareholders.map((s) => ({
    ...s,
    value: s.share,
  }));

  return (
    <section aria-labelledby="shareholder-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="shareholder-heading" className="text-xl font-semibold text-slate-900">
          주주 구성
        </h2>
        {overview.shareholderSourceRef && (
          <SourceExcerptDialog
            sectionLabel={overview.shareholderSourceRef.sectionLabel}
            excerpt={overview.shareholderSourceRef.excerpt}
            sourceRef={overview.shareholderSourceRef.sourceRef}
            label="공시 원문 보기"
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          />
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Donut */}
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
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={HOLDER_COLORS[entry.id] ?? '#e2e8f0'}
                      opacity={activeIdx === null || activeIdx === chartData.indexOf(entry) ? 1 : 0.35}
                      style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter shareholders={shareholders} activeIdx={activeIdx} />
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {shareholders.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
                className={`flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 ${activeIdx === i ? 'bg-slate-50' : ''}`}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: HOLDER_COLORS[h.id] ?? '#e2e8f0' }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">{h.name}</span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-slate-700">{h.share}%</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{h.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* So what */}
        {overview.shareholderInsight && (
          <div className="mt-4 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-blue-700">So what? </span>
              {overview.shareholderInsight}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
