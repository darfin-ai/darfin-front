import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { totalScore, totalMaxScore } from '../lib/scoring';
import { AnimatedNumber } from './AnimatedNumber';

function getVerdict(score, max) {
  const ratio = score / max;
  if (ratio >= 0.7) return { label: '위험', color: 'red', Icon: TrendingDown, desc: '이번 분기 여러 지표에서 유의미한 이상 신호가 감지됐습니다.' };
  if (ratio >= 0.4) return { label: '주의', color: 'amber', Icon: AlertTriangle, desc: '일부 항목에서 변화가 포착됐습니다. 세부 내용을 확인하세요.' };
  return { label: '안정', color: 'emerald', Icon: TrendingUp, desc: '전반적으로 이전 분기와 유사한 수준을 유지하고 있습니다.' };
}

const COLOR = {
  red:     { bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-100 text-red-700',     icon: 'text-red-500',     bar: 'bg-red-500' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-500',   bar: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-500', bar: 'bg-emerald-500' },
};

/**
 * @param {{ scores: import('../../../../mocks/companyAnalysis/types').ScoreComponent[], quarter: string }} props
 */
export function QuarterlyVerdictBanner({ scores, quarter }) {
  const total = totalScore(scores);
  const max = totalMaxScore(scores);
  const verdict = getVerdict(total, max);
  const c = COLOR[verdict.color];
  const pct = Math.round((total / max) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
      className={`rounded-lg border ${c.border} ${c.bg} p-5`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <verdict.Icon size={20} className={c.icon} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{quarter} 종합 이상 신호</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.badge}`}>{verdict.label}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{verdict.desc}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold text-slate-900">
            <AnimatedNumber value={total} />
          </span>
          <span className="text-sm text-slate-400"> / {max}점</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className={`h-full rounded-full ${c.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-1 text-right text-[11px] text-slate-400">변동 강도 {pct}%</p>
      </div>
    </motion.div>
  );
}
