import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { motion, useReducedMotion, useInView } from "motion/react";
import { ChevronRight, ArrowRight, Lightbulb, TrendingUp, Landmark, AlertTriangle, ShieldCheck, Check } from "lucide-react";
import { useAuth } from "../features/auth";
import { heroDemo, heroFindingsByLens } from "../../mocks/landing/heroDemo";
import { topKospiCompanies } from "../../mocks/companyAnalysis/topKospi";
import { topKosdaqCompanies } from "../../mocks/companyAnalysis/topKosdaq";

const SECTION = "py-16 sm:py-20 px-4 sm:px-6 lg:px-8";

/* Aligned with /company: blue-600 primary, restrained type weights */
const CTA_PRIMARY = "bg-blue-600 hover:bg-blue-700";
const CTA_SECTION = "bg-slate-900";

const EYEBROW = "text-sm font-medium text-slate-500 mb-2";
const SECTION_TITLE = "text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900";
const SECTION_DESC = "text-sm text-slate-500 leading-relaxed";

const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 px-5 py-2.5 ${CTA_PRIMARY} text-white text-sm font-medium rounded-lg transition-colors`;
const BTN_SECONDARY = "inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors";
const LINK_ACTION = "inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors";

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

const RECENT_DISCLOSURES = [
  { id: 1, company: "삼성전자", code: "005930", type: "분기보고서", title: "2026년 1분기 분기보고서 (주요 실적: 영업이익 7.8조 원)", time: "09:12" },
  { id: 2, company: "에코프로비엠", code: "247540", type: "주요사항보고서", title: "타법인 주식 및 출자증권 취득결정 (2,400억 규모 헝가리 법인 투자)", time: "09:31" },
  { id: 3, company: "카카오페이", code: "377300", type: "주요사항보고서", title: "전환사채 발행 결정 (500억 규모, CB 희석 주의)", time: "10:05" },
  { id: 4, company: "HD현대중공업", code: "329180", type: "수시공시", title: "대규모 LNG선 수주 계약 체결 — 총 계약금액 2.3조 원", time: "10:48" },
  { id: 5, company: "셀트리온", code: "068270", type: "주요사항보고서", title: "자기주식 취득 결정 (1,200억 규모 자사주 매입 공시)", time: "11:22" },
  { id: 6, company: "한화에어로스페이스", code: "012450", type: "수시공시", title: "방위산업 수출 계약 체결 — 폴란드 향 계약금액 4,200억", time: "13:05" },
];

/* Mirrors the real score_component categories from the findings table. */
const LENS_STYLE = {
  financialChange: { icon: <TrendingUp size={16} />, border: "border-l-red-400", dot: "bg-red-400", text: "text-red-600", label: "영향 높음" },
  managementEmphasis: { icon: <Landmark size={16} />, border: "border-l-amber-400", dot: "bg-amber-400", text: "text-amber-600", label: "영향 보통" },
  riskEscalation: { icon: <AlertTriangle size={16} />, border: "border-l-amber-400", dot: "bg-amber-400", text: "text-amber-600", label: "영향 보통" },
  governance: { icon: <ShieldCheck size={16} />, border: "border-l-slate-300", dot: "bg-slate-300", text: "text-slate-500", label: "영향 보통" },
};

function HeroCta() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => navigate("/company")}
          className={BTN_PRIMARY}
        >
          기업 분석 시작하기 <ArrowRight size={16} />
        </button>
        <Link
          to="/trading"
          className={BTN_SECONDARY}
        >
          모의투자 해보기
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
          무료로 시작하기 <ArrowRight size={16} />
        </Link>
        <Link
          to="/login"
          className={BTN_SECONDARY}
        >
          로그인
        </Link>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        신용카드 없이 가입 · 기업 분석·공시 분석·커뮤니티 무료 이용
      </p>
    </div>
  );
}

const HERO_DEMO_BODY_HEIGHT = "h-[352px]";
const HERO_DEMO_FINAL_STEP = 8;
const HERO_SUMMARY_TEXT = heroDemo.finding.summaryPreview;
const HERO_SUMMARY_STREAM_MS = 16;
const HERO_HOP_STAGGER_MS = 320;

const CREDIBILITY_STATS = [
  { label: "등록 기업 수", type: "count", to: 3200, suffix: "+", duration: 1.4, sub: "유가증권 + 코스닥 전 종목" },
  { label: "분석된 공시 건수", type: "count", to: 2840000, suffix: "+", duration: 2.2, sub: "DART 전체 공시 커버" },
  { label: "분석 방식", value: "DART 원문 기반", sub: "요약이 아니라 원문 근거를 함께 제시" },
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
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState("after");
  const [step, setStep] = useState(HERO_DEMO_FINAL_STEP);
  const [hopIndex, setHopIndex] = useState(heroDemo.hops.length - 1);
  const [highlightVisible, setHighlightVisible] = useState(true);
  const [streamedLength, setStreamedLength] = useState(HERO_SUMMARY_TEXT.length);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const timersRef = useRef([]);

  const highlight = heroDemo.before.highlight ?? "";
  const textParts = heroDemo.before.text.split(highlight || "###");

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
    setHopIndex(heroDemo.hops.length - 1);
    setHighlightVisible(true);
    setStreamedLength(HERO_SUMMARY_TEXT.length);
    setTab("after");
  }, [clearTimers]);

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
        if (len >= HERO_SUMMARY_TEXT.length) {
          clearInterval(intervalId);
          const hopsStart = 280;
          schedule(hopsStart, () => setStep(7));
          heroDemo.hops.forEach((_, i) => {
            schedule(hopsStart + i * HERO_HOP_STAGGER_MS, () => setHopIndex(i));
          });
          schedule(
            hopsStart + heroDemo.hops.length * HERO_HOP_STAGGER_MS + 100,
            () => setIsPlaying(false),
          );
        }
      }, HERO_SUMMARY_STREAM_MS);
      timersRef.current.push(intervalId);
    });
  }, [clearTimers, reduceMotion, showEndState]);

  useEffect(() => {
    showEndState();
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    return clearTimers;
  }, [clearTimers, showEndState]);

  const showSummary = step >= 6;
  const showHops = step >= 7;
  const summaryStreaming = isPlaying && streamedLength < HERO_SUMMARY_TEXT.length;

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm lg:transition-shadow lg:hover:shadow-md"
      onMouseEnter={() => { if (!reduceMotion) playSequence(); }}
      onMouseLeave={() => { if (!reduceMotion) showEndState(); }}
      onClick={() => {
        if (!isTouchDevice || reduceMotion) return;
        if (isPlaying) showEndState();
        else playSequence();
      }}
    >
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
        <div>
          <span className="text-sm font-semibold text-slate-900">{heroDemo.company.name}</span>
          <span className="ml-1.5 text-xs text-slate-500 tabular-nums">{heroDemo.company.ticker}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium border transition-colors duration-300 ${
          isPlaying
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-blue-50 text-blue-600 border-blue-200"
        }`}>
          {isPlaying ? "AI 분석 중" : "AI 분석 예시"}
        </span>
      </div>

      <div className="p-1 mx-5 mt-4 flex lg:hidden bg-slate-100/80 rounded-lg">
        <button
          onClick={() => setTab("before")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${tab === "before" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          공시 원문
        </button>
        <button
          onClick={() => setTab("after")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${tab === "after" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          AI 분석 결과
        </button>
      </div>

      {!isPlaying && (
        <p className="lg:hidden mx-5 mb-3 text-xs text-center text-slate-400">탭하여 AI 분석 다시 보기</p>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-slate-100 ${HERO_DEMO_BODY_HEIGHT}`}>
        <div className={`${tab === "before" ? "flex" : "hidden"} lg:flex flex-col h-full min-h-0 px-5 py-4 overflow-hidden`}>
          <div className="shrink-0 text-xs font-medium text-slate-400 mb-2">
            {heroDemo.before.sectionLabel}
          </div>
          <div className="flex-1 min-h-0">
            <p className="text-xs text-slate-600 leading-relaxed">
              {textParts[0]}
              {highlight && textParts.length > 1 && (
                <span className="inline font-semibold">
                  {highlight.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      className="rounded-[2px] box-decoration-clone"
                      initial={false}
                      animate={{
                        backgroundColor: highlightVisible ? "rgb(191 219 254)" : "rgba(191, 219, 254, 0)",
                        color: highlightVisible ? "rgb(15 23 42)" : "rgb(71 85 105)",
                      }}
                      transition={
                        isPlaying && highlightVisible
                          ? { duration: 0.06, delay: i * 0.045 }
                          : { duration: 0 }
                      }
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
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
            <div className="flex gap-2 rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2 mb-2 shrink-0">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-blue-500" />
              <div className="text-[11px] leading-snug text-slate-700 min-h-[3.5rem]">
                <div className="font-semibold text-blue-700">AI 요약.</div>
                <div className="mt-0.5">
                  {HERO_SUMMARY_TEXT.slice(0, streamedLength)}
                  {summaryStreaming && (
                    <span
                      className="inline-block w-[2px] h-3 ml-px align-middle bg-blue-500 animate-pulse"
                      aria-hidden
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {heroDemo.hops.map((h, i) => (
                showHops && hopIndex >= i ? (
                  <motion.div
                    key={h.sectionLabel}
                    initial={isPlaying ? { opacity: 0, y: -12 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="py-1 text-[11px] text-slate-500 leading-snug"
                  >
                    <div className="font-medium text-slate-600">{h.sectionLabel}</div>
                    <div className="mt-0.5">{h.excerpt}</div>
                  </motion.div>
                ) : null
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          출처: {heroDemo.source.label}
        </p>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500 tabular-nums">
          접수번호 {heroDemo.source.rceptNo}
        </span>
      </div>
    </div>
  );
}

function CompanyBadge({ company, index }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-3 pr-5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${AVATAR_PALETTE[index % AVATAR_PALETTE.length]}`}>
        {avatarLabel(company)}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900 whitespace-nowrap">{company.name}</div>
        <div className="text-xs text-slate-400 tabular-nums mt-0.5">{company.ticker}</div>
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
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-100 bg-slate-50">
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
  return (
    <BrowserChrome label="삼성전자 · 005930 · 기업분석">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">삼성전자</span>
            <span className="text-xs text-slate-400 tabular-nums">005930</span>
            <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium px-1.5 py-0.5">KOSPI</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">반도체·전자제품</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">AI 종합 스코어</div>
          <div className="text-lg font-semibold text-blue-600 tabular-nums">78</div>
        </div>
      </div>
      <div className="flex gap-1 mb-4 bg-slate-100/80 rounded-lg p-1 text-xs font-semibold">
        <span className="flex-1 text-center py-1.5 bg-white rounded-md text-slate-900 shadow-sm">개요</span>
        <span className="flex-1 text-center py-1.5 text-slate-400">재무 추이</span>
        <span className="flex-1 text-center py-1.5 text-slate-400">공시 변경</span>
      </div>
      <div className="flex items-start justify-between mb-4 px-1">
        {["2024 Q1", "2025 Q1", "2026 Q1"].map((q, i) => (
          <div key={q} className="flex flex-col items-center gap-1 relative flex-1">
            {i > 0 && <div className="absolute right-1/2 top-3 w-full h-px bg-slate-200 -z-10" />}
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
              {i === 2 ? "●" : "✓"}
            </div>
            <span className="text-[10px] text-slate-400 tabular-nums">{q}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2.5">
        <Lightbulb size={13} className="mt-0.5 shrink-0 text-blue-500" />
        <p className="text-xs leading-relaxed text-slate-700">
          <span className="font-semibold text-blue-700">AI 요약. </span>
          DS 부문 매출 비중이 61%로 급등 — HBM 수요 확대가 영업이익률을 8.45%→42.75%로 끌어올림.
        </p>
      </div>
    </BrowserChrome>
  );
}

function TradingMockup() {
  const bars = [40, 55, 35, 60, 50, 70, 65, 80, 58, 72, 68, 90];
  return (
    <BrowserChrome label="모의투자 · 삼성전자">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-slate-900">삼성전자</div>
          <div className="text-base font-semibold text-slate-900 tabular-nums">73,400<span className="text-xs font-medium text-slate-400 ml-1">원</span></div>
        </div>
        <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-1">모의투자 · 실제 돈 아님</span>
      </div>
      <div className="flex items-end gap-1 h-20 mb-4">
        {bars.map((h, i) => (
          <div key={i} className={`flex-1 rounded-sm ${i % 3 === 0 ? "bg-blue-200" : "bg-red-200"}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button className="py-2 rounded-lg bg-red-500 text-white text-xs font-medium">매수</button>
        <button className="py-2 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium">매도</button>
      </div>
      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
        <span className="text-slate-400">평가손익</span>
        <span className="font-semibold text-red-500 tabular-nums">+12.4%</span>
      </div>
    </BrowserChrome>
  );
}

function CommunityMockup() {
  const posts = [
    { company: "삼성전자", tag: "005930", q: "이번 분기 HBM 매출 비중, 다음 분기에도 유지될까요?", replies: 3, resolved: true },
    { company: "카카오페이", tag: "377300", q: "CB 발행이 기존 주주에게 어떤 영향을 주나요?", replies: 1, resolved: false },
    { company: "HD현대중공업", tag: "329180", q: "LNG선 수주가 실제 실적엔 언제 반영되나요?", replies: 0, resolved: false },
  ];
  return (
    <BrowserChrome label="커뮤니티 · 질문과 답변">
      <div className="divide-y divide-slate-100">
        {posts.map((p, i) => (
          <div key={p.company} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]} text-white text-[10px] font-bold flex items-center justify-center`}>
              {p.company.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-semibold text-blue-600">{p.company}</span>
                <span className="text-[10px] text-slate-400 tabular-nums">{p.tag}</span>
              </div>
              <p className="text-xs text-slate-700 truncate">{p.q}</p>
            </div>
            <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.resolved ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-slate-100 text-slate-500"}`}>
              {p.resolved ? `답변 ${p.replies}` : "답변 대기"}
            </span>
          </div>
        ))}
      </div>
    </BrowserChrome>
  );
}

const WALKTHROUGH = [
  {
    eyebrow: "기업 분석",
    title: "공시를 검색하면, AI가 먼저 읽습니다",
    desc: "관심 기업을 검색하면 최신 공시부터 과거 분기까지 AI가 원문을 읽고 핵심 변화를 짚어드립니다.",
    bullets: [
      "실적·지배구조·리스크·경영진 발언까지 한 화면에서",
      "분기마다 무엇이 바뀌었는지 자동으로 비교",
      "모든 인사이트는 원문 근거와 함께 제공",
    ],
    link: "/company",
    cta: "기업 분석 시작하기",
    Mockup: CompanyMockup,
  },
  {
    eyebrow: "모의투자",
    title: "실제 돈 없이, 먼저 연습해보세요",
    desc: "실시간 시세를 기반으로 한 모의투자로, 실전에 들어가기 전에 전략을 검증할 수 있습니다.",
    bullets: [
      "실제 시세 기반 · 실제 돈은 전혀 사용하지 않음",
      "매수·매도 체결 후 즉시 손익 확인",
      "전략을 충분히 검증한 뒤 실전 투자로",
    ],
    link: "/trading",
    cta: "모의투자 해보기",
    Mockup: TradingMockup,
  },
  {
    eyebrow: "커뮤니티",
    title: "같은 기업을 보는 사람들과 의견을 나눕니다",
    desc: "공시와 분석 결과를 함께 보며, 종목별로 쌓이는 질문과 답변에 참여해보세요. 아직 시작하는 단계라, 지금 참여하면 초기 멤버가 됩니다.",
    bullets: [
      "종목별로 질문과 답변이 쌓이는 구조",
      "공시·분석 결과를 근거로 한 토론",
      "지금 커뮤니티를 만들어가는 초기 멤버가 되어보세요",
    ],
    link: "/community",
    cta: "커뮤니티 둘러보기",
    Mockup: CommunityMockup,
  },
];

export function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  return (
    <div className="flex flex-col flex-1">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium mb-6">
                AI 공시 분석 · 모의투자 · 투자자 커뮤니티
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.2] mb-5">
                DART 원문 그대로,<br />
                <span className="text-blue-600">AI가 읽어드립니다</span>
              </h1>
              <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-lg">
                요약이 아닌 공시 원문을 근거로, 코스피·코스닥 3,200여 상장사의 핵심 변화를 찾아냅니다.
              </p>

              <HeroCta />

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> 금융감독원 DART 공식 데이터</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> 3,200+ 상장 기업</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> 모든 분석에 원문 근거 제공</span>
              </div>

              <a
                href="#features"
                className={`mt-8 ${LINK_ACTION}`}
              >
                기능 미리보기 <ArrowRight size={15} />
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}>
              <HeroDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Credibility band ─────────────────────────────── */}
      <section className={`bg-slate-50 border-y border-slate-200 ${SECTION}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {CREDIBILITY_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-5 text-center"
              >
                <div className="text-xl font-semibold tabular-nums text-slate-900 mb-1">
                  <CredibilityStatValue stat={s} />
                </div>
                <div className="text-sm font-medium text-slate-600 mb-0.5">{s.label}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{s.sub}</div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 max-w-2xl mx-auto">
            숫자를 만들어내지 않습니다. 모든 AI 분석 결과는 실제 공시 원문 문장을 근거로 제시하며,
            근거를 직접 확인할 수 있습니다.
          </p>
        </div>
      </section>

      {/* ── Data coverage — real KOSPI/KOSDAQ companies as social proof ── */}
      <section className="bg-white py-16 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <div className={EYEBROW}>데이터 커버리지</div>
          <h2 className={SECTION_TITLE}>코스피·코스닥 상장사 전체를 분석합니다</h2>
        </div>
        <CompanyMarquee />
      </section>

      {/* ── Product walkthrough — real UI mockups per feature ── */}
      <section id="features" className={`bg-slate-50 border-y border-slate-200 ${SECTION}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="text-center mb-14"
          >
            <div className={EYEBROW}>이용 흐름</div>
            <h2 className={`${SECTION_TITLE} mb-3`}>분석하고, 연습하고, 함께 검증합니다</h2>
            <p className={`${SECTION_DESC} max-w-xl mx-auto`}>하나로 이어지는 투자 리서치 흐름입니다.</p>
          </motion.div>

          <div className="space-y-24">
            {WALKTHROUGH.map((item, i) => {
              const Mockup = item.Mockup;
              return (
                <div key={item.eyebrow} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={i % 2 === 1 ? "lg:order-2" : ""}
                  >
                    <div className={EYEBROW}>0{i + 1} · {item.eyebrow}</div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                    <p className={`${SECTION_DESC} mb-6`}>{item.desc}</p>
                    <ul className="space-y-2.5 mb-8">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                          <Check size={15} className="mt-0.5 text-blue-500 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link to={item.link} className={LINK_ACTION}>
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
      <section className={`bg-white ${SECTION}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <div className={EYEBROW}>실시간 공시 피드</div>
              <h2 className={SECTION_TITLE}>오늘의 주요 공시</h2>
              <p className={`${SECTION_DESC} mt-2`}>AI가 분석한 오늘의 핵심 공시를 가장 빠르게 확인하세요.</p>
            </div>
            <Link to="/disclosure" className={`hidden sm:flex ${LINK_ACTION}`}>
              전체 보기 <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className="rounded-xl border border-slate-200 bg-white p-2" role="feed" aria-label="오늘의 주요 공시 목록" aria-live="polite">
            <div className="divide-y divide-slate-100">
              {RECENT_DISCLOSURES.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.25 }}>
                  <Link to={`/disclosure/${d.id}`} className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-md transition-colors">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]}`}>
                      {avatarLabel({ name: d.company })}
                    </span>
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm font-semibold text-slate-900">{d.company}</div>
                      <div className="text-xs text-slate-400 tabular-nums">{d.code}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-medium truncate group-hover:text-slate-900 transition-colors">{d.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{d.type}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400 tabular-nums">{d.time}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Analysis lenses — grounded in the same real Samsung filing as the hero ── */}
      <section className={`bg-slate-50 border-y border-slate-200 ${SECTION}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="text-center mb-10"
          >
            <div className={EYEBROW}>하나의 공시, 4가지 시선</div>
            <h2 className={`${SECTION_TITLE} mb-3`}>같은 보고서에서 이만큼 찾아냅니다</h2>
            <p className={`${SECTION_DESC} max-w-2xl mx-auto`}>
              위 예시와 같은 {heroDemo.company.name} 보고서 하나에서, AI는 재무·경영·리스크·지배구조 네 가지 관점의 변화를 함께 짚어냅니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {heroFindingsByLens.map((item, i) => {
              const style = LENS_STYLE[item.scoreComponent];
              return (
                <motion.div
                  key={item.scoreComponent}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                  className={`flex flex-col rounded-xl border border-slate-200 border-l-4 bg-white p-5 ${style.border}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">{style.icon}</span>
                    <h3 className="text-sm font-semibold text-slate-800">{item.label}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 mb-3">{item.summary}</p>
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
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            무료로 시작해서, 필요할 때 Pro로.{" "}
            <Link to="/subscription" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
              요금제 살펴보기 →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className={`${CTA_SECTION} ${SECTION}`}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">지금 시작하세요</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-10 max-w-lg mx-auto leading-relaxed">
            DART 공시 기반 AI 분석부터 모의투자까지 — 무료로 가입하고 바로 이용해보세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => navigate("/company")}
                className="px-6 py-2.5 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                기업 분석 시작하기
              </button>
            ) : (
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                무료 회원가입
              </Link>
            )}
            <Link
              to="/trading"
              className="px-6 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
            >
              모의투자 먼저 해보기 <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
