import { motion } from 'motion/react';
import { SCORE_COMPONENT_LABELS, SCORE_COMPONENT_COLORS, latestValue, previousValue } from '../lib/scoring';

/** Maps a (delta / maxPoints) ratio to a readable Korean label */
function deltaLabel(delta, maxPoints) {
  if (delta === 0) return { text: '변화 없음', bg: 'bg-slate-100', textColor: 'text-slate-500' };
  const ratio = Math.abs(delta) / maxPoints;
  if (ratio >= 0.70) return { text: delta > 0 ? '급증' : '급감', bg: delta > 0 ? 'bg-red-50' : 'bg-blue-50', textColor: delta > 0 ? 'text-red-600' : 'text-blue-600' };
  if (ratio >= 0.35) return { text: delta > 0 ? '증가' : '감소', bg: delta > 0 ? 'bg-orange-50' : 'bg-blue-50', textColor: delta > 0 ? 'text-orange-600' : 'text-blue-600' };
  return { text: delta > 0 ? '소폭 증가' : '소폭 감소', bg: 'bg-slate-50', textColor: 'text-slate-500' };
}

function SignalRow({ component, index }) {
  const latest = latestValue(component);
  const prev = previousValue(component);
  const delta = latest - prev;
  const absDelta = Math.abs(delta);
  const fillPct = Math.min((absDelta / component.maxPoints) * 100, 100);
  const color = SCORE_COMPONENT_COLORS[component.key];
  const label = SCORE_COMPONENT_LABELS[component.key];
  const isFlat = delta === 0;
  const { text, bg, textColor } = deltaLabel(delta, component.maxPoints);

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      className="flex items-center gap-4"
    >
      <span className="w-28 shrink-0 text-sm font-medium text-slate-600">{label}</span>

      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ backgroundColor: isFlat ? '#cbd5e1' : color }}
          initial={{ width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.7, delay: index * 0.06 + 0.15, ease: 'easeOut' }}
        />
      </div>

      <span className={`w-20 shrink-0 rounded-full px-2 py-0.5 text-right text-xs font-medium ${bg} ${textColor}`}>
        {text}
      </span>
    </motion.div>
  );
}

/**
 * @param {{ scores: import('../../../../mocks/companyAnalysis/types').ScoreComponent[], quarter: string }} props
 */
export function ChangeSignalPanel({ scores, quarter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white p-6"
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">이번 분기 변화 감지 현황</h2>
        <p className="mt-1 text-sm text-slate-500">
          {quarter} · 전분기 대비 각 항목에서 얼마나 큰 변화가 감지됐는지를 나타냅니다.
          <span className="font-medium text-slate-700"> 변화가 크다는 것은 주목할 사항이 있다는 의미이지, 좋다·나쁘다를 뜻하지 않습니다.</span>
        </p>
      </div>

      <div className="space-y-5">
        {scores.map((component, i) => (
          <SignalRow key={component.key} component={component} index={i} />
        ))}
      </div>

      <p className="mt-5 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400">
        AI 모델이 공시에서 감지한 변화 강도이며, 투자 판단의 근거로 사용하면 안 됩니다. 구체적인 내용은 아래 AI 분석 근거에서 확인하세요.
      </p>
    </motion.div>
  );
}
