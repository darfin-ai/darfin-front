import { motion } from 'motion/react';
import { useLocale } from '../../../../shared/i18n';
import { useExpandableRows } from '../../lib/useExpandableRows';
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
import { majorHolderTotalStake, majorHolderRows, minorityRow } from './dartDerive';
import { ExpandToggle } from './ExpandToggle';

const BAR_COLORS = {
  major: '#1e40af',
  minority: '#3b82f6',
  others: '#94a3b8',
};

function pct(value, digits = 1) {
  return value == null || Number.isNaN(value) ? '-' : `${value.toFixed(digits)}%`;
}

function StakeDelta({ begin, end }) {
  if (begin == null || end == null) return null;
  const delta = end - begin;
  if (Math.abs(delta) < 0.005) {
    return <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">0.0%p</span>;
  }
  const up = delta > 0;
  return (
    <span
      className={`text-xs tabular-nums ${up ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}
    >
      {up ? '+' : ''}{delta.toFixed(2)}%p
    </span>
  );
}

/**
 * hyslrSttus + mrhlSttus — 지분 구성 스택 바 + 주주별 기초→기말 테이블.
 * @param {{
 *   section: import('../../../../../mocks/companyAnalysis/types').DartSection|null,
 *   minoritySection: import('../../../../../mocks/companyAnalysis/types').DartSection|null,
 * }} props
 */
export function MajorShareholderPanel({ section, minoritySection }) {
  const { t, locale } = useLocale();
  const empty = isEmptySection(section);

  const holders = majorHolderRows(section);
  const { visible, hasMore, expanded, toggle, total } = useExpandableRows(holders);
  const majorStake = majorHolderTotalStake(section);
  const minority = minorityRow(minoritySection);
  const minorityStake = minority?.holdStockRate ?? null;
  const othersStake =
    majorStake != null && minorityStake != null
      ? Math.max(0, 100 - majorStake - minorityStake)
      : null;

  const segments = [
    { key: 'major', label: t('company.dart.labels.majorGroup'), value: majorStake },
    { key: 'minority', label: t('company.dart.labels.minorityGroup'), value: minorityStake },
    { key: 'others', label: t('company.dart.labels.othersGroup'), value: othersStake },
  ].filter((s) => s.value != null && s.value > 0);

  const numberLocale = locale === 'en' ? 'en-US' : 'ko-KR';

  return (
    <section aria-labelledby="dart-major-shareholders-heading">
      <DartSectionHeader
        id="dart-major-shareholders-heading"
        title={t('company.dart.panels.majorShareholders')}
        asOf={section?.asOf}
      />
      <DartCard>
        {empty ? (
          <DartEmptyState>{t('company.dart.empty.majorShareholders')}</DartEmptyState>
        ) : (
          <>
            {segments.length > 0 && (
              <>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  {segments.map((s) => (
                    <motion.div
                      key={s.key}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{ backgroundColor: BAR_COLORS[s.key] }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {segments.map((s) => (
                    <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAR_COLORS[s.key] }} />
                      {s.label}
                      <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">{pct(s.value)}</span>
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[380px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.holder')}</th>
                    <th className={TABLE_HEAD_CLASS}>{t('company.dart.labels.relation')}</th>
                    <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.stakeBegin')}</th>
                    <th className={TABLE_HEAD_NUM_CLASS}>{t('company.dart.labels.stakeEnd')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((h, index) => (
                    <tr key={`${h.nm}-${h.relate}-${h.stockKnd}-${index}`} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <td className={`${TABLE_CELL_CLASS} font-medium text-slate-900 dark:text-slate-100`}>{h.nm}</td>
                      <td className={TABLE_CELL_CLASS}>{h.relate}</td>
                      <td className={TABLE_CELL_NUM_CLASS}>{pct(h.bsisQotaRt, 2)}</td>
                      <td className={TABLE_CELL_NUM_CLASS}>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{pct(h.trmendQotaRt, 2)}</span>
                        <span className="ml-1.5">
                          <StakeDelta begin={h.bsisQotaRt} end={h.trmendQotaRt} />
                        </span>
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
              labelKey="company.dart.labels.showAllHolders"
            />

            {minority?.shrholdrCo != null && minorityStake != null && (
              <p className="mt-3 rounded-md bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                {t('company.dart.labels.minoritySummary', {
                  count: minority.shrholdrCo.toLocaleString(numberLocale),
                  rate: minorityStake.toFixed(1),
                })}
              </p>
            )}
          </>
        )}
      </DartCard>
    </section>
  );
}
