import { motion } from 'motion/react';
import { useLocale } from '../../../../shared/i18n';
import { formatShares } from '../../lib/format';
import {
  DartSectionHeader,
  DartCard,
  DartEmptyState,
  isEmptySection,
  TABLE_HEAD_CLASS,
  TABLE_HEAD_NUM_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NUM_CLASS,
} from './DartSectionHeader';

const SEGMENT_COLORS = {
  float: '#3b82f6',
  treasury: '#64748b',
  reduced: '#94a3b8',
};

function ClassBar({ row, t }) {
  const total = row.istcTotqy;
  if (!total) return null;
  const treasury = row.tesstkCo ?? 0;
  const float = row.distbStockCo ?? Math.max(0, total - treasury);
  const other = Math.max(0, total - float - treasury);
  const segments = [
    { key: 'float', label: t('company.dart.labels.float'), value: float },
    { key: 'treasury', label: t('company.dart.labels.treasury'), value: treasury },
    { key: 'reduced', label: t('company.dart.labels.reduced'), value: other },
  ].filter((s) => s.value > 0);

  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{row.se}</span>
        <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">
          {t('company.dart.labels.issued')} {formatShares(total)}
        </span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {segments.map((s) => (
          <motion.div
            key={s.key}
            initial={{ width: 0 }}
            animate={{ width: `${(s.value / total) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ backgroundColor: SEGMENT_COLORS[s.key] }}
            title={`${s.label} ${formatShares(s.value)}`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[s.key] }} />
            {s.label}
            <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
              {((s.value / total) * 100).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * stockTotqySttus — 주식 총수·유통 현황.
 * @param {{ section: import('../../../../../mocks/companyAnalysis/types').DartSection|null }} props
 */
export function StockCompositionPanel({ section }) {
  const { t, locale } = useLocale();
  const rows = section?.rows ?? [];
  const classRows = rows.filter((r) => !r.se.includes('합계'));

  return (
    <section aria-labelledby="dart-stock-composition-heading">
      <DartSectionHeader
        id="dart-stock-composition-heading"
        title={t('company.dart.panels.stockComposition')}
        asOf={section?.asOf}
      />
      <DartCard>
        {isEmptySection(section) ? (
          <DartEmptyState>{t('company.dart.empty.stockComposition')}</DartEmptyState>
        ) : (
          <>
            {classRows.map((row) => (
              <ClassBar key={row.se} row={row} t={t} />
            ))}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className={TABLE_HEAD_CLASS} />
                    <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.authorized')}</th>
                    <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.issued')}</th>
                    <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.treasury')}</th>
                    <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.float')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.se} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <td className={`${TABLE_CELL_CLASS} font-medium text-slate-900 dark:text-slate-100`}>{row.se}</td>
                      <td className={TABLE_CELL_NUM_CLASS}>{formatShares(row.isuStockTotqy, locale)}</td>
                      <td className={TABLE_CELL_NUM_CLASS}>{formatShares(row.istcTotqy, locale)}</td>
                      <td className={TABLE_CELL_NUM_CLASS}>{formatShares(row.tesstkCo, locale)}</td>
                      <td className={TABLE_CELL_NUM_CLASS}>{formatShares(row.distbStockCo, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DartCard>
    </section>
  );
}
