import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { ChevronLeft, Sparkles, BookOpen, Search, Highlighter, Info, Download } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
export function DisclosureViewer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const companyName = searchParams.get("company") || "\uC0BC\uC131\uC804\uC790";
  const [activeTab, setActiveTab] = useState("summary");
  const [activeTerm, setActiveTerm] = useState(null);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showTerms, setShowTerms] = useState(true);
  const glossary = {
    "\uC601\uC5C5\uC774\uC775": "\uAE30\uC5C5\uC774 \uC8FC\uB41C \uC601\uC5C5\uD65C\uB3D9\uC744 \uD1B5\uD574 \uBC8C\uC5B4\uB4E4\uC778 \uC774\uC775\uC73C\uB85C, \uB9E4\uCD9C\uC561\uC5D0\uC11C \uB9E4\uCD9C\uC6D0\uAC00\uC640 \uD310\uB9E4\uBE44 \uBC0F \uAD00\uB9AC\uBE44\uB97C \uBE80 \uAE08\uC561\uC785\uB2C8\uB2E4.",
    "\uB2F9\uAE30\uC21C\uC774\uC775": "\uAE30\uC5C5\uC774 \uC77C\uC815 \uAE30\uAC04 \uB3D9\uC548 \uC5BB\uC740 \uBAA8\uB4E0 \uC218\uC775\uC5D0\uC11C \uC9C0\uCD9C\uD55C \uBAA8\uB4E0 \uBE44\uC6A9\uC744 \uACF5\uC81C\uD558\uACE0 \uC21C\uC218\uD558\uAC8C \uB0A8\uC740 \uC774\uC775\uC785\uB2C8\uB2E4.",
    "HBM": "High Bandwidth Memory\uC758 \uC57D\uC790\uB85C, \uC5EC\uB7EC \uAC1C\uC758 D\uB7A8\uC744 \uC218\uC9C1\uC73C\uB85C \uC5F0\uACB0\uD574 \uAE30\uC874 D\uB7A8\uBCF4\uB2E4 \uB370\uC774\uD130 \uCC98\uB9AC \uC18D\uB3C4\uB97C \uD601\uC2E0\uC801\uC73C\uB85C \uB04C\uC5B4\uC62C\uB9B0 \uACE0\uC131\uB2A5 \uBA54\uBAA8\uB9AC\uC785\uB2C8\uB2E4.",
    "\uC720\uD615\uC790\uC0B0": "\uAE30\uC5C5\uC774 \uC601\uC5C5\uD65C\uB3D9\uC5D0 \uC0AC\uC6A9\uD560 \uBAA9\uC801\uC73C\uB85C \uBCF4\uC720\uD558\uB294 \uBB3C\uB9AC\uC801 \uD615\uD0DC\uAC00 \uC788\uB294 \uC790\uC0B0 (\uC608: \uD1A0\uC9C0, \uAC74\uBB3C, \uAE30\uACC4\uC7A5\uCE58 \uB4F1)\uC785\uB2C8\uB2E4."
  };
  const handleTermClick = (term) => {
    setActiveTerm(term);
    setActiveTab("glossary");
  };
  const renderHighlight = (content) => {
    return showHighlights ? <mark className="bg-yellow-200/60 rounded px-1 transition-all">{content}</mark> : <span className="transition-all">{content}</span>;
  };
  const renderTerm = (term, label = term) => {
    return showTerms ? <span
      className="border-b-2 border-blue-400 border-dashed cursor-help hover:bg-blue-50 transition-all"
      onClick={() => handleTermClick(term)}
    >
        {label}
      </span> : <span className="transition-all">{label}</span>;
  };
  return <div className="h-[calc(100vh-12rem)] flex flex-col -mt-4 animate-in fade-in duration-300">
      {
    /* Header */
  }
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-4">
          <Link to={`/company/${companyName}`} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">정기공시</span>
              <span className="text-sm text-slate-500">2026.06.08</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">사업보고서 (2025.12) - {companyName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="원문 다운로드">
            <Download size={20} />
          </button>
        </div>
      </div>

      {
    /* Main Content Split */
  }
      <div className="flex-1 flex gap-6 overflow-hidden">
        {
    /* Left: Original Document View */
  }
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
                  <span className="w-3 h-3 rounded-sm border-b-2 border-blue-400 border-dashed shrink-0" /> 
                  전문 용어
                </span>
              </label>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 font-serif text-slate-800 leading-loose">
            <h2 className="text-2xl font-bold mb-6 text-center">사 업 보 고 서</h2>
            <p className="mb-4">
              <strong>1. 회사의 개요</strong><br />
              본 보고서는 {companyName}의 2025 회계연도 사업 성과 및 재무 상태를 요약한 문서입니다.
            </p>
            <p className="mb-4">
              <strong>2. 사업의 내용</strong><br />
              당사는 반도체, 스마트폰, 가전제품을 주력으로 생산하며 글로벌 시장에서 선도적인 위치를 점하고 있습니다.
              {renderHighlight(
    <>특히 2025년에는 AI 산업의 팽창과 함께 {renderTerm("HBM")} 수요가 폭발적으로 증가하여 반도체 부문의 매출이 전년 대비 45% 성장했습니다.</>
  )}
            </p>
            <p className="mb-4">
              <strong>3. 재무에 관한 사항</strong><br />
              당기의 총 {renderTerm("\uC601\uC5C5\uC774\uC775")}은 52조 원을 기록하였으며, 이는 원가 절감 노력과 고부가가치 제품 중심의 판매 믹스 개선에 기인합니다.
              {renderHighlight(
    <>또한 신규 공장 증설을 위해 15조 원 규모의 {renderTerm("\uC720\uD615\uC790\uC0B0")} 투자가 집행되었으며, 이는 향후 생산 능력 확대를 위한 선제적 조치입니다.</>
  )}
              최종적인 {renderTerm("\uB2F9\uAE30\uC21C\uC774\uC775")}은 41조 원으로 집계되었습니다.
            </p>
            <p className="text-slate-400 italic text-sm mt-8 text-center">
              (본 원문은 시연을 위한 가상의 데이터입니다)
            </p>
          </div>
        </div>

        {
    /* Right: AI Tools Panel */
  }
        <div className="w-[400px] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
          {
    /* Tabs */
  }
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

          {
    /* Tab Content */
  }
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "summary" && <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-blue-600 font-bold mb-4">
                  <Sparkles size={18} />
                  <span>핵심 내용 3줄 요약</span>
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
              </div>}

            {activeTab === "analysis" && <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
                  <Highlighter size={18} />
                  <span>Gemini 의미 분석</span>
                </div>
                <div className="space-y-4">
                  <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/50">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">투자 시그널 분석</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      15조 원의 공격적인 유형자산 투자는 단기적으로는 현금흐름에 부담을 줄 수 있으나, AI 반도체 시장의 주도권을 쥐기 위한 필수적인 자본 지출(CAPEX)로 해석됩니다. 장기적 성장에 매우 긍정적인 시그널입니다.
                    </p>
                  </div>
                  <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/50">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">수익성 개선 배경</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      매출 증가(45%) 대비 영업이익의 성장이 두드러지는 것은 HBM 등 고마진 제품의 비중 확대 효과가 본격적으로 나타나고 있음을 의미합니다.
                    </p>
                  </div>
                </div>
              </div>}

            {activeTab === "glossary" && <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
                  <Info size={18} />
                  <span>금융/다트 용어 사전</span>
                </div>
                
                {
    /* Search Term */
  }
                <div className="relative mb-6">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
    type="text"
    placeholder="궁금한 용어를 검색하세요"
    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
  />
                </div>

                {activeTerm && glossary[activeTerm] && <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <h3 className="font-bold text-indigo-900 mb-2">{activeTerm}</h3>
                    <p className="text-sm text-indigo-800/80 leading-relaxed">{glossary[activeTerm]}</p>
                    <button
    onClick={() => setActiveTerm(null)}
    className="mt-3 text-xs text-indigo-600 font-medium hover:underline"
  >
                      초기화
                    </button>
                  </div>}

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">문서 내 주요 용어</h4>
                  {Object.entries(glossary).map(([term, desc]) => <button
    key={term}
    onClick={() => setActiveTerm(term)}
    className={`w-full text-left p-3 rounded-lg border transition-colors ${activeTerm === term ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"}`}
  >
                      <div className="font-bold text-sm text-slate-800 mb-1">{term}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{desc}</div>
                    </button>)}
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>;
}
