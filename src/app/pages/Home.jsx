import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { motion, useReducedMotion, useInView } from "motion/react";
import { ChevronRight, ArrowRight, Lightbulb, TrendingUp, Landmark, AlertTriangle, ShieldCheck, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "../features/auth";
import { useLocale } from "../shared/i18n";
import { topKospiCompanies } from "../../mocks/companyAnalysis/topKospi";
import { topKosdaqCompanies } from "../../mocks/companyAnalysis/topKosdaq";

const SECTION = "py-14 sm:py-16 px-4 sm:px-6 lg:px-8";

/* Aligned with /company: blue-600 primary, restrained type weights */
const CTA_PRIMARY = "bg-blue-600 hover:bg-blue-700";
const CTA_SECTION = "bg-slate-900";

const EYEBROW = "text-xs font-medium text-slate-400 dark:text-slate-500 mb-2";
const SECTION_TITLE = "text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100";
const SECTION_DESC = "text-sm text-slate-500 dark:text-slate-400 leading-relaxed";

const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 h-10 px-5 ${CTA_PRIMARY} text-white text-sm font-medium rounded-md transition-colors`;
const BTN_SECONDARY = "inline-flex items-center justify-center gap-2 h-10 px-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors";
const LINK_ACTION = "inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors";
const LINK_SUBTLE = "inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors";
const CARD = "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900";

/* Matches CompanyQuickLinks.jsx exactly, so avatar badges look identical to the real /company page. */
const AVATAR_PALETTE = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-violet-600",
  "from-teal-500 to-teal-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-indigo-500 to-indigo-600",
  "from-emerald-500 to-emerald-600",
  "from-cyan-500 to-cyan-600",
];
function avatarLabel(company) {
  const source = company.shortName ?? company.name;
  return source.length <= 2 ? source : source.slice(0, 2);
}


/* Mirrors the real score_component categories from the findings table. */
function lensStyles(t) {
  return {
    financialChange: { icon: <TrendingUp size={16} />, border: "border-l-red-400", dot: "bg-red-400", text: "text-red-600 dark:text-red-400", label: t("landing.lenses.impactHigh") },
    managementEmphasis: { icon: <Landmark size={16} />, border: "border-l-amber-400", dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400", label: t("landing.lenses.impactMedium") },
    riskEscalation: { icon: <AlertTriangle size={16} />, border: "border-l-amber-400", dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400", label: t("landing.lenses.impactMedium") },
    governance: { icon: <ShieldCheck size={16} />, border: "border-l-slate-300 dark:border-l-slate-600", dot: "bg-slate-300 dark:bg-slate-600", text: "text-slate-500 dark:text-slate-400", label: t("landing.lenses.impactMedium") },
  };
}

function HeroCta() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { t } = useLocale();

  if (isLoggedIn) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => navigate("/company")}
          className={BTN_PRIMARY}
        >
          {t("landing.hero.ctaCompany")} <ArrowRight size={16} />
        </button>
        <Link
          to="/trading"
          className={BTN_SECONDARY}
        >
          {t("landing.hero.ctaTrading")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/signup"
          className={BTN_PRIMARY}
        >
          {t("landing.hero.ctaSignup")} <ArrowRight size={16} />
        </Link>
        <Link
          to="/login"
          className={BTN_SECONDARY}
        >
          {t("landing.hero.ctaLogin")}
        </Link>
      </div>
      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        {t("landing.hero.signupNote")}
      </p>
    </div>
  );
}

const HERO_DEMO_BODY_HEIGHT = "h-[352px]";
const HERO_DEMO_FINAL_STEP = 8;
const HERO_SUMMARY_STREAM_MS = 16;
const HERO_HOP_STAGGER_MS = 320;

const CREDIBILITY_STAT_KEYS = [
  { type: "count", to: 3200, suffix: "+", duration: 1.4 },
  { type: "count", to: 2840000, suffix: "+", duration: 2.2 },
  { type: "value" },
];

function formatCount(n) {
  return Math.round(n).toLocaleString("ko-KR");
}

function CountUpValue({ to, suffix = "+", duration = 1.4 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? to : 0);

  useEffect(() => {
    if (reduceMotion) {
      setValue(to);
      return;
    }
    if (!isInView) return;

    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(to * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, isInView, reduceMotion, to]);

  return (
    <span ref={ref}>
      {formatCount(value)}
      {suffix}
    </span>
  );
}

function CredibilityStatValue({ stat }) {
  if (stat.type === "count") {
    return <CountUpValue to={stat.to} suffix={stat.suffix} duration={stat.duration} />;
  }
  return stat.value;
}

function HeroDemo() {
  const { t } = useLocale();
  const { resolvedTheme } = useTheme();
  const demo = t("landing.demo.snapshot");
  const summaryText = demo.summaryPreview;
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState("after");
  const [step, setStep] = useState(HERO_DEMO_FINAL_STEP);
  const [hopIndex, setHopIndex] = useState(demo.hops.length - 1);
  const [highlightVisible, setHighlightVisible] = useState(true);
  const [streamedLength, setStreamedLength] = useState(summaryText.length);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const timersRef = useRef([]);

  const highlight = demo.highlight ?? "";
  const textParts = demo.sourceText.split(highlight || "###");
  const isDark = resolvedTheme === "dark";

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    timersRef.current = [];
  }, []);

  const showEndState = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    setStep(HERO_DEMO_FINAL_STEP);
    setHopIndex(demo.hops.length - 1);
    setHighlightVisible(true);
    setStreamedLength(summaryText.length);
    setTab("after");
  }, [clearTimers, demo.hops.length, summaryText.length]);

  const playSequence = useCallback(() => {
    if (reduceMotion) {
      showEndState();
      return;
    }

    clearTimers();
    setIsPlaying(true);
    setStep(0);
    setHopIndex(-1);
    setHighlightVisible(false);
    setStreamedLength(0);
    setTab("after");

    const schedule = (delay, fn) => {
      timersRef.current.push(setTimeout(fn, delay));
    };

    schedule(350, () => setHighlightVisible(true));
    schedule(950, () => {
      setStep(6);
      let len = 0;
      const intervalId = setInterval(() => {
        len += 1;
        setStreamedLength(len);
        if (len >= summaryText.length) {
          clearInterval(intervalId);
          const hopsStart = 280;
          schedule(hopsStart, () => setStep(7));
          demo.hops.forEach((_, i) => {
            schedule(hopsStart + i * HERO_HOP_STAGGER_MS, () => setHopIndex(i));
          });
          schedule(
            hopsStart + demo.hops.length * HERO_HOP_STAGGER_MS + 100,
            () => setIsPlaying(false),
          );
        }
      }, HERO_SUMMARY_STREAM_MS);
      timersRef.current.push(intervalId);
    });
  }, [clearTimers, demo.hops, reduceMotion, showEndState, summaryText.length]);

  useEffect(() => {
    showEndState();
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    return clearTimers;
  }, [clearTimers, showEndState]);

  const showSummary = step >= 6;
  const showHops = step >= 7;
  const summaryStreaming = isPlaying && streamedLength < summaryText.length;

  return (
    <div
      className={`${CARD} overflow-hidden shadow-sm lg:transition-shadow lg:hover:shadow-md dark:shadow-none`}
      onMouseEnter={() => { if (!reduceMotion) playSequence(); }}
      onMouseLeave={() => { if (!reduceMotion) showEndState(); }}
      onClick={() => {
        if (!isTouchDevice || reduceMotion) return;
        if (isPlaying) showEndState();
        else playSequence();
      }}
    >
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{demo.companyName}</span>
          <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">{demo.ticker}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium border transition-colors duration-300 ${
          isPlaying
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        }`}>
          {isPlaying ? t("landing.demo.analyzing") : t("landing.demo.example")}
        </span>
      </div>

      <div className="p-1 mx-5 mt-4 flex lg:hidden bg-slate-100/80 dark:bg-slate-800/80 rounded-lg">
        <button
          onClick={() => setTab("before")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === "before" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}
        >
          {t("landing.demo.tabBefore")}
        </button>
        <button
          onClick={() => setTab("after")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === "after" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}
        >
          {t("landing.demo.tabAfter")}
        </button>
      </div>

      {!isPlaying && (
        <p className="lg:hidden mx-5 mb-3 text-xs text-center text-slate-400 dark:text-slate-500">{t("landing.demo.tapReplay")}</p>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-slate-100 dark:lg:divide-slate-800 ${HERO_DEMO_BODY_HEIGHT}`}>
        <div className={`${tab === "before" ? "flex" : "hidden"} lg:flex flex-col h-full min-h-0 px-5 py-4 overflow-hidden`}>
          <div className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
            {demo.sectionLabel}
          </div>
          <div className="flex-1 min-h-0">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {textParts[0]}
              {highlight && textParts.length > 1 && (
                <motion.span
                  className="inline rounded-[3px] px-0.5 -mx-px box-decoration-clone"
                  initial={false}
                  animate={{
                    backgroundColor: highlightVisible
                      ? isDark
                        ? "rgba(59, 130, 246, 0.14)"
                        : "rgba(191, 219, 254, 0.75)"
                      : "transparent",
                    boxShadow: highlightVisible && isDark
                      ? "inset 0 0 0 1px rgba(96, 165, 250, 0.22)"
                      : "inset 0 0 0 0px transparent",
                  }}
                  transition={
                    isPlaying
                      ? { duration: 0.35, ease: "easeOut" }
                      : { duration: 0 }
                  }
                >
                  {highlight.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={false}
                      animate={{
                        color: highlightVisible
                          ? isDark
                            ? "rgb(191 219 254)"
                            : "rgb(15 23 42)"
                          : isDark
                            ? "rgb(148 163 184)"
                            : "rgb(71 85 105)",
                      }}
                      transition={
                        isPlaying && highlightVisible
                          ? { duration: 0.04, delay: i * 0.03 }
                          : { duration: 0 }
                      }
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              )}
              {textParts[1] ?? ""}
            </p>
          </div>
        </div>

        <div className={`${tab === "after" ? "block" : "hidden"} lg:block h-full min-h-0 px-5 py-3`}>
          <motion.div
            initial={false}
            animate={{ opacity: showSummary ? 1 : 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="h-full min-h-0 flex flex-col"
            aria-hidden={!showSummary}
          >
            <div className="flex gap-2 rounded-md border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2 mb-2 shrink-0">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" />
              <div className="text-[11px] leading-snug text-slate-700 dark:text-slate-300 min-h-[3.5rem]">
                <div className="font-medium text-blue-700 dark:text-blue-300">{t("landing.demo.aiSummary")}</div>
                <div className="mt-0.5">
                  {summaryText.slice(0, streamedLength)}
                  {summaryStreaming && (
                    <span
                      className="inline-block w-[2px] h-3 ml-px align-middle bg-blue-500 animate-pulse"
                      aria-hidden
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {demo.hops.map((h, i) => (
                showHops && hopIndex >= i ? (
                  <motion.div
                    key={h.sectionLabel}
                    initial={isPlaying ? { opacity: 0, y: -12 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="py-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug"
                  >
                    <div className="font-medium text-slate-600 dark:text-slate-300">{h.sectionLabel}</div>
                    <div className="mt-0.5">{h.excerpt}</div>
                  </motion.div>
                ) : null
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t("landing.demo.source")}: {demo.sourceLabel}
        </p>
        <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          {t("landing.demo.rceptNo")} {demo.rceptNo}
        </span>
      </div>
    </div>
  );
}

function CompanyBadge({ company, index }) {
  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${CARD} p-3 pr-4`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${AVATAR_PALETTE[index % AVATAR_PALETTE.length]}`}>
        {avatarLabel(company)}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{company.name}</div>
        <div className="text-xs text-slate-400 dark:text-slate-500 tabular-nums mt-0.5">{company.ticker}</div>
      </div>
    </div>
  );
}

function CompanyMarquee() {
  const rowA = [...topKospiCompanies, ...topKospiCompanies];
  const rowB = [...topKosdaqCompanies, ...topKosdaqCompanies];
  return (
    <div className="overflow-hidden space-y-5 py-2" aria-hidden="true">
      <div className="flex gap-4 w-max" style={{ animation: "marquee 42s linear infinite" }}>
        {rowA.map((c, i) => <CompanyBadge key={`kospi-${c.id}-${i}`} company={c} index={i} />)}
      </div>
      <div className="flex gap-4 w-max" style={{ animation: "marquee-reverse 42s linear infinite" }}>
        {rowB.map((c, i) => <CompanyBadge key={`kosdaq-${c.id}-${i}`} company={c} index={i + 3} />)}
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function BrowserChrome({ label, children }) {
  return (
    <div className={`${CARD} overflow-hidden shadow-sm dark:shadow-none`}>
      <div className="px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-xs font-medium text-slate-400 truncate">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function CompanyMockup() {
  const { t } = useLocale();
  return (
    <BrowserChrome label={t("landing.mockups.companyChrome")}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-slate-100">삼성전자</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">005930</span>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-medium px-1.5 py-0.5">KOSPI</span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("landing.mockups.companySector")}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 dark:text-slate-500">{t("landing.mockups.aiScore")}</div>
          <div className="text-base font-semibold text-blue-600 dark:text-blue-400 tabular-nums">78</div>
        </div>
      </div>
      <div className="flex gap-1 mb-4 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-1 text-xs font-medium">
        <span className="flex-1 text-center py-1.5 bg-white dark:bg-slate-900 rounded-md text-slate-900 dark:text-slate-100 shadow-sm">{t("landing.mockups.tabOverview")}</span>
        <span className="flex-1 text-center py-1.5 text-slate-400 dark:text-slate-500">{t("landing.mockups.tabFinancials")}</span>
        <span className="flex-1 text-center py-1.5 text-slate-400 dark:text-slate-500">{t("landing.mockups.tabChanges")}</span>
      </div>
      <div className="flex items-start justify-between mb-4 px-1">
        {["2024 Q1", "2025 Q1", "2026 Q1"].map((q, i) => (
          <div key={q} className="flex flex-col items-center gap-1 relative flex-1">
            {i > 0 && <div className="absolute right-1/2 top-3 w-full h-px bg-slate-200 dark:bg-slate-700 -z-10" />}
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 2 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
              {i === 2 ? "●" : "✓"}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">{q}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 rounded-md border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2.5">
        <Lightbulb size={13} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" />
        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <span className="font-medium text-blue-700 dark:text-blue-300">{t("landing.demo.aiSummary")} </span>
          {t("landing.mockups.aiSummaryText")}
        </p>
      </div>
    </BrowserChrome>
  );
}

function TradingMockup() {
  const { t } = useLocale();
  const bars = [40, 55, 35, 60, 50, 70, 65, 80, 58, 72, 68, 90];
  return (
    <BrowserChrome label={t("landing.mockups.tradingChrome")}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">삼성전자</div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">73,400<span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">원</span></div>
        </div>
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium px-2 py-1">{t("landing.mockups.paperTrading")}</span>
      </div>
      <div className="flex items-end gap-1 h-20 mb-4">
        {bars.map((h, i) => (
          <div key={i} className={`flex-1 rounded-sm ${i % 3 === 0 ? "bg-blue-200 dark:bg-blue-900/60" : "bg-red-200 dark:bg-red-900/50"}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button className="py-2 rounded-lg bg-red-500 text-white text-xs font-medium">{t("landing.mockups.buy")}</button>
        <button className="py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium">{t("landing.mockups.sell")}</button>
      </div>
      <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
        <span className="text-slate-400 dark:text-slate-500">{t("landing.mockups.pnl")}</span>
        <span className="font-medium text-red-500 dark:text-red-400 tabular-nums">+12.4%</span>
      </div>
    </BrowserChrome>
  );
}

function CommunityMockup() {
  const { t } = useLocale();
  const posts = [
    { company: "삼성전자", tag: "005930", replies: 3, resolved: true },
    { company: "카카오페이", tag: "377300", replies: 1, resolved: false },
    { company: "HD현대중공업", tag: "329180", replies: 0, resolved: false },
  ];
  const questions = t("landing.mockups.communityPosts");
  return (
    <BrowserChrome label={t("landing.mockups.communityChrome")}>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {posts.map((p, i) => (
          <div key={p.company} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]} text-white text-[10px] font-medium flex items-center justify-center`}>
              {p.company.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{p.company}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">{p.tag}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{questions[i]?.q}</p>
            </div>
            <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.resolved ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
              {p.resolved ? `${t("landing.mockups.replyCount")} ${p.replies}` : t("landing.mockups.awaitingReply")}
            </span>
          </div>
        ))}
      </div>
    </BrowserChrome>
  );
}

const WALKTHROUGH_LINKS = ["/company", "/trading", "/community"];
const WALKTHROUGH_MOCKUPS = [CompanyMockup, TradingMockup, CommunityMockup];

export function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { t } = useLocale();
  const demoSnapshot = t("landing.demo.snapshot");
  const credibilityStats = t("landing.credibility.stats");
  const walkthroughItems = t("landing.walkthrough.items");
  const disclosureItems = t("landing.disclosures.items");
  const lensItems = t("landing.lenses.items");
  const lensStyleMap = lensStyles(t);
  return (
    <div className="flex flex-col flex-1">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-14 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-4">
                {t("landing.hero.tagline")}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug mb-4">
                {t("landing.hero.titleLine1")}<br />
                {t("landing.hero.titleLine2")}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-md">
                {t("landing.hero.subtitle")}
              </p>

              <HeroCta />

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400 dark:text-slate-500">
                <span>{t("landing.hero.trustDart")}</span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden>·</span>
                <span>{t("landing.hero.trustCompanies")}</span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden>·</span>
                <span>{t("landing.hero.trustSource")}</span>
              </div>

              <a
                href="#features"
                className={`mt-6 ${LINK_SUBTLE}`}
              >
                {t("landing.hero.previewFeatures")} <ArrowRight size={14} />
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}>
              <HeroDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Credibility band ─────────────────────────────── */}
      <section className={SECTION}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 overflow-hidden mb-6">
            {CREDIBILITY_STAT_KEYS.map((meta, i) => {
              const copy = credibilityStats[i];
              const stat = { ...meta, ...copy };
              return (
              <motion.div
                key={copy.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 px-5 py-4 text-center"
              >
                <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100 mb-0.5">
                  <CredibilityStatValue stat={stat} />
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{copy.label}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{copy.sub}</div>
              </motion.div>
            );})}
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t("landing.credibility.disclaimer")}
          </p>
        </div>
      </section>

      {/* ── Data coverage — real KOSPI/KOSDAQ companies as social proof ── */}
      <section className={`${SECTION} pt-0 overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <div className={EYEBROW}>{t("landing.coverage.eyebrow")}</div>
          <h2 className={SECTION_TITLE}>{t("landing.coverage.title")}</h2>
        </div>
        <CompanyMarquee />
      </section>

      {/* ── Product walkthrough — real UI mockups per feature ── */}
      <section id="features" className={SECTION}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="text-center mb-12"
          >
            <div className={EYEBROW}>{t("landing.walkthrough.eyebrow")}</div>
            <h2 className={`${SECTION_TITLE} mb-3`}>{t("landing.walkthrough.title")}</h2>
            <p className={`${SECTION_DESC} max-w-xl mx-auto`}>{t("landing.walkthrough.subtitle")}</p>
          </motion.div>

          <div className="space-y-20">
            {walkthroughItems.map((item, i) => {
              const Mockup = WALKTHROUGH_MOCKUPS[i];
              return (
                <div key={item.eyebrow} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={i % 2 === 1 ? "lg:order-2" : ""}
                  >
                    <div className={EYEBROW}>0{i + 1} · {item.eyebrow}</div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                    <p className={`${SECTION_DESC} mb-5`}>{item.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          <Check size={15} className="mt-0.5 text-blue-500 dark:text-blue-400 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link to={WALKTHROUGH_LINKS[i]} className={LINK_ACTION}>
                      {item.cta} <ChevronRight size={15} />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                    className={i % 2 === 1 ? "lg:order-1" : ""}
                  >
                    <Mockup />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Latest Disclosures ──────────────────────── */}
      <section className={SECTION}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="flex items-end justify-between mb-6"
          >
            <div>
              <div className={EYEBROW}>{t("landing.disclosures.eyebrow")}</div>
              <h2 className={SECTION_TITLE}>{t("landing.disclosures.title")}</h2>
              <p className={`${SECTION_DESC} mt-2`}>{t("landing.disclosures.subtitle")}</p>
            </div>
            <Link to="/disclosure" className={`hidden sm:flex ${LINK_ACTION}`}>
              {t("landing.disclosures.viewAll")} <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className={`${CARD} p-2`} role="feed" aria-label={t("landing.disclosures.feedLabel")} aria-live="polite">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {disclosureItems.map((d, i) => (
                <motion.div key={`${d.code}-${i}`} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.25 }}>
                  <Link to={`/disclosure/${i + 1}`} className="group flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]}`}>
                      {avatarLabel({ name: d.company })}
                    </span>
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{d.company}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{d.code}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{d.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{d.type}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{d.time}</span>
                      <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" aria-hidden="true" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Analysis lenses — grounded in the same real Samsung filing as the hero ── */}
      <section className={SECTION}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="text-center mb-8"
          >
            <div className={EYEBROW}>{t("landing.lenses.eyebrow")}</div>
            <h2 className={`${SECTION_TITLE} mb-3`}>{t("landing.lenses.title")}</h2>
            <p className={`${SECTION_DESC} max-w-2xl mx-auto`}>
              {t("landing.lenses.subtitlePrefix")} {demoSnapshot.companyName} {t("landing.lenses.subtitleSuffix")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lensItems.map((item, i) => {
              const style = lensStyleMap[item.scoreComponent];
              return (
                <motion.div
                  key={item.scoreComponent}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                  className={`flex flex-col ${CARD} border-l-2 p-4 ${style.border}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-400 dark:text-slate-500">{style.icon}</span>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 mb-3">{item.summary}</p>
                  <div className="mt-auto flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("landing.pricing.text")}{" "}
            <Link to="/subscription" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              {t("landing.pricing.link")}
            </Link>
          </p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className={`${CTA_SECTION} py-14 sm:py-16 px-4 sm:px-6 lg:px-8`}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">{t("landing.finalCta.title")}</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {t("landing.finalCta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => navigate("/company")}
                className="h-10 px-5 bg-white text-slate-900 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors"
              >
                {t("landing.finalCta.company")}
              </button>
            ) : (
              <Link
                to="/signup"
                className="inline-flex items-center justify-center h-10 px-5 bg-white text-slate-900 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors"
              >
                {t("landing.finalCta.signup")}
              </Link>
            )}
            <Link
              to="/trading"
              className="inline-flex items-center justify-center h-10 px-5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-md hover:bg-white/15 transition-colors gap-2"
            >
              {t("landing.finalCta.trading")} <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
