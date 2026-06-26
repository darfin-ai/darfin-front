import { useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  Download,
  Highlighter,
  Info,
  Loader2,
  Search,
  Sparkles,
  X
} from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import * as Tabs from "@radix-ui/react-tabs";
import { getDisclosureById } from "../data/filings";
import { RiskBadge, RiskBadgeGroup } from "../components/RiskBadge";

export function DisclosureViewer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const disclosure = getDisclosureById(id);
  const companyName = searchParams.get("company") || disclosure.company;
  const corpCode = searchParams.get("corpCode") || disclosure.corpCode;

  const [activeTab, setActiveTab] = useState("summary");
  const [activeTerm, setActiveTerm] = useState(null);
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [showHighlights, setShowHighlights] = useState(true);
  const [showTerms, setShowTerms] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const analysisRefs = useRef({});
  const highlightRefs = useRef({});

  const summaryBadges = [
    {
      axisLabel: "위험도",
      riskLabel: disclosure.riskLabel,
      riskTier: disclosure.riskTier
    }
  ];
  const glossary = disclosure.glossary ?? getDisclosureById("sample").glossary;
  const analysisItems = disclosure.analysisItems ?? getDisclosureById("sample").analysisItems;
  const document = disclosure.document ?? getDisclosureById("sample").document;
  const criticalAlert = getCriticalAlert(disclosure.extra);
  const cardBorderClass = criticalAlert ? "border-red-300 ring-1 ring-red-100" : "border-slate-200";

  const filteredGlossaryEntries = Object.entries(glossary).filter(([term]) =>
    term.toLowerCase().includes(glossaryQuery.trim().toLowerCase())
  );

  const handleTermClick = (term) => {
    setActiveTerm(term);
    setActiveTab("glossary");
  };

  const handleHighlightClick = (analysisKey) => {
    setActiveTab("analysis");
    requestAnimationFrame(() => {
      const node = analysisRefs.current[analysisKey];
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        node.classList.add("ring-2", "ring-emerald-300");
        window.setTimeout(() => node.classList.remove("ring-2", "ring-emerald-300"), 1500);
      }
    });
  };

  const handleViewInOriginal = (analysisKey) => {
    const node = highlightRefs.current[analysisKey];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.classList.add("ring-2", "ring-blue-300");
      window.setTimeout(() => node.classList.remove("ring-2", "ring-blue-300"), 1500);
    }
  };

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    window.setTimeout(() => setIsDownloading(false), 1200);
  };

  const renderHighlight = (content, analysisKey) => {
    if (!showHighlights) return <span className="transition-all">{content}</span>;

    return (
      <mark
        ref={(node) => {
          highlightRefs.current[analysisKey] = node;
        }}
        onClick={() => handleHighlightClick(analysisKey)}
        className="bg-yellow-200/70 rounded px-1 transition-all cursor-pointer hover:bg-yellow-300/80"
        title="클릭하면 연결된 AI 분석으로 이동합니다"
      >
        {content}
      </mark>
    );
  };

  const renderTerm = (term, label = term) => {
    if (!showTerms) return <span className="transition-all">{label}</span>;

    return (
      <span
        className="border-b-2 border-blue-400 border-dashed cursor-help hover:bg-blue-50 transition-all"
        onClick={() => handleTermClick(term)}
        title="클릭하면 용어 사전에서 설명을 볼 수 있습니다"
      >
        {label}
      </span>
    );
  };

  return (
    <div className="h-[calc(100vh-11rem)] min-h-[720px] flex flex-col -mt-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={`/company/${corpCode}`}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            aria-label="기업 분석으로 돌아가기"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {disclosure.typeLabel}
              </span>
              <span className="text-sm text-slate-500">{disclosure.date}</span>
              <RiskBadge riskLabel={disclosure.riskLabel} riskTier={disclosure.riskTier} size="sm" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 truncate">
              {disclosure.title} - {companyName}
            </h1>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-wait"
          title="원문 다운로드"
          aria-label="공시 원문 다운로드"
        >
          {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <section className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <BookOpen size={16} className="text-blue-600" />
              공시 원문
            </div>
            <div className="flex items-center gap-5 text-xs">
              <ViewerToggle
                checked={showHighlights}
                onCheckedChange={setShowHighlights}
                swatchClass="bg-yellow-200"
                label="핵심 문장"
              />
              <ViewerToggle
                checked={showTerms}
                onCheckedChange={setShowTerms}
                swatchClass="border-b-2 border-blue-400 border-dashed"
                label="전문 용어"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 text-slate-800 leading-loose">
            <h2 className="text-2xl font-bold mb-6 text-center">{document.heading}</h2>
            {document.sections.map((section) => (
              <p key={section.title} className="mb-4">
                <strong>{section.title}</strong>
                <br />
                {renderDocumentText(section.body, renderTerm)}
                {section.highlight && (
                  <>
                    {" "}
                    {renderHighlight(renderDocumentText(section.highlight, renderTerm), section.highlightKey)}
                  </>
                )}
                {section.closing && (
                  <>
                    {" "}
                    {renderDocumentText(section.closing, renderTerm)}
                  </>
                )}
              </p>
            ))}
            <p className="text-slate-400 italic text-sm mt-8 text-center">
              본 원문은 서비스 시연을 위한 예시 데이터입니다.
            </p>
          </div>
        </section>

        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className={`w-[420px] flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden shrink-0 ${cardBorderClass}`}
        >
          <Tabs.List className="flex border-b border-slate-200">
            <ViewerTab value="summary" activeTab={activeTab} activeClass="border-blue-600 text-blue-600">
              AI 요약
            </ViewerTab>
            <ViewerTab value="analysis" activeTab={activeTab} activeClass="border-emerald-500 text-emerald-600">
              핵심 분석
            </ViewerTab>
            <ViewerTab value="glossary" activeTab={activeTab} activeClass="border-indigo-500 text-indigo-600">
              용어 사전
            </ViewerTab>
          </Tabs.List>

          <div className="flex-1 overflow-y-auto p-5">
            <Tabs.Content value="summary" className="space-y-4 animate-in fade-in outline-none">
              <CriticalAlertBanner message={criticalAlert?.message} detail={criticalAlert?.detail} />

              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Sparkles size={18} />
                  <span>핵심 내용 정리</span>
                </div>
                <RiskBadgeGroup badges={summaryBadges} size="md" />
              </div>

              <ul className="space-y-3">
                {(disclosure.summary ?? getDisclosureById("sample").summary).map((summary) => (
                  <li key={summary} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {summary}
                  </li>
                ))}
              </ul>
            </Tabs.Content>

            <Tabs.Content value="analysis" className="space-y-4 animate-in fade-in outline-none">
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
                <Highlighter size={18} />
                <span>AI 근거 분석</span>
              </div>
              <div className="space-y-4">
                {analysisItems.map((item) => (
                  <div
                    key={item.key}
                    ref={(node) => {
                      analysisRefs.current[item.key] = node;
                    }}
                    className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/50 transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <RiskBadge axisLabel={item.axisLabel} riskLabel={item.riskLabel} riskTier={item.riskTier} size="sm" />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
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
            </Tabs.Content>

            <Tabs.Content value="glossary" className="space-y-4 animate-in fade-in outline-none">
              <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
                <Info size={18} />
                <span>금융/공시 용어 사전</span>
              </div>

              <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={glossaryQuery}
                  onChange={(event) => setGlossaryQuery(event.target.value)}
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
                  <button
                    type="button"
                    onClick={() => setActiveTerm(null)}
                    className="mt-3 text-xs text-indigo-600 font-medium hover:underline"
                  >
                    선택 해제
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
                  filteredGlossaryEntries.map(([term, description]) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setActiveTerm(term)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        activeTerm === term ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-800 mb-1">{term}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{description}</div>
                    </button>
                  ))
                )}
              </div>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}

function ViewerToggle({ checked, onCheckedChange, swatchClass, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-8 h-4 bg-slate-200 rounded-full relative data-[state=checked]:bg-blue-500 outline-none cursor-pointer transition-colors"
      >
        <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4 will-change-transform shadow-sm" />
      </Switch.Root>
      <span className="flex items-center gap-1.5 text-slate-600 group-hover:text-slate-900 transition-colors">
        <span className={`w-3 h-3 rounded-sm shrink-0 ${swatchClass}`} />
        {label}
      </span>
    </label>
  );
}

function ViewerTab({ value, activeTab, activeClass, children }) {
  return (
    <Tabs.Trigger
      value={value}
      className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
        activeTab === value ? activeClass : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </Tabs.Trigger>
  );
}

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

function getCriticalAlert(extra) {
  if (extra?.auditOpinion && extra.auditOpinion !== "적정") {
    return {
      message: `감사의견 ${extra.auditOpinion}: 상장유지 및 거래정지 가능성 확인 필요`,
      detail: "감사의견은 다른 지표보다 우선해서 검토해야 하는 위험 신호입니다."
    };
  }

  if (extra?.isTrueSaleConfirmed === false) {
    return {
      message: "진정한 양도 여부가 불확실한 자산유동화 위험",
      detail: "자산 보호 범위와 투자자 상환 가능성을 추가로 확인해야 합니다."
    };
  }

  if (extra?.willDelist === true) {
    return {
      message: "상장폐지 추진 가능성 확인 필요",
      detail: "공개매수 이후 상장폐지 절차가 진행될 수 있습니다."
    };
  }

  if (extra?.hasInjunctionRequest === true) {
    return {
      message: "가처분 신청 포함으로 의사결정 효력 정지 가능성",
      detail: "경영 의사결정이 지연되거나 무효화될 위험이 있습니다."
    };
  }

  return null;
}

function renderDocumentText(text, renderTerm) {
  const terms = ["영업이익", "당기순이익", "HBM", "유형자산"];
  const matchedTerm = terms.find((term) => text.includes(term));

  if (!matchedTerm) return text;

  const parts = text.split(matchedTerm);
  return parts.map((part, index) => (
    <span key={`${matchedTerm}-${index}`}>
      {part}
      {index < parts.length - 1 && renderTerm(matchedTerm)}
    </span>
  ));
}
