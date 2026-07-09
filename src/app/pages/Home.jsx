import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence, useReducedMotion, useInView } from "motion/react";
import { ChevronRight, ArrowRight, Lightbulb, TrendingUp, Landmark, AlertTriangle, ShieldCheck, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "../features/auth";
import { useLocale } from "../shared/i18n";
import { topKospiCompanies } from "../../mocks/companyAnalysis/topKospi";
import { topKosdaqCompanies } from "../../mocks/companyAnalysis/topKosdaq";

const SECTION = "py-14 sm:py-16";

/* Aligned with /company: blue-600 primary, restrained type weights */
const CTA_PRIMARY = "bg-blue-600 hover:bg-blue-700";
const CTA_SECTION = "bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800";

const EYEBROW = "text-xs font-medium text-slate-400 dark:text-slate-500 mb-2";
const SECTION_TITLE = "text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100";
const SECTION_DESC = "text-base text-slate-500 dark:text-slate-400 leading-relaxed";

const BTN_PRIMARY = `inline-flex w-fit items-center justify-center gap-2 h-10 px-5 ${CTA_PRIMARY} text-white text-sm font-medium rounded-md transition-colors`;
const BTN_SECONDARY = "inline-flex w-fit items-center justify-center gap-2 h-10 px-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors";
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


/* Category icons for the company-analysis lenses band. */
function lensStyles() {
  return {
    financialChange: { icon: <TrendingUp size={18} />, iconBg: "bg-red-50 dark:bg-red-950/40", iconText: "text-red-600 dark:text-red-400" },
    managementEmphasis: { icon: <Landmark size={18} />, iconBg: "bg-amber-50 dark:bg-amber-950/40", iconText: "text-amber-600 dark:text-amber-400" },
    riskEscalation: { icon: <AlertTriangle size={18} />, iconBg: "bg-amber-50 dark:bg-amber-950/40", iconText: "text-amber-600 dark:text-amber-400" },
    governance: { icon: <ShieldCheck size={18} />, iconBg: "bg-slate-100 dark:bg-slate-800", iconText: "text-slate-600 dark:text-slate-400" },
  };
}

function HeroCta() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { t } = useLocale();

  if (isLoggedIn) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

function HeroDemo({ active = false }) {
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
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    return clearTimers;
  }, [clearTimers]);

  useEffect(() => {
    if (reduceMotion) {
      showEndState();
      return;
    }
    if (active) playSequence();
    else showEndState();
  }, [active, playSequence, reduceMotion, showEndState]);

  const showSummary = step >= 6;
  const showHops = step >= 7;
  const summaryStreaming = isPlaying && streamedLength < summaryText.length;

  return (
    <div className={`${CARD} overflow-hidden shadow-sm dark:shadow-none`}>
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

      {!isPlaying && !active && isTouchDevice && (
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
    <div className="container">
      <div className="relative overflow-hidden py-2">
        <div className="space-y-5" aria-hidden="true">
          <div className="flex gap-4 w-max" style={{ animation: "marquee 42s linear infinite" }}>
            {rowA.map((c, i) => <CompanyBadge key={`kospi-${c.id}-${i}`} company={c} index={i} />)}
          </div>
          <div className="flex gap-4 w-max" style={{ animation: "marquee-reverse 42s linear infinite" }}>
            {rowB.map((c, i) => <CompanyBadge key={`kosdaq-${c.id}-${i}`} company={c} index={i + 3} />)}
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent"
          aria-hidden
        />
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function BrowserChrome({ label, children, active = false, className = "", contentClassName = "" }) {
  return (
    <motion.div
      className={`${CARD} overflow-hidden flex flex-col min-h-[360px] sm:min-h-[400px] ${className}`}
      animate={{
        boxShadow: active
          ? "0 20px 40px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(148, 163, 184, 0.15)"
          : "0 1px 3px 0 rgba(15, 23, 42, 0.06)",
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-xs font-medium text-slate-400 truncate">{label}</span>
      </div>
      <div className={`p-5 flex flex-col flex-1 justify-between min-h-0 ${contentClassName}`}>{children}</div>
    </motion.div>
  );
}

function CompanyMockup({ active = false }) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  return (
    <BrowserChrome label={t("landing.mockups.companyChrome")} active={active}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-slate-100">{t("landing.mockups.demoCompanyName")}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">005930</span>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-medium px-1.5 py-0.5">KOSPI</span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("landing.mockups.companySector")}</div>
        </div>
        <motion.div
          className="text-right"
          animate={active && !reduceMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="text-xs text-slate-400 dark:text-slate-500">{t("landing.mockups.aiScore")}</div>
          <div className="text-base font-semibold text-blue-600 dark:text-blue-400 tabular-nums">78</div>
        </motion.div>
      </div>
      <div className="flex gap-1 mb-6 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-1 text-xs font-medium">
        <span className="flex-1 text-center py-1.5 bg-white dark:bg-slate-900 rounded-md text-slate-900 dark:text-slate-100 shadow-sm">{t("landing.mockups.tabOverview")}</span>
        <span className="flex-1 text-center py-1.5 text-slate-400 dark:text-slate-500">{t("landing.mockups.tabFinancials")}</span>
        <span className="flex-1 text-center py-1.5 text-slate-400 dark:text-slate-500">{t("landing.mockups.tabAiAnalysis")}</span>
      </div>
      <div className="flex items-start justify-between mb-6 px-1 flex-1">
        {["2024 Q1", "2025 Q1", "2026 Q1"].map((q, i) => (
          <div key={q} className="flex flex-col items-center gap-1 relative flex-1">
            {i > 0 && <div className="absolute right-1/2 top-3 w-full h-px bg-slate-200 dark:bg-slate-700 -z-10" />}
            <motion.div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 2 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              animate={active && !reduceMotion && i === 2 ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              {i === 2 ? "●" : "✓"}
            </motion.div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">{q}</span>
          </div>
        ))}
      </div>
      <motion.div
        className="flex gap-2 rounded-md border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2.5"
        animate={active && !reduceMotion ? { y: [0, -3, 0] } : { y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Lightbulb size={13} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" />
        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <span className="font-medium text-blue-700 dark:text-blue-300">{t("landing.demo.aiSummary")} </span>
          {t("landing.mockups.aiSummaryText")}
        </p>
      </motion.div>
    </BrowserChrome>
  );
}

const TRADING_MOCK_CANDLES = [
  { o: 70800, h: 71340, l: 70559, c: 71162, vol: 0.45 },
  { o: 71185, h: 71635, l: 70908, c: 71477, vol: 0.53 },
  { o: 71429, h: 71718, l: 70902, c: 71056, vol: 0.61 },
  { o: 71112, h: 71715, l: 70963, c: 71521, vol: 0.69 },
  { o: 71472, h: 72110, l: 71315, c: 71863, vol: 0.77 },
  { o: 71833, h: 72417, l: 71585, c: 72136, vol: 0.85 },
  { o: 72083, h: 72367, l: 71421, c: 71592, vol: 0.45 },
  { o: 71560, h: 72301, l: 71271, c: 72001, vol: 0.53 },
  { o: 71948, h: 72664, l: 71707, c: 72375, vol: 0.61 },
  { o: 72321, h: 72808, l: 72039, c: 72657, vol: 0.69 },
  { o: 72706, h: 72920, l: 72145, c: 72392, vol: 0.77 },
  { o: 72350, h: 72938, l: 72064, c: 72768, vol: 0.85 },
  { o: 72747, h: 73484, l: 72561, c: 73170, vol: 0.45 },
  { o: 73123, h: 73800, l: 72820, c: 73551, vol: 0.53 },
  { o: 73515, h: 73679, l: 72860, c: 73140, vol: 0.61 },
  { o: 73171, h: 73751, l: 73016, c: 73467, vol: 0.69 },
  { o: 73486, h: 73800, l: 73172, c: 73700, vol: 0.77 },
  { o: 73708, h: 73800, l: 73441, c: 73700, vol: 0.85 },
  { o: 73714, h: 73800, l: 72966, c: 73198, vol: 0.45 },
  { o: 73176, h: 73705, l: 72858, c: 73519, vol: 0.53 },
  { o: 73558, h: 73800, l: 73271, c: 73700, vol: 0.61 },
  { o: 73678, h: 73800, l: 73451, c: 73700, vol: 0.69 },
  { o: 73733, h: 73800, l: 73044, c: 73339, vol: 0.77 },
  { o: 73288, h: 73800, l: 73041, c: 73598, vol: 0.85 },
  { o: 73559, h: 73800, l: 73381, c: 73700, vol: 0.45 },
  { o: 73759, h: 73800, l: 73550, c: 73700, vol: 0.53 },
  { o: 73725, h: 73800, l: 73140, c: 73426, vol: 0.61 },
  { o: 73320, h: 73620, l: 73180, c: 73400, vol: 0.9 },
];

function MiniTradingChart({ active = false }) {
  const reduceMotion = useReducedMotion();
  const candles = TRADING_MOCK_CANDLES;
  const w = 320;
  const h = 136;
  const volH = 18;
  const padL = 4;
  const padR = 36;
  const padT = 8;
  const chartH = h - padT - volH - 8;
  const n = candles.length;

  const allPrices = candles.flatMap((c) => [c.h, c.l]);
  const pMin = Math.min(...allPrices);
  const pMax = Math.max(...allPrices);
  const rawRng = pMax - pMin || 1;
  const yPad = rawRng * 0.12;
  const rMin = pMin - yPad;
  const rMax = pMax + yPad;
  const rng = rMax - rMin;
  const y = (v) => padT + (1 - (v - rMin) / rng) * chartH;
  const cw = (w - padL - padR) / n;
  const bw = Math.max(3, cw * 0.72);
  const maxVol = Math.max(...candles.map((c) => c.vol));
  const volY = padT + chartH + 8;

  const ticks = [0, 1, 2].map((i) => rMin + rng * (2 - i) / 2);
  const formatPrice = (v) => `${Math.round(v / 1000)}k`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" aria-hidden overflow="visible">
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={padL}
            y1={y(tick)}
            x2={w - padR}
            y2={y(tick)}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="1"
          />
          <text
            x={w - padR + 4}
            y={y(tick) + 3}
            className="fill-slate-400 dark:fill-slate-500"
            fontSize="8"
          >
            {formatPrice(tick)}
          </text>
        </g>
      ))}

      {candles.map((c, i) => {
        const cx = padL + i * cw + cw / 2;
        const up = c.c >= c.o;
        const color = up ? "#F04452" : "#3182F6";
        const bodyTop = y(Math.max(c.o, c.c));
        const bodyBot = y(Math.min(c.o, c.c));
        const bodyH = Math.max(bodyBot - bodyTop, 5);
        const volBarH = (c.vol / maxVol) * (volH - 2);

        return (
          <g key={i}>
            <line x1={cx} y1={y(c.h)} x2={cx} y2={y(c.l)} stroke={color} strokeWidth="1.25" />
            <motion.rect
              x={cx - bw / 2}
              y={bodyTop}
              width={bw}
              height={bodyH}
              fill={color}
              initial={false}
              animate={{ opacity: active && !reduceMotion ? [0.35, 1] : 1 }}
              transition={{ duration: 0.35, delay: active && !reduceMotion ? i * 0.012 : 0, ease: "easeOut" }}
            />
            <motion.rect
              x={cx - bw / 2}
              y={volY + volH - volBarH}
              width={bw}
              height={volBarH}
              className={up ? "fill-red-200 dark:fill-red-900/50" : "fill-blue-200 dark:fill-blue-900/50"}
              rx="0.5"
              initial={false}
              animate={{ scaleY: active && !reduceMotion ? [0.4, 1] : 1 }}
              style={{ transformOrigin: `${cx}px ${volY + volH}px` }}
              transition={{ duration: 0.35, delay: active && !reduceMotion ? i * 0.012 : 0, ease: "easeOut" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function TradingMockup({ active = false }) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  return (
    <BrowserChrome label={t("landing.mockups.tradingChrome")} active={active}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{t("landing.mockups.demoCompanyName")}</div>
          <div className="flex items-baseline gap-2">
            <motion.div
              className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums"
              animate={active && !reduceMotion ? { y: [0, -2, 0] } : { y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              73,400<span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">{t("landing.mockups.currencyUnit")}</span>
            </motion.div>
            <span className="text-[10px] font-medium text-red-500 dark:text-red-400 tabular-nums">+1.24%</span>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium px-2 py-1">{t("landing.mockups.paperTrading")}</span>
      </div>

      <div className="flex gap-1 mb-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-0.5 text-[10px] font-medium w-fit">
        {(t("landing.mockups.chartPeriods") || []).map((label, i) => (
          <span
            key={label}
            className={`px-2 py-1 rounded-md ${i === 0 ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-400 dark:text-slate-500"}`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="h-32 mb-4 flex-1 min-h-[8rem]">
        <MiniTradingChart active={active} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <motion.button
          className="py-2 rounded-lg bg-red-500 text-white text-xs font-medium"
          animate={active && !reduceMotion ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {t("landing.mockups.buy")}
        </motion.button>
        <button className="py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium">{t("landing.mockups.sell")}</button>
      </div>
      <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
        <span className="text-slate-400 dark:text-slate-500">{t("landing.mockups.pnl")}</span>
        <motion.span
          className="font-medium text-red-500 dark:text-red-400 tabular-nums"
          animate={active && !reduceMotion ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          +12.4%
        </motion.span>
      </div>
    </BrowserChrome>
  );
}

function CommunityTypingIndicator({ paletteIndex = 0 }) {
  return (
    <div className="flex items-center gap-2 px-1 py-0.5">
      <div
        className={`h-6 w-6 shrink-0 rounded-full bg-gradient-to-br ${AVATAR_PALETTE[paletteIndex % AVATAR_PALETTE.length]} opacity-40`}
      />
      <div className="flex items-center gap-1 px-2.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
            animate={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

function CommunityMockup({ active = false }) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const activeRef = useRef(active);
  activeRef.current = active;

  const thread = t("landing.mockups.communityThread");
  const messages = thread.messages;

  const [visibleCount, setVisibleCount] = useState(messages.length);
  const [showTyping, setShowTyping] = useState(false);
  const [threadFaded, setThreadFaded] = useState(false);
  const timersRef = useRef([]);
  const sequenceIdRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const runChatSequence = useCallback(() => {
    const sequenceId = ++sequenceIdRef.current;
    const isCurrent = () => sequenceId === sequenceIdRef.current;

    clearTimers();
    setThreadFaded(false);
    setVisibleCount(0);
    setShowTyping(false);

    if (reduceMotion) {
      setVisibleCount(messages.length);
      return;
    }

    const TYPING_MS = 850;
    const MESSAGE_GAP_MS = 500;
    const LOOP_PAUSE_MS = 3200;
    const LOOP_FADE_MS = 280;
    let delay = 400;

    schedule(() => {
      if (!isCurrent()) return;
      setShowTyping(true);
    }, delay);
    delay += TYPING_MS;

    messages.forEach((_, i) => {
      const nextCount = i + 1;
      schedule(() => {
        if (!isCurrent()) return;
        setShowTyping(false);
      }, delay);
      delay += 160;

      schedule(() => {
        if (!isCurrent()) return;
        setVisibleCount(nextCount);
      }, delay);
      delay += 380;

      if (i < messages.length - 1) {
        delay += MESSAGE_GAP_MS;
        schedule(() => {
          if (!isCurrent()) return;
          setShowTyping(true);
        }, delay);
        delay += TYPING_MS;
      }
    });

    schedule(() => {
      if (!isCurrent() || !activeRef.current) return;
      setThreadFaded(true);
    }, delay + LOOP_PAUSE_MS - LOOP_FADE_MS);

    schedule(() => {
      if (!isCurrent() || !activeRef.current) return;
      setVisibleCount(0);
      setShowTyping(false);
      setThreadFaded(false);
      runChatSequence();
    }, delay + LOOP_PAUSE_MS);
  }, [clearTimers, messages, reduceMotion, schedule]);

  useEffect(() => {
    if (active) {
      runChatSequence();
    } else {
      sequenceIdRef.current += 1;
      clearTimers();
      setThreadFaded(false);
      setVisibleCount(messages.length);
      setShowTyping(false);
    }
    return clearTimers;
  }, [active, runChatSequence, clearTimers, messages.length]);

  const replyCount = Math.max(0, visibleCount - 1);

  return (
    <BrowserChrome
      label={t("landing.mockups.communityChrome")}
      active={active}
      className="h-[480px]"
      contentClassName="!justify-start h-full"
    >
        <div className="mb-3 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded">
              {thread.company} <span className="text-slate-400 dark:text-slate-500 tabular-nums">{thread.ticker}</span>
            </span>
            <motion.span
              key={active ? replyCount : "final"}
              initial={active && !reduceMotion ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 tabular-nums"
            >
              {replyCount > 0
                ? `${thread.replyCountPrefix}${replyCount}${thread.replyCountSuffix}`
                : thread.awaitingReply}
            </motion.span>
          </div>
          <p className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug">{thread.title}</p>
        </div>

        <motion.div
          className="flex-1 min-h-0 overflow-hidden space-y-2"
          animate={{ opacity: threadFaded ? 0 : 1 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
        >
          <AnimatePresence initial={false}>
            {messages.slice(0, visibleCount).map((msg, i) => (
              <motion.div
                key={`${msg.author}-${i}`}
                initial={active && !reduceMotion && i === visibleCount - 1 ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={msg.isReply ? "ml-4" : undefined}
              >
                <div
                  className={`flex gap-2 rounded-lg p-2 ${
                    msg.adopted
                      ? "border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20"
                      : msg.isReply
                        ? "border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40"
                        : ""
                  }`}
                >
                  <div
                    className={`h-6 w-6 shrink-0 rounded-full bg-gradient-to-br ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]} text-white text-[9px] font-medium flex items-center justify-center`}
                  >
                    {msg.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-800 dark:text-slate-200">{msg.author}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">{msg.time}</span>
                      {msg.adopted && visibleCount === messages.length && (
                        <motion.span
                          initial={active && !reduceMotion ? { opacity: 0 } : false}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.2, ease: "easeOut" }}
                          className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400"
                        >
                          {thread.adopted}
                        </motion.span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{msg.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {showTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <CommunityTypingIndicator paletteIndex={visibleCount} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <div className="flex-1 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-2.5 flex items-center overflow-hidden">
            <motion.span
              className="text-[10px] text-slate-400 dark:text-slate-500 truncate"
              animate={active && !reduceMotion ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {thread.placeholder}
            </motion.span>
          </div>
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 shrink-0">
            {thread.submit}
          </span>
        </div>
      </BrowserChrome>
  );
}

const WALKTHROUGH_MOCKUP_TILTS = [-0.6, 0.6, -0.5];
const HERO_MOCKUP_TILT = 0.5;
const DART_LOGO_URL = "https://dart.fss.or.kr/";

function HeroDataTrust() {
  const { t } = useLocale();
  return (
    <a
      href={DART_LOGO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 mb-5 group"
    >
      <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
        {t("landing.hero.trustedDataFrom")}
      </span>
      <img
        src="/images/dart-logo.png"
        alt={t("landing.hero.dartLogoAlt")}
        className="h-5 sm:h-6 w-auto opacity-90 transition-opacity group-hover:opacity-100 dark:opacity-95"
        width={90}
        height={24}
      />
    </a>
  );
}

function HeroSection() {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-10 lg:gap-16 items-center"
      onMouseEnter={() => { if (!isTouchDevice) setActive(true); }}
      onMouseLeave={() => { if (!isTouchDevice) setActive(false); }}
    >
      <motion.div
        className="max-w-[44rem]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <HeroDataTrust />
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.15] mb-4">
          {t("landing.hero.titleLine1")}<br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
            {t("landing.hero.titleLine2")}
          </span>
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-[36rem]">
          {t("landing.hero.subtitle")}
        </p>

        <HeroCta />

        <a href="#features" className={`mt-6 ${LINK_SUBTLE}`}>
          {t("landing.hero.previewFeatures")} <ArrowRight size={14} />
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: 1,
          y: active && !reduceMotion ? -6 : 0,
          rotate: active && !reduceMotion ? HERO_MOCKUP_TILT : 0,
          scale: active && !reduceMotion ? 1.015 : 1,
        }}
        transition={{
          opacity: { duration: 0.35, delay: 0.1, ease: "easeOut" },
          y: { type: "spring", stiffness: 260, damping: 22 },
          rotate: { type: "spring", stiffness: 260, damping: 22 },
          scale: { type: "spring", stiffness: 260, damping: 22 },
        }}
        onClick={() => {
          if (!isTouchDevice || reduceMotion) return;
          setActive((v) => !v);
        }}
      >
        <HeroDemo active={active} />
      </motion.div>
    </div>
  );
}

function WalkthroughRow({ item, index, Mockup, link }) {
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const textOnRight = index % 2 === 1;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-10 lg:gap-16 items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={textOnRight ? "lg:order-2" : ""}
      >
        <div className={EYEBROW}>0{index + 1} · {item.eyebrow}</div>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
        <p className={`${SECTION_DESC} mb-5`}>{item.desc}</p>
        <ul className="space-y-2 mb-6">
          {item.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <Check size={15} className="mt-0.5 text-blue-500 dark:text-blue-400 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
        <Link to={link} className={LINK_ACTION}>
          {item.cta} <ChevronRight size={15} />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        className={textOnRight ? "lg:order-1" : ""}
        animate={
          hovered && !reduceMotion
            ? index === 2
              ? { y: -6, rotate: WALKTHROUGH_MOCKUP_TILTS[index] ?? 0 }
              : { y: -6, rotate: WALKTHROUGH_MOCKUP_TILTS[index] ?? 0, scale: 1.015 }
            : { y: 0, rotate: 0, scale: 1 }
        }
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <Mockup active={hovered} />
      </motion.div>
    </div>
  );
}

const WALKTHROUGH_LINKS = ["/company", "/trading", "/community"];
const WALKTHROUGH_MOCKUPS = [CompanyMockup, TradingMockup, CommunityMockup];

export function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { t } = useLocale();
  const credibilityStats = t("landing.credibility.stats");
  const walkthroughItems = t("landing.walkthrough.items");
  const disclosureItems = t("landing.disclosures.items");
  const lensItems = t("landing.lenses.items");
  const lensStyleMap = lensStyles();
  return (
    <div className="flex flex-col flex-1">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="container pt-10 sm:pt-12 pb-14 sm:pb-16">
          <HeroSection />
        </div>
      </section>

      {/* ── Credibility band ─────────────────────────────── */}
      <section className={SECTION}>
        <div className="container">
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
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 max-w-[45rem] mx-auto">
            {t("landing.credibility.disclaimer")}
          </p>
        </div>
      </section>

      {/* ── Data coverage — real KOSPI/KOSDAQ companies as social proof ── */}
      <section className={`${SECTION} pt-0`}>
        <div className="container text-center mb-8">
          <div className={EYEBROW}>{t("landing.coverage.eyebrow")}</div>
          <h2 className={SECTION_TITLE}>{t("landing.coverage.title")}</h2>
        </div>
        <CompanyMarquee />
      </section>

      {/* ── Product walkthrough — real UI mockups per feature ── */}
      <section id="features" className={SECTION}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="max-w-[45rem] mx-auto text-center mb-12"
          >
            <div className={EYEBROW}>{t("landing.walkthrough.eyebrow")}</div>
            <h2 className={`${SECTION_TITLE} mb-3`}>{t("landing.walkthrough.title")}</h2>
            <p className={SECTION_DESC}>{t("landing.walkthrough.subtitle")}</p>
          </motion.div>

          <div className="space-y-16 lg:space-y-20">
            {walkthroughItems.map((item, i) => {
              const Mockup = WALKTHROUGH_MOCKUPS[i];
              return (
                <WalkthroughRow
                  key={item.eyebrow}
                  item={item}
                  index={i}
                  Mockup={Mockup}
                  link={WALKTHROUGH_LINKS[i]}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Company analysis lenses ───────────────────────── */}
      <section className={SECTION}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="max-w-[45rem] mx-auto text-center mb-8"
          >
            <div className={EYEBROW}>{t("landing.lenses.eyebrow")}</div>
            <h2 className={`${SECTION_TITLE} mb-3`}>{t("landing.lenses.title")}</h2>
            <p className={SECTION_DESC}>{t("landing.lenses.subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 overflow-hidden">
            {lensItems.map((item, i) => {
              const style = lensStyleMap[item.scoreComponent];
              return (
                <motion.div
                  key={item.scoreComponent}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                  className="bg-white dark:bg-slate-900 px-5 py-5"
                >
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${style.iconBg} ${style.iconText}`}>
                    {style.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">{item.label}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.summary}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Link to="/company" className={LINK_ACTION}>
              {t("landing.lenses.cta")} <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest Disclosures ──────────────────────── */}
      <section className={SECTION}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="max-w-[45rem] mx-auto text-center mb-6"
          >
            <div className={EYEBROW}>{t("landing.disclosures.eyebrow")}</div>
            <h2 className={`${SECTION_TITLE} mb-3`}>{t("landing.disclosures.title")}</h2>
            <p className={SECTION_DESC}>{t("landing.disclosures.subtitle")}</p>
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

          <div className="mt-6 text-center">
            <Link to="/disclosure" className={LINK_ACTION}>
              {t("landing.disclosures.viewAll")} <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────── */}
      <section className="py-10">
        <div className="container-sm text-center">
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("landing.pricing.text")}{" "}
            <Link to="/pricing" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              {t("landing.pricing.link")}
            </Link>
          </p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className={`${CTA_SECTION} py-14 sm:py-16`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="container-sm text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mb-3">{t("landing.finalCta.title")}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base mb-8 leading-relaxed">
            {t("landing.finalCta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => navigate("/company")}
                className={`${BTN_PRIMARY} dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100`}
              >
                {t("landing.finalCta.company")}
              </button>
            ) : (
              <Link
                to="/signup"
                className={`${BTN_PRIMARY} dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100`}
              >
                {t("landing.finalCta.signup")}
              </Link>
            )}
            <Link
              to="/trading"
              className={`${BTN_SECONDARY} dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15 gap-2`}
            >
              {t("landing.finalCta.trading")} <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
