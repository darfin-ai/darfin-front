import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Search, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight, Lightbulb, TrendingUp, Landmark, AlertTriangle, ShieldCheck } from "lucide-react";
import { heroDemo, heroFindingsByLens } from "../../mocks/landing/heroDemo";

const SECTION = "py-20 px-4 sm:px-6 lg:px-8";

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
  { id: 1, company: "삼성전자", code: "005930", type: "분기보고서", title: "2026년 1분기 분기보고서 (주요 실적: 영업이익 7.8조 원)", time: "09:12", tag: "실적", severity: "positive" },
  { id: 2, company: "에코프로비엠", code: "247540", type: "주요사항보고서", title: "타법인 주식 및 출자증권 취득결정 (2,400억 규모 헝가리 법인 투자)", time: "09:31", tag: "투자", severity: "neutral" },
  { id: 3, company: "카카오페이", code: "377300", type: "주요사항보고서", title: "전환사채 발행 결정 (500억 규모, CB 희석 주의)", time: "10:05", tag: "고위험", severity: "negative" },
  { id: 4, company: "HD현대중공업", code: "329180", type: "수시공시", title: "대규모 LNG선 수주 계약 체결 — 총 계약금액 2.3조 원", time: "10:48", tag: "수주", severity: "positive" },
  { id: 5, company: "셀트리온", code: "068270", type: "주요사항보고서", title: "자기주식 취득 결정 (1,200억 규모 자사주 매입 공시)", time: "11:22", tag: "주주환원", severity: "positive" },
  { id: 6, company: "한화에어로스페이스", code: "012450", type: "수시공시", title: "방위산업 수출 계약 체결 — 폴란드 향 계약금액 4,200억", time: "13:05", tag: "수주", severity: "positive" },
];

const DISCLOSURE_SEVERITY = {
  positive: { border: "border-l-blue-400", dot: "bg-blue-400" },
  negative: { border: "border-l-red-400", dot: "bg-red-400" },
  neutral: { border: "border-l-slate-300", dot: "bg-slate-300" },
};

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

      {/* ── Workflow ─────────────────────────────────────── */}
      <section className={`bg-white ${SECTION}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="text-center mb-12"
          >
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">이용 흐름</div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">분석하고, 연습하고, 함께 검증합니다</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">하나로 이어지는 투자 리서치 흐름입니다.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[22px] left-[16.5%] right-[16.5%] h-px bg-slate-200 z-0" />
            {[
              { n: 1, title: "분석한다", desc: "관심 기업의 공시를 AI가 읽고, 원문 근거와 함께 핵심 변화를 짚어드립니다.", link: "/company", cta: "기업 분석 보기" },
              { n: 2, title: "연습한다", desc: "실제 돈 없이 모의투자로 전략을 먼저 검증합니다.", link: "/trading", cta: "모의투자 해보기" },
              { n: 3, title: "함께 검증한다", desc: "같은 기업을 보는 다른 투자자와 의견을 나눕니다.", link: "/community", cta: "커뮤니티 보기" },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -3 }}
                className="relative z-10"
              >
                <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-4 mx-auto">
                  {step.n}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center transition-shadow hover:shadow-md h-full">
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{step.desc}</p>
                  <Link to={step.link} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    {step.cta} <ChevronRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Disclosures ──────────────────────── */}
      <section className={`bg-slate-50 border-y border-slate-200 ${SECTION}`}>
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
              {RECENT_DISCLOSURES.map((d, i) => {
                const sev = DISCLOSURE_SEVERITY[d.severity];
                return (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.25 }}>
                    <Link to={`/disclosure/${d.id}`} className={`group flex items-center gap-4 p-3 border-l-4 ${sev.border} hover:bg-slate-50 rounded-md transition-colors`}>
                      <div className="w-28 flex-shrink-0">
                        <div className="text-sm font-semibold text-slate-900">{d.company}</div>
                        <div className="text-xs text-slate-400 tabular-nums">{d.code}</div>
                      </div>
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                        {d.tag}
                      </span>
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
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Analysis lenses — grounded in the same real Samsung filing as the hero ── */}
      <section className={`bg-white ${SECTION}`}>
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

      {/* ── Community (soft-launch framing) ─────────────── */}
      <section className={`bg-slate-50 border-y border-slate-200 ${SECTION}`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">커뮤니티</div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">지금 함께 만들어가는 커뮤니티</h2>
            <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
              아직 시작하는 단계입니다. 관심 기업에 대해 이런 질문을 나눌 수 있어요.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { company: "삼성전자", q: "이번 분기 HBM 매출 비중, 다음 분기에도 유지될까요?" },
              { company: "카카오페이", q: "CB 발행이 기존 주주에게 어떤 영향을 주나요?" },
              { company: "HD현대중공업", q: "LNG선 수주가 실제 실적엔 언제 반영되나요?" },
            ].map((item, i) => (
              <motion.div
                key={item.company}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -3 }}
                className="rounded-xl border border-slate-200 bg-white p-5 text-left transition-shadow hover:shadow-md"
              >
                <div className="text-xs font-semibold text-blue-600 mb-2">{item.company}</div>
                <p className="text-sm text-slate-700 leading-relaxed">{item.q}</p>
                <p className="text-xs text-slate-400 mt-3">예시 질문</p>
              </motion.div>
            ))}
          </div>

          <Link to="/community" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            질문 둘러보기 <ChevronRight size={16} />
          </Link>
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
