import { formatQuarterAxis, formatQuarterFull, formatFinancialMetricValue } from '../lib/format';

/**
 * Quarter-by-quarter table view of the same financial metrics shown in the charts above.
 * @param {{ financials: import('../../../../mocks/companyAnalysis/types').FinancialMetric[] }} props
 */
export function FinancialTrendTable({ financials }) {
  const quarters = financials[0]?.series.map((point) => point.quarter) ?? [];

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 text-left font-medium text-slate-500">
              지표
            </th>
            {quarters.map((quarter) => (
              <th
                key={quarter}
                title={formatQuarterFull(quarter)}
                className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-slate-500"
              >
                {formatQuarterAxis(quarter)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {financials.map((metric) => (
            <tr key={metric.concept}>
              <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-slate-700">
                {metric.label}
              </td>
              {metric.series.map((point) => (
                <td key={point.quarter} className="whitespace-nowrap px-4 py-2.5 text-right text-slate-900">
                  {formatFinancialMetricValue(metric, point.value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
