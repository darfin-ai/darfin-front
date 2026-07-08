import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { SoWhatCallout } from './SoWhatCallout';
import { isAiReady } from '../lib/aiStatus';
import { formatKrwCompact } from '../lib/format';

function HistoryTooltip({ active, payload, locale, t }) {
  if (!active || !payload?.length) return null;
  const { fiscalYear, perShareKrw } = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-slate-500 dark:text-slate-400">{fiscalYear}</p>
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        {perShareKrw != null ? formatKrwCompact(perShareKrw, locale) : t('company.labels.dividend.undecided')}
      </p>
    </div>
  );
}

function MetricCard({ label, value, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3"
    >
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </motion.div>
  );
}

function normalizeHistory(div) {
  const rows = div.history ?? [];
  const priorFullYear = rows.find((row) => row.year === '전기')?.perShareKrw;

  return rows.map((row) => {
    const fiscalYear = row.fiscalYear ?? row.year;
    let isPartial = row.isPartial;
    if (isPartial == null && row.year === '당기') {
      if (div.isInterimReport === true) {
        isPartial = true;
      } else if (
        div.isInterimReport == null &&
        priorFullYear != null &&
        row.perShareKrw != null &&
        row.perShareKrw < priorFullYear * 0.75
      ) {
        isPartial = true;
      }
    }

    return {
      fiscalYear,
      perShareKrw: row.perShareKrw,
      isPartial: Boolean(isPartial),
    };
  });
}

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function DividendPanel({ overview }) {
  const { t, locale } = useLocale();
  const div = overview.dividend;
  if (!div) return null;

  const history = normalizeHistory(div).sort((a, b) => {
    const aNum = Number(a.fiscalYear);
    const bNum = Number(b.fiscalYear);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    const order = { 전전기: 0, 전기: 1, 당기: 2 };
    return (order[a.fiscalYear] ?? 99) - (order[b.fiscalYear] ?? 99);
  });
  const partialPoint = history.find((row) => row.isPartial && row.perShareKrw != null);
  const annualHistory = history.filter((row) => !row.isPartial && row.perShareKrw != null);
  const chartData = annualHistory.map((row) => ({
    ...row,
    displayValue: row.perShareKrw,
  }));
  const maxVal = Math.max(...chartData.map((d) => d.perShareKrw ?? 0), 1);
  const perShareLabel = partialPoint ? t('company.labels.dividend.perShareYtd') : t('company.labels.dividend.perShareCurrent');

  return (
    <section aria-labelledby="dividend-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="dividend-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t('company.panels.dividend')}
        </h2>
        {div.sourceRef && (
          <SourceExcerptDialog
            sectionLabel={div.sourceRef.sectionLabel}
            excerpt={div.sourceRef.excerpt}
            sourceRef={div.sourceRef.sourceRef}
            label={t('company.panels.viewSourceFull')}
            className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
          />
        )}
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label={perShareLabel}
            value={formatKrwCompact(div.perShareKrw, locale)}
            sub={partialPoint ? `${div.reportLabel ?? t('company.labels.dividend.recentBasis')}` : t('company.labels.dividend.commonBasis')}
            delay={0}
          />
          <MetricCard
            label={t('company.labels.dividend.yield')}
            value={`${div.yieldPct}%`}
            sub={t('company.labels.dividend.recentBasis')}
            delay={0.06}
          />
          <MetricCard
            label={t('company.labels.dividend.payout')}
            value={`${div.payoutRatioPct}%`}
            sub={t('company.labels.dividend.profitBasis')}
            delay={0.12}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">{t('company.panels.annualDividendTrend')}</p>
          {chartData.length > 0 ? (
            <>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <YAxis domain={[0, maxVal * 1.3]} hide />
                    <Tooltip content={<HistoryTooltip locale={locale} t={t} />} cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} />
                    <Bar dataKey="displayValue" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.fiscalYear} fill="#3b82f6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around px-1">
                {chartData.map((d) => (
                  <span key={d.fiscalYear} className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    {d.fiscalYear}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">{t('company.panels.noDividendHistory')}</p>
          )}

          {partialPoint && (
            <p className="mt-3 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-medium">{t('company.panels.dividendYtdCumulative', { year: partialPoint.fiscalYear })}</span>
              {' '}
              {formatKrwCompact(partialPoint.perShareKrw, locale)}
              {div.reportLabel ? ` (${div.reportLabel})` : ''}
              {' '}
              {t('company.panels.dividendPartialNote')}
            </p>
          )}

          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {t('company.panels.dividendFiscalFootnote')}
          </p>
        </div>

        <SoWhatCallout ready={isAiReady(overview)} insight={div.insight} />
      </div>
    </section>
  );
}
