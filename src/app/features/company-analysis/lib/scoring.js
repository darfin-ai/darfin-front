export { SCORE_COMPONENT_LABELS } from '../../../../mocks/companyAnalysis/types';

export const HOP_TYPE_LABELS = {
  financial_anomaly: '재무제표',
  note: '주석',
  mdna: 'MD&A',
};

export const SEVERITY_LABELS = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

/**
 * Deliberately conservative: red is reserved for genuinely high-severity
 * findings (real risk signals), never used decoratively elsewhere in this
 * feature. Medium uses amber, low uses neutral slate — no color implies
 * "this is fine" for something that scored a finding at all.
 */
export const SEVERITY_STYLES = {
  high: { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', leftBorder: 'border-l-red-400' },
  medium: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', leftBorder: 'border-l-amber-400' },
  low: { badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', leftBorder: 'border-l-slate-300' },
};

/** Same conservative palette, keyed by the grid card's coarser change-level signal. */
export const CHANGE_LEVEL_STYLES = {
  high: { dot: 'bg-red-500', text: 'text-red-700' },
  medium: { dot: 'bg-amber-500', text: 'text-amber-700' },
  low: { dot: 'bg-blue-400', text: 'text-slate-600' },
  flat: { dot: 'bg-slate-300', text: 'text-slate-500' },
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
