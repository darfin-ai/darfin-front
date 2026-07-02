import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { groupDiffsBySection, getFilingContext, baselineLabel } from '../lib/comparison';
import { SectionDiffGroup } from './SectionDiffGroup';
import { ComparisonModeSelector } from './ComparisonModeSelector';

/**
 * @param {{ diffs: import('../../../../mocks/companyAnalysis/types').SectionDiffEntry[], recentFilings: import('../../../../mocks/companyAnalysis/types').RecentFiling[] }} props
 */
export function SectionDiffList({ diffs, recentFilings }) {
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
      <h2 id="section-diffs-heading" className="mb-4 text-xl font-semibold text-slate-900">
        공시 변경
      </h2>

      <ComparisonModeSelector filingContext={filingContext} mode={mode} onChange={setMode} className="mb-6" />

      {/* Keyed by `mode` so switching QoQ/YoY/전체 crossfades the whole list —
          a visible signal that the content below just changed, not just an
          instant swap. */}
      <AnimatePresence mode="wait">
        {groups.length === 0 ? (
          <motion.p
            key={`${mode}-empty`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400"
          >
            선택한 기준에 해당하는 항목이 없어요.
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
