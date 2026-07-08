import { useLocale } from '../../../shared/i18n';
import { formatMetricValue, formatMetricDelta } from '../lib/format';

function deltaColor(delta) {
  if (delta > 0) return 'text-blue-600 dark:text-blue-400';
  if (delta < 0) return 'text-red-500 dark:text-red-400';
  return 'text-slate-400 dark:text-slate-500';
}

/**
 * @param {{ metrics: import('../../../../mocks/companyAnalysis/types').NumericDeltaMetric[], currentLabel: string, baselineLabel: string }} props
 */
export function NumericDeltaTable({ metrics, currentLabel, baselineLabel }) {
  const { t, locale } = useLocale();

  return (
    <div className="overflow-x-auto rounded-md border border-slate-100 dark:border-slate-800">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
            <th className="px-3 py-2 text-left font-medium">{t('company.panels.item')}</th>
            <th className="px-3 py-2 text-right font-medium">{currentLabel}</th>
            <th className="px-3 py-2 text-right font-medium">{baselineLabel}</th>
            <th className="px-3 py-2 text-right font-medium">{t('company.panels.change')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {metrics.map((metric) => {
            const delta = metric.current - metric.baseline;
            return (
              <tr key={metric.label}>
                <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{metric.label}</td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-900 dark:text-slate-100">
                  {formatMetricValue(metric.unit, metric.current, metric.unitLabel, locale)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-500 dark:text-slate-400">
                  {formatMetricValue(metric.unit, metric.baseline, metric.unitLabel, locale)}
                </td>
                <td className={`px-3 py-2 text-right tabular-nums font-medium ${deltaColor(delta)}`}>
                  {formatMetricDelta(metric.unit, delta, metric.unitLabel, locale)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
