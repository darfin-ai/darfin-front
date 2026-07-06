/**
 * Whether the LLM stage (insights/risks/findings) has finished for this
 * filing's overview. `aiInsightsReady` is only present on rows written by the
 * new two-phase pipeline (deterministic panels first, insights patched in
 * later) — older rows written atomically have no such field at all, and are
 * already fully complete, so `undefined` counts as ready.
 * @param {import('../../../../mocks/companyAnalysis/types').CompanyOverview | null | undefined} overview
 */
export function isAiReady(overview) {
  return overview?.aiInsightsReady !== false;
}
