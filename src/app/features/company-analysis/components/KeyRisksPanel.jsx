import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { SourceExcerptDialog } from './SourceExcerptDialog';

const SEVERITY_STYLES = {
  high:   { border: 'border-l-red-400',   dot: 'bg-red-400',   label: '영향 높음', text: 'text-red-600' },
  medium: { border: 'border-l-amber-400', dot: 'bg-amber-400', label: '영향 보통', text: 'text-amber-600' },
  low:    { border: 'border-l-slate-300', dot: 'bg-slate-300', label: '영향 낮음', text: 'text-slate-500' },
};

const STATUS_BADGE = {
  new:     { label: '신규',   className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  removed: { label: '제거됨', className: 'bg-red-50 text-red-600 border border-red-200' },
};

/**
 * @param {{ overview: import('../../../../mocks/companyAnalysis/types').CompanyOverview }} props
 */
export function KeyRisksPanel({ overview }) {
  const risks = overview.risks ?? [];

  return (
    <section aria-labelledby="risk-heading">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 id="risk-heading" className="text-xl font-semibold text-slate-900">
          핵심 리스크
        </h2>
        {risks.some((r) => r.status === 'new') && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 border border-blue-200">
            {risks.filter((r) => r.status === 'new').length}건 신규
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {risks.filter((r) => r.status !== 'removed').map((risk, i) => {
          const sev = SEVERITY_STYLES[risk.severity];
          return (
            <motion.div
              key={risk.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
              className={`flex flex-col rounded-lg border border-slate-200 border-l-4 bg-white p-4 ${sev.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800">{risk.title}</span>
                {risk.status !== 'existing' && (
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE[risk.status].className}`}>
                    {STATUS_BADGE[risk.status].label}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">{risk.description}</p>

              {risk.insight && (
                <div className="mt-3 flex gap-2 rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2">
                  <Lightbulb size={13} className="mt-0.5 shrink-0 text-blue-500" />
                  <p className="text-xs leading-relaxed text-slate-700">
                    <span className="font-semibold text-blue-700">So what? </span>
                    {risk.insight}
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${sev.dot}`} />
                  <span className={`text-xs font-medium ${sev.text}`}>{sev.label}</span>
                </div>
                {risk.sourceRef && (
                  <SourceExcerptDialog
                    sectionLabel={risk.sourceRef.sectionLabel}
                    excerpt={risk.sourceRef.excerpt}
                    sourceRef={risk.sourceRef.sourceRef}
                    label="공시 원문"
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {risks.some((r) => r.status === 'removed') && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 mb-2">이번 분기 제거된 리스크</p>
          <div className="flex flex-wrap gap-2">
            {risks.filter((r) => r.status === 'removed').map((r) => (
              <span key={r.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-400 line-through">
                {r.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
