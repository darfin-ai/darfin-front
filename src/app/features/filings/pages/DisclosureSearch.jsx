import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, FileText, CheckCircle2, ChevronRight, Building2, Calendar as CalendarIcon, Filter, LayoutGrid, ChevronLeft, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as Popover from "@radix-ui/react-popover";
import "react-day-picker/dist/style.css";

const DISCLOSURE_TYPES = [
  "정기공시",
  "주요사항보고서",
  "발행공시",
  "지분공시",
  "기타공시",
  "외부감사관련",
  "펀드공시",
  "자산유동화",
  "거래소공시",
  "공정위공시"
];

// risk_tier(1~5) -> 검색결과 행에 쓸 색상. 상세보기 페이지의 RiskBadge와 같은 규칙을 공유함.
const RISK_TIER_DOT = {
  1: "bg-emerald-500",
  2: "bg-blue-500",
  3: "bg-amber-500",
  4: "bg-orange-500",
  5: "bg-red-500"
};
const RISK_TIER_TEXT = {
  1: "text-emerald-700",
  2: "text-blue-700",
  3: "text-amber-700",
  4: "text-orange-700",
  5: "text-red-700"
};

// risk_tier별 호버 설명. axisLabel(보고서마다 다른 위험축 이름)과 무관하게
// "이 숫자단계가 무슨 뜻인지"를 짧게 풀어줌. risk_tier는 항상 1=가장 안전, 5=가장 위험으로
// 정규화되어 있으므로(역설축도 저장 시점에 이미 역전됨) 이 설명 5개만으로 모든 보고서를 커버함.
const RISK_TIER_DESCRIPTION = {
  1: "안전한 수준입니다. 특별히 주의할 사항이 없습니다.",
  2: "중립적인 수준입니다. 참고할 정보가 있습니다.",
  3: "주의가 필요한 수준입니다. 내용을 확인해보세요.",
  4: "경계가 필요한 수준입니다. 자세히 살펴보시길 권합니다.",
  5: "가장 위험한 수준입니다. 즉시 확인이 필요합니다."
};

// 정렬 — riskTier는 항상 1(안전)~5(위험)로 정규화되어 있으므로 숫자 그대로 비교하면 됨.
// 같은 보고서라도 역설축(예: 확신신호)이면 risk_label은 "Critical"인데 riskTier는 1일 수 있는데,
// 이 정렬은 risk_label 텍스트가 아니라 riskTier 숫자를 기준으로 하므로 항상 일관된 위험순이 됨.
function sortResults(results, sortKey, sortDirection) {
  const sorted = [...results];
  const dir = sortDirection === "asc" ? 1 : -1;
  sorted.sort((a, b) => {
    if (sortKey === "date") return dir * (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    if (sortKey === "risk") return dir * (a.riskTier - b.riskTier);
    if (sortKey === "type") return dir * a.type.localeCompare(b.type, "ko");
    if (sortKey === "title") return dir * a.title.localeCompare(b.title, "ko");
    return 0;
  });
  return sorted;
}

// 실제로는 disclosure_type.group_code를 그대로 따라가야 함(문서 내용과 무관하게 순서로 배지를 매기지 않음).
// 각 문서는 자신의 실제 group_code 하나만 가지며, 검색 시 selectedTypes로 필터링만 적용함.
const MOCK_DISCLOSURES = [
  { id: "sample", type: "정기공시", title: "사업보고서 (2025.12)", date: "2026-03-31", riskLabel: "Low", riskTier: 1 },
  { id: "d2", type: "주요사항보고서", title: "유상증자결정", date: "2026-03-15", riskLabel: "High", riskTier: 4 },
  { id: "d3", type: "지분공시", title: "임원·주요주주특정증권등소유상황보고서", date: "2026-03-10", submitterOverride: "홍길동", riskLabel: "Critical", riskTier: 1 },
  { id: "d4", type: "기타공시", title: "단일판매·공급계약체결", date: "2026-02-28", riskLabel: "Neutral", riskTier: 2 },
  { id: "d5", type: "정기공시", title: "반기보고서 (2025.06)", date: "2025-08-14", riskLabel: "Low", riskTier: 1 },
  { id: "d6", type: "외부감사관련", title: "감사보고서 (2025.12)", date: "2026-03-29", riskLabel: "한정", riskTier: 5 },
  { id: "d7", type: "거래소공시", title: "현금·현물배당결정", date: "2026-03-20", riskLabel: "Low", riskTier: 1 },
  { id: "d8", type: "공정위공시", title: "대규모내부거래관련공시", date: "2026-03-05", riskLabel: "Warning", riskTier: 3 },
  { id: "d9", type: "자산유동화", title: "자산유동화증권발행신고서", date: "2026-02-20", riskLabel: "High", riskTier: 4 },
  { id: "d10", type: "펀드공시", title: "집합투자증권결산서", date: "2026-02-10", riskLabel: "Low", riskTier: 1 },
  { id: "d11", type: "발행공시", title: "주권상장법인의증권신고서", date: "2026-01-28", riskLabel: "Neutral", riskTier: 2 },
  { id: "d12", type: "주요사항보고서", title: "타법인주식및출자증권양수결정", date: "2026-01-15", riskLabel: "High", riskTier: 4 }
];

const PAGE_SIZE = 5;

const generateMockResults = (companyName, selectedTypes) => {
  const filtered = selectedTypes.length > 0 ? MOCK_DISCLOSURES.filter((d) => selectedTypes.includes(d.type)) : MOCK_DISCLOSURES;
  return filtered.map((d) => ({
    id: d.id,
    company: companyName || "삼성전자",
    type: d.type,
    title: d.title,
    date: d.date,
    submitter: d.submitterOverride || companyName || "삼성전자",
    riskLabel: d.riskLabel,
    riskTier: d.riskTier
  }));
};


export function DisclosureSearch() {
  const navigate = useNavigate();
  const today = /* @__PURE__ */ new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: firstDayOfMonth,
    to: today
  });
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 정렬 — sortKey가 null이면 검색결과 원본 순서(최신순) 그대로 사용
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc");

  const sortedResults = results ? (sortKey ? sortResults(results, sortKey, sortDirection) : results) : [];
  const totalPages = results ? Math.max(1, Math.ceil(results.length / PAGE_SIZE)) : 1;
  const pagedResults = sortedResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 헤더 클릭 -> 같은 컬럼이면 방향 토글, 다른 컬럼이면 내림차순(위험도/최신순)으로 새로 시작
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // 전체보기 = 선택된 유형이 하나도 없는 상태
  const isAllSelected = selectedTypes.length === 0;

  const toggleType = (type) => {
    setSelectedTypes(
      (prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // 전체보기 클릭 시 모든 개별 선택을 해제 -> 검색 시 모든 유형 포함
  const selectAllTypes = () => {
    setSelectedTypes([]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setCurrentPage(1);
    setSortKey(null);
    setTimeout(() => {
      setResults(generateMockResults(searchTerm, selectedTypes));
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Calendar Styling */
        .rdp {
          --rdp-color-selected: #2563eb;
          --rdp-color-selected-hover: #1d4ed8;
          --rdp-cell-size: 36px;
          margin: 0;
        }
        .rdp-day_selected,
        .rdp-day_selected:focus-visible,
        .rdp-day_selected:hover {
          color: white;
          opacity: 1;
          background-color: var(--rdp-color-selected);
        }
        .rdp-day_range_middle {
          background-color: #eff6ff !important;
          color: #1e3a8a !important;
          border-radius: 0 !important;
        }
        .rdp-day_range_start {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
        .rdp-day_range_end {
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
        }
      `}</style>

      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FileText className="text-blue-600" size={32} />
          공시 통합 검색
        </h1>
        <p className="text-slate-500 text-lg">
          기업명과 공시 유형을 선택하여 필요한 다트(DART) 공시를 빠르고 정확하게 검색하세요.
        </p>
      </div>

      {/* Search Form Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
        <form onSubmit={handleSearch} className="space-y-8">

          {/* Company Name and Date Range Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 size={16} />
                기업명 또는 종목코드
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="예: 삼성전자, 005930"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <CalendarIcon size={16} />
                공시 기간
              </label>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner text-left flex items-center justify-between"
                  >
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy-MM-dd")} ~ {format(dateRange.to, "yyyy-MM-dd")}
                        </>
                      ) : (
                        format(dateRange.from, "yyyy-MM-dd")
                      )
                    ) : (
                      <span className="text-slate-400">기간을 선택하세요</span>
                    )}
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    align="start"
                    className="z-50 bg-white p-3 rounded-2xl shadow-xl border border-slate-200"
                    sideOffset={8}
                  >
                    <DayPicker
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      locale={ko}
                      showOutsideDays
                      className="text-sm"
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>

          {/* Disclosure Types Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Filter size={16} />
                공시 유형 (다중 선택 가능)
              </label>
              <button
                type="button"
                onClick={() => setSelectedTypes([])}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
              >
                선택 초기화
              </button>
            </div>

            <div className="flex w-full gap-1.5 sm:gap-2">
              {/* 전체보기 버튼: 선택된 유형이 없을 때(=전체 검색) 활성 표시되는 첫 번째 칩 */}
              <button
                type="button"
                onClick={selectAllTypes}
                aria-pressed={isAllSelected}
                className={`flex-1 py-2 px-1 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 border whitespace-nowrap
                  ${isAllSelected
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
              >
                {isAllSelected && <CheckCircle2 size={12} className="text-blue-600 flex-shrink-0" />}
                {!isAllSelected && <LayoutGrid size={12} className="text-slate-400 flex-shrink-0" />}
                <span>전체보기</span>
              </button>

              {DISCLOSURE_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`flex-1 py-2 px-1 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 border whitespace-nowrap
                      ${isSelected
                        ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                  >
                    {isSelected && <CheckCircle2 size={12} className="text-blue-600 flex-shrink-0" />}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">
              {isAllSelected
                ? "전체보기가 선택되어, 해당 기업과 기간에 포함된 모든 공시 유형을 검색합니다."
                : `${selectedTypes.length}개 유형으로 필터링하여 검색합니다.`}
            </p>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search size={20} />
                공시 검색하기
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            검색 결과 <span className="text-blue-600">{results.length}</span>건
            {selectedTypes.length > 0 ? (
              <span className="text-sm font-normal text-slate-500 ml-2">
                (필터 적용됨: {selectedTypes.length}개)
              </span>
            ) : (
              <span className="text-sm font-normal text-slate-500 ml-2">
                (전체보기)
              </span>
            )}
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <SortableHeader label="공시일자" sortKeyName="date" className="w-28" {...{ sortKey, sortDirection, onSort: handleSort }} />
                    <SortableHeader label="공시유형" sortKeyName="type" className="w-32" {...{ sortKey, sortDirection, onSort: handleSort }} />
                    <SortableHeader label="공시제목" sortKeyName="title" {...{ sortKey, sortDirection, onSort: handleSort }} />
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-32">제출인</th>
                    <SortableHeader label="위험도" sortKeyName="risk" className="w-24" {...{ sortKey, sortDirection, onSort: handleSort }} />
                    <th className="px-6 py-4 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedResults.map((result) => (
                    <tr
                      key={result.id}
                      onClick={() => navigate(`/disclosure/${result.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                          <CalendarIcon size={14} />
                          {result.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200">
                          {result.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {result.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{result.company}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {result.submitter}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-help ${RISK_TIER_TEXT[result.riskTier] ?? RISK_TIER_TEXT[3]}`}
                          title={RISK_TIER_DESCRIPTION[result.riskTier] ?? RISK_TIER_DESCRIPTION[3]}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${RISK_TIER_DOT[result.riskTier] ?? RISK_TIER_DOT[3]} shrink-0`} />
                          {result.riskLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                          <ChevronRight size={16} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {results.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-900">검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 기업명이나 조건으로 검색해보세요.</p>
              </div>
            )}

            {/* 페이지네이션 — 검색결과가 PAGE_SIZE(5건)를 넘으면 표시 */}
            {results.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, results.length)} / {results.length}건
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === currentPage ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 정렬 가능한 테이블 헤더.
// 현재 정렬중인 컬럼이면 위/아래 화살표로 방향을 보여주고, 아니면 중립 아이콘만 옅게 표시.
function SortableHeader({ label, sortKeyName, sortKey, sortDirection, onSort, className = "" }) {
  const isActive = sortKey === sortKeyName;
  const Icon = isActive ? (sortDirection === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKeyName)}
        className={`flex items-center gap-1 hover:text-slate-800 transition-colors ${isActive ? "text-slate-900" : ""}`}
      >
        {label}
        <Icon size={12} className={isActive ? "text-blue-600" : "text-slate-300"} />
      </button>
    </th>
  );
}
