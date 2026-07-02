import { TrendChartCard } from './TrendChartCard';
import { FinancialTrendTable } from './FinancialTrendTable';

/**
 * @param {{ financials: import('../../../../mocks/companyAnalysis/types').FinancialMetric[] }} props
 */
export function FinancialTrendCharts({ financials }) {
  return (
    <section aria-labelledby="financial-trends-heading">
      <h2 id="financial-trends-heading" className="mb-3 text-lg font-semibold text-slate-900">
        재무 추이
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {financials.map((metric, index) => (
          <TrendChartCard key={metric.concept} metric={metric} index={index} />
        ))}
      </div>

      <div className="mt-6">
        <FinancialTrendTable financials={financials} />
      </div>
    </section>
  );
}
