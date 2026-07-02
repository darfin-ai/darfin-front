import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

/**
 * Counts up from 0 to `value` on mount/change — used for the score
 * components, where the jump itself (e.g. 16 -> 34) is the thing worth
 * noticing, not just the static end state.
 * @param {{ value: number, duration?: number, className?: string }} props
 */
export function AnimatedNumber({ value, duration = 0.9, className }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [value, duration, motionValue]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
