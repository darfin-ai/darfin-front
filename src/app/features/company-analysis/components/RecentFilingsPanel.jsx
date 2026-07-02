import { ExternalLink } from 'lucide-react';

const TYPE_BADGE = {
  '사업보고서': 'bg-blue-50 text-blue-700 border-blue-200',
  '반기보고서': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  '분기보고서': 'bg-slate-100 text-slate-600 border-slate-200',
};

function fmt(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * @param {{ filings: import('../../../../mocks/companyAnalysis/types').RecentFiling[] }} props
 */
export function RecentFilingsPanel({ filings }) {
  if (!filings?.length) return null;

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">최근 보고서</h2>
      <ul className="flex-1 divide-y divide-slate-100">
        {filings.map((f) => (
          <li key={f.id}>
            <a
              href={f.dartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded-md transition-colors"
            >
              <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[11px] font-medium ${TYPE_BADGE[f.type] ?? TYPE_BADGE['분기보고서']}`}>
                {f.type}
              </span>
              <span className="flex-1 whitespace-nowrap text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                {f.period}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-slate-400">{fmt(f.date)}</span>
              <ExternalLink size={12} className="shrink-0 text-slate-300 group-hover:text-blue-400 transition-colors" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
