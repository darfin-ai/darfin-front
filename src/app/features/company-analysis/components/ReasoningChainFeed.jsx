import { useMemo } from 'react';
import { useLocale } from '../../../shared/i18n';
import { ReasoningChainItem } from './ReasoningChainItem';

const SEVERITY_RANK = { high: 0, medium: 1, low: 2 };

/**
 * @param {{
 *   findings: import('../../../../mocks/companyAnalysis/types').ReasoningChainFinding[],
 *   selectedHopSourceRef: string | null,
 *   onSelectHop: (finding: object, hop: object) => void,
 * }} props
 */
export function ReasoningChainFeed({ findings, selectedHopSourceRef, onSelectHop }) {
  const { t } = useLocale();
  const ranked = useMemo(
    () => [...findings].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]),
    [findings],
  );

  return (
    <section aria-labelledby="reasoning-chain-heading">
      <div className="mb-4">
        <h2 id="reasoning-chain-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {t('company.panels.reasoning')}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('company.panels.reasoningDesc')}
        </p>
      </div>
      {ranked.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-400 dark:text-slate-500">
          {t('company.panels.noFindings')}
        </p>
      ) : (
        <div className="space-y-3">
          {ranked.map((finding, index) => (
            <ReasoningChainItem
              key={finding.id}
              finding={finding}
              selectedHopSourceRef={selectedHopSourceRef}
              onSelectHop={onSelectHop}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
