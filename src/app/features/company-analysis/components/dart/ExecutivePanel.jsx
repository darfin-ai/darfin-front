import { useLocale } from '../../../../shared/i18n';
import { useExpandableRows } from '../../lib/useExpandableRows';
import { formatFilingDate } from '../../lib/format';
import {
  DartSectionHeader,
  DartCard,
  DartEmptyState,
  isEmptySection,
  TABLE_HEAD_CLASS,
  TABLE_CELL_CLASS,
} from './DartSectionHeader';
import { ExpandToggle } from './ExpandToggle';

function ExecBadge({ registered, fullTime, t }) {
  const regCls = registered
    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500';
  const fteCls = fullTime
    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
  return (
    <span className="inline-flex gap-1">
      <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${regCls}`}>
        {registered ? t('company.dart.labels.registered') : t('company.dart.labels.unregistered')}
      </span>
      <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${fteCls}`}>
        {fullTime ? t('company.dart.labels.fullTime') : t('company.dart.labels.partTime')}
      </span>
    </span>
  );
}

/**
 * exctvSttus — 임원 테이블 (6행 + 전체 보기 토글).
 * @param {{ section: import('../../../../../mocks/companyAnalysis/types').DartSection|null }} props
 */
export function ExecutivePanel({ section }) {
  const { t } = useLocale();
  const rows = section?.rows ?? [];
  const { visible, hasMore, expanded, toggle, total } = useExpandableRows(rows);

  return (
    <section aria-labelledby="dart-executives-heading" className="min-w-0">
      <DartSectionHeader
        id="dart-executives-heading"
        title={t('company.dart.panels.executives')}
        sourceRef={section?.sourceRef}
        asOf={section?.asOf}
      />
      <DartCard>
        {isEmptySection(section) ? (
          <DartEmptyState>{t('company.dart.empty.executives')}</DartEmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.holder')}</th>
                    <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.position')}</th>
                    <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.role')}</th>
                    <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.tenure')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => {
                    const registered = row.rgistExctvAt?.includes('등기');
                    const fullTime = row.fteAt === '상근';
                    return (
                      <tr key={`${row.nm}-${row.ofcps}`} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                        <td className={`${TABLE_CELL_CLASS} align-top`}>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{row.nm}</p>
                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400 dark:text-slate-500" title={row.mainCareer}>
                            {row.mainCareer}
                          </p>
                          <div className="mt-1">
                            <ExecBadge registered={registered} fullTime={fullTime} t={t} />
                          </div>
                        </td>
                        <td className={`${TABLE_CELL_CLASS} align-top text-sm`}>{row.ofcps}</td>
                        <td className={`${TABLE_CELL_CLASS} align-top text-sm`}>{row.chrgJob}</td>
                        <td className={`${TABLE_CELL_CLASS} align-top text-sm tabular-nums`}>
                          {row.hffcPd ?? '-'}
                          {row.tenureEndOn && (
                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                              {t('company.dart.labels.tenureEnd')} {formatFilingDate(row.tenureEndOn)}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ExpandToggle
              hasMore={hasMore}
              expanded={expanded}
              total={total}
              onToggle={toggle}
              labelKey="company.dart.labels.showAllExecutives"
            />
          </>
        )}
      </DartCard>
    </section>
  );
}
