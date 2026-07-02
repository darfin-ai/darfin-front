import { motion } from 'motion/react';
import { DIFF_ANALYSIS_LABELS } from '../lib/comparison';
import { DiffEntryCard } from './DiffEntryCard';

/**
 * @param {{
 *   group: { sectionLabel: string, analysisType: string, blocks: { comparisonType: 'QoQ'|'YoY', goal: string, entries: import('../../../../mocks/companyAnalysis/types').SectionDiffEntry[] }[] },
 *   currentLabel: string, qoqLabel: string, yoyLabel: string, index?: number,
 * }} props
 */
export function SectionDiffGroup({ group, currentLabel, qoqLabel, yoyLabel, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-base font-semibold text-slate-800">{group.sectionLabel}</h3>
        <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
          {DIFF_ANALYSIS_LABELS[group.analysisType]}
        </span>
      </div>

      <div className="space-y-4">
        {group.blocks.map((block) => {
          const baseline = block.comparisonType === 'QoQ' ? qoqLabel : yoyLabel;
          return (
            <div key={block.comparisonType} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
              <div className="mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {block.comparisonType} · {baseline} 대비
                </span>
                <p className="mt-0.5 text-xs text-slate-400">{block.goal}</p>
              </div>

              {block.entries.length === 0 ? (
                <p className="text-sm text-slate-400">변경 사항이 감지되지 않았어요.</p>
              ) : (
                <div className="space-y-2">
                  {block.entries.map((entry, i) => (
                    <DiffEntryCard
                      key={`${entry.sectionLabel}-${block.comparisonType}-${i}`}
                      entry={entry}
                      currentLabel={currentLabel}
                      baselineLabel={baseline}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
