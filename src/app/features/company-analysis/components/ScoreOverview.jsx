import { motion } from 'motion/react';
import { ScoreSparklineCard } from './ScoreSparklineCard';
import { AnimatedNumber } from './AnimatedNumber';
import { totalScore, totalMaxScore } from '../lib/scoring';

/**
 * @param {{ scores: import('../../../../mocks/companyAnalysis/types').ScoreComponent[] }} props
 */
export function ScoreOverview({ scores }) {
  return (
    <section aria-labelledby="score-overview-heading">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-3"
      >
        <h2 id="score-overview-heading" className="text-xl font-semibold text-slate-900">
          분기별 변화 강도 추이
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          항목별로 감지된 <span className="font-medium text-slate-700">변화의 크기</span>를 분기별로 추적합니다.
          점수가 높다는 것은 좋다는 의미가 아니라, <span className="font-medium text-slate-700">그만큼 큰 변화가 있었다</span>는 의미입니다.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {scores.map((component, index) => (
          <ScoreSparklineCard key={component.key} component={component} index={index} />
        ))}
      </div>
    </section>
  );
}
