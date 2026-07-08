/** Company monitoring slot limits by subscription tier (frontend until API exposes this). */
const MONITOR_LIMIT_BY_PLAN = {
  FREE: 3,
  BASIC: 3,
  PRO: 10,
  ENTERPRISE: 50,
};

const DEFAULT_LIMIT = 3;

export function getMonitorLimit(subscriptionLevel) {
  if (!subscriptionLevel) return DEFAULT_LIMIT;
  return MONITOR_LIMIT_BY_PLAN[subscriptionLevel.toUpperCase()] ?? DEFAULT_LIMIT;
}

export function getPlanLabelKey(subscriptionLevel) {
  const level = (subscriptionLevel || 'BASIC').toUpperCase();
  if (level === 'FREE') return 'company.monitoring.planBasic';
  return `company.monitoring.plan${level.charAt(0)}${level.slice(1).toLowerCase()}`;
}
