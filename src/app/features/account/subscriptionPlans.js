export const PLAN_ORDER = ["BASIC", "PRO", "ENTERPRISE"];

export const PLAN_LABELS = {
  BASIC: "Darfin Basic",
  PRO: "Darfin Pro",
  ENTERPRISE: "Darfin Enterprise",
};

/** Mirrors darfin-main PlanType enum — used when plans API is not public. */
export const STATIC_PLANS = [
  { planName: "BASIC", price: 0, tokenQuota: 10000, resetTimes: ["06:00"] },
  { planName: "PRO", price: 15000, tokenQuota: 30000, resetTimes: ["06:00", "18:00"] },
  { planName: "ENTERPRISE", price: 49000, tokenQuota: 50000, resetTimes: ["06:00", "18:00"] },
];
