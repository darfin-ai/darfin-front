import { SearchCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { HOP_TYPE_LABELS } from '../lib/scoring';

/**
 * @param {{ selection: { finding: object, hop: import('../../../../mocks/companyAnalysis/types').ReasoningHop } | null }} props
 */
export function VerificationRail({ selection }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">근거 확인</h2>

      {/* Keyed by sourceRef so switching between hops crossfades instead of
          silently swapping text — this is the main feedback loop on the page. */}
      <AnimatePresence mode="wait">
        {!selection ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-3 flex flex-col items-center gap-2 py-6 text-center text-sm text-slate-500"
          >
            <SearchCheck size={22} className="text-slate-300" />
            왼쪽 근거 체인에서 항목을 선택하면
            <br />
            원문 발췌가 여기에 표시됩니다.
          </motion.div>
        ) : (
          <motion.div
            key={selection.hop.sourceRef}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-3"
          >
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {HOP_TYPE_LABELS[selection.hop.type]}
            </span>
            <p className="mt-2 text-xs font-medium text-slate-500">{selection.hop.sectionLabel}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {selection.hop.excerpt}
            </p>
            <p className="mt-3 border-t border-slate-100 pt-2 font-mono text-xs text-slate-500">
              {selection.hop.sourceRef}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
