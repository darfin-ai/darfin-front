import { motion } from 'motion/react';

/**
 * @param {{ profile: import('../../../../mocks/companyAnalysis/types').CompanyProfile }} props
 */
export function BusinessContextCard({ profile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-blue-100 bg-blue-50/50 p-5"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-500">사업의 내용</p>
      <p className="text-sm leading-relaxed text-slate-700">{profile.businessDescription}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-blue-100 pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-slate-500">주식 현황</dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-slate-600">{profile.shareStructure}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">지배구조</dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-slate-600">{profile.governanceNotes}</dd>
        </div>
      </div>
    </motion.div>
  );
}
