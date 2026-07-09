import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { useLocale } from '../../../../shared/i18n';
import { formatKrwCompact } from '../../lib/format';
import { dividendValue } from './dartDerive';
import { MetricCard } from './MetricCard';
import {
  DartSectionHeader,
  DartCard,
  DartEmptyState,
  isEmptySection,
} from './DartSectionHeader';

function HistoryTooltip({ active, payload, locale, t }) {
  if (!active || !payload?.length) return null;
  const { year, dps } = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-slate-500 dark:text-slate-400">{year}</p>
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        {dps != null ? formatKrwCompact(dps, locale) : t('company.dart.labels.noDividend')}
      </p>
    </div>
  );
}

/**
 * alotMatter — 배당 MetricCards + 3년 BarChart.
 * @param {{
 *   section: import('../../../../../mocks/companyAnalysis/types').DartSection|null,
 *   meta: import('../../../../../mocks/companyAnalysis/types').DartSectionMeta,
 * }} props
 */
export function DartDividendPanel({ section, meta }) {
  const { t, locale } = useLocale();
  const empty = isEmptySection(section);

  const dps = dividendValue(section, '주당 현금배당금', '보통주');
  const yieldPct = dividendValue(section, '현금배당수익률', '보통주');
  const payoutPct = dividendValue(section, '현금배당성향');
  const netIncome = dividendValue(section, '당기순이익');

  const dpsLwfr = dividendValue(section, '주당 현금배당금', '보통주', 'lwfr');
  const dpsFrmtrm = dividendValue(section, '주당 현금배당금', '보통주', 'frmtrm');
  const dpsThstrm = dividendValue(section, '주당 현금배당금', '보통주', 'thstrm');

  const year = Number(meta.bsnsYear);
  const chartData = [
    { year: String(year - 2), dps: dpsLwfr },
    { year: String(year - 1), dps: dpsFrmtrm },
    { year: String(year), dps: dpsThstrm },
  ].filter((d) => d.dps != null && d.dps > 0);

  const hasDividend = dps != null && dps > 0;
  const showPayout = payoutPct != null && (netIncome == null || netIncome > 0);
  const isInterim = meta.reprtCode !== '11011';
  const maxVal = Math.max(...chartData.map((d) => d.dps ?? 0), 1);

  return (
    <section aria-labelledby="dart-dividend-heading">
      <DartSectionHeader
        id="dart-dividend-heading"
        title={t('company.dart.panels.dividend')}
        sourceRef={section?.sourceRef}
      />
      <DartCard>
        {empty ? (
          <DartEmptyState>{t('company.dart.empty.dividends')}</DartEmptyState>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                label={t('company.dart.labels.dps')}
                value={hasDividend ? formatKrwCompact(dps, locale) : '-'}
                sub={t('company.dart.labels.commonBasis')}
                delay={0}
              />
              <MetricCard
                label={t('company.dart.labels.yieldPct')}
                value={yieldPct != null ? `${yieldPct.toFixed(1)}%` : '-'}
                sub={t('company.dart.labels.commonBasis')}
                delay={0.06}
              />
              <MetricCard
                label={t('company.dart.labels.payoutPct')}
                value={showPayout ? `${payoutPct.toFixed(1)}%` : '-'}
                sub={t('company.dart.labels.profitBasis')}
                delay={0.12}
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('company.dart.labels.dividendTrend')}
              </p>
              {chartData.length > 0 ? (
                <>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <YAxis domain={[0, maxVal * 1.3]} hide />
                        <Tooltip content={<HistoryTooltip locale={locale} t={t} />} cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} />
                        <Bar dataKey="dps" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry) => (
                            <Cell key={entry.year} fill="#3b82f6" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-around px-1">
                    {chartData.map((d) => (
                      <span key={d.year} className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {d.year}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                  {t('company.dart.labels.noDividend')}
                </p>
              )}

              {isInterim && (
                <p className="mt-3 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                  {t('company.dart.labels.interimNote')}
                </p>
              )}
            </div>
          </>
        )}
      </DartCard>
    </section>
  );
}
