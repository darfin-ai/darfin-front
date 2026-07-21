import { Link } from 'react-router';
import { ExternalLink, FileText } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { useCompanyName } from '../lib/companyNameContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../../../shared/components/ui/dialog';

/**
 * sourceRef는 이 섹션 데이터의 출처가 된 공시의 rcept_no다(DartOverviewSection.SourceRef 참고).
 * @param {{ sectionLabel: string, excerpt: string, sourceRef: string, label?: string, className?: string }} props
 */
export function SourceExcerptDialog({ sectionLabel, excerpt, sourceRef, label, className = '' }) {
  const { t } = useLocale();
  const companyName = useCompanyName();
  const triggerLabel = label ?? t('company.panels.viewSource');
  const disclosureHref = sourceRef
    ? `/disclosure/${encodeURIComponent(sourceRef)}${companyName ? `?company=${encodeURIComponent(companyName)}` : ''}`
    : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1 rounded text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${className}`}
        >
          <ExternalLink size={12} />
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{sectionLabel}</DialogTitle>
          <DialogDescription>{t('company.panels.sourceExcerpt')}</DialogDescription>
        </DialogHeader>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{excerpt}</p>
        <p className="font-mono text-xs text-slate-400 dark:text-slate-500">{sourceRef}</p>
        {disclosureHref && (
          <Link
            to={disclosureHref}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
          >
            <FileText size={13} />
            {t('company.panels.goToDisclosureAnalysis')}
          </Link>
        )}
      </DialogContent>
    </Dialog>
  );
}
