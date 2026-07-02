import { useMemo } from 'react';
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
  const ranked = useMemo(
    () => [...findings].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]),
    [findings]
  );

  return (
    <section aria-labelledby="reasoning-chain-heading">
      <div className="mb-4">
        <h2 id="reasoning-chain-heading" className="text-xl font-semibold text-slate-900">
          AI 분석 근거
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          AI가 공시에서 발견한 주요 변화와 판단 근거입니다.
          각 항목의 <span className="font-medium text-slate-700">원문 보기</span>를 클릭하면 실제 공시 발췌문을 확인할 수 있습니다.
        </p>
      </div>
      {ranked.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          이번 분기 감지된 항목이 없어요.
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
