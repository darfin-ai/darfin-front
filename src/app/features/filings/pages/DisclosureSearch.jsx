import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const SESSION_KEY = "disclosureSearchState";

function loadState() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    // Date 객체 복원
    return {
      ...s,
      dateRange: {
        from: s.dateRange?.from ? new Date(s.dateRange.from) : null,
        to:   s.dateRange?.to   ? new Date(s.dateRange.to)   : null,
      },
    };
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  LayoutGrid,
  Search
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as Popover from "@radix-ui/react-popover";
import { DISCLOSURE_GROUPS } from "../constants";
import { searchDisclosures } from "../api/disclosureApi";
import { RiskBadge } from "../components/RiskBadge";
import "react-day-picker/dist/style.css";

const PAGE_SIZE = 5;

export function DisclosureSearch() {
  const navigate = useNavigate();
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

  const saved = loadState();

  const [searchTerm, setSearchTerm] = useState(saved?.searchTerm ?? "");
  const [selectedTypeCodes, setSelectedTypeCodes] = useState(saved?.selectedTypeCodes ?? []);
  const [dateRange, setDateRange] = useState(saved?.dateRange ?? { from: firstDayOfYear, to: today });
  const [isSearching, setIsSearching] = useState(false);
  const [collectMessage, setCollectMessage] = useState(saved?.collectMessage ?? null);
  const [searchError, setSearchError] = useState(null);
  const [results, setResults] = useState(saved?.results ?? null);
  const [currentPage, setCurrentPage] = useState(saved?.currentPage ?? 1);
  const [sortKey, setSortKey] = useState(saved?.sortKey ?? null);
  const [sortDirection, setSortDirection] = useState(saved?.sortDirection ?? "desc");
  const [lastSearchedTerm, setLastSearchedTerm] = useState(saved?.lastSearchedTerm ?? null);

  // 상태가 바뀔 때마다 sessionStorage에 저장
  useEffect(() => {
    saveState({ searchTerm, selectedTypeCodes, dateRange, collectMessage, results, currentPage, sortKey, sortDirection, lastSearchedTerm });
  }, [searchTerm, selectedTypeCodes, dateRange, collectMessage, results, currentPage, sortKey, sortDirection, lastSearchedTerm]);

  const pagedResults = results?.content ?? [];
  const totalElements = results?.totalElements ?? 0;
  const totalPages = results?.totalPages ?? 1;
  const isAllSelected = selectedTypeCodes.length === 0;

  // 공시 검색하기 버튼 하나로 통합된 로직.
  // 서버(/api/disclosures)가 DB에 데이터가 없으면 DART에서 자동 수집한 뒤 검색 결과를 내려주고,
  // 이미 수집되어 있으면 DART 호출 없이 DB 조회만 수행한다.
  const performSearch = async ({ companyName, page, key, direction }) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const data = await searchDisclosures({
        companyName,
        dateFrom: dateRange?.from,
        dateTo: dateRange?.to,
        typeCodes: selectedTypeCodes,
        sortKey: key,
        sortDirection: direction,
        page: page - 1, // 백엔드는 0부터 시작하는 페이지 번호를 받음
        size: PAGE_SIZE
      });

      setResults(data.results);
      setCollectMessage(
        data.collected
          ? `DART 수집 완료: 종목 ${data.savedStockCount ?? 0}건, 공시 ${data.savedDisclosureCount ?? 0}건 저장` +
              (data.skippedCount > 0 ? ` (미등록 유형으로 ${data.skippedCount}건 제외됨)` : "")
          : null
      );
    } catch (error) {
      setSearchError(error.message ?? "검색 중 오류가 발생했습니다.");
      setResults(null);
      setCollectMessage(null);
    } finally {
      setIsSearching(false);
    }
  };

  const runSearch = async ({ page = currentPage, key = sortKey, direction = sortDirection } = {}) => {
    if (!lastSearchedTerm) return;
    await performSearch({ companyName: lastSearchedTerm, page, key, direction });
  };

  // sessionStorage에 캐시된 results는 상세보기에서 AI 요약/분석을 새로 생성하기 전 시점의
  // 스냅샷일 수 있다(riskLabel 등이 그 사이 바뀌어도 캐시에는 반영 안 됨). 뒤로가기로 이
  // 화면에 돌아왔을 때 캐시를 먼저 보여주되, 조용히 서버에서 한 번 다시 받아와 최신 상태로
  // 교체한다.
  useEffect(() => {
    if (saved?.lastSearchedTerm) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (key) => {
    let nextDirection = "desc";
    if (sortKey === key) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(nextDirection);
    } else {
      setSortKey(key);
    }
    setCurrentPage(1);
    runSearch({ page: 1, key, direction: nextDirection });
  };

  const handlePageChange = (updater) => {
    setCurrentPage((prevPage) => {
      const nextPage = typeof updater === "function" ? updater(prevPage) : updater;
      runSearch({ page: nextPage });
      return nextPage;
    });
  };

  const toggleType = (typeCode) => {
    setSelectedTypeCodes((prev) =>
      prev.includes(typeCode) ? prev.filter((code) => code !== typeCode) : [...prev, typeCode]
    );
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;

    const companyName = searchTerm.trim();

    setCurrentPage(1);
    setSortKey(null);
    setSortDirection("desc");
    setLastSearchedTerm(companyName);

    performSearch({ companyName, page: 1, key: null, direction: "desc" });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <style>{`
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FileText className="text-blue-600" size={32} />
          공시 통합 검색
        </h1>
        <p className="text-slate-500 text-lg">
          기업명과 공시 유형, 기간을 선택해 DART 공시를 빠르게 확인하세요.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
        <form onSubmit={handleSearch} className="space-y-8">
          <div className="grid grid-cols-[1fr_300px] gap-6">
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
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="예: 삼성전자, 005930"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left flex items-center justify-between"
                  >
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span>
                          {format(dateRange.from, "yyyy-MM-dd")} ~ {format(dateRange.to, "yyyy-MM-dd")}
                        </span>
                      ) : (
                        format(dateRange.from, "yyyy-MM-dd")
                      )
                    ) : (
                      <span className="text-slate-400">기간을 선택하세요</span>
                    )}
                    <CalendarIcon size={16} className="text-slate-400" />
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Filter size={16} />
                공시 유형
              </label>
              <button
                type="button"
                onClick={() => setSelectedTypeCodes([])}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
              >
                선택 초기화
              </button>
            </div>

            <div className="grid grid-cols-11 gap-2">
              <DisclosureTypeButton
                label="전체"
                selected={isAllSelected}
                onClick={() => setSelectedTypeCodes([])}
                icon={isAllSelected ? <CheckCircle2 size={12} /> : <LayoutGrid size={12} />}
              />
              {DISCLOSURE_GROUPS.map((group) => (
                <DisclosureTypeButton
                  key={group.code}
                  label={group.label}
                  selected={selectedTypeCodes.includes(group.code)}
                  onClick={() => toggleType(group.code)}
                  icon={selectedTypeCodes.includes(group.code) ? <CheckCircle2 size={12} /> : null}
                />
              ))}
            </div>

            <p className="text-xs text-slate-400">
              {isAllSelected
                ? "전체 공시 유형을 대상으로 검색합니다."
                : `${selectedTypeCodes.length}개 유형으로 필터링합니다.`}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim() || !dateRange?.from || !dateRange?.to}
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

      {collectMessage && !searchError && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-blue-700 text-sm mb-6">
          {collectMessage}
        </div>
      )}

      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
          {searchError}
        </div>
      )}

      {results && !searchError && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              검색 결과 <span className="text-blue-600">{totalElements}</span>건
            </h2>
            <p className="text-sm text-slate-500">
              {selectedTypeCodes.length > 0 ? `필터 ${selectedTypeCodes.length}개 적용` : "전체 유형"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <SortableHeader label="공시일자" sortKeyName="date" className="w-40" {...{ sortKey, sortDirection, onSort: handleSort }} />
                  <SortableHeader label="공시유형" sortKeyName="type" className="w-36" {...{ sortKey, sortDirection, onSort: handleSort }} />
                  <SortableHeader label="공시제목" sortKeyName="title" {...{ sortKey, sortDirection, onSort: handleSort }} />
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 w-36">제출인</th>
                  <SortableHeader label="위험도" sortKeyName="risk" className="w-28" {...{ sortKey, sortDirection, onSort: handleSort }} />
                  <th className="px-6 py-4 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedResults.map((result) => (
                  <tr
                    key={result.rceptNo}
                    onClick={() => {
                      saveState({ searchTerm, selectedTypeCodes, dateRange, collectMessage, results, currentPage, sortKey, sortDirection, lastSearchedTerm });
                      navigate(`/disclosure/${result.rceptNo}?company=${encodeURIComponent(result.companyName)}`);
                    }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                        <CalendarIcon size={14} />
                        {result.filedAt}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200 whitespace-nowrap">
                        {result.typeName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {result.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{result.companyName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{result.filerName}</td>
                    <td className="px-6 py-4">
                      {result.riskLabel ? (
                        <RiskBadge riskLabel={result.riskLabel} riskTier={result.riskTier} compact />
                      ) : (
                        <span className="text-xs text-slate-400">요약 전</span>
                      )}
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

            {totalElements === 0 && (
              <div className="p-12 text-center text-slate-500">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-900">검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 기업명이나 기간, 공시 유형으로 다시 검색해 보세요.</p>
              </div>
            )}

            {totalElements > PAGE_SIZE && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalElements)} / {totalElements}건
                </p>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DisclosureTypeButton({ label, selected, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`h-10 rounded-lg text-[12px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 border whitespace-nowrap
        ${selected
          ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
    >
      {icon && <span className={selected ? "text-blue-600" : "text-slate-400"}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

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

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = buildVisiblePages(currentPage, totalPages);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange((page) => Math.max(1, page - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="w-8 text-center text-xs text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              page === currentPage ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange((page) => Math.min(totalPages, page + 1))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="다음 페이지"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function buildVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}
