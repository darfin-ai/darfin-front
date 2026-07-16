const MS_PER_DAY = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toTimestamp(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toKstDayNumber(value) {
  const timestamp = toTimestamp(value);
  if (timestamp == null) return null;
  return Math.floor((timestamp + KST_OFFSET_MS) / MS_PER_DAY);
}

function normalizeHoldDays(value) {
  const days = Number(value);
  return Number.isFinite(days) ? Math.max(0, Math.floor(days)) : null;
}

export function calculateBuyHoldDays(tradedAt, now = Date.now()) {
  const tradeDay = toKstDayNumber(tradedAt);
  const currentDay = toKstDayNumber(now);
  if (tradeDay == null || currentDay == null) return null;
  return Math.max(1, currentDay - tradeDay + 1);
}

export function msUntilNextKstDay(now = Date.now()) {
  const timestamp = toTimestamp(now) ?? Date.now();
  const currentDay = toKstDayNumber(timestamp);
  if (currentDay == null) return MS_PER_DAY;

  const nextKstMidnight = (currentDay + 1) * MS_PER_DAY - KST_OFFSET_MS;
  return Math.max(1000, nextKstMidnight - timestamp + 1000);
}

export function resolveTradeHoldDays(trade, now = Date.now()) {
  const serverHoldDays = normalizeHoldDays(trade?.holdDays);
  const side = trade?.type || trade?.side;
  if (side !== 'BUY') return serverHoldDays;

  const calculatedHoldDays = calculateBuyHoldDays(trade?.ts || trade?.tradedAt, now);
  return calculatedHoldDays ?? serverHoldDays;
}
