import { motion } from 'motion/react';
import { useLocale } from '../../../../shared/i18n';
import { formatFilingDate } from '../../lib/format';
import { useExpandableRows } from '../../lib/useExpandableRows';
import {
  DartSectionHeader,
  DartCard,
  DartEmptyState,
  isEmptySection,
} from './DartSectionHeader';
import { ExpandToggle } from './ExpandToggle';

/**
 * hyslrChgSttus — 최대주주 변동 타임라인.
 * @param {{ section: import('../../../../../mocks/companyAnalysis/types').DartSection|null }} props
 */
export function ShareholderChangePanel({ section }) {
  const { t } = useLocale();
  const rows = [...(section?.rows ?? [])].sort((a, b) => (a.changeOn < b.changeOn ? 1 : -1));
  const { visible, hasMore, expanded, toggle, total } = useExpandableRows(rows);

  return (
    <section aria-labelledby="dart-shareholder-changes-heading">
      <DartSectionHeader
        id="dart-shareholder-changes-heading"
        title={t('company.dart.panels.shareholderChanges')}
        asOf={section?.asOf}
      />
      <DartCard>
        {isEmptySection(section) ? (
          <DartEmptyState>{t('company.dart.empty.shareholderChanges')}</DartEmptyState>
        ) : (
          <>
            <ol className="relative space-y-5 border-l border-slate-200 dark:border-slate-700 pl-4">
            {visible.map((row, i) => (
              <motion.li
                key={`${row.changeOn}-${row.mxmmShrholdrNm}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
                className="relative"
              >
                <span className="absolute -left-[21.5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500" />
                <p className="text-xs tabular-nums text-slate-400 dark:text-slate-500">{formatFilingDate(row.changeOn)}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {row.mxmmShrholdrNm}
                  {row.qotaRt != null && (
                    <span className="ml-2 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                      {row.qotaRt.toFixed(2)}%
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{row.changeCause}</p>
              </motion.li>
            ))}
          </ol>
          <ExpandToggle
            hasMore={hasMore}
            expanded={expanded}
            total={total}
            onToggle={toggle}
            labelKey="company.dart.labels.showAllChanges"
          />
          </>
        )}
      </DartCard>
    </section>
  );
}
