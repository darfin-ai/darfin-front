import { motion } from 'motion/react';
import { ArrowRight, TrendingUp, FileText, MessageSquareQuote } from 'lucide-react';

/**
 * @param {{ shift: import('../../../../mocks/companyAnalysis/types').StrategyShift, index: number }} props
 */
function ShiftItem({ shift, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      {/* Quarter badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
          {shift.quarter} 감지
        </span>
        <a
          href={`#${shift.sourceRef}`}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600"
        >
          <FileText size={12} />
          원문
        </a>
      </div>

      {/* From → To */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600">
          {shift.from}
        </span>
        <ArrowRight size={14} className="shrink-0 text-slate-400" />
        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
          {shift.to}
        </span>
      </div>

      {/* Evidence */}
      <div className="mt-3 border-l-2 border-slate-300 pl-3">
        <p className="text-xs font-medium text-slate-500">데이터 근거</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{shift.evidence}</p>
      </div>

      {/* Rationale */}
      <div className="mt-3 rounded-md border-l-4 border-blue-400 bg-blue-50/40 pl-3 pr-2 py-2">
        <p className="flex items-center gap-1 text-xs font-medium text-blue-600">
          <MessageSquareQuote size={12} />
          경영진 설명
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{shift.rationale}</p>
      </div>
    </motion.div>
  );
}

/**
 * @param {{
 *   profile: import('../../../../mocks/companyAnalysis/types').CompanyProfile,
 *   strategyShifts: import('../../../../mocks/companyAnalysis/types').StrategyShift[]
 * }} props
 */
export function BusinessEvolutionCard({ profile, strategyShifts }) {
  return (
    <section aria-labelledby="business-evolution-heading">
      {/* Static overview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="rounded-lg border border-slate-200 bg-slate-50/60 p-5"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">사업의 내용</p>
        <p className="text-base leading-relaxed text-slate-700">{profile.businessDescription}</p>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">주식 현황</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-600">{profile.shareStructure}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">지배구조</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-600">{profile.governanceNotes}</dd>
          </div>
        </div>
      </motion.div>

      {/* Detected strategy shifts */}
      {strategyShifts.length > 0 && (
        <div className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={15} className="text-blue-500" />
            <h2 id="business-evolution-heading" className="text-base font-semibold text-slate-800">
              공시에서 감지된 전략 변화
            </h2>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
              {strategyShifts.length}건
            </span>
          </div>
          <div className="space-y-3">
            {strategyShifts.map((shift, i) => (
              <ShiftItem key={`${shift.quarter}-${shift.from}`} shift={shift} index={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
