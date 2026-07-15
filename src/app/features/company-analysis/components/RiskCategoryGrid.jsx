import { motion, useReducedMotion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { RISK_STATE_KEYS, RISK_CATEGORY_KEYS, RISK_STATE_STYLES, isFlaggedState } from '../lib/riskStates';

/**
 * AI분석 — 최신 분기의 6개 리스크 카테고리 상태 카드.
 * narrativeKo가 null이면 quant-only 단계(LLM 서사 대기 중) — 신호 요약만 보여준다.
 * @param {{ currentStates: import('../../../../mocks/companyAnalysis/types').RiskCategoryState[] }} props
 */
export function RiskCategoryGrid({ currentStates }) {
  const { t } = useLocale();
  const shouldReduceMotion = useReducedMotion();
  if (!currentStates?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {currentStates.map((cs, index) => {
        const style = RISK_STATE_STYLES[cs.state] ?? RISK_STATE_STYLES['데이터부족'];
        const flagged = isFlaggedState(cs.state);
        return (
          <motion.div
            key={cs.category}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : index * 0.07, duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t(`company.risk.categories.${RISK_CATEGORY_KEYS[cs.category] ?? cs.category}`)}
              </h4>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                {t(`company.risk.states.${RISK_STATE_KEYS[cs.state] ?? 'insufficient'}`)}
              </span>
            </div>

            {flagged && cs.consecutiveQtrs > 1 && (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {t('company.risk.streak', { count: cs.consecutiveQtrs })}
              </p>
            )}

            {cs.narrativeKo && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {cs.narrativeKo}
              </p>
            )}

            {cs.watchNextKo && (
              <div className="mt-3 rounded-md bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {t('company.risk.watchNext')}
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{cs.watchNextKo}</p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
