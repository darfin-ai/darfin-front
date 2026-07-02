import { useState } from 'react';
import { FileText, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Derives a short display label from a full shift label string.
 * e.g. "스마트폰·가전 중심 DX 사업 (매출 비중 72.5%, 2023Q1)" → "스마트폰·가전 중심 DX 사업"
 */
function shortLabel(str) {
  return str.split('(')[0].trim();
}

/**
 * Extracts a quarter code from inside parentheses.
 * e.g. "... (매출 비중 72.5%, 2023Q1)" → "2023Q1"
 */
function extractQuarter(str) {
  const m = str.match(/(\d{4}Q\d)/);
  return m ? m[1] : '';
}

/** "2024Q1" → "2024 Q1" */
function fmtQuarter(q) {
  const m = q.match(/(\d{4})Q(\d)/);
  return m ? `${m[1]} Q${m[2]}` : q;
}

/**
 * Derives an ordered list of timeline nodes from the strategyShifts array.
 * Adding a new StrategyShift to the source data automatically creates a new node —
 * no changes to this component needed.
 *
 * @param {import('../../../../mocks/companyAnalysis/types').StrategyShift[]} strategyShifts
 */
function deriveNodes(strategyShifts) {
  if (strategyShifts.length === 0) return [];

  const sorted = [...strategyShifts].sort((a, b) => a.quarter.localeCompare(b.quarter));

  return [
    // Origin: inferred from the earliest shift's "from" description
    {
      id: 'origin',
      label: shortLabel(sorted[0].from),
      quarter: extractQuarter(sorted[0].from),
      shift: null,
      isCurrent: false,
    },
    // One node per detected shift, chronological order
    ...sorted.map((shift, i) => ({
      id: shift.quarter,
      label: shortLabel(shift.to),
      quarter: shift.quarter,
      shift,
      isCurrent: i === sorted.length - 1, // last = most recent filing
    })),
  ];
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
 *   strategyShifts: import('../../../../mocks/companyAnalysis/types').StrategyShift[],
 * }} props
 */
export function BusinessEvolutionTimeline({ profile, strategyShifts }) {
  const nodes = deriveNodes(strategyShifts);

  const [selectedIdx, setSelectedIdx] = useState(nodes.length - 1);
  const [windowStart, setWindowStart] = useState(Math.max(0, nodes.length - PAGE_SIZE));
  const [slideDir, setSlideDir] = useState(0); // -1 = sliding left, 1 = sliding right

  const selected = nodes[selectedIdx];
  const visibleNodes = nodes.slice(windowStart, windowStart + PAGE_SIZE);
  const canPrev = windowStart > 0;
  const canNext = windowStart + PAGE_SIZE < nodes.length;

  function shiftWindow(dir) {
    setSlideDir(dir);
    setWindowStart((s) => Math.max(0, Math.min(nodes.length - PAGE_SIZE, s + dir)));
  }

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">사업의 내용</p>
        <p className="text-base leading-relaxed text-slate-700">{profile.businessDescription}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-slate-500">사업 변화 흐름</p>

      {/* Horizontal stepper with prev/next arrows */}
      <div className="flex items-start gap-2">
        {/* Prev arrow */}
        <button
          onClick={() => shiftWindow(-1)}
          disabled={!canPrev}
          className="mt-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="이전"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        {/* 3-node window */}
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
              {/* Connecting line */}
              <div className="absolute left-[22px] right-[22px] top-[21px] h-px bg-slate-200" />

              {visibleNodes.map((node) => {
                const i = nodes.indexOf(node);
                const isPast = i < nodes.length - 1;
                const isSelected = i === selectedIdx;

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedIdx(i)}
                    className="group relative z-10 flex flex-1 flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {/* Circle */}
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isPast
                        ? 'border-slate-300 bg-slate-300 text-white'
                        : 'border-slate-200 bg-slate-200 text-slate-400 group-hover:border-blue-300 group-hover:bg-blue-100 group-hover:text-blue-500'
                    }`}>
                      {node.isCurrent ? (
                        <span className="text-xs font-bold">현재</span>
                      ) : isPast ? (
                        <Check size={16} strokeWidth={2.5} />
                      ) : (
                        <span className="text-sm font-semibold">{i + 1}</span>
                      )}
                    </div>

                    {/* Quarter */}
                    <span className={`text-xs font-medium tabular-nums ${
                      isSelected ? 'text-blue-500' : 'text-slate-400'
                    }`}>
                      {node.quarter ? fmtQuarter(node.quarter) : '기준 시점'}
                    </span>

                    {/* Label */}
                    <span className={`max-w-[120px] text-center text-sm font-semibold leading-snug ${
                      isSelected ? 'text-blue-700' : 'text-slate-500'
                    }`}>
                      {node.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next arrow */}
        <button
          onClick={() => shiftWindow(1)}
          disabled={!canNext}
          className="mt-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="다음"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Detail panel — fixed height container, content crossfades only (no layout shift) */}
      <div className="mt-6 min-h-[120px] border-t border-slate-100 pt-5">
        <AnimatePresence mode="wait">
          {selected?.shift ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-3"
            >
              {/* Key metrics */}
              {selected.shift.metrics?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.shift.metrics.map((m) => (
                    <div key={m.label} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      <p className="text-[11px] font-medium text-slate-400">{m.label}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {m.from && (
                          <>
                            <span className="text-sm font-semibold tabular-nums text-slate-400">{m.from}</span>
                            <span className="text-xs text-slate-300">→</span>
                          </>
                        )}
                        <span className="text-sm font-bold tabular-nums text-slate-800">{m.to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Management rationale */}
              <div className="rounded-md border-l-4 border-blue-400 bg-blue-50/40 px-4 py-3">
                <p className="mb-1 text-xs font-semibold text-blue-600">경영진 설명</p>
                <p className="max-w-xl text-sm leading-relaxed text-slate-700">{selected.shift.rationale}</p>
              </div>
              <a
                href={`#${selected.shift.sourceRef}`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600"
              >
                <FileText size={12} />
                원문 보기
              </a>
            </motion.div>
          ) : (
            <motion.p
              key="origin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-sm text-slate-400"
            >
              이 시점이 변화의 출발점입니다. 이후 분기를 선택하면 전환 내용을 확인할 수 있어요.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
