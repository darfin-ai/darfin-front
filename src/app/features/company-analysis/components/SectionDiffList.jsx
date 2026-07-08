import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { groupDiffsBySection, getFilingContext, baselineLabel } from '../lib/comparison';
import { SectionDiffGroup } from './SectionDiffGroup';
import { ComparisonModeSelector } from './ComparisonModeSelector';

/**
 * @param {{ diffs: import('../../../../mocks/companyAnalysis/types').SectionDiffEntry[], recentFilings: import('../../../../mocks/companyAnalysis/types').RecentFiling[] }} props
 */
export function SectionDiffList({ diffs, recentFilings }) {
  const { t } = useLocale();
  const [mode, setMode] = useState('all');
  const filingContext = getFilingContext(recentFilings ?? []);

  const groups = groupDiffsBySection(diffs)
    .map((group) => ({
      ...group,
      blocks: mode === 'all' ? group.blocks : group.blocks.filter((b) => b.comparisonType === mode),
    }))
    .filter((group) => group.blocks.length > 0);

  return (
    <section aria-labelledby="section-diffs-heading">
      <h2 id="section-diffs-heading" className="mb-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {t('company.detail.tabDiffs')}
      </h2>

      <ComparisonModeSelector filingContext={filingContext} mode={mode} onChange={setMode} className="mb-6" />

      <AnimatePresence mode="wait">
        {groups.length === 0 ? (
          <motion.p
            key={`${mode}-empty`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-400 dark:text-slate-500"
          >
            {t('company.panels.noItemsForMode')}
          </motion.p>
        ) : (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="space-y-4"
          >
            {groups.map((group, index) => (
              <SectionDiffGroup
                key={group.sectionLabel}
                group={group}
                currentLabel={baselineLabel(filingContext.current)}
                qoqLabel={baselineLabel(filingContext.qoqBaseline)}
                yoyLabel={baselineLabel(filingContext.yoyBaseline)}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
