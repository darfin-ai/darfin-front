import { motion } from 'motion/react';

/** DividendPanel에서 쓰던 스탯 카드를 dart 패널 공용으로 추출한 것 */
export function MetricCard({ label, value, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3"
    >
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </motion.div>
  );
}
