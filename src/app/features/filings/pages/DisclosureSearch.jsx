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
import * as Popover from "@radix-ui/react-popover";
import { DISCLOSURE_GROUPS, getDisclosureGroupLabel } from "../constants";
import { useLocale } from "@/app/shared/i18n";
import { getDateFnsLocale } from "@/app/shared/i18n/localeFormat";
import { searchDisclosures } from "../api/disclosureApi";
import { RiskBadge } from "../components/RiskBadge";
import {
  CARD,
  PAGE_TITLE,
  PAGE_DESC,
  LABEL,
  INPUT,
  BTN_PRIMARY,
  ALERT_INFO,
  ALERT_ERROR,
  BADGE_NEUTRAL,
  ROW_HOVER,
  ROW_DIVIDER,
} from "@/app/shared/lib/uiRecipes";
import "react-day-picker/dist/style.css";

const PAGE_SIZE = 5;

export function DisclosureSearch() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const dateFnsLocale = getDateFnsLocale(locale);
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
          ? t("disclosure.search.collectDone", {
              stocks: data.savedStockCount ?? 0,
              disclosures: data.savedDisclosureCount ?? 0,
              skipped: data.skippedCount > 0
                ? t("disclosure.search.collectSkipped", { count: data.skippedCount })
                : "",
            })
          : null
      );
    } catch (error) {
      setSearchError(error.message ?? t("disclosure.search.errorDefault"));
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
    <div className="container">
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
        <h1 className={`${PAGE_TITLE} mb-2 flex items-center gap-2`}>
          <FileText className="text-blue-600 dark:text-blue-400" size={32} />
          {t("disclosure.search.title")}
        </h1>
        <p className={PAGE_DESC}>
          {t("disclosure.search.description")}
        </p>
      </div>

      <div className={`${CARD} shadow-sm p-8 mb-8`}>
        <form onSubmit={handleSearch} className="space-y-8">
          <div className="grid grid-cols-[1fr_300px] gap-6">
            <div className="space-y-3">
              <label className={`${LABEL} flex items-center gap-2`}>
                <Building2 size={16} />
                {t("disclosure.search.companyLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t("disclosure.search.companyPlaceholder")}
                  className={`${INPUT} pl-12 h-12 text-base`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`${LABEL} flex items-center gap-2`}>
                <CalendarIcon size={16} />
                {t("disclosure.search.dateRangeLabel")}
              </label>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className={`${INPUT} h-12 text-left flex items-center justify-between`}
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
                      <span className="text-slate-400 dark:text-slate-500">{t("disclosure.search.dateRangePlaceholder")}</span>
                    )}
                    <CalendarIcon size={16} className="text-slate-400 dark:text-slate-500" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    align="start"
                    className="z-50 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800"
                    sideOffset={8}
                  >
                    <DayPicker
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      locale={dateFnsLocale}
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
              <label className={`${LABEL} flex items-center gap-2`}>
                <Filter size={16} />
                {t("disclosure.search.typeLabel")}
              </label>
              <button
                type="button"
                onClick={() => setSelectedTypeCodes([])}
                className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                {t("disclosure.search.typeReset")}
              </button>
            </div>

            <div className="grid grid-cols-11 gap-2">
              <DisclosureTypeButton
                label={t("disclosure.search.typeAll")}
                selected={isAllSelected}
                onClick={() => setSelectedTypeCodes([])}
                icon={isAllSelected ? <CheckCircle2 size={12} /> : <LayoutGrid size={12} />}
              />
              {DISCLOSURE_GROUPS.map((group) => (
                <DisclosureTypeButton
                  key={group.code}
                  label={getDisclosureGroupLabel(t, group.code)}
                  selected={selectedTypeCodes.includes(group.code)}
                  onClick={() => toggleType(group.code)}
                  icon={selectedTypeCodes.includes(group.code) ? <CheckCircle2 size={12} /> : null}
                />
              ))}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isAllSelected
                ? t("disclosure.search.typeAllHint")
                : t("disclosure.search.typeFilterHint", { count: selectedTypeCodes.length })}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim() || !dateRange?.from || !dateRange?.to}
            className={`${BTN_PRIMARY} w-full h-12 text-lg rounded-xl shadow-md`}
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("disclosure.search.searching")}
              </>
            ) : (
              <>
                <Search size={20} />
                {t("disclosure.search.submit")}
              </>
            )}
          </button>
        </form>
      </div>

      {collectMessage && !searchError && (
        <div className={`${ALERT_INFO} mb-6`}>
          {collectMessage}
        </div>
      )}

      {searchError && (
        <div className={ALERT_ERROR}>
          {searchError}
        </div>
      )}

      {results && !searchError && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {t("disclosure.search.resultsTitle")}{" "}
              <span className="text-blue-600 dark:text-blue-400">{totalElements}</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedTypeCodes.length > 0
                ? t("disclosure.search.resultsFilter", { count: selectedTypeCodes.length })
                : t("disclosure.search.resultsAllTypes")}
            </p>
          </div>

          <div className={`${CARD} shadow-sm overflow-x-auto`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <SortableHeader label={t("disclosure.search.table.filedAt")} sortKeyName="date" className="w-40" {...{ sortKey, sortDirection, onSort: handleSort }} />
                  <SortableHeader label={t("disclosure.search.table.type")} sortKeyName="type" className="w-36" {...{ sortKey, sortDirection, onSort: handleSort }} />
                  <SortableHeader label={t("disclosure.search.table.title")} sortKeyName="title" {...{ sortKey, sortDirection, onSort: handleSort }} />
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 w-36">{t("disclosure.search.table.filer")}</th>
                  <SortableHeader label={t("disclosure.search.table.risk")} sortKeyName="risk" className="w-28" {...{ sortKey, sortDirection, onSort: handleSort }} />
                  <th className="px-6 py-4 w-12" />
                </tr>
              </thead>
              <tbody className={ROW_DIVIDER}>
                {pagedResults.map((result) => (
                  <tr
                    key={result.rceptNo}
                    onClick={() => {
                      saveState({ searchTerm, selectedTypeCodes, dateRange, collectMessage, results, currentPage, sortKey, sortDirection, lastSearchedTerm });
                      navigate(`/disclosure/${result.rceptNo}?company=${encodeURIComponent(result.companyName)}`);
                    }}
                    className={ROW_HOVER}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <CalendarIcon size={14} />
                        {result.filedAt}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${BADGE_NEUTRAL} whitespace-nowrap`}>
                        {result.typeName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {result.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{result.companyName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{result.filerName}</td>
                    <td className="px-6 py-4">
                      {result.riskLabel ? (
                        <RiskBadge riskLabel={result.riskLabel} riskTier={result.riskTier} compact />
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">{t("disclosure.search.beforeSummary")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:border-blue-200 dark:group-hover:border-blue-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all shadow-sm">
                        <ChevronRight size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalElements === 0 && (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100">{t("disclosure.search.noResults.title")}</p>
                <p className="text-sm mt-1">{t("disclosure.search.noResults.hint")}</p>
              </div>
            )}

            {totalElements > PAGE_SIZE && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t("disclosure.search.pagination", {
                    start: (currentPage - 1) * PAGE_SIZE + 1,
                    end: Math.min(currentPage * PAGE_SIZE, totalElements),
                    total: totalElements,
                  })}
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  prevLabel={t("disclosure.search.prevPage")}
                  nextLabel={t("disclosure.search.nextPage")}
                />
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
          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"}`}
    >
      {icon && <span className={selected ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

function SortableHeader({ label, sortKeyName, sortKey, sortDirection, onSort, className = "" }) {
  const isActive = sortKey === sortKeyName;
  const Icon = isActive ? (sortDirection === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKeyName)}
        className={`flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ${isActive ? "text-slate-900 dark:text-slate-100" : ""}`}
      >
        {label}
        <Icon size={12} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-slate-600"} />
      </button>
    </th>
  );
}

function Pagination({ currentPage, totalPages, onPageChange, prevLabel, nextLabel }) {
  const pages = buildVisiblePages(currentPage, totalPages);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange((page) => Math.max(1, page - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label={prevLabel}
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="w-8 text-center text-xs text-slate-400 dark:text-slate-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label={nextLabel}
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
