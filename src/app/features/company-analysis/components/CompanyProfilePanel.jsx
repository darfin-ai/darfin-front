/**
 * Static reference info — business description, share structure, governance.
 * Deliberately lower visual weight than the score/reasoning/diff sections
 * above it: this rarely changes quarter to quarter and shouldn't compete
 * for attention with what actually did change.
 *
 * @param {{ profile: import('../../../../mocks/companyAnalysis/types').CompanyProfile }} props
 */
export function CompanyProfilePanel({ profile }) {
  const rows = [
    ['사업 개요', profile.businessDescription],
    ['주식 현황', profile.shareStructure],
    ['지배구조', profile.governanceNotes],
  ];

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400">기업 개요</h2>
      <dl className="mt-2 space-y-3">
        {rows.map(([term, description]) => (
          <div key={term}>
            <dt className="text-xs font-medium text-slate-500">{term}</dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
