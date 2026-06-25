import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, FileText, CheckCircle2, ChevronRight, Building2, Calendar as CalendarIcon, Filter } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as Popover from "@radix-ui/react-popover";
import "react-day-picker/dist/style.css";
const DISCLOSURE_TYPES = [
  "\uC815\uAE30\uACF5\uC2DC",
  "\uC8FC\uC694\uC0AC\uD56D\uBCF4\uACE0\uC11C",
  "\uBC1C\uD589\uACF5\uC2DC",
  "\uC9C0\uBD84\uACF5\uC2DC",
  "\uAE30\uD0C0\uACF5\uC2DC",
  "\uC678\uBD80\uAC10\uC0AC\uAD00\uB828",
  "\uD380\uB4DC\uACF5\uC2DC",
  "\uC790\uC0B0\uC720\uB3D9\uD654",
  "\uAC70\uB798\uC18C\uACF5\uC2DC",
  "\uACF5\uC815\uC704\uACF5\uC2DC"
];
const generateMockResults = (companyName, selectedTypes) => {
  const typesToUse = selectedTypes.length > 0 ? selectedTypes : DISCLOSURE_TYPES;
  return [
    { id: "sample", company: companyName || "\uC0BC\uC131\uC804\uC790", type: typesToUse[0 % typesToUse.length], title: "\uC0AC\uC5C5\uBCF4\uACE0\uC11C (2025.12)", date: "2026-03-31", submitter: companyName || "\uC0BC\uC131\uC804\uC790" },
    { id: "d2", company: companyName || "\uC0BC\uC131\uC804\uC790", type: typesToUse[1 % typesToUse.length], title: "\uC720\uC0C1\uC99D\uC790\uACB0\uC815", date: "2026-03-15", submitter: companyName || "\uC0BC\uC131\uC804\uC790" },
    { id: "d3", company: companyName || "\uC0BC\uC131\uC804\uC790", type: typesToUse[2 % typesToUse.length] || "\uC9C0\uBD84\uACF5\uC2DC", title: "\uC784\uC6D0\u318D\uC8FC\uC694\uC8FC\uC8FC\uD2B9\uC815\uC99D\uAD8C\uB4F1\uC18C\uC720\uC0C1\uD669\uBCF4\uACE0\uC11C", date: "2026-03-10", submitter: "\uD64D\uAE38\uB3D9" },
    { id: "d4", company: companyName || "\uC0BC\uC131\uC804\uC790", type: typesToUse[3 % typesToUse.length] || "\uAE30\uD0C0\uACF5\uC2DC", title: "\uB2E8\uC77C\uD310\uB9E4\u318D\uACF5\uAE09\uACC4\uC57D\uCCB4\uACB0", date: "2026-02-28", submitter: companyName || "\uC0BC\uC131\uC804\uC790" },
    { id: "d5", company: companyName || "\uC0BC\uC131\uC804\uC790", type: typesToUse[4 % typesToUse.length] || "\uC815\uAE30\uACF5\uC2DC", title: "\uBC18\uAE30\uBCF4\uACE0\uC11C (2025.06)", date: "2025-08-14", submitter: companyName || "\uC0BC\uC131\uC804\uC790" }
  ];
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
  const toggleType = (type) => {
    setSelectedTypes(
      (prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setResults(generateMockResults(searchTerm, selectedTypes));
      setIsSearching(false);
    }, 600);
  };
  return <div className="max-w-5xl mx-auto">
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
      {
    /* Header section */
  }
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FileText className="text-blue-600" size={32} />
          공시 통합 검색
        </h1>
        <p className="text-slate-500 text-lg">
          기업명과 공시 유형을 선택하여 필요한 다트(DART) 공시를 빠르고 정확하게 검색하세요.
        </p>
      </div>

      {
    /* Search Form Card */
  }
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
        <form onSubmit={handleSearch} className="space-y-8">
          
          {
    /* Company Name and Date Range Inputs */
  }
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
                    {dateRange?.from ? dateRange.to ? <>
                          {format(dateRange.from, "yyyy-MM-dd")} ~ {format(dateRange.to, "yyyy-MM-dd")}
                        </> : format(dateRange.from, "yyyy-MM-dd") : <span className="text-slate-400">기간을 선택하세요</span>}
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

          {
    /* Disclosure Types Selection */
  }
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
              {DISCLOSURE_TYPES.map((type) => {
    const isSelected = selectedTypes.includes(type);
    return <button
      key={type}
      type="button"
      onClick={() => toggleType(type)}
      className={`flex-1 py-2 px-1 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 border whitespace-nowrap
                      ${isSelected ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
    >
                    {isSelected && <CheckCircle2 size={12} className="text-blue-600 flex-shrink-0" />}
                    <span>{type}</span>
                  </button>;
  })}
            </div>
          </div>

          {
    /* Search Button */
  }
          <button
    type="submit"
    disabled={isSearching || !searchTerm.trim()}
    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
  >
            {isSearching ? <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                검색 중...
              </> : <>
                <Search size={20} />
                공시 검색하기
              </>}
          </button>
        </form>
      </div>

      {
    /* Results Section */
  }
      {results && <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            검색 결과 <span className="text-blue-600">{results.length}</span>건
            {selectedTypes.length > 0 && <span className="text-sm font-normal text-slate-500 ml-2">
                (필터 적용됨: {selectedTypes.length}개)
              </span>}
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-28">공시일자</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-32">공시유형</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">공시제목</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-32">제출인</th>
                    <th className="px-6 py-4 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((result) => <tr
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
                      <td className="px-6 py-4 text-right">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                          <ChevronRight size={16} />
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            
            {results.length === 0 && <div className="p-12 text-center text-slate-500">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-900">검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 기업명이나 조건으로 검색해보세요.</p>
              </div>}
          </div>
        </div>}
    </div>;
}
