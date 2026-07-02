import { SectionDiffItem } from './SectionDiffItem';

/**
 * @param {{ diffs: import('../../../../mocks/companyAnalysis/types').SectionDiffEntry[] }} props
 */
export function SectionDiffList({ diffs }) {
  return (
    <section aria-labelledby="section-diffs-heading">
      <h2 id="section-diffs-heading" className="mb-4 text-xl font-semibold text-slate-900">
        서술형 항목 변경
      </h2>
      {diffs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          변경된 서술형 항목이 없어요.
        </p>
      ) : (
        <div className="space-y-2">
          {diffs.map((diff, index) => (
            <SectionDiffItem key={`${diff.sectionLabel}-${diff.sourceRef}`} diff={diff} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
