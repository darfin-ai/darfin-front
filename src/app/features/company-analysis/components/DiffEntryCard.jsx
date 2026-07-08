import { useLocale } from '../../../shared/i18n';
import { SourceExcerptDialog } from './SourceExcerptDialog';
import { NumericDeltaTable } from './NumericDeltaTable';

const CHANGE_TYPE_BADGE = {
  added: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  modified: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  removed: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
};

/**
 * @param {{ entry: import('../../../../mocks/companyAnalysis/types').SectionDiffEntry, currentLabel: string, baselineLabel: string }} props
 */
export function DiffEntryCard({ entry, currentLabel, baselineLabel }) {
  const { t } = useLocale();
  const badgeClass = entry.changeType ? CHANGE_TYPE_BADGE[entry.changeType] : null;
  const fullExcerpt = [
    entry.before && `${t('company.labels.before')}\n${entry.before}`,
    entry.after && `${t('company.labels.after')}\n${entry.after}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return (
    <div className="rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 p-3">
      {entry.changeType && badgeClass && (
        <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
          {t(`company.labels.diffChange.${entry.changeType}`)}
        </span>
      )}

      {(entry.before || entry.after) && (
        <div className="space-y-1.5">
          {entry.before && (
            <p className="rounded bg-red-50 dark:bg-red-950/30 px-2 py-1 text-sm leading-relaxed text-red-700 dark:text-red-400 line-through decoration-red-300 dark:decoration-red-800">
              {entry.before}
            </p>
          )}
          {entry.after && (
            <p className="rounded bg-green-50 dark:bg-green-950/30 px-2 py-1 text-sm leading-relaxed text-green-800 dark:text-green-400">{entry.after}</p>
          )}
        </div>
      )}

      {entry.metrics?.length > 0 && (
        <div className={entry.before || entry.after ? 'mt-2' : ''}>
          <NumericDeltaTable metrics={entry.metrics} currentLabel={currentLabel} baselineLabel={baselineLabel} />
        </div>
      )}

      <div className="mt-2">
        <SourceExcerptDialog
          sectionLabel={entry.sourceLabel ?? entry.sectionLabel}
          excerpt={fullExcerpt || entry.sourceLabel || entry.sectionLabel}
          sourceRef={entry.sourceRef}
        />
      </div>
    </div>
  );
}
