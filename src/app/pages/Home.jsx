import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Search, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight, Lightbulb, TrendingUp, Landmark, AlertTriangle, ShieldCheck, Check } from "lucide-react";
import { heroDemo, heroFindingsByLens } from "../../mocks/landing/heroDemo";
import { topKospiCompanies } from "../../mocks/companyAnalysis/topKospi";
import { topKosdaqCompanies } from "../../mocks/companyAnalysis/topKosdaq";

const SECTION = "py-20 px-4 sm:px-6 lg:px-8";

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

const TICKERS = [
  { name: "삼성전자", code: "005930", price: 73400, change: 1.32, up: true },
  { name: "SK하이닉스", code: "000660", price: 198500, change: 2.87, up: true },
  { name: "LG에너지솔루션", code: "373220", price: 361000, change: -1.09, up: false },
  { name: "삼성바이오로직스", code: "207940", price: 892000, change: 0.45, up: true },
  { name: "현대차", code: "005380", price: 251000, change: -0.79, up: false },
  { name: "NAVER", code: "035420", price: 195500, change: 1.55, up: true },
  { name: "카카오", code: "035720", price: 41050, change: -2.13, up: false },
  { name: "셀트리온", code: "068270", price: 178500, change: 3.22, up: true },
  { name: "POSCO홀딩스", code: "005490", price: 312000, change: -0.32, up: false },
  { name: "KB금융", code: "105560", price: 87800, change: 0.92, up: true },
];

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

function TickerBar() {
  const doubled = [...TICKERS, ...TICKERS];
  return (
    <div className="bg-slate-900 border-b border-slate-700 overflow-hidden py-2.5 select-none" role="region" aria-label="실시간 시세 (참고용, 지연 시세)">
      <div className="flex gap-0" style={{ animation: "ticker 40s linear infinite" }} aria-hidden="true">
        {doubled.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-slate-700 flex-shrink-0">
            <span className="text-slate-300 text-xs font-medium whitespace-nowrap">{t.name}</span>
            <span className="text-white text-xs font-bold tabular-nums">{t.price.toLocaleString()}</span>
            <span className={`text-xs font-bold tabular-nums flex items-center gap-0.5 ${t.up ? "text-red-400" : "text-blue-400"}`}>
              {t.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(t.change)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/company/${encodeURIComponent(query.trim())}`);
  };
  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <label htmlFor="home-company-search" className="sr-only">기업명 또는 종목코드 검색</label>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        id="home-company-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-md text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        placeholder="기업명 또는 종목코드 검색 (예: 삼성전자, 005930)"
      />
      <button
        type="submit"
        className="absolute right-2 top-2 bottom-2 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
      >
        분석하기
      </button>
    </form>
  );
}

function HeroDemo() {
  const [tab, setTab] = useState("before");
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
        <div>
          <span className="text-sm font-semibold text-slate-900">{heroDemo.company.name}</span>
          <span className="ml-1.5 text-xs text-slate-500 tabular-nums">{heroDemo.company.ticker}</span>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 border border-blue-200">
          AI 분석 예시
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

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-slate-100">
        <div className={`${tab === "before" ? "block" : "hidden"} lg:block p-5`}>
          <div className="text-xs font-medium text-slate-400 mb-2">{heroDemo.before.sectionLabel}</div>
          <p className="text-xs text-slate-600 leading-relaxed max-h-56 overflow-y-auto custom-scrollbar pr-2">
            {heroDemo.before.text.split(heroDemo.before.highlight ?? "###").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <mark className="bg-blue-100 text-blue-800 rounded px-0.5">{heroDemo.before.highlight}</mark>}
              </span>
            ))}
          </p>
        </div>

        <div className={`${tab === "after" ? "block" : "hidden"} lg:block p-5`}>
          <div className="flex gap-2 rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2.5 mb-3">
            <Lightbulb size={14} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-xs leading-relaxed text-slate-700">
              <span className="font-semibold text-blue-700">AI 요약. </span>
              {heroDemo.finding.summary}
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {heroDemo.hops.map((h) => (
              <div key={h.sectionLabel} className="py-1.5 text-xs text-slate-500 leading-snug">
                <span className="font-medium text-slate-600">{h.sectionLabel}</span> — {h.excerpt}
              </div>
            ))}
          </div>
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
    <div className="flex items-center gap-2 flex-shrink-0 rounded-full border border-slate-200 bg-white pl-2 pr-4 py-1.5">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white ${AVATAR_PALETTE[index % AVATAR_PALETTE.length]}`}>
        {avatarLabel(company)}
      </span>
      <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{company.name}</span>
    </div>
  );
}

function CompanyMarquee() {
  const rowA = [...topKospiCompanies, ...topKospiCompanies];
  const rowB = [...topKosdaqCompanies, ...topKosdaqCompanies];
  return (
    <div className="overflow-hidden space-y-3" aria-hidden="true">
      <div className="flex gap-3 w-max" style={{ animation: "marquee 38s linear infinite" }}>
        {rowA.map((c, i) => <CompanyBadge key={`kospi-${c.id}-${i}`} company={c} index={i} />)}
      </div>
      <div className="flex gap-3 w-max" style={{ animation: "marquee-reverse 38s linear infinite" }}>
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
            <span className="font-bold text-slate-900">삼성전자</span>
            <span className="text-xs text-slate-400 tabular-nums">005930</span>
            <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-1.5 py-0.5">KOSPI</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">반도체·전자제품</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">AI 종합 스코어</div>
          <div className="text-xl font-bold text-blue-600 tabular-nums">78</div>
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
          <div className="font-bold text-slate-900">삼성전자</div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">73,400<span className="text-xs font-medium text-slate-400 ml-1">원</span></div>
        </div>
        <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1">모의투자 · 실제 돈 아님</span>
      </div>
      <div className="flex items-end gap-1 h-20 mb-4">
        {bars.map((h, i) => (
          <div key={i} className={`flex-1 rounded-sm ${i % 3 === 0 ? "bg-blue-200" : "bg-red-200"}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button className="py-2 rounded-lg bg-red-500 text-white text-xs font-bold">매수</button>
        <button className="py-2 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold">매도</button>
      </div>
      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
        <span className="text-slate-400">평가손익</span>
        <span className="font-bold text-red-500 tabular-nums">+12.4%</span>
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
  return (
    <div className="flex flex-col flex-1">
      <TickerBar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 40%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(59,130,246,0.05) 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-6">
                AI 공시 분석 · 모의투자 · 투자자 커뮤니티
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-5">
                50페이지 공시,<br />
                <span className="text-blue-600">이렇게 읽습니다</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                DART 공시 원문을 AI가 읽고 핵심 변화를 짚어드립니다. 오른쪽은 삼성전자의
                실제 2026년 1분기 보고서로 만든 예시입니다.
              </p>

              <SearchBar />

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> DART 실시간 연동</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> 3,200+ 상장 기업</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> 무료로 시작 가능</span>
              </div>

              <button
                onClick={() => navigate("/company")}
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                무료로 둘러보기 <ArrowRight size={15} />
              </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "등록 기업 수", value: "3,200+", sub: "유가증권 + 코스닥 전 종목" },
              { label: "분석된 공시 건수", value: "2,840,000+", sub: "DART 전체 공시 커버" },
              { label: "분석 방식", value: "DART 원문 기반", sub: "요약이 아니라 원문 근거를 함께 제시" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
                className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-center"
              >
                <div className="text-2xl font-bold tabular-nums text-slate-900 mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-blue-600 mb-0.5">{s.label}</div>
                <div className="text-xs text-slate-400">{s.sub}</div>
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
      <section className="bg-white py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">데이터 커버리지</div>
          <h2 className="text-2xl font-extrabold text-slate-900">코스피·코스닥 상장사 전체를 분석합니다</h2>
        </div>
        <CompanyMarquee />
      </section>

      {/* ── Product walkthrough — real UI mockups per feature ── */}
      <section className={`bg-slate-50 border-y border-slate-200 ${SECTION}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="text-center mb-16"
          >
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">이용 흐름</div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">분석하고, 연습하고, 함께 검증합니다</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">하나로 이어지는 투자 리서치 흐름입니다.</p>
          </motion.div>

          <div className="space-y-20">
            {WALKTHROUGH.map((item, i) => {
              const Mockup = item.Mockup;
              return (
                <div key={item.eyebrow} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={i % 2 === 1 ? "lg:order-2" : ""}
                  >
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">0{i + 1} · {item.eyebrow}</div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-500 mb-5 leading-relaxed">{item.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check size={15} className="mt-0.5 text-blue-500 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link to={item.link} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
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
            className="flex items-end justify-between mb-6"
          >
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">실시간 공시 피드</div>
              <h2 className="text-3xl font-extrabold text-slate-900">오늘의 주요 공시</h2>
              <p className="text-slate-500 mt-1">AI가 분석한 오늘의 핵심 공시를 가장 빠르게 확인하세요.</p>
            </div>
            <Link to="/disclosure" className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              전체 보기 <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className="rounded-lg border border-slate-200 bg-white p-2" role="feed" aria-label="오늘의 주요 공시 목록" aria-live="polite">
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
            className="text-center mb-12"
          >
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">하나의 공시, 4가지 시선</div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">같은 보고서에서 이만큼 찾아냅니다</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              위 예시와 같은 {heroDemo.company.name} 보고서 하나에서, AI는 재무·경영·리스크·지배구조 네 가지 관점의 변화를 함께 짚어냅니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {heroFindingsByLens.map((item, i) => {
              const style = LENS_STYLE[item.scoreComponent];
              return (
                <motion.div
                  key={item.scoreComponent}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                  className={`flex flex-col rounded-lg border border-slate-200 border-l-4 bg-white p-4 ${style.border}`}
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
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-600">
            무료로 시작해서, 필요할 때 Pro로.{" "}
            <Link to="/subscription" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              요금제 살펴보기 →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className={`bg-blue-600 ${SECTION}`}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">지금 확인해보세요</h2>
          <p className="text-blue-100 text-lg mb-10">
            회원가입 없이 기업 검색부터, 실제 돈 없이 모의투자까지 — 먼저 둘러본 뒤 결정하세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/company")}
              className="px-8 py-4 bg-white text-blue-700 font-extrabold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              기업 분석 무료로 시작하기
            </button>
            <Link
              to="/trading"
              className="px-8 py-4 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              모의투자 먼저 해보기 <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
