import { motion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { scoreComponentLabel } from '../lib/i18n';
import { ReasoningHopStep } from './ReasoningHopStep';
import { SEVERITY_STYLES } from '../lib/scoring';

/**
 * @param {{
 *   finding: import('../../../../mocks/companyAnalysis/types').ReasoningChainFinding,
 *   selectedHopSourceRef: string | null,
 *   onSelectHop: (finding: object, hop: object) => void,
 *   index?: number,
 * }} props
 */
export function ReasoningChainItem({ finding, selectedHopSourceRef, onSelectHop, index = 0 }) {
  const { t } = useLocale();
  const severityStyle = SEVERITY_STYLES[finding.severity];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 border-l-4 ${severityStyle.leftBorder}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          {scoreComponentLabel(t, finding.scoreComponent)}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${severityStyle.badge}`}>
          {t(`company.labels.impact.${finding.severity}`)}
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{finding.summary}</h3>

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
