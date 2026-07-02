import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../../../shared/components/ui/dialog';

/**
 * The single "원문 보기" affordance used by both the reasoning chain and the
 * section diffs — every claim surfaced in either place must resolve to one
 * of these. There's no real filing viewer wired up yet (frontend/mock-only
 * task), so this renders the full excerpt in context rather than linking
 * out to a document that doesn't exist.
 *
 * @param {{ sectionLabel: string, excerpt: string, sourceRef: string, label?: string, className?: string }} props
 */
export function SourceExcerptDialog({ sectionLabel, excerpt, sourceRef, label = '원문 보기', className = '' }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1 rounded text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${className}`}
        >
          <ExternalLink size={12} />
          {label}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{sectionLabel}</DialogTitle>
          <DialogDescription>공시 원문 발췌</DialogDescription>
        </DialogHeader>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{excerpt}</p>
        <p className="font-mono text-xs text-slate-400">{sourceRef}</p>
      </DialogContent>
    </Dialog>
  );
}
