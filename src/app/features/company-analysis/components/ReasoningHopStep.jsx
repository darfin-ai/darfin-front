import { Calculator, FileText, MessageSquareQuote } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import { hopTypeLabel } from '../lib/i18n';
import { SourceExcerptDialog } from './SourceExcerptDialog';

const HOP_ICONS = {
  financial_anomaly: Calculator,
  note: FileText,
  mdna: MessageSquareQuote,
};

/**
 * @param {{
 *   hop: import('../../../../mocks/companyAnalysis/types').ReasoningHop,
 *   isLast: boolean,
 *   isSelected: boolean,
 *   onSelect: () => void,
 * }} props
 */
export function ReasoningHopStep({ hop, isLast, isSelected, onSelect }) {
  const { t } = useLocale();
  const Icon = HOP_ICONS[hop.type];

  return (
    <li className="relative pl-7">
      {!isLast && (
        <span className="absolute left-[9px] top-6 h-[calc(100%-8px)] w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
      )}
      <span
        className={`absolute left-0 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border transition-colors duration-200 ${
          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500'
        }`}
        aria-hidden="true"
      >
        <Icon size={11} />
      </span>

      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-pressed={isSelected}
        className={`w-full cursor-pointer rounded-md p-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isSelected ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {hopTypeLabel(t, hop.type)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{hop.sectionLabel}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{hop.excerpt}</p>
        <div className="mt-1">
          <SourceExcerptDialog sectionLabel={hop.sectionLabel} excerpt={hop.excerpt} sourceRef={hop.sourceRef} />
        </div>
      </div>
    </li>
  );
}
