/**
 * Deliberately conservative: red is reserved for genuinely high-severity
 * findings (real risk signals), never used decoratively elsewhere in this
 * feature. Medium uses amber, low uses neutral slate — no color implies
 * "this is fine" for something that scored a finding at all.
 */
export const SEVERITY_STYLES = {
  high: { badge: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900', dot: 'bg-red-500', leftBorder: 'border-l-red-400' },
  medium: { badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', leftBorder: 'border-l-amber-400' },
  low: { badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400', leftBorder: 'border-l-slate-300 dark:border-l-slate-600' },
};

/** Same conservative palette, keyed by the grid card's coarser change-level signal. */
export const CHANGE_LEVEL_STYLES = {
  high: { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
  medium: { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  low: { dot: 'bg-blue-400', text: 'text-slate-600 dark:text-slate-400' },
  flat: { dot: 'bg-slate-300 dark:bg-slate-600', text: 'text-slate-500 dark:text-slate-400' },
};

/** @param {import('../../../../mocks/companyAnalysis/types').ScoreComponent} component */
export function latestValue(component) {
  const h = component.history;
  return h[h.length - 1]?.value ?? 0;
}

/** @param {import('../../../../mocks/companyAnalysis/types').ScoreComponent} component */
export function previousValue(component) {
  const h = component.history;
  return h[h.length - 2]?.value ?? h[h.length - 1]?.value ?? 0;
}

/**
 * Normalizes each component's latest-quarter delta against its own max
 * points (financialChange swings on a 0-40 scale, governance on 0-10 — a
 * raw delta comparison would always favor financialChange). Returns the
 * single component that moved the most, for the compact grid-card indicator.
 */
export function dominantScoreChange(scores) {
  let best = null;
  for (const component of scores) {
    const delta = latestValue(component) - previousValue(component);
    const normalized = delta / component.maxPoints;
    if (!best || Math.abs(normalized) > Math.abs(best.normalized)) {
      best = { key: component.key, delta, normalized };
    }
  }
  return best ?? { key: null, delta: 0, normalized: 0 };
}

/**
 * Maps a normalized score swing to a severity-shaped level for the grid
 * card's compact indicator dot. Thresholds are deliberately coarse — this
 * is a "does this deserve a click" signal, not the real score.
 */
export function changeLevel(normalizedDelta) {
  const abs = Math.abs(normalizedDelta);
  if (abs >= 0.35) return 'high';
  if (abs >= 0.15) return 'medium';
  if (abs > 0.02) return 'low';
  return 'flat';
}

/** Sort key for the companies grid: largest absolute normalized score swing first. */
export function mostRecentChangeMagnitude(scores) {
  return Math.abs(dominantScoreChange(scores).normalized);
}
