import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocale } from '../../../../shared/i18n';
import { formatKrwCompact } from '../../lib/format';
import { employeeTotals } from './dartDerive';
import { MetricCard } from './MetricCard';
import {
  DartSectionHeader,
  DartCard,
  DartEmptyState,
  isEmptySection,
} from './DartSectionHeader';

const REGULAR_COLOR = '#3b82f6';
const CONTRACT_COLOR = '#94a3b8';

function DivisionTooltip({ active, payload, t }) {
  if (!active || !payload?.length) return null;
  const { division, regular, contract, total } = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-slate-900 dark:text-slate-100">{division}</p>
      <p className="text-slate-500 dark:text-slate-400">
        {t('company.dart.labels.regular')}: <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">{regular?.toLocaleString()}</span>
      </p>
      <p className="text-slate-500 dark:text-slate-400">
        {t('company.dart.labels.contract')}: <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">{contract?.toLocaleString()}</span>
      </p>
      <p className="mt-0.5 font-semibold tabular-nums text-slate-800 dark:text-slate-100">
        {total?.toLocaleString()}{t('company.dart.labels.peopleUnit')}
      </p>
    </div>
  );
}

function aggregateByDivision(rows) {
  const map = new Map();
  for (const row of rows) {
    const existing = map.get(row.foBbm) ?? { division: row.foBbm, regular: 0, contract: 0, total: 0, tenureSum: 0, salarySum: 0, headcount: 0 };
    existing.regular += row.rgllbrCo ?? 0;
    existing.contract += row.cnttkCo ?? 0;
    existing.total += row.sm ?? 0;
    const tenure = parseFloat(row.avrgCnwkSdytrn);
    if (!Number.isNaN(tenure) && row.sm) {
      existing.tenureSum += tenure * row.sm;
      existing.salarySum += (row.janSalaryAm ?? 0) * row.sm;
      existing.headcount += row.sm;
    }
    map.set(row.foBbm, existing);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/**
 * empSttus — 사업부문별 수평 스택 바 + 요약 스탯 카드.
 * @param {{ section: import('../../../../../mocks/companyAnalysis/types').DartSection|null }} props
 */
export function EmployeePanel({ section }) {
  const { t, locale } = useLocale();
  const rows = section?.rows ?? [];
  const totals = employeeTotals(section);
  const numberLocale = locale === 'en' ? 'en-US' : 'ko-KR';

  const chartData = useMemo(() => aggregateByDivision(rows), [rows]);

  const avgTenure = useMemo(() => {
    let sum = 0;
    let count = 0;
    for (const row of rows) {
      const tenure = parseFloat(row.avrgCnwkSdytrn);
      if (!Number.isNaN(tenure) && row.sm) {
        sum += tenure * row.sm;
        count += row.sm;
      }
    }
    return count > 0 ? sum / count : null;
  }, [rows]);

  const avgSalary = useMemo(() => {
    let sum = 0;
    let count = 0;
    for (const row of rows) {
      if (row.janSalaryAm != null && row.sm) {
        sum += row.janSalaryAm * row.sm;
        count += row.sm;
      }
    }
    return count > 0 ? sum / count : null;
  }, [rows]);

  const regularRatio = totals && totals.total > 0
    ? (totals.regular / totals.total) * 100
    : null;

  return (
    <section aria-labelledby="dart-employees-heading">
      <DartSectionHeader
        id="dart-employees-heading"
        title={t('company.dart.panels.employees')}
        sourceRef={section?.sourceRef}
        asOf={section?.asOf}
      />
      <DartCard>
        {isEmptySection(section) ? (
          <DartEmptyState>{t('company.dart.empty.employees')}</DartEmptyState>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard
                label={t('company.dart.labels.totalEmployees')}
                value={totals ? `${totals.total.toLocaleString(numberLocale)}${t('company.dart.labels.peopleUnit')}` : '-'}
                delay={0}
              />
              <MetricCard
                label={t('company.dart.labels.regularRatio')}
                value={regularRatio != null ? `${regularRatio.toFixed(1)}%` : '-'}
                delay={0.06}
              />
              <MetricCard
                label={t('company.dart.labels.avgTenure')}
                value={avgTenure != null ? t('company.dart.labels.years', { n: avgTenure.toFixed(1) }) : '-'}
                delay={0.12}
              />
              <MetricCard
                label={t('company.dart.labels.avgSalary')}
                value={avgSalary != null ? formatKrwCompact(avgSalary, locale) : '-'}
                delay={0.18}
              />
            </div>

            {chartData.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('company.dart.labels.division')}
                </p>
                <div style={{ height: Math.max(chartData.length * 36, 120) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 0, right: 8, bottom: 0, left: 4 }}
                      barCategoryGap="20%"
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="division"
                        width={88}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<DivisionTooltip t={t} />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                      <Bar dataKey="regular" stackId="a" fill={REGULAR_COLOR} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="contract" stackId="a" fill={CONTRACT_COLOR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex gap-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: REGULAR_COLOR }} />
                    {t('company.dart.labels.regular')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CONTRACT_COLOR }} />
                    {t('company.dart.labels.contract')}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </DartCard>
    </section>
  );
}
