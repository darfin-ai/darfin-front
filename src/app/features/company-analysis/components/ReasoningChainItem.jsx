import { motion } from 'motion/react';
import { ReasoningHopStep } from './ReasoningHopStep';
import { SEVERITY_LABELS, SEVERITY_STYLES, SCORE_COMPONENT_LABELS } from '../lib/scoring';

/**
 * @param {{
 *   finding: import('../../../../mocks/companyAnalysis/types').ReasoningChainFinding,
 *   selectedHopSourceRef: string | null,
 *   onSelectHop: (finding: object, hop: object) => void,
 *   index?: number,
 * }} props
 */
export function ReasoningChainItem({ finding, selectedHopSourceRef, onSelectHop, index = 0 }) {
  const severityStyle = SEVERITY_STYLES[finding.severity];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
      className={`rounded-lg border border-slate-200 bg-white p-5 border-l-4 ${severityStyle.leftBorder}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {SCORE_COMPONENT_LABELS[finding.scoreComponent]}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${severityStyle.badge}`}>
          영향도 {SEVERITY_LABELS[finding.severity]}
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">{finding.summary}</h3>

      <ol className="mt-3 space-y-3">
        {finding.hops.map((hop, i) => (
          <ReasoningHopStep
            key={`${hop.sourceRef}-${i}`}
            hop={hop}
            isLast={i === finding.hops.length - 1}
            isSelected={selectedHopSourceRef === hop.sourceRef}
            onSelect={() => onSelectHop(finding, hop)}
          />
        ))}
      </ol>
    </motion.article>
  );
}
