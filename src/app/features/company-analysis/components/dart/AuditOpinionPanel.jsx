import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '../../../../shared/i18n';
import {
  DartSectionHeader,
  DartCard,
  DartEmptyState,
  isEmptySection,
} from './DartSectionHeader';

function opinionBadgeClass(opinion) {
  if (!opinion) return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  if (opinion.includes('적정') && !opinion.includes('부적정')) {
    return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  }
  if (opinion.includes('한정')) {
    return 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300';
  }
  return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300';
}

function ExpandableNote({ label, text }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        {label}
      </button>
      {open && (
        <p className="mt-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * accnutAdtorNmNdAdtOpinion — 3년 감사의견 + 강조/핵심감사사항.
 * @param {{ section: import('../../../../../mocks/companyAnalysis/types').DartSection|null }} props
 */
export function AuditOpinionPanel({ section }) {
  const { t } = useLocale();
  const rows = [...(section?.rows ?? [])].sort((a, b) => String(b.bsnsYear).localeCompare(String(a.bsnsYear)));

  return (
    <section aria-labelledby="dart-audit-heading">
      <DartSectionHeader
        id="dart-audit-heading"
        title={t('company.dart.panels.auditOpinion')}
        sourceRef={section?.sourceRef}
        asOf={section?.asOf}
      />
      <DartCard>
        {isEmptySection(section) ? (
          <DartEmptyState>{t('company.dart.empty.auditOpinion')}</DartEmptyState>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, index) => (
              <li key={`${row.bsnsYear}-${row.adtor}-${index}`} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {row.bsnsYear}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {t('company.dart.labels.auditor')}: {row.adtor}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${opinionBadgeClass(row.adtOpinion)}`}>
                    {row.adtOpinion ?? '-'}
                  </span>
                </div>
                <ExpandableNote label={t('company.dart.labels.emphasis')} text={row.emphsMatter} />
                <ExpandableNote label={t('company.dart.labels.keyAuditMatter')} text={row.coreAdtMatter} />
              </li>
            ))}
          </ul>
        )}
      </DartCard>
    </section>
  );
}
