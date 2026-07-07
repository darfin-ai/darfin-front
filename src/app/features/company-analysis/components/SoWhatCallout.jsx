import { Lightbulb } from 'lucide-react';
import { Skeleton } from '../../../shared/components/ui/skeleton';

/**
 * The one AI-insight callout (DESIGN_SYSTEM.md §5.6). Blue is reserved for
 * AI-generated content, so every "So what?" paragraph renders through this.
 * Shows a skeleton while the LLM pass is still pending.
 * @param {{ ready: boolean, insight?: string | null, className?: string }} props
 */
export function SoWhatCallout({ ready, insight, className = 'mt-4' }) {
  if (ready && !insight) return null;
  return (
    <div className={`flex gap-3 rounded-md border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2.5 ${className}`}>
      <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" />
      {ready ? (
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <span className="font-medium text-blue-700 dark:text-blue-300">So what? </span>
          {insight}
        </p>
      ) : (
        <div className="flex-1 space-y-1.5 py-0.5">
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      )}
    </div>
  );
}
