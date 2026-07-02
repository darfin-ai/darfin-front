import { LineChart, Line, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { formatQuarterFull } from '../lib/format';
import { SCORE_COMPONENT_LABELS, SCORE_COMPONENT_COLORS, latestValue, previousValue } from '../lib/scoring';

function SparklineTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium text-slate-500">{formatQuarterFull(point.quarter)}</div>
      <div className="font-semibold text-slate-900">변화 강도 {point.value}</div>
    </div>
  );
}

/** Returns a short verbal label for how intense this quarter's change was */
function intensityLabel(value, max) {
  const ratio = value / max;
  if (ratio >= 0.85) return { text: '매우 큼', color: 'text-red-600 bg-red-50 border-red-200' };
  if (ratio >= 0.55) return { text: '큼', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  if (ratio >= 0.30) return { text: '보통', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { text: '작음', color: 'text-slate-500 bg-slate-100 border-slate-200' };
}

/**
 * @param {{ component: import('../../../../mocks/companyAnalysis/types').ScoreComponent, index?: number }} props
 */
export function ScoreSparklineCard({ component, index = 0 }) {
  const label = SCORE_COMPONENT_LABELS[component.key];
  const color = SCORE_COMPONENT_COLORS[component.key];
  const latest = latestValue(component);
  const previous = previousValue(component);
  const delta = latest - previous;
  const { text: intensity, color: intensityColor } = intensityLabel(latest, component.maxPoints);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${intensityColor}`}>
          {intensity}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-xs text-slate-400">전분기 대비</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: delta === 0 ? '#94a3b8' : color }}>
          {delta === 0 ? '변화없음' : `${delta > 0 ? '+' : ''}${delta}`}
        </span>
      </div>

      <div className="mt-3 h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={component.history} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <YAxis domain={[0, component.maxPoints]} hide />
            <Tooltip content={<SparklineTooltip />} cursor={{ stroke: '#e2e8f0' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3.5 }}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
