export function getPlanDescription(t, planName) {
  return t(`pricingPage.plans.${planName}.description`);
}

export function getPlanFeatures(t, planName) {
  const features = t(`pricingPage.plans.${planName}.features`);
  return Array.isArray(features) ? features : [];
}

export function formatPlanPrice(price, t, locale) {
  if (price === 0) return t("pricingPage.free");
  const formatted = price.toLocaleString(locale === "ko" ? "ko-KR" : "en-US");
  return locale === "ko" ? `${formatted}원` : `₩${formatted}`;
}

export function formatPlanTokenLine(plan, locale) {
  const quota = plan.tokenQuota.toLocaleString(locale === "ko" ? "ko-KR" : "en-US");
  const resets = plan.resetTimes.join(", ");
  return locale === "ko"
    ? `토큰 ${quota}개 · ${resets} 초기화`
    : `${quota} tokens · resets at ${resets}`;
}
