import { useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { ChevronLeft, Sparkles, BookOpen, Search, Highlighter, Info, Download, AlertTriangle, Loader2, X } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";

// =====================================================================
// 위험도/신호 배지 — 모든 보고서 유형이 공유하는 컴포넌트
// =====================================================================

// risk_tier(1~5)를 화면 색상으로 정규화하는 단 하나의 매핑 테이블.
// 보고서마다 risk_label은 다르지만(Critical, Guaranteed, Ending, Watch...),
// risk_tier만 보면 항상 같은 색상이 나오도록 설계되어 있음(역설축은 저장 시점에 이미 역전되어 들어옴).
const RISK_TIER_STYLE = {
  1: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  2: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  3: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  4: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  5: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" }
};

// risk_tier별 호버 설명. 검색결과 목록 페이지와 동일한 5단계 설명을 공유함.
// axisLabel(보고서마다 다른 위험축 이름)과 무관하게 "이 숫자단계가 무슨 뜻인지"를 짧게 풀어줌.
const RISK_TIER_DESCRIPTION = {
  1: "안전한 수준입니다. 특별히 주의할 사항이 없습니다.",
  2: "중립적인 수준입니다. 참고할 정보가 있습니다.",
  3: "주의가 필요한 수준입니다. 내용을 확인해보세요.",
  4: "경계가 필요한 수준입니다. 자세히 살펴보시길 권합니다.",
  5: "가장 위험한 수준입니다. 즉시 확인이 필요합니다."
};

/**
 * 위험도/신호 배지.
 * props:
 *  - axisLabel: 배지 앞에 붙는 축 이름. "위험도" / "확신신호" / "성사가능성" / "검증상태" / "분쟁수준" 등
 *  - riskLabel: risk_label 컬럼 원본 텍스트 그대로. "Critical", "Guaranteed", "Watch" 등 가공하지 않음.
 *  - riskTier: risk_tier 컬럼(1~5). 색상만 결정하며 텍스트에는 노출하지 않음.
 *  - size: "sm" | "md" (기본 sm) — 요약탭 헤더는 md, 분석탭 항목별 배지는 sm 권장.
 */
function RiskBadge({ axisLabel, riskLabel, riskTier, size = "sm" }) {
  const style = RISK_TIER_STYLE[riskTier] ?? RISK_TIER_STYLE[3];
  const sizeClass = size === "md" ? "text-xs px-3 py-1.5" : "text-[11px] px-2 py-1";
  const description = RISK_TIER_DESCRIPTION[riskTier] ?? RISK_TIER_DESCRIPTION[3];

  return (
    <span
      title={`${axisLabel} · ${riskLabel} — ${description}`}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap cursor-help ${style.bg} ${style.border} ${style.text} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
      {axisLabel}
      <span className="opacity-60">·</span>
      {riskLabel}
    </span>
  );
}

/**
 * 여러 배지를 한 줄에 나란히 보여주는 그룹 래퍼.
 * 공개매수신고서처럼 독립된 두 질문(성사가능성+자금조달확실성)이 있는 보고서는
 * badges 배열에 2개를 넣으면 자동으로 줄바꿈 처리됨(flex-wrap).
 */
function RiskBadgeGroup({ badges, size = "sm" }) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {badges.map((b, i) => (
        <RiskBadge key={`${b.axisLabel}-${i}`} axisLabel={b.axisLabel} riskLabel={b.riskLabel} riskTier={b.riskTier} size={size} />
      ))}
    </div>
  );
}

/**
 * 단독 절대 트리거 경고 박스.
 * 감사의견 비적정, ABS 진정한양도 불확실, 상장폐지 추진 등
 * 다른 모든 지표보다 우선하는 신호를 위한 전용 컴포넌트.
 */
function CriticalAlertBanner({ message, detail }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
      <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-red-800">{message}</p>
        {detail && <p className="text-xs text-red-700 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

// =====================================================================
// 공시 상세보기 페이지 본체
// =====================================================================

export function DisclosureViewer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const companyName = searchParams.get("company") || "삼성전자";

  const [activeTab, setActiveTab] = useState("summary");
  const [activeTerm, setActiveTerm] = useState(null);
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [showHighlights, setShowHighlights] = useState(true);
  const [showTerms, setShowTerms] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // 분석 탭의 각 카드로 스크롤하기 위한 ref. key는 ai_analysis_item.id(또는 item_no)에 대응.
  const analysisRefs = useRef({});
  // 좌측 원문의 각 하이라이트로 스크롤하기 위한 ref. analysisRefs와 같은 key를 공유해서
  // "분석 카드 -> 원문 위치"의 역방향 이동도 같은 key 하나로 양쪽을 다 찾을 수 있게 함.
  const highlightRefs = useRef({});

  // ---------------------------------------------------------------------
  // 실제로는 ai_summary_result(risk_label, risk_tier, extra)와
  // disclosure_type.risk_scale_code -> 화면 레이블 매핑 결과를 그대로 내려주면 됨.
  // ---------------------------------------------------------------------

  // risk_scale_code -> 화면에 보일 축 이름 매핑 (백엔드에서 내려주거나 프론트 상수로 유지)
  const RISK_AXIS_LABEL = {
    STANDARD: "위험도",
    GOVERNANCE: "위험도",
    CONFIDENCE: "확신신호",
    SUCCESS: "성사가능성",
    VERIFICATION: "검증상태",
    DISPUTE: "분쟁수준",
    MARKET_SIGNAL: "시장신호"
  };

  // 이 문서(사업보고서)는 STANDARD 축, risk_tier=1(Low) 단일 배지인 경우.
  // 검색결과 목록 페이지의 같은 문서 행과 동일한 값을 써서 목록<->상세 화면의 위험도 표시가 이어지도록 함.
  const docRisk = { axisLabel: RISK_AXIS_LABEL.STANDARD, riskLabel: "Low", riskTier: 1 };
  const summaryBadges = [docRisk];

  // ai_summary_result.extra에 실려오는 보고서별 가변 보조필드.
  // 지금은 사업보고서라 감사의견 관련 필드가 없는 게 정상 — 그래서 경고가 안 뜸.
  const disclosureExtra = {
    // auditOpinion: "한정",   // 감사보고서일 때만 내려오는 필드. 주석을 풀면 경고가 자동으로 뜸.
  };

  // 단독 절대 트리거 판단 — 다른 모든 지표보다 우선하는 경고들을 한곳에서 결정.
  function getCriticalAlert(extra) {
    if (extra?.auditOpinion && extra.auditOpinion !== "적정") {
      return {
        message: `감사의견 ${extra.auditOpinion} — 상장폐지·거래정지 가능성`,
        detail: "다른 모든 지표보다 우선하는 절대적 위험 신호입니다"
      };
    }
    if (extra?.isTrueSaleConfirmed === false) {
      return {
        message: "진정한 양도 불확실 — 도산 절연 리스크",
        detail: "원보유자 파산 시 투자자가 자산을 보호받지 못할 수 있습니다"
      };
    }
    if (extra?.willDelist === true) {
      return {
        message: "상장폐지 추진 — 매도 기회 확인 필요",
        detail: "공개매수 성공으로 자발적 상장폐지가 진행될 예정입니다"
      };
    }
    if (extra?.hasInjunctionRequest === true) {
      return {
        message: "가처분 신청 포함 — 이사회 결의 효력정지 가능성",
        detail: "즉시 경영 마비로 이어질 수 있는 위험 신호입니다"
      };
    }
    return null;
  }

  const criticalAlert = getCriticalAlert(disclosureExtra);

  const glossary = {
    "영업이익": "기업이 주된 영업활동을 통해 벌어들인 이익으로, 매출액에서 매출원가와 판매비 및 관리비를 뺀 금액입니다.",
    "당기순이익": "기업이 일정 기간 동안 얻은 모든 수익에서 지출한 모든 비용을 공제하고 순수하게 남은 이익입니다.",
    "HBM": "High Bandwidth Memory의 약자로, 여러 개의 D램을 수직으로 연결해 기존 D램보다 데이터 처리 속도를 혁신적으로 끌어올린 고성능 메모리입니다.",
    "유형자산": "기업이 영업활동에 사용할 목적으로 보유하는 물리적 형태가 있는 자산 (예: 토지, 건물, 기계장치 등)입니다."
  };

  // 용어사전 검색 — 입력값으로 용어명을 필터링(대소문자 무시)
  const filteredGlossaryEntries = Object.entries(glossary).filter(([term]) =>
    term.toLowerCase().includes(glossaryQuery.trim().toLowerCase())
  );

  const handleTermClick = (term) => {
    setActiveTerm(term);
    setActiveTab("glossary");
  };

  // 심층 분석 항목 — 각 항목이 자기만의 category + risk 배지를 가짐(ai_analysis_item 1:N 구조 그대로).
  // highlightKey로 좌측 원문의 핵심 문장 하이라이트와 1:1 연결됨.
  const analysisItems = [
    {
      key: "capex",
      category: "Capex_Growth",
      title: "투자 시그널 분석",
      content:
        "15조 원의 공격적인 유형자산 투자는 단기적으로는 현금흐름에 부담을 줄 수 있으나, AI 반도체 시장의 주도권을 쥐기 위한 필수적인 자본 지출(CAPEX)로 해석됩니다. 장기적 성장에 매우 긍정적인 시그널입니다.",
      axisLabel: RISK_AXIS_LABEL.STANDARD,
      riskLabel: "Neutral",
      riskTier: 2
    },
    {
      key: "profitability",
      category: "Profitability_Trend",
      title: "수익성 개선 배경",
      content:
        "매출 증가(45%) 대비 영업이익의 성장이 두드러지는 것은 HBM 등 고마진 제품의 비중 확대 효과가 본격적으로 나타나고 있음을 의미합니다.",
      axisLabel: RISK_AXIS_LABEL.STANDARD,
      riskLabel: "Low",
      riskTier: 1
    }
  ];

  // 좌측 원문의 노란 하이라이트를 클릭하면 "심층 분석" 탭으로 전환하고
  // 해당 항목 카드로 스크롤. ai_analysis_item의 좌표(char_start/end)와
  // material_impact/risk_label이 같은 행이라는 DB 구조를 화면 인터랙션으로도 드러냄.
  const handleHighlightClick = (analysisKey) => {
    setActiveTab("analysis");
    requestAnimationFrame(() => {
      const node = analysisRefs.current[analysisKey];
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        node.classList.add("ring-2", "ring-emerald-300");
        setTimeout(() => node.classList.remove("ring-2", "ring-emerald-300"), 1500);
      }
    });
  };

  // 분석 카드의 "원문에서 보기"를 누르면 좌측 패널의 같은 key를 가진 하이라이트로 스크롤.
  // handleHighlightClick과 정반대 방향. 우측 패널은 탭을 바꾸지 않고 그대로 두며,
  // 좌측 원문만 해당 위치로 스크롤되어 두 패널을 동시에 비교하며 볼 수 있게 함.
  const handleViewInOriginal = (analysisKey) => {
    const node = highlightRefs.current[analysisKey];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.classList.add("ring-2", "ring-blue-300");
      setTimeout(() => node.classList.remove("ring-2", "ring-blue-300"), 1500);
    }
  };

  // 핵심 문장(노란 배경) — 클릭 가능, 우측 심층분석으로 연결됨.
  // ref도 함께 등록해서 분석 카드 쪽에서 "원문에서 보기"로 역방향 이동이 가능하게 함.
  const renderHighlight = (content, analysisKey) => {
    if (!showHighlights) return <span className="transition-all">{content}</span>;
    return (
      <mark
        ref={(node) => (highlightRefs.current[analysisKey] = node)}
        onClick={() => handleHighlightClick(analysisKey)}
        className="bg-yellow-200/60 rounded px-1 transition-all cursor-pointer hover:bg-yellow-300/70"
        title="클릭하면 심층 분석으로 이동합니다"
      >
        {content}
      </mark>
    );
  };

  // 전문 용어(점선 밑줄) — 핵심 문장과는 시각적으로 분리되는 표시 방식.
  // 노란 배경(하이라이트)=핵심 문장, 파란 점선 밑줄=전문 용어로 의미를 구분함.
  const renderTerm = (term, label = term) => {
    return showTerms ? (
      <span
        className="border-b-2 border-blue-400 border-dashed cursor-help hover:bg-blue-50 transition-all"
        onClick={() => handleTermClick(term)}
        title="클릭하면 용어 사전에서 설명을 볼 수 있습니다"
      >
        {label}
      </span>
    ) : (
      <span className="transition-all">{label}</span>
    );
  };

  // 다운로드 버튼 — 실제로는 disclosure.raw_zip_path를 호출하는 비동기 요청이 들어갈 자리.
  // 완료까지 시간이 걸릴 수 있으므로 로딩 상태를 보여줌.
  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1200);
  };

  // 카드 전체 테두리 — 단독 트리거가 있으면 빨간 테두리로 강조(시각 우선순위)
  const cardBorderClass = criticalAlert ? "border-red-300 ring-1 ring-red-100" : "border-slate-200";

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col -mt-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-4">
          <Link to={`/company/${companyName}`} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">정기공시</span>
              <span className="text-sm text-slate-500">2026.06.08</span>
              {/* 2순위: 패널을 펼치지 않아도 헤더만 보고 위험수준을 즉시 파악할 수 있게 함 */}
              <RiskBadge axisLabel={docRisk.axisLabel} riskLabel={docRisk.riskLabel} riskTier={docRisk.riskTier} size="sm" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">사업보고서 (2025.12) - {companyName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 다운로드 로딩 상태 표시 */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-wait"
            title="원문 다운로드"
          >
            {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Original Document View */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <BookOpen size={16} className="text-blue-600" />
              공시 원문
            </div>
            <div className="flex items-center gap-5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Switch.Root
                  checked={showHighlights}
                  onCheckedChange={setShowHighlights}
                  className="w-8 h-4 bg-slate-200 rounded-full relative data-[state=checked]:bg-blue-500 outline-none cursor-pointer transition-colors"
                >
                  <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4 will-change-transform shadow-sm" />
                </Switch.Root>
                <span className="flex items-center gap-1.5 text-slate-600 group-hover:text-slate-900 transition-colors">
                  {/* 핵심 문장 = 노란 배경 (전문 용어의 파란 밑줄과 명확히 다른 표시방식) */}
                  <span className="w-3 h-3 rounded-sm bg-yellow-200 shrink-0" />
                  핵심 문장
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <Switch.Root
                  checked={showTerms}
                  onCheckedChange={setShowTerms}
                  className="w-8 h-4 bg-slate-200 rounded-full relative data-[state=checked]:bg-blue-500 outline-none cursor-pointer transition-colors"
                >
                  <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4 will-change-transform shadow-sm" />
                </Switch.Root>
                <span className="flex items-center gap-1.5 text-slate-600 group-hover:text-slate-900 transition-colors">
                  {/* 전문 용어 = 파란 점선 밑줄 (핵심 문장의 노란 배경과 명확히 다른 표시방식) */}
                  <span className="w-3 h-3 rounded-sm border-b-2 border-blue-400 border-dashed shrink-0" />
                  전문 용어
                </span>
              </label>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 font-serif text-slate-800 leading-loose">
            <h2 className="text-2xl font-bold mb-6 text-center">사 업 보 고 서</h2>
            <p className="mb-4">
              <strong>1. 회사의 개요</strong>
              <br />
              본 보고서는 {companyName}의 2025 회계연도 사업 성과 및 재무 상태를 요약한 문서입니다.
            </p>
            <p className="mb-4">
              <strong>2. 사업의 내용</strong>
              <br />
              당사는 반도체, 스마트폰, 가전제품을 주력으로 생산하며 글로벌 시장에서 선도적인 위치를 점하고 있습니다.
              {renderHighlight(
                <>
                  특히 2025년에는 AI 산업의 팽창과 함께 {renderTerm("HBM")} 수요가 폭발적으로 증가하여 반도체 부문의 매출이 전년 대비 45% 성장했습니다.
                </>,
                "profitability"
              )}
            </p>
            <p className="mb-4">
              <strong>3. 재무에 관한 사항</strong>
              <br />
              당기의 총 {renderTerm("영업이익")}은 52조 원을 기록하였으며, 이는 원가 절감 노력과 고부가가치 제품 중심의 판매 믹스 개선에 기인합니다.
              {renderHighlight(
                <>
                  또한 신규 공장 증설을 위해 15조 원 규모의 {renderTerm("유형자산")} 투자가 집행되었으며, 이는 향후 생산 능력 확대를 위한 선제적 조치입니다.
                </>,
                "capex"
              )}
              최종적인 {renderTerm("당기순이익")}은 41조 원으로 집계되었습니다.
            </p>
            <p className="text-slate-400 italic text-sm mt-8 text-center">(본 원문은 시연을 위한 가상의 데이터입니다)</p>
          </div>
        </div>

        {/* Right: AI Tools Panel */}
        <div className={`w-[400px] flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden shrink-0 ${cardBorderClass}`}>
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "summary" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              AI 요약
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "analysis" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              심층 분석
            </button>
            <button
              onClick={() => setActiveTab("glossary")}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "glossary" ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              용어 사전
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "summary" && (
              <div className="space-y-4 animate-in fade-in">
                {/* 단독 절대 트리거 경고 — 다른 모든 정보보다 먼저 표시 */}
                <CriticalAlertBanner message={criticalAlert?.message} detail={criticalAlert?.detail} />

                {/* 요약 헤더 + 위험도/신호 배지 그룹 (1개 또는 2개 모두 같은 컴포넌트로 처리) */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2 text-blue-600 font-bold">
                    <Sparkles size={18} />
                    <span>핵심 내용 정리</span>
                  </div>
                  <RiskBadgeGroup badges={summaryBadges} size="md" />
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    AI 산업 성장에 따른 HBM 수요 증가로 반도체 부문 매출이 전년 대비 45% 증가했습니다.
                  </li>
                  <li className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    고부가가치 제품 중심 판매로 총 영업이익 52조 원, 당기순이익 41조 원을 달성했습니다.
                  </li>
                  <li className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    생산 능력 확대를 위해 15조 원 규모의 선제적 유형자산 투자가 진행되었습니다.
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
                  <Highlighter size={18} />
                  <span>Gemini 의미 분석</span>
                </div>
                <div className="space-y-4">
                  {analysisItems.map((item) => (
                    <div
                      key={item.key}
                      ref={(node) => (analysisRefs.current[item.key] = node)}
                      className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/50 transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                        <RiskBadge axisLabel={item.axisLabel} riskLabel={item.riskLabel} riskTier={item.riskTier} size="sm" />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
                      {/* 역방향 연결 — 좌측 원문의 해당 하이라이트 위치로 스크롤 */}
                      <button
                        type="button"
                        onClick={() => handleViewInOriginal(item.key)}
                        className="mt-3 text-xs font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft size={12} />
                        원문에서 보기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "glossary" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
                  <Info size={18} />
                  <span>금융/다트 용어 사전</span>
                </div>

                {/* Search Term — value/onChange 연결 + 입력 시 X 버튼으로 지울 수 있음 */}
                <div className="relative mb-6">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    placeholder="궁금한 용어를 검색하세요"
                    className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {glossaryQuery && (
                    <button
                      type="button"
                      onClick={() => setGlossaryQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="검색어 지우기"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {activeTerm && glossary[activeTerm] && (
                  <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <h3 className="font-bold text-indigo-900 mb-2">{activeTerm}</h3>
                    <p className="text-sm text-indigo-800/80 leading-relaxed">{glossary[activeTerm]}</p>
                    <button onClick={() => setActiveTerm(null)} className="mt-3 text-xs text-indigo-600 font-medium hover:underline">
                      초기화
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    {glossaryQuery ? `검색 결과 (${filteredGlossaryEntries.length})` : "문서 내 주요 용어"}
                  </h4>
                  {filteredGlossaryEntries.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">일치하는 용어가 없습니다.</p>
                  ) : (
                    filteredGlossaryEntries.map(([term, desc]) => (
                      <button
                        key={term}
                        onClick={() => setActiveTerm(term)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${activeTerm === term ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"}`}
                      >
                        <div className="font-bold text-sm text-slate-800 mb-1">{term}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{desc}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
