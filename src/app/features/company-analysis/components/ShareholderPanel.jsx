import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { SoWhatCallout } from './SoWhatCallout';
import { isAiReady } from '../lib/aiStatus';

const SLICE_COLORS = ['#1e40af', '#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6', '#64748b', '#94a3b8'];

const sliceColor = (index) => SLICE_COLORS[index % SLICE_COLORS.length];

function CustomTooltip({ active, payload, t }) {
  if (!active || !payload?.length) return null;
  const { name, detail, share } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-slate-800 dark:text-slate-100">{name}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{t('company.panels.shareRatio')} <span className="font-semibold text-slate-800 dark:text-slate-100">{share}%</span></p>
    </div>
  );
}

function DonutCenter({ shareholders, activeIdx }) {
  const largestIdx = shareholders.reduce((best, s, i) => (s.share > shareholders[best].share ? i : best), 0);
  const h = activeIdx !== null ? shareholders[activeIdx] : shareholders[largestIdx];
  if (!h) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{h.share}%</span>
      <span className="mt-0.5 max-w-[72px] text-center text-[11px] leading-tight text-slate-500 dark:text-slate-400">
        {h.name.split(' ')[0]}
      </span>
    </div>
  );
}

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function ShareholderPanel({ overview }) {
  const { t } = useLocale();
  const shareholders = overview.shareholders ?? [];
  const [activeIdx, setActiveIdx] = useState(null);

  const chartData = shareholders.map((s) => ({
    ...s,
    value: s.share,
  }));

  return (
    <section aria-labelledby="shareholder-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="shareholder-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t('company.panels.shareholders')}
        </h2>
        {overview.shareholderSourceRef && (
          <SourceExcerptDialog
            sectionLabel={overview.shareholderSourceRef.sectionLabel}
            excerpt={overview.shareholderSourceRef.excerpt}
            sourceRef={overview.shareholderSourceRef.sourceRef}
            label={t('company.panels.viewSourceFull')}
            className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
          />
        )}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        {shareholders.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
            {t('company.panels.noShareholderData')}
          </p>
        )}
        {shareholders.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative mx-auto h-40 w-40 shrink-0 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="56%"
                  outerRadius="78%"
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, i) => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)}
                  stroke="none"
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={sliceColor(i)}
                      opacity={activeIdx === null || activeIdx === i ? 1 : 0.35}
                      style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip t={t} />} />
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter shareholders={shareholders} activeIdx={activeIdx} />
          </div>

          <div className="flex-1 space-y-2">
            {shareholders.map((h, i) => (
              <motion.div
                key={h.name}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
                className={`flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 ${activeIdx === i ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: sliceColor(i) }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{h.name}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">{h.share}%</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{h.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        )}

        <SoWhatCallout ready={isAiReady(overview)} insight={overview.shareholderInsight} />
      </div>
    </section>
  );
}
