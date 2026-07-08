import { ExternalLink } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../../../shared/components/ui/dialog';

/**
 * @param {{ sectionLabel: string, excerpt: string, sourceRef: string, label?: string, className?: string }} props
 */
export function SourceExcerptDialog({ sectionLabel, excerpt, sourceRef, label, className = '' }) {
  const { t } = useLocale();
  const triggerLabel = label ?? t('company.panels.viewSource');

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
      </DialogContent>
    </Dialog>
  );
}
