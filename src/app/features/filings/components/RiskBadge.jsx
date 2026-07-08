import { useLocale } from "@/app/shared/i18n";

export const RISK_TIER_STYLE = {
  1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  2: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  3: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  4: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500 dark:bg-orange-400",
  },
  5: {
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500 dark:bg-red-400",
  },
};

export function RiskBadge({ axisLabel, riskLabel, riskTier, size = "sm", compact = false }) {
  const { t } = useLocale();
  const style = RISK_TIER_STYLE[riskTier] ?? RISK_TIER_STYLE[3];
  const sizeClass =
    size === "lg"
      ? "text-sm px-3.5 py-1.5"
      : size === "md"
        ? "text-xs px-3 py-1.5"
        : "text-[11px] px-2 py-1";
  const dotClass = size === "lg" ? "w-2.5 h-2.5" : size === "md" ? "w-2 h-2" : "w-1.5 h-1.5";
  const resolvedAxisLabel = axisLabel ?? t("disclosure.risk.axisLabel");
  const tier = riskTier ?? 3;
  const description = t(`disclosure.riskTier.${tier}`);

  return (
    <span
      title={`${resolvedAxisLabel} · ${riskLabel}: ${description}`}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap cursor-help ${style.bg} ${style.border} ${style.text} ${sizeClass}`}
    >
      <span className={`${dotClass} rounded-full ${style.dot} shrink-0`} />
      {!compact && (
        <>
          {resolvedAxisLabel}
          <span className="opacity-60">·</span>
        </>
      )}
      {riskLabel}
    </span>
  );
}

export function RiskBadgeGroup({ badges, size = "sm" }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {badges.map((badge, index) => (
        <RiskBadge
          key={`${badge.axisLabel}-${badge.riskLabel}-${index}`}
          axisLabel={badge.axisLabel}
          riskLabel={badge.riskLabel}
          riskTier={badge.riskTier}
          size={size}
        />
      ))}
    </div>
  );
}
