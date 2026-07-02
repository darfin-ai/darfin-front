import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { formatKrwCompact, formatPercent, formatQuarterAxis, formatQuarterFull } from '../lib/format';

function formatMetricValue(metric, value) {
  return metric.unit === '%' ? formatPercent(value) : formatKrwCompact(value);
}

function TrendTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium text-slate-500">{formatQuarterFull(point.quarter)}</div>
      <div className="font-semibold text-slate-900">{formatMetricValue(metric, point.value)}</div>
    </div>
  );
}

/**
 * One "small multiple" line chart for a single financial concept.
 * @param {{ metric: import('../../../../mocks/companyAnalysis/types').FinancialMetric, index?: number }} props
 */
export function TrendChartCard({ metric, index = 0 }) {
  const series = metric.series;
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const pctChange = previous && previous.value !== 0 ? ((latest.value - previous.value) / Math.abs(previous.value)) * 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-600">{metric.label}</span>
        {pctChange != null && (
          <span className="shrink-0 text-xs font-medium text-slate-500">
            전분기 대비 {formatPercent(pctChange)}
          </span>
        )}
      </div>
      <div className="mt-1 text-xl font-bold text-slate-900">{formatMetricValue(metric, latest.value)}</div>

      <div className="mt-2 h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <XAxis
              dataKey="quarter"
              tickFormatter={formatQuarterAxis}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip content={<TrendTooltip metric={metric} />} cursor={{ stroke: '#e2e8f0' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2.5, fill: '#2563eb', strokeWidth: 0 }}
              activeDot={{ r: 4 }}
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
