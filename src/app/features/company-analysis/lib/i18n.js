/** @param {(path: string, vars?: Record<string, string | number>) => string} t */
export function scoreComponentLabel(t, key) {
  return t(`company.labels.scoreComponents.${key}`);
}

/** @param {(path: string, vars?: Record<string, string | number>) => string} t */
export function hopTypeLabel(t, type) {
  return t(`company.labels.hopType.${type}`);
}

/** @param {(path: string, vars?: Record<string, string | number>) => string} t */
export function severityLabel(t, severity) {
  return t(`company.labels.severity.${severity}`);
}

/** @param {(path: string, vars?: Record<string, string | number>) => string} t */
export function diffAnalysisLabel(t, type) {
  return t(`company.labels.diffAnalysis.${type}`);
}
