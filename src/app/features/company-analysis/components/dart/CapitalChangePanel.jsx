import { useLocale } from '../../../../shared/i18n';
import { formatFilingDate, formatShares } from '../../lib/format';
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

function TypeBadge({ stle }) {
  const dilutiveOrReduction = stle.includes('감자') || stle.includes('소각');
  const cls = dilutiveOrReduction
    ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {stle}
    </span>
  );
}

/**
 * irdsSttus — 증자·감자 이력.
 * @param {{ section: import('../../../../../mocks/companyAnalysis/types').DartSection|null }} props
 */
export function CapitalChangePanel({ section }) {
  const { t, locale } = useLocale();
  const rows = [...(section?.rows ?? [])].sort((a, b) => (a.isuDcrsDe < b.isuDcrsDe ? 1 : -1));
  const numberLocale = locale === 'en' ? 'en-US' : 'ko-KR';

  return (
    <section aria-labelledby="dart-capital-changes-heading">
      <DartSectionHeader
        id="dart-capital-changes-heading"
        title={t('company.dart.panels.capitalChanges')}
        sourceRef={section?.sourceRef}
        asOf={section?.asOf}
      />
      <DartCard>
        {isEmptySection(section) ? (
          <DartEmptyState>{t('company.dart.empty.capitalChanges')}</DartEmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.date')}</th>
                  <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.type')}</th>
                  <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.quantity')}</th>
                  <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.issuePrice')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.isuDcrsDe}-${row.isuDcrsStle}-${row.isuDcrsStockKnd}-${index}`}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                  >
                    <td className={`${TABLE_CELL_NUM_CLASS} text-left`}>{formatFilingDate(row.isuDcrsDe)}</td>
                    <td className={TABLE_CELL_CLASS}>
                      <TypeBadge stle={row.isuDcrsStle} />
                      <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">{row.isuDcrsStockKnd}</span>
                    </td>
                    <td className={TABLE_CELL_NUM_CLASS}>{formatShares(row.isuDcrsQy, locale)}</td>
                    <td className={TABLE_CELL_NUM_CLASS}>
                      {row.isuDcrsMstvdivAmount != null
                        ? `${row.isuDcrsMstvdivAmount.toLocaleString(numberLocale)}${locale === 'en' ? ' KRW' : '원'}`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DartCard>
    </section>
  );
}
