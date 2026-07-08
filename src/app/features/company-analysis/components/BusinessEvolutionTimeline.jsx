import { useState } from 'react';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../../../shared/i18n';

function fmtQuarter(q) {
  const m = q.match(/(\d{4})Q(\d)/);
  return m ? `${m[1]} Q${m[2]}` : q;
}

const PAGE_SIZE = 3;

const slideVariants = {
  enter: (dir) => ({ x: dir * 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -50, opacity: 0 }),
};

/**
 * @param {{
 *   profile: import('../../../../mocks/companyAnalysis/types').CompanyProfile,
 *   mdnaHistory: import('../../../../mocks/companyAnalysis/types').MdnaHistoryEntry[],
 * }} props
 */
export function BusinessEvolutionTimeline({ profile, mdnaHistory = [] }) {
  const { t } = useLocale();
  const safeProfile = profile ?? { businessDescription: '', shareStructure: '', governanceNotes: '' };
  const [selectedIdx, setSelectedIdx] = useState(mdnaHistory.length - 1);
  const [windowStart, setWindowStart] = useState(Math.max(0, mdnaHistory.length - PAGE_SIZE));
  const [slideDir, setSlideDir] = useState(0);

  const selected = mdnaHistory[selectedIdx];
  const visibleEntries = mdnaHistory.slice(windowStart, windowStart + PAGE_SIZE);
  const canPrev = windowStart > 0;
  const canNext = windowStart + PAGE_SIZE < mdnaHistory.length;

  function shiftWindow(dir) {
    setSlideDir(dir);
    setWindowStart((s) => Math.max(0, Math.min(mdnaHistory.length - PAGE_SIZE, s + dir)));
  }

  if (mdnaHistory.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">{t('company.panels.businessContent')}</h2>
        <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">{safeProfile.businessDescription}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <h2 className="mb-6 text-sm font-medium text-slate-900 dark:text-slate-100">{t('company.panels.businessEvolution')}</h2>

      <div className="flex items-start gap-2">
        <button
          onClick={() => shiftWindow(-1)}
          disabled={!canPrev}
          className="mt-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label={t('company.panels.prev')}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={slideDir}>
            <motion.div
              key={windowStart}
              custom={slideDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative flex items-start"
            >
              <div className="absolute left-[22px] right-[22px] top-[21px] h-px bg-slate-200 dark:bg-slate-700" />

              {visibleEntries.map((entry) => {
                const i = mdnaHistory.indexOf(entry);
                const isPast = i < mdnaHistory.length - 1;
                const isSelected = i === selectedIdx;

                return (
                  <button
                    key={entry.rceptNo}
                    onClick={() => setSelectedIdx(i)}
                    className="group relative z-10 flex flex-1 flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isPast
                        ? 'border-slate-300 dark:border-slate-600 bg-slate-300 dark:bg-slate-600 text-white dark:text-slate-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-700 text-slate-400 group-hover:border-blue-300 group-hover:bg-blue-100 group-hover:text-blue-500 dark:group-hover:border-blue-800 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400'
                    }`}>
                      {i === mdnaHistory.length - 1 ? (
                        <span className="text-xs font-semibold">{t('company.panels.latest')}</span>
                      ) : (
                        <FileText size={16} strokeWidth={2.5} />
                      )}
                    </div>

                    <span className={`text-xs font-medium tabular-nums ${
                      isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {fmtQuarter(entry.quarter)}
                    </span>

                    <span className={`max-w-[120px] text-center text-sm font-semibold leading-snug ${
                      isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {entry.reportLabel}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => shiftWindow(1)}
          disabled={!canNext}
          className="mt-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label={t('company.panels.next')}
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.rceptNo}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-3"
            >
              <div className="max-h-80 overflow-y-auto rounded-md border-l-4 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{selected.excerpt}</p>
              </div>
              <a
                href={`#${selected.sourceRef}`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <FileText size={12} />
                {t('company.panels.viewSource')}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
