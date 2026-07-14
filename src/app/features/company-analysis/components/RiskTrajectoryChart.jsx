import { useLocale } from '../../../shared/i18n';
import { RISK_STATE_KEYS, RISK_CATEGORY_KEYS, RISK_STATE_STYLES } from '../lib/riskStates';

/**
 * AI분석 — 카테고리 × 분기 상태 히트 스트립. 상태가 범주형이라 선 그래프 대신
 * 셀 색으로 궤적을 보여준다 ("악화 3분기 연속"이 한눈에 보이는 형태).
 * @param {{
 *   quarters: string[],
 *   trajectories: import('../../../../mocks/companyAnalysis/types').RiskCategoryTrajectory[],
 * }} props
 */
export function RiskTrajectoryChart({ quarters, trajectories }) {
  const { t } = useLocale();
  if (!quarters?.length || !trajectories?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {t('company.risk.trajectoryTitle')}
      </h4>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-28 min-w-28" aria-hidden="true" />
              {quarters.map((q) => (
                <th
                  key={q}
                  className="pb-1 text-center text-[10px] font-normal text-slate-400 dark:text-slate-500"
                >
                  {/* 2024Q1 → 24Q1 (좁은 셀 라벨) */}
                  {q.slice(2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trajectories.map((traj) => {
              const byQuarter = Object.fromEntries(traj.points.map((p) => [p.quarter, p]));
              return (
                <tr key={traj.category}>
                  <td className="pr-2 text-right text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {t(`company.risk.categories.${RISK_CATEGORY_KEYS[traj.category] ?? traj.category}`)}
                  </td>
                  {quarters.map((q) => {
                    const point = byQuarter[q];
                    const style = point
                      ? (RISK_STATE_STYLES[point.state] ?? RISK_STATE_STYLES['데이터부족'])
                      : null;
                    const label = point
                      ? `${q} · ${t(`company.risk.states.${RISK_STATE_KEYS[point.state] ?? 'insufficient'}`)}`
                      : q;
                    return (
                      <td key={q} className="p-0">
                        <div
                          title={label}
                          className={`h-5 min-w-5 rounded-sm ${style ? style.cell : 'bg-transparent'}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {Object.entries(RISK_STATE_KEYS).map(([state, key]) => (
          <span key={state} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <span className={`h-2.5 w-2.5 rounded-sm ${RISK_STATE_STYLES[state].cell}`} />
            {t(`company.risk.states.${key}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
