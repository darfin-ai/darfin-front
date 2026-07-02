import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SourceExcerptDialog } from './SourceExcerptDialog';

const CHANGE_TYPE_STYLES = {
  added: { label: '신규 추가', badge: 'bg-blue-50 text-blue-700' },
  modified: { label: '수정됨', badge: 'bg-slate-100 text-slate-600' },
  removed: { label: '삭제됨', badge: 'bg-amber-50 text-amber-700' },
};

/**
 * Not built on the shared Collapsible primitive: that one shows/hides
 * instantly with no height transition, and this is exactly the kind of
 * animate-to-"auto"-height case motion handles natively. State/ARIA wiring
 * is done by hand here instead.
 * @param {{ diff: import('../../../../mocks/companyAnalysis/types').SectionDiffEntry, index?: number }} props
 */
export function SectionDiffItem({ diff, index = 0 }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const style = CHANGE_TYPE_STYLES[diff.changeType];
  const fullExcerpt = [diff.before && `[이전]\n${diff.before}`, diff.after && `[이후]\n${diff.after}`]
    .filter(Boolean)
    .join('\n\n');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-3 px-3 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown size={16} />
        </motion.span>
        <span className="min-w-0 flex-1 truncate text-base font-medium text-slate-800">{diff.sectionLabel}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>{style.label}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-t border-slate-100 px-3 pb-4 pt-3">
              {diff.before && (
                <p className="rounded bg-red-50 px-2 py-1 text-sm leading-relaxed text-red-700 line-through decoration-red-300">{diff.before}</p>
              )}
              {diff.after && <p className="rounded bg-green-50 px-2 py-1 text-sm leading-relaxed text-green-800">{diff.after}</p>}
              <div className="mt-2">
                <SourceExcerptDialog sectionLabel={diff.sectionLabel} excerpt={fullExcerpt} sourceRef={diff.sourceRef} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
