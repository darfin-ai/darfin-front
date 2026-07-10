/**
 * Shared Tailwind class recipes — canonical design system for all product surfaces.
 * Source of truth: DESIGN_SYSTEM.md. Use these instead of ad-hoc class strings.
 */

// ── Layout ──────────────────────────────────────────────────────
export const PAGE = "pb-16";
export const CONTAINER = "container";

// ── Surfaces ────────────────────────────────────────────────────
export const CARD =
  "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900";
export const CARD_PADDING = "p-5";
export const CARD_HEADER =
  "border-b border-slate-100 dark:border-slate-800 px-5 py-3";

// ── Typography ──────────────────────────────────────────────────
export const PAGE_TITLE =
  "text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100";
export const PAGE_DESC = "text-base text-slate-500 dark:text-slate-400 leading-relaxed";
export const SECTION_TITLE = "text-lg font-semibold text-slate-900 dark:text-slate-100";
export const SECTION_DESC = "text-sm text-slate-500 dark:text-slate-400 leading-relaxed";
export const LABEL = "text-sm font-medium text-slate-900 dark:text-slate-100";
export const META = "text-xs text-slate-500 dark:text-slate-400";
export const EYEBROW = "text-xs font-medium text-slate-400 dark:text-slate-500 mb-2";

// ── Forms ───────────────────────────────────────────────────────
export const INPUT =
  "w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20";
export const TEXTAREA =
  "w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 resize-y";

// ── Buttons ─────────────────────────────────────────────────────
export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 h-10 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors disabled:opacity-60";
export const BTN_GHOST =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors";
export const BTN_DANGER_GHOST =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors";
export const BTN_BUY =
  "inline-flex items-center justify-center gap-2 h-10 px-5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60";
export const BTN_SELL =
  "inline-flex items-center justify-center gap-2 h-10 px-5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60";
export const BACK_LINK =
  "inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 w-fit font-medium text-sm transition-colors";

// ── Links ───────────────────────────────────────────────────────
export const LINK_ACTION =
  "inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors";
export const LINK_SUBTLE =
  "inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors";

// ── Badges ──────────────────────────────────────────────────────
export const BADGE_INFO =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
export const BADGE_NEUTRAL =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";

// ── AI callout (DESIGN_SYSTEM.md §5.6) ──────────────────────────
export const AI_CALLOUT =
  "flex gap-2 rounded-md border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 px-3.5 py-3";
export const AI_CALLOUT_LEAD = "font-semibold text-blue-700 dark:text-blue-300";
export const AI_CALLOUT_BODY = "text-base leading-relaxed text-slate-800 dark:text-slate-200";

// ── Segmented control ───────────────────────────────────────────
export const SEGMENT_TRACK =
  "inline-flex gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-1.5 text-xs font-medium";
export const SEGMENT_ACTIVE =
  "px-4 py-2 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm whitespace-nowrap transition-colors";
export const SEGMENT_IDLE =
  "px-4 py-2 rounded-md text-slate-500 dark:text-slate-400 whitespace-nowrap hover:text-slate-700 dark:hover:text-slate-300 transition-colors";

// ── Tabs (underline style) ─────────────────────────────────────
export const TAB_ACTIVE =
  "relative px-2 py-4 text-sm font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap";
export const TAB_IDLE =
  "relative px-2 py-4 text-sm font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap hover:text-slate-600 dark:hover:text-slate-300";
export const TAB_INDICATOR =
  "absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full";

// ── List rows ───────────────────────────────────────────────────
export const ROW_HOVER =
  "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer";
export const ROW_DIVIDER = "divide-y divide-slate-100 dark:divide-slate-800";

// ── KRX price colors (red = up, blue = down) ────────────────────
export const PRICE_UP = "text-red-500 dark:text-red-400";
export const PRICE_DOWN = "text-blue-500 dark:text-blue-400";
export const PRICE_FLAT = "text-slate-500 dark:text-slate-400";
export const BG_PRICE_UP = "bg-red-50 dark:bg-red-950/30";
export const BG_PRICE_DOWN = "bg-blue-50 dark:bg-blue-950/30";

/** @param {number} pct */
export function priceToneClass(pct) {
  if (pct > 0) return PRICE_UP;
  if (pct < 0) return PRICE_DOWN;
  return PRICE_FLAT;
}

/** SVG stroke/fill colors for charts (matches Tailwind red-500 / blue-500) */
export const CHART_UP = "#ef4444";
export const CHART_DOWN = "#3b82f6";
export const CHART_FLAT = "#64748b";

/** @param {number} pct */
export function chartColor(pct) {
  if (pct > 0) return CHART_UP;
  if (pct < 0) return CHART_DOWN;
  return CHART_FLAT;
}

// ── Alerts ──────────────────────────────────────────────────────
export const ALERT_INFO =
  "rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-700 dark:text-blue-300";
export const ALERT_ERROR =
  "rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300";
export const ALERT_WARNING =
  "rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-700 dark:text-amber-300";

// ── Sub-navigation (trading feature bar below Layout header) ────
export const SUBNAV =
  "border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900";
export const SUBNAV_INNER = "container flex items-center gap-0";

// ── Avatar gradient palette (sync with company-analysis) ────────
export const AVATAR_PALETTE = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-violet-600",
  "from-teal-500 to-teal-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-indigo-500 to-indigo-600",
  "from-emerald-500 to-emerald-600",
  "from-cyan-500 to-cyan-600",
];

/** @param {string} code */
export function avatarGradient(code) {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
