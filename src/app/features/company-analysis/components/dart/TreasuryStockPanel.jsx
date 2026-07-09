import { Info } from 'lucide-react';
import { useLocale } from '../../../../shared/i18n';
import { formatShares } from '../../lib/format';
import { useExpandableRows } from '../../lib/useExpandableRows';
import {
  DartSectionHeader,
  DartCard,
  DartEmptyState,
  TABLE_HEAD_CLASS,
  TABLE_HEAD_NUM_CLASS,
  TABLE_CELL_CLASS,
  TABLE_CELL_NUM_CLASS,
} from './DartSectionHeader';
import { ExpandToggle } from './ExpandToggle';

const hasActivity = (row) =>
  [row.bsisQy, row.changeQyAcqs, row.changeQyDsps, row.changeQyIncnr, row.trmendQy].some(
    (v) => v != null && v !== 0,
  );

function MethodLabel({ row }) {
  const parts = [row.acqsMth1, row.acqsMth2, row.acqsMth3].filter((p) => p && p !== '-');
  return (
    <div>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{parts[0] ?? '-'}</p>
      {parts.length > 1 && (
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{parts.slice(1).join(' · ')}</p>
      )}
      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{row.stockKnd}</p>
    </div>
  );
}

function FlowCell({ value, accent, locale }) {
  if (value == null || value === 0) {
    return <td className={`${TABLE_CELL_NUM_CLASS} text-slate-300 dark:text-slate-600`}>-</td>;
  }
  const cls = accent
    ? 'font-medium text-red-600 dark:text-red-400'
    : 'text-slate-700 dark:text-slate-300';
  return (
    <td className={`${TABLE_CELL_NUM_CLASS} ${cls}`}>
      {formatShares(value, locale)}
    </td>
  );
}

/**
 * tesstkAcqsDspsSttus — 자기주식 기초→취득→처분→소각→기말 흐름표.
 * @param {{ section: import('../../../../../mocks/companyAnalysis/types').DartSection|null }} props
 */
export function TreasuryStockPanel({ section }) {
  const { t, locale } = useLocale();
  const rows = (section?.rows ?? []).filter(hasActivity);
  const { visible, hasMore, expanded, toggle, total } = useExpandableRows(rows);

  return (
    <section aria-labelledby="dart-treasury-heading">
      <DartSectionHeader
        id="dart-treasury-heading"
        title={t('company.dart.panels.treasuryStock')}
        sourceRef={section?.sourceRef}
        asOf={section?.asOf}
      />
      <DartCard>
        {rows.length === 0 ? (
          <DartEmptyState>{t('company.dart.empty.treasuryStock')}</DartEmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.type')}</th>
                  <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.begin')}</th>
                  <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.acquired')}</th>
                  <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.disposed')}</th>
                  <th className={TABLE_HEAD_NUM_CLASS}>
                    <span className="inline-flex items-center gap-1">
                      {t('company.dart.labels.retired')}
                      <span title={t('company.dart.labels.retiredNote')} className="text-slate-400 dark:text-slate-500">
                        <Info className="h-3 w-3" aria-hidden />
                      </span>
                    </span>
                  </th>
                  <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.end')}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row, index) => (
                  <tr
                    key={`${row.acqsMth1}-${row.acqsMth2}-${row.acqsMth3}-${row.stockKnd}-${index}`}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                  >
                    <td className={TABLE_CELL_CLASS}>
                      <MethodLabel row={row} />
                    </td>
                    <FlowCell value={row.bsisQy} locale={locale} />
                    <FlowCell value={row.changeQyAcqs} accent locale={locale} />
                    <FlowCell value={row.changeQyDsps} locale={locale} />
                    <FlowCell value={row.changeQyIncnr} locale={locale} />
                    <td className={`${TABLE_CELL_NUM_CLASS} font-medium text-slate-900 dark:text-slate-100`}>
                      {formatShares(row.trmendQy, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <ExpandToggle
              hasMore={hasMore}
              expanded={expanded}
              total={total}
              onToggle={toggle}
              labelKey="company.dart.labels.showAllTreasury"
            />
          </>
        )}
      </DartCard>
    </section>
  );
}
