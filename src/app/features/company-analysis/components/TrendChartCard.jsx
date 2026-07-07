import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { formatPercent, formatQuarterAxis, formatQuarterFull, formatFinancialMetricValue } from '../lib/format';
import { chartAxisColors } from '../lib/chartTheme';

function TrendTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium text-slate-500 dark:text-slate-400">{formatQuarterFull(point.quarter)}</div>
      <div className="font-semibold text-slate-900 dark:text-slate-100">{formatFinancialMetricValue(metric, point.value)}</div>
    </div>
  );
}

/**
 * One "small multiple" line chart for a single financial concept.
 * @param {{ metric: import('../../../../mocks/companyAnalysis/types').FinancialMetric, index?: number }} props
 */
export function TrendChartCard({ metric, index = 0 }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = chartAxisColors(isDark);

  const series = metric.series;
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const pctChange = previous && previous.value !== 0 ? ((latest.value - previous.value) / Math.abs(previous.value)) * 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.07, 0.6), duration: 0.35, ease: 'easeOut' }}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.label}</span>
        {pctChange != null && (
          <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
            전분기 대비 {formatPercent(pctChange)}
          </span>
        )}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {formatFinancialMetricValue(metric, latest.value)}
      </div>

      <div className="mt-2 h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <XAxis
              dataKey="quarter"
              tickFormatter={formatQuarterAxis}
              tick={{ fontSize: 11, fill: colors.tick }}
              axisLine={{ stroke: colors.axis }}
              tickLine={false}
            />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip content={<TrendTooltip metric={metric} />} cursor={{ stroke: colors.cursor }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.line}
              strokeWidth={2}
              dot={{ r: 2.5, fill: colors.line, strokeWidth: 0 }}
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
