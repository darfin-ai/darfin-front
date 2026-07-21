import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useLocale } from '../../../shared/i18n';
import { RISK_CATEGORY_KEYS } from '../lib/riskStates';

const EVENT_STYLES = {
  item_appeared: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  item_disappeared: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  correction_material: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  restatement_gap: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
};

/**
 * AI분석 — 도시에(dossier) 이벤트 타임라인. 단일 공시 분석이 못 잡는 시계열
 * 신호(주석 항목 소멸, 정정으로 인한 수치 변경 등)를 최신순으로 나열한다.
 * @param {{ events: import('../../../../mocks/companyAnalysis/types').DossierEvent[], companyName?: string }} props
 */
export function DossierTimeline({ events, companyName }) {
  const { t } = useLocale();
  const shouldReduceMotion = useReducedMotion();
  if (!events?.length) return null;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.24, duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
    >
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {t('company.risk.timelineTitle')}
      </h4>
      <ul className="mt-3 space-y-3">
        {events.map((ev, i) => (
          <motion.li
            key={`${ev.rceptNo}-${ev.eventType}-${ev.itemKey ?? i}`}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.32 + i * 0.06, duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            className="flex items-start gap-3"
          >
            <span
              className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                EVENT_STYLES[ev.eventType] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t(`company.risk.events.${ev.eventType}`)}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {RISK_CATEGORY_KEYS[ev.category]
                  ? t(`company.risk.categories.${RISK_CATEGORY_KEYS[ev.category]}`)
                  : ev.category}
                {ev.itemKey ? ` · ${ev.itemKey}` : ''}
              </p>
              {ev.detail?.summary && (
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{ev.detail.summary}</p>
              )}
              <Link
                to={
                  companyName
                    ? `/disclosure/${ev.rceptNo}?company=${encodeURIComponent(companyName)}`
                    : `/disclosure/${ev.rceptNo}`
                }
                className="mt-0.5 inline-block text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('company.risk.viewFiling')}
              </Link>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
