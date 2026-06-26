export const RISK_TIER_STYLE = {
  1: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  2: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  3: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  4: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  5: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" }
};

export const RISK_TIER_DESCRIPTION = {
  1: "안정적인 상태입니다. 눈에 띄는 주의 사항은 없습니다.",
  2: "중립적인 상태입니다. 참고할 정보가 있습니다.",
  3: "주의가 필요한 상태입니다. 내용을 확인해 보세요.",
  4: "경계가 필요한 상태입니다. 자세한 검토를 권장합니다.",
  5: "가장 위험한 상태입니다. 즉시 확인이 필요합니다."
};

export function RiskBadge({ axisLabel = "위험도", riskLabel, riskTier, size = "sm", compact = false }) {
  const style = RISK_TIER_STYLE[riskTier] ?? RISK_TIER_STYLE[3];
  const sizeClass = size === "md" ? "text-xs px-3 py-1.5" : "text-[11px] px-2 py-1";
  const description = RISK_TIER_DESCRIPTION[riskTier] ?? RISK_TIER_DESCRIPTION[3];

  return (
    <span
      title={`${axisLabel} · ${riskLabel}: ${description}`}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap cursor-help ${style.bg} ${style.border} ${style.text} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
      {!compact && (
        <>
          {axisLabel}
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
