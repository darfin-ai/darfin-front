import { formatMetricValue, formatMetricDelta } from '../lib/format';

function deltaColor(delta) {
  if (delta > 0) return 'text-blue-600';
  if (delta < 0) return 'text-red-500';
  return 'text-slate-400';
}

/**
 * @param {{ metrics: import('../../../../mocks/companyAnalysis/types').NumericDeltaMetric[], currentLabel: string, baselineLabel: string }} props
 */
export function NumericDeltaTable({ metrics, currentLabel, baselineLabel }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-100">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-xs text-slate-500">
            <th className="px-3 py-2 text-left font-medium">항목</th>
            <th className="px-3 py-2 text-right font-medium">{currentLabel}</th>
            <th className="px-3 py-2 text-right font-medium">{baselineLabel}</th>
            <th className="px-3 py-2 text-right font-medium">증감</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {metrics.map((metric) => {
            const delta = metric.current - metric.baseline;
            return (
              <tr key={metric.label}>
                <td className="px-3 py-2 font-medium text-slate-700">{metric.label}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                  {formatMetricValue(metric.unit, metric.current, metric.unitLabel)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-500">
                  {formatMetricValue(metric.unit, metric.baseline, metric.unitLabel)}
                </td>
                <td className={`px-3 py-2 text-right tabular-nums font-medium ${deltaColor(delta)}`}>
                  {formatMetricDelta(metric.unit, delta, metric.unitLabel)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
