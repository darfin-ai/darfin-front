import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import {
  Sparkles,
  Database,
  Cpu,
  BarChart,
  AlertTriangle,
  TrendingUp,
  Activity,
  ShieldCheck,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  MessageSquare,
  Zap,
  CheckCircle2,
  BarChart2,
  Bell
} from "lucide-react";
const TICKERS = [
  { name: "\uC0BC\uC131\uC804\uC790", code: "005930", price: 73400, change: 1.32, up: true },
  { name: "SK\uD558\uC774\uB2C9\uC2A4", code: "000660", price: 198500, change: 2.87, up: true },
  { name: "LG\uC5D0\uB108\uC9C0\uC194\uB8E8\uC158", code: "373220", price: 361e3, change: -1.09, up: false },
  { name: "\uC0BC\uC131\uBC14\uC774\uC624\uB85C\uC9C1\uC2A4", code: "207940", price: 892e3, change: 0.45, up: true },
  { name: "\uD604\uB300\uCC28", code: "005380", price: 251e3, change: -0.79, up: false },
  { name: "NAVER", code: "035420", price: 195500, change: 1.55, up: true },
  { name: "\uCE74\uCE74\uC624", code: "035720", price: 41050, change: -2.13, up: false },
  { name: "\uC140\uD2B8\uB9AC\uC628", code: "068270", price: 178500, change: 3.22, up: true },
  { name: "POSCO\uD640\uB529\uC2A4", code: "005490", price: 312e3, change: -0.32, up: false },
  { name: "KB\uAE08\uC735", code: "105560", price: 87800, change: 0.92, up: true }
];
const RECENT_DISCLOSURES = [
  { id: 1, company: "\uC0BC\uC131\uC804\uC790", code: "005930", type: "\uBD84\uAE30\uBCF4\uACE0\uC11C", title: "2026\uB144 1\uBD84\uAE30 \uBD84\uAE30\uBCF4\uACE0\uC11C (\uC8FC\uC694 \uC2E4\uC801: \uC601\uC5C5\uC774\uC775 7.8\uC870 \uC6D0)", time: "09:12", tag: "\uC2E4\uC801", tagColor: "bg-blue-100 text-blue-700", severity: "positive" },
  { id: 2, company: "\uC5D0\uCF54\uD504\uB85C\uBE44\uC5E0", code: "247540", type: "\uC8FC\uC694\uC0AC\uD56D\uBCF4\uACE0\uC11C", title: "\uD0C0\uBC95\uC778 \uC8FC\uC2DD \uBC0F \uCD9C\uC790\uC99D\uAD8C \uCDE8\uB4DD\uACB0\uC815 (2,400\uC5B5 \uADDC\uBAA8 \uD5DD\uAC00\uB9AC \uBC95\uC778 \uD22C\uC790)", time: "09:31", tag: "\uD22C\uC790", tagColor: "bg-violet-100 text-violet-700", severity: "neutral" },
  { id: 3, company: "\uCE74\uCE74\uC624\uD398\uC774", code: "377300", type: "\uC8FC\uC694\uC0AC\uD56D\uBCF4\uACE0\uC11C", title: "\uC804\uD658\uC0AC\uCC44 \uBC1C\uD589 \uACB0\uC815 (500\uC5B5 \uADDC\uBAA8, CB \uD76C\uC11D \uC8FC\uC758)", time: "10:05", tag: "\uACE0\uC704\uD5D8", tagColor: "bg-red-100 text-red-600", severity: "negative" },
  { id: 4, company: "HD\uD604\uB300\uC911\uACF5\uC5C5", code: "329180", type: "\uC218\uC2DC\uACF5\uC2DC", title: "\uB300\uADDC\uBAA8 LNG\uC120 \uC218\uC8FC \uACC4\uC57D \uCCB4\uACB0 \u2014 \uCD1D \uACC4\uC57D\uAE08\uC561 2.3\uC870 \uC6D0", time: "10:48", tag: "\uC218\uC8FC", tagColor: "bg-emerald-100 text-emerald-700", severity: "positive" },
  { id: 5, company: "\uC140\uD2B8\uB9AC\uC628", code: "068270", type: "\uC8FC\uC694\uC0AC\uD56D\uBCF4\uACE0\uC11C", title: "\uC790\uAE30\uC8FC\uC2DD \uCDE8\uB4DD \uACB0\uC815 (1,200\uC5B5 \uADDC\uBAA8 \uC790\uC0AC\uC8FC \uB9E4\uC785 \uACF5\uC2DC)", time: "11:22", tag: "\uC8FC\uC8FC\uD658\uC6D0", tagColor: "bg-teal-100 text-teal-700", severity: "positive" },
  { id: 6, company: "\uD55C\uD654\uC5D0\uC5B4\uB85C\uC2A4\uD398\uC774\uC2A4", code: "012450", type: "\uC218\uC2DC\uACF5\uC2DC", title: "\uBC29\uC704\uC0B0\uC5C5 \uC218\uCD9C \uACC4\uC57D \uCCB4\uACB0 \u2014 \uD3F4\uB780\uB4DC \uD5A5 \uACC4\uC57D\uAE08\uC561 4,200\uC5B5", time: "13:05", tag: "\uC218\uC8FC", tagColor: "bg-emerald-100 text-emerald-700", severity: "positive" }
];
const STATS = [
  { label: "\uBD84\uC11D\uB41C \uACF5\uC2DC \uAC74\uC218", value: "2,840,000+", sub: "DART \uC804\uCCB4 \uACF5\uC2DC \uCEE4\uBC84" },
  { label: "\uB4F1\uB85D \uAE30\uC5C5 \uC218", value: "3,200+", sub: "\uC720\uAC00\uC99D\uAD8C + \uCF54\uC2A4\uB2E5 \uC804 \uC885\uBAA9" },
  { label: "\uC6D4\uAC04 \uD65C\uC131 \uC774\uC6A9\uC790", value: "48,000+", sub: "\uAC1C\uC778 \uD22C\uC790\uC790 \xB7 \uAE30\uAD00 \uD3EC\uD568" },
  { label: "AI \uC694\uC57D \uC815\uD655\uB3C4", value: "94.7%", sub: "\uC804\uBB38\uAC00 \uAC80\uC99D \uAE30\uC900" }
];
const FEATURES = [
  {
    icon: <Sparkles size={22} />,
    color: "bg-blue-600",
    title: "AI \uACF5\uC2DC \uC694\uC57D \uB9AC\uD3EC\uD2B8",
    desc: "Gemini AI\uAC00 \uC218\uC2ED \uD398\uC774\uC9C0 \uACF5\uC2DC\uB97C 3\uC904 \uD575\uC2EC \uC694\uC57D + \uAE0D\uC815/\uBD80\uC815 \uC2DC\uADF8\uB110\uB85C \uC815\uB9AC\uD569\uB2C8\uB2E4.",
    link: "/company"
  },
  {
    icon: <BookOpen size={22} />,
    color: "bg-indigo-600",
    title: "\uACF5\uC2DC \uC6D0\uBB38 \uC2A4\uB9C8\uD2B8 \uBDF0\uC5B4",
    desc: "\uD575\uC2EC \uBB38\uC7A5 \uC790\uB3D9 \uD558\uC774\uB77C\uC774\uD2B8, \uC804\uBB38\uC6A9\uC5B4 \uC989\uC2DC \uD574\uC124 \uD1A0\uAE00, \uC870\uD56D\uBCC4 \uBD81\uB9C8\uD06C \uAE30\uB2A5 \uC81C\uACF5.",
    link: "/disclosure"
  },
  {
    icon: <BarChart2 size={22} />,
    color: "bg-emerald-600",
    title: "\uAE30\uC5C5 \uC7AC\uBB34 \uCC28\uD2B8 \uBD84\uC11D",
    desc: "\uB9E4\uCD9C\xB7\uC601\uC5C5\uC774\uC775\xB7\uBD80\uCC44\uBE44\uC728 \uB4F1\uC744 \uC778\uD130\uB799\uD2F0\uBE0C Recharts \uCC28\uD2B8\uB85C \uC2DC\uAC01\uD654\uD558\uACE0 \uC0B0\uC5C5 \uD3C9\uADE0\uACFC \uBE44\uAD50\uD569\uB2C8\uB2E4.",
    link: "/company"
  },
  {
    icon: <TrendingUp size={22} />,
    color: "bg-violet-600",
    title: "\uBAA8\uC758\uD22C\uC790 \uC2DC\uBBAC\uB808\uC774\uD130",
    desc: "\uC2E4\uC81C \uC2DC\uC138 \uAE30\uBC18 \uAC00\uC0C1 \uD3EC\uD2B8\uD3F4\uB9AC\uC624\uB85C \uC804\uB7B5\uC744 \uAC80\uC99D\uD558\uACE0, AI\uAC00 \uACF5\uC2DC \uAE30\uBC18 \uB9E4\uB9E4 \uD0C0\uC774\uBC0D\uC744 \uC81C\uC548\uD569\uB2C8\uB2E4.",
    link: "/trading"
  },
  {
    icon: <Bell size={22} />,
    color: "bg-amber-500",
    title: "\uAD00\uC2EC \uAE30\uC5C5 \uACF5\uC2DC \uC54C\uB9BC",
    desc: "\uC990\uACA8\uCC3E\uB294 \uAE30\uC5C5\uC5D0 \uC0C8 \uACF5\uC2DC\uAC00 \uB4F1\uB85D\uB418\uBA74 \uC989\uC2DC \uC54C\uB9BC, AI \uAE34\uAE09\uB3C4 \uC2A4\uCF54\uC5B4\uC640 \uD568\uAED8 \uC81C\uACF5\uB429\uB2C8\uB2E4.",
    link: "/mypage"
  },
  {
    icon: <MessageSquare size={22} />,
    color: "bg-rose-500",
    title: "\uD22C\uC790\uC790 \uCEE4\uBBA4\uB2C8\uD2F0",
    desc: "\uACF5\uC2DC \uBD84\uC11D \uACB0\uACFC\uB97C \uACF5\uC720\uD558\uACE0 \uB2E4\uB978 \uD22C\uC790\uC790\uC640 \uC778\uC0AC\uC774\uD2B8\uB97C \uAD50\uD658\uD558\uB294 \uC804\uBB38 \uD22C\uC790 \uCEE4\uBBA4\uB2C8\uD2F0.",
    link: "/community"
  }
];
function TickerBar() {
  const ref = useRef(null);
  const doubled = [...TICKERS, ...TICKERS];
  return <div className="bg-slate-900 border-b border-slate-700 overflow-hidden py-2.5 select-none">
      <div ref={ref} className="flex gap-0" style={{ animation: "ticker 40s linear infinite" }}>
        {doubled.map((t, i) => <div key={i} className="flex items-center gap-2 px-6 border-r border-slate-700 flex-shrink-0">
            <span className="text-slate-300 text-xs font-medium whitespace-nowrap">{t.name}</span>
            <span className="text-white text-xs font-bold font-mono">{t.price.toLocaleString()}</span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${t.up ? "text-red-400" : "text-blue-400"}`}>
              {t.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(t.change)}%
            </span>
          </div>)}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>;
}
function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/company/${encodeURIComponent(query.trim())}`);
  };
  return <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
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
    </form>;
}
export function Home() {
  const navigate = useNavigate();
  return <div className="flex flex-col flex-1">

      {
    /* Ticker Bar */
  }
      <TickerBar />

      {
    /* ── Hero ─────────────────────────────────────────── */
  }
      <section className="relative bg-white overflow-hidden">
        {
    /* subtle grid bg */
  }
        <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: "radial-gradient(circle at 70% 40%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(16,185,129,0.06) 0%, transparent 50%)"
    }}
  />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {
    /* Left: Copy */
  }
            <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6">
                <Sparkles size={13} />
                Gemini AI 기반 지능형 공시 분석 플랫폼
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-5">
                어려운 금융 공시,<br />
                <span className="text-slate-900">AI로 3초 만에</span><br />
                <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">꽂히게 이해하기</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                DART 공시 원문을 Gemini AI가 읽고 핵심 시그널, 재무 지표, 리스크를 즉시 분석합니다.
                더 이상 수십 페이지 문서를 혼자 헤매지 마세요.
              </p>

              <SearchBar />

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-500" /> DART 실시간 연동</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-500" /> 3,200+ 상장 기업</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-500" /> 무료로 시작 가능</span>
              </div>
            </motion.div>

            {
    /* Right: Live Dashboard Preview */
  }
            <motion.div
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
    className="hidden lg:block"
  >
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                {
    /* mini header */
  }
                <div className="bg-slate-900 px-5 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-slate-400 text-xs font-mono">darfin.ai · 삼성전자 AI 분석</span>
                </div>

                {
    /* content */
  }
                <div className="p-5 space-y-4">
                  {
    /* company header */
  }
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-slate-900">삼성전자</span>
                        <span className="text-xs text-slate-500 font-mono">005930</span>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">KOSPI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-slate-900">73,400원</span>
                        <span className="text-sm font-bold text-red-500 flex items-center gap-0.5">
                          <ArrowUpRight size={14} /> +1.32%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-0.5">AI 종합 스코어</div>
                      <div className="text-2xl font-extrabold text-emerald-600">78</div>
                      <div className="text-[10px] text-slate-400">/ 100</div>
                    </div>
                  </div>

                  {
    /* signal pills */
  }
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <TrendingUp size={11} /> HBM 수주 확대
                    </span>
                    <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> 영업이익 흑자 전환
                    </span>
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <AlertTriangle size={11} /> 파운드리 경쟁 심화
                    </span>
                  </div>

                  {
    /* ai summary box */
  }
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={13} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-600">AI 핵심 요약</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      2026년 1분기 영업이익 <strong>7.8조 원</strong>으로 전분기 대비 31% 개선. HBM3E 공급 확대와 파운드리 가동률 회복이 주요 긍정 요인. 다만 레거시 DRAM 가격 하락 압력은 지속.
                    </p>
                  </div>

                  {
    /* mini metric row */
  }
                  <div className="grid grid-cols-3 gap-2">
                    {[
    { label: "PER", value: "18.2x", color: "text-slate-900" },
    { label: "PBR", value: "1.4x", color: "text-slate-900" },
    { label: "\uBC30\uB2F9\uC218\uC775\uB960", value: "2.1%", color: "text-emerald-600" }
  ].map((m) => <div key={m.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <div className="text-xs text-slate-500 mb-0.5">{m.label}</div>
                        <div className={`text-sm font-extrabold ${m.color}`}>{m.value}</div>
                      </div>)}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {
    /* ── Stats Bar ─────────────────────────────────── */
  }
      <section className="bg-slate-900 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => <motion.div
    key={s.label}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.1, duration: 0.5 }}
    className="text-center"
  >
              <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-blue-400 mb-0.5">{s.label}</div>
              <div className="text-xs text-slate-500">{s.sub}</div>
            </motion.div>)}
        </div>
      </section>

      {
    /* ── Latest Disclosures ──────────────────────── */
  }
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="flex items-end justify-between mb-8"
  >
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">실시간 공시 피드</div>
              <h2 className="text-3xl font-extrabold text-slate-900">오늘의 주요 공시</h2>
              <p className="text-slate-500 mt-1">AI가 분석한 오늘의 핵심 공시를 가장 빠르게 확인하세요.</p>
            </div>
            <Link
    to="/disclosure"
    className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
  >
              전체 보기 <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className="space-y-3">
            {RECENT_DISCLOSURES.map((d, i) => <motion.div
    key={d.id}
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.07, duration: 0.4 }}
  >
                <Link
    to={`/disclosure/${d.id}`}
    className="group flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all"
  >
                  {
    /* severity dot */
  }
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.severity === "positive" ? "bg-red-500" : d.severity === "negative" ? "bg-blue-500" : "bg-slate-400"}`} />

                  {
    /* company */
  }
                  <div className="w-28 flex-shrink-0">
                    <div className="text-sm font-bold text-slate-900">{d.company}</div>
                    <div className="text-xs text-slate-400 font-mono">{d.code}</div>
                  </div>

                  {
    /* tag */
  }
                  <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${d.tagColor}`}>
                    {d.tag}
                  </span>

                  {
    /* title */
  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium truncate group-hover:text-slate-900 transition-colors">
                      {d.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.type}</p>
                  </div>

                  {
    /* time + arrow */
  }
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 font-mono">{d.time}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              </motion.div>)}
          </div>
        </div>
      </section>

      {
    /* ── Features Grid ───────────────────────────── */
  }
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="text-center mb-12"
  >
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">주요 기능</div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">투자에 필요한 모든 것</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">공시 분석부터 포트폴리오 시뮬레이션, 커뮤니티까지 — 투자 리서치의 시작과 끝을 함께합니다.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => <motion.div
    key={f.title}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.08, duration: 0.5 }}
  >
                <Link
    to={f.link}
    className="group block bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all h-full"
  >
                  <div className={`w-11 h-11 ${f.color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    자세히 보기 <ChevronRight size={13} />
                  </div>
                </Link>
              </motion.div>)}
          </div>
        </div>
      </section>

      {
    /* ── Analysis Pipeline ───────────────────────── */
  }
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="text-center mb-14"
  >
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">분석 파이프라인</div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">어떻게 분석하나요?</h2>
            <p className="text-lg text-slate-500">DART 공시가 등록되는 순간부터 AI 리포트 생성까지, 4단계 자동화 프로세스.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {
    /* connector */
  }
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 via-emerald-200 to-amber-200 z-0" />

            {[
    { icon: <Database size={28} />, bg: "bg-blue-100", color: "text-blue-600", ring: "ring-blue-200", n: "01", title: "\uACF5\uC2DC \uC218\uC9D1", desc: "DART Open API\uB85C \uC815\uAE30\xB7\uC218\uC2DC\xB7\uC8FC\uC694\uC0AC\uD56D \uACF5\uC2DC\uB97C \uC2E4\uC2DC\uAC04 \uD06C\uB864\uB9C1\uD569\uB2C8\uB2E4." },
    { icon: <Cpu size={28} />, bg: "bg-indigo-100", color: "text-indigo-600", ring: "ring-indigo-200", n: "02", title: "AI \uD30C\uC2F1", desc: "Gemini\uAC00 \uD45C\xB7\uC904\uAE00\uC744 \uC77D\uACE0 \uC218\uCE58\xB7\uC774\uBCA4\uD2B8\xB7\uB9AC\uC2A4\uD06C \uD0A4\uC6CC\uB4DC\uB97C \uCD94\uCD9C\uD569\uB2C8\uB2E4." },
    { icon: <Activity size={28} />, bg: "bg-emerald-100", color: "text-emerald-600", ring: "ring-emerald-200", n: "03", title: "\uC778\uC0AC\uC774\uD2B8 \uB3C4\uCD9C", desc: "\uACFC\uAC70 \uB370\uC774\uD130 \uBE44\uAD50\xB7\uC0B0\uC5C5 \uD3C9\uADE0 \uB300\uBE44 \uBD84\uC11D\uC73C\uB85C \uD22C\uC790 \uC2DC\uADF8\uB110\uC744 \uCC44\uC810\uD569\uB2C8\uB2E4." },
    { icon: <BarChart size={28} />, bg: "bg-amber-100", color: "text-amber-600", ring: "ring-amber-200", n: "04", title: "\uC2DC\uAC01\uD654 \uC81C\uACF5", desc: "\uC778\uD130\uB799\uD2F0\uBE0C \uCC28\uD2B8\xB7\uC694\uC57D \uB9AC\uD3EC\uD2B8\xB7\uC54C\uB9BC\uC73C\uB85C \uD22C\uC790\uC790\uC5D0\uAC8C \uC989\uC2DC \uC804\uB2EC\uB429\uB2C8\uB2E4." }
  ].map((step, i) => <motion.div
    key={step.n}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.12, duration: 0.5 }}
    className="relative z-10 bg-white rounded-2xl border border-slate-200 p-7 text-center hover:shadow-lg transition-shadow"
  >
                <div className={`w-16 h-16 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ${step.ring}`}>
                  {step.icon}
                </div>
                <div className="text-xs font-black text-slate-300 mb-1 tracking-widest">{step.n}</div>
                <h3 className="font-extrabold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {
    /* ── Risk Classification ─────────────────────── */
  }
      <section className="bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="text-center mb-12"
  >
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">분석 기준</div>
            <h2 className="text-3xl font-extrabold text-white mb-3">4가지 핵심 분석 기준</h2>
            <p className="text-lg text-slate-400">투자 판단에 직접 영향을 미치는 기준으로 모든 공시를 자동 분류합니다.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
    { icon: <AlertTriangle size={24} />, accent: "border-red-500/40 hover:border-red-500/70", iconBg: "bg-red-500/15 text-red-400", badge: "\uACE0\uC704\uD5D8", badgeColor: "bg-red-500/20 text-red-400 border-red-500/30", title: "High Severity", sub: "\uC989\uAC01\uC801 \uC8FC\uC8FC\uAC00\uCE58 \uD6FC\uC190 \uACF5\uC2DC", desc: "\uB300\uADDC\uBAA8 \uC720\uC0C1\uC99D\uC790\xB7\uC804\uD658\uC0AC\uCC44(CB)\xB7\uD6A1\uB839\xB7\uBC30\uC784\xB7\uC0C1\uC7A5\uD3D0\uC9C0 \uC2EC\uC0AC \uC0AC\uC720 \uB4F1 \uC8FC\uAC00\uC5D0 \uC989\uAC01\uC801 \uCDA9\uACA9\uC744 \uC904 \uC218 \uC788\uB294 \uACF5\uC2DC\uB97C \uCD5C\uC6B0\uC120\uC73C\uB85C \uC2DD\uBCC4\uD569\uB2C8\uB2E4." },
    { icon: <TrendingUp size={24} />, accent: "border-emerald-500/40 hover:border-emerald-500/70", iconBg: "bg-emerald-500/15 text-emerald-400", badge: "\uC131\uC7A5 \uCD09\uC9C4", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", title: "Growth Signal", sub: "\uC678\uD615 \uC131\uC7A5\xB7\uC8FC\uC8FC\uD658\uC6D0 \uCD09\uB9E4\uC81C", desc: "\uC2E0\uADDC \uC2DC\uC124 \uD22C\uC790\xB7\uB300\uD615 \uC218\uC8FC\xB7\uBB34\uC0C1\uC99D\uC790\xB7\uC790\uC0AC\uC8FC \uB9E4\uC785 \uBC0F \uC18C\uAC01 \uB4F1 \uAE30\uC5C5 \uC131\uC7A5\uACFC \uC8FC\uC8FC \uD658\uC6D0\uC5D0 \uAE0D\uC815\uC801\uC778 \uD575\uC2EC \uC774\uBCA4\uD2B8\uB97C \uD0D0\uC9C0\uD569\uB2C8\uB2E4." },
    { icon: <Activity size={24} />, accent: "border-amber-500/40 hover:border-amber-500/70", iconBg: "bg-amber-500/15 text-amber-400", badge: "\uBCC0\uB3D9\uC131 \uC694\uC778", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30", title: "Medium Risk", sub: "\uC9C0\uBC30\uAD6C\uC870\xB7\uC0AC\uC5C5 \uAD6C\uC870 \uBCC0\uD654", desc: "\uCD5C\uB300\uC8FC\uC8FC \uBCC0\uACBD\xB7\uC601\uC5C5\uC591\uC218\uB3C4\xB7\uD0C0\uBC95\uC778 \uC8FC\uC2DD \uCDE8\uB4DD \uB4F1 \uC911\uC7A5\uAE30 \uAE30\uC5C5\uAC00\uCE58\uC5D0 \uBD88\uD655\uC2E4\uC131\uC744 \uB354\uD558\uB294 \uC7A0\uC7AC\uC801 \uBCC0\uB3D9\uC131 \uC694\uC778\uC744 \uCD94\uC801\uD569\uB2C8\uB2E4." },
    { icon: <ShieldCheck size={24} />, accent: "border-blue-500/40 hover:border-blue-500/70", iconBg: "bg-blue-500/15 text-blue-400", badge: "\uC7AC\uBB34 \uAC74\uC804\uC131", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30", title: "Financial Stability", sub: "\uC7AC\uBB34 \uCCB4\uB825 \uCD94\uC138 \uBD84\uC11D", desc: "\uC0AC\uC5C5\xB7\uBD84\uAE30\xB7\uBC18\uAE30\uBCF4\uACE0\uC11C \uAE30\uBC18\uC73C\uB85C \uBD80\uCC44\uBE44\uC728\xB7\uC601\uC5C5\uC774\uC775\uB960\xB7\uC789\uC5EC\uD604\uAE08\uD750\uB984 \uCD94\uC138\uB97C \uBD84\uC11D\uD558\uC5EC \uD751\uC790/\uC801\uC790 \uC804\uD658 \uC5EC\uBD80\uB97C \uD3C9\uAC00\uD569\uB2C8\uB2E4." }
  ].map((item, i) => <motion.div
    key={item.title}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.1, duration: 0.5 }}
    className={`bg-slate-800/60 rounded-2xl p-7 border ${item.accent} transition-colors`}
  >
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-extrabold text-white">{item.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>{item.badge}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mb-2">{item.sub}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {
    /* ── CTA Banner ──────────────────────────────── */
  }
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="max-w-3xl mx-auto text-center"
  >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold mb-6">
            <Zap size={13} /> 지금 무료로 시작하세요
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">
            복잡한 공시, 이제 3초면 충분합니다
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Basic 플랜은 완전 무료. 회원가입 없이 기업 검색부터 시작해보세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
    onClick={() => navigate("/company")}
    className="px-8 py-4 bg-white text-blue-700 font-extrabold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg"
  >
              기업 분석 무료로 시작하기
            </button>
            <Link
    to="/subscription"
    className="px-8 py-4 bg-white/10 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
  >
              Pro 플랜 알아보기 <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>;
}
