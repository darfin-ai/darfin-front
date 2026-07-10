import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  subMonths,
  isSameDay,
} from "date-fns";
import * as Popover from "@radix-ui/react-popover";
import { DISCLOSURE_GROUPS, getDisclosureGroupLabel } from "../constants";
import { useLocale } from "@/app/shared/i18n";
import { usePageMeta } from "@/app/shared/hooks/usePageMeta";
import { getDateFnsLocale } from "@/app/shared/i18n/localeFormat";
import { searchDisclosures } from "../api/disclosureApi";
import { RiskBadge } from "../components/RiskBadge";
import { TodayDisclosures } from "../components/TodayDisclosures";
import {
  CARD,
  LABEL,
  ALERT_INFO,
  ALERT_ERROR,
  BADGE_NEUTRAL,
  ROW_HOVER,
  ROW_DIVIDER,
} from "@/app/shared/lib/uiRecipes";
import "react-day-picker/dist/style.css";

const SESSION_KEY = "disclosureSearchState";
const PAGE_SIZE = 5;

const DATE_PRESET_IDS = ["today", "week", "month", "sixMonths", "custom"];

function getDateRangeForPreset(preset) {
  const now = new Date();
  const end = endOfDay(now);
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: end };
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: end };
    case "month":
      return { from: startOfMonth(now), to: end };
    case "sixMonths":
      return { from: startOfDay(subMonths(now, 6)), to: end };
    default:
      return null;
  }
}

function inferDatePreset(range) {
  if (!range?.from || !range?.to) return "sixMonths";
  for (const preset of DATE_PRESET_IDS) {
    if (preset === "custom") continue;
    const expected = getDateRangeForPreset(preset);
    if (
      expected &&
      isSameDay(range.from, expected.from) &&
      isSameDay(range.to, expected.to)
    ) {
      return preset;
    }
  }
  return "custom";
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const dateRange = {
      from: s.dateRange?.from ? new Date(s.dateRange.from) : null,
      to: s.dateRange?.to ? new Date(s.dateRange.to) : null,
    };
    return {
      ...s,
      dateRange,
      datePreset: s.datePreset ?? inferDatePreset(dateRange),
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

/** Stagger presets aligned with company-analysis list entrances (CompanyQuickLinks, CompanyCard). */
function getStaggerVariants(reduceMotion, { stagger = 0.03, delayChildren = 0 } = {}) {
  if (reduceMotion) {
    return {
      container: { hidden: {}, show: {} },
      item: { hidden: {}, show: {} },
    };
  }
  return {
    container: {
      hidden: {},
      show: {
        transition: { staggerChildren: stagger, delayChildren },
      },
    },
    item: {
      hidden: { opacity: 0, y: 8 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" },
      },
    },
  };
}

export function DisclosureSearch() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();

  usePageMeta({
    title: t("seo.disclosure.title"),
    description: t("seo.disclosure.description"),
  });

  const dateFnsLocale = getDateFnsLocale(locale);
  const today = new Date();

  const saved = loadState();
  const defaultPreset = "sixMonths";
  const defaultRange = getDateRangeForPreset(defaultPreset);

  const [searchTerm, setSearchTerm] = useState(saved?.searchTerm ?? "");
  const [selectedTypeCodes, setSelectedTypeCodes] = useState(saved?.selectedTypeCodes ?? []);
  const [datePreset, setDatePreset] = useState(saved?.datePreset ?? defaultPreset);
  const [dateRange, setDateRange] = useState(saved?.dateRange ?? defaultRange);
  const [isSearching, setIsSearching] = useState(false);
  const [collectMessage, setCollectMessage] = useState(saved?.collectMessage ?? null);
  const [searchError, setSearchError] = useState(null);
  const [results, setResults] = useState(saved?.results ?? null);
  const [currentPage, setCurrentPage] = useState(saved?.currentPage ?? 1);
  const [sortKey, setSortKey] = useState(saved?.sortKey ?? null);
  const [sortDirection, setSortDirection] = useState(saved?.sortDirection ?? "desc");
  const [lastSearchedTerm, setLastSearchedTerm] = useState(saved?.lastSearchedTerm ?? null);
  // Filters already default to "last 6 months, all types" and work without being opened —
  // only expand automatically if the user had customized them in a previous visit.
  const [filtersOpen, setFiltersOpen] = useState(
    () => datePreset !== defaultPreset || selectedTypeCodes.length > 0
  );
  const reduceMotion = useReducedMotion();
  const [introDone, setIntroDone] = useState(!!reduceMotion);
  const pageStagger = getStaggerVariants(reduceMotion, { stagger: 0.05, delayChildren: 0.04 });
  // Chips wait for title → description → search → filter summary before cascading in.
  const filterChipStagger = getStaggerVariants(reduceMotion, {
    stagger: 0.05,
    delayChildren: introDone ? 0.1 : 0.38,
  });
  const chipRowStagger = getStaggerVariants(reduceMotion, { stagger: 0.03, delayChildren: 0 });

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = setTimeout(() => setIntroDone(true), 520);
    return () => clearTimeout(id);
  }, [reduceMotion]);

  useEffect(() => {
    saveState({
      searchTerm,
      selectedTypeCodes,
      datePreset,
      dateRange,
      collectMessage,
      results,
      currentPage,
      sortKey,
      sortDirection,
      lastSearchedTerm,
    });
  }, [
    searchTerm,
    selectedTypeCodes,
    datePreset,
    dateRange,
    collectMessage,
    results,
    currentPage,
    sortKey,
    sortDirection,
    lastSearchedTerm,
  ]);

  const pagedResults = results?.content ?? [];
  const totalElements = results?.totalElements ?? 0;
  const totalPages = results?.totalPages ?? 1;
  const isAllSelected = selectedTypeCodes.length === 0;

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
        page: page - 1,
        size: PAGE_SIZE,
      });

      setResults(data.results);
      setCollectMessage(
        data.collected
          ? t("disclosure.search.collectDone", {
              stocks: data.savedStockCount ?? 0,
              disclosures: data.savedDisclosureCount ?? 0,
              skipped:
                data.skippedCount > 0
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

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    if (preset !== "custom") {
      const nextRange = getDateRangeForPreset(preset);
      if (nextRange) setDateRange(nextRange);
    }
  };

  const handleCustomRangeSelect = (range) => {
    setDateRange(range);
    setDatePreset("custom");
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

  // 검색창을 비우면 이전 검색 결과를 그대로 붙들고 있지 않고 "오늘 올라온 공시"로
  // 되돌아간다 — results가 null이어야 TodayDisclosures가 다시 렌더링된다.
  const handleSearchTermChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setResults(null);
      setCollectMessage(null);
      setSearchError(null);
      setLastSearchedTerm(null);
      setCurrentPage(1);
      setSortKey(null);
      setSortDirection("desc");
    }
  };

  const presetLabels = t("disclosure.search.datePresets");
  const dateSummary =
    datePreset === "custom" && dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "M/d")} ~ ${format(dateRange.to, "M/d")}`
      : presetLabels[datePreset];
  const typeSummary = isAllSelected
    ? t("disclosure.search.typeAll")
    : t("disclosure.search.typeSelectedCount", { count: selectedTypeCodes.length });

  return (
    <div className="container max-w-[1180px] pb-16">
      {/*
        react-day-picker renders its own class names, so Tailwind utility
        classes can't reach them — these overrides use the hex values of
        the equivalent Tailwind tokens (annotated below) with an explicit
        dark: pair, per DESIGN_SYSTEM.md §1.3.
      */}
      <style>{`
        .rdp {
          --rdp-color-selected: #2563eb; /* blue-600 */
          --rdp-color-selected-hover: #1d4ed8; /* blue-700 */
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
          background-color: #eff6ff !important; /* blue-50 */
          color: #1e3a8a !important; /* blue-900 */
          border-radius: 0 !important;
        }
        .dark .rdp-day_range_middle {
          background-color: rgba(30, 58, 138, 0.35) !important; /* blue-900/35 */
          color: #93c5fd !important; /* blue-300 */
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

      <motion.div
        variants={pageStagger.container}
        initial="hidden"
        animate="show"
      >
      {/* Page header — spacing matches CompaniesGrid (pt-10 pb-2, mb-6 before search) */}
      <div className="pt-10 pb-2">
        <div className="mb-6 text-center">
          <motion.div variants={pageStagger.item}>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t("disclosure.search.title")}
            </h1>
          </motion.div>
          <motion.p
            variants={pageStagger.item}
            className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-[36rem] mx-auto"
          >
            {t("disclosure.search.description")}
          </motion.p>
        </div>

      <form onSubmit={handleSearch} className="space-y-6">
        {/* Primary search — submit sits inside the pill as a round icon button */}
        <motion.div variants={pageStagger.item} className="relative mx-auto w-full max-w-2xl">
          <div className="group relative flex h-14 items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-5 pr-1.5 shadow-sm dark:shadow-none transition-all duration-300 focus-within:border-blue-300 dark:focus-within:border-blue-600 focus-within:shadow-lg focus-within:shadow-blue-500/10 dark:focus-within:shadow-blue-500/5 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-500/20">
            <Search className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchTermChange}
              placeholder={t("disclosure.search.companyPlaceholder")}
              aria-label={t("disclosure.search.companyLabel")}
              className="w-full min-w-0 flex-1 border-none bg-transparent text-base text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isSearching || !searchTerm.trim() || !dateRange?.from || !dateRange?.to}
              aria-label={t("disclosure.search.submit")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ArrowRight size={18} strokeWidth={2.25} />
              )}
            </button>
          </div>
        </motion.div>

        {/* Filters are optional — search already runs on the defaults (last 6 months, all
            types) shown in this summary, so opening the panel is only needed to narrow things down. */}
        <motion.div variants={pageStagger.item} className="mx-auto w-full max-w-2xl">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className="mx-auto flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <SlidersHorizontal size={14} />
            <span>{dateSummary} · {typeSummary}</span>
            <ChevronDown size={14} className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>
        </motion.div>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              key="filters"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto w-full max-w-2xl overflow-hidden"
            >
              <motion.div
                className="space-y-6 pt-6"
                variants={filterChipStagger.container}
                initial="hidden"
                animate="show"
              >
                {/* Date range — one box always shows the active range, whether it came from a
                    quick preset or a manual pick; there's no separate "custom" chip because
                    opening the box *is* the custom action. */}
                <div className="space-y-3">
                  <motion.label
                    variants={filterChipStagger.item}
                    className={`${LABEL} flex items-center gap-2`}
                  >
                    <CalendarIcon size={16} className="text-slate-400 dark:text-slate-500" />
                    {t("disclosure.search.dateRangeLabel")}
                  </motion.label>
                  <motion.div variants={filterChipStagger.item}>
                    <motion.div
                      variants={chipRowStagger.container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-wrap items-center gap-2"
                    >
                      <motion.div variants={chipRowStagger.item}>
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button
                          type="button"
                          className={`h-9 shrink-0 px-3.5 rounded-full border text-sm font-medium flex items-center gap-1.5 transition-colors
                            ${datePreset === "custom"
                              ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"}`}
                        >
                          <CalendarIcon size={14} className="shrink-0" />
                          {dateRange?.from && dateRange?.to ? (
                            <span className="tabular-nums whitespace-nowrap">
                              {format(dateRange.from, "yyyy-MM-dd")} ~ {format(dateRange.to, "yyyy-MM-dd")}
                            </span>
                          ) : (
                            <span className="whitespace-nowrap">{t("disclosure.search.dateRangePlaceholder")}</span>
                          )}
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
                            defaultMonth={dateRange?.from ?? today}
                            selected={dateRange}
                            onSelect={handleCustomRangeSelect}
                            locale={dateFnsLocale}
                            showOutsideDays
                            className="text-sm"
                          />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                    </motion.div>

                    {DATE_PRESET_IDS.filter((preset) => preset !== "custom").map((preset) => (
                      <motion.div key={preset} variants={chipRowStagger.item}>
                      <DatePresetButton
                        label={presetLabels[preset]}
                        selected={datePreset === preset}
                        onClick={() => handlePresetChange(preset)}
                      />
                      </motion.div>
                    ))}
                    </motion.div>
                  </motion.div>
                </div>

                {/* Disclosure type chips — no "All" chip: zero selected already means all
                    (see the hint text below), so "select all" needs no button of its own. */}
                <div className="space-y-3">
                  <motion.div variants={filterChipStagger.item} className="flex items-center justify-between gap-4">
                    <label className={`${LABEL} flex items-center gap-2`}>
                      <FileText size={16} className="text-slate-400 dark:text-slate-500" />
                      {t("disclosure.search.typeLabel")}
                    </label>
                    {!isAllSelected && (
                      <button
                        type="button"
                        onClick={() => setSelectedTypeCodes([])}
                        className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shrink-0"
                      >
                        {t("disclosure.search.typeReset")}
                      </button>
                    )}
                  </motion.div>

                  <motion.div variants={filterChipStagger.item}>
                    <motion.div
                      variants={chipRowStagger.container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-wrap gap-2.5"
                    >
                    {DISCLOSURE_GROUPS.map((group) => (
                      <motion.div key={group.code} variants={chipRowStagger.item}>
                      <DisclosureTypeButton
                        label={getDisclosureGroupLabel(t, group.code)}
                        selected={selectedTypeCodes.includes(group.code)}
                        onClick={() => toggleType(group.code)}
                      />
                      </motion.div>
                    ))}
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      </div>
      </motion.div>

      {collectMessage && !searchError && (
        <div className={`${ALERT_INFO} mb-6`}>{collectMessage}</div>
      )}

      {searchError && <div className={ALERT_ERROR}>{searchError}</div>}

      {!results && !searchError && <TodayDisclosures />}

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
                  <SortableHeader
                    label={t("disclosure.search.table.filedAt")}
                    sortKeyName="date"
                    className="w-40"
                    {...{ sortKey, sortDirection, onSort: handleSort }}
                  />
                  <SortableHeader
                    label={t("disclosure.search.table.type")}
                    sortKeyName="type"
                    className="w-36"
                    {...{ sortKey, sortDirection, onSort: handleSort }}
                  />
                  <SortableHeader
                    label={t("disclosure.search.table.title")}
                    sortKeyName="title"
                    {...{ sortKey, sortDirection, onSort: handleSort }}
                  />
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 w-36">
                    {t("disclosure.search.table.filer")}
                  </th>
                  <SortableHeader
                    label={t("disclosure.search.table.risk")}
                    sortKeyName="risk"
                    className="w-28"
                    {...{ sortKey, sortDirection, onSort: handleSort }}
                  />
                  <th className="px-6 py-4 w-12" />
                </tr>
              </thead>
              <tbody className={ROW_DIVIDER}>
                {pagedResults.map((result) => (
                  <tr
                    key={result.rceptNo}
                    onClick={() => {
                      saveState({
                        searchTerm,
                        selectedTypeCodes,
                        datePreset,
                        dateRange,
                        collectMessage,
                        results,
                        currentPage,
                        sortKey,
                        sortDirection,
                        lastSearchedTerm,
                      });
                      navigate(
                        `/disclosure/${result.rceptNo}?company=${encodeURIComponent(result.companyName)}`
                      );
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
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {result.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {result.filerName}
                    </td>
                    <td className="px-6 py-4">
                      {result.riskLabel ? (
                        <RiskBadge riskLabel={result.riskLabel} riskTier={result.riskTier} compact />
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {t("disclosure.search.beforeSummary")}
                        </span>
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
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  {t("disclosure.search.noResults.title")}
                </p>
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

function DatePresetButton({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 border
        ${
          selected
            ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
    >
      {label}
    </button>
  );
}

function DisclosureTypeButton({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-9 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 inline-flex items-center justify-center border text-center leading-snug
        ${
          selected
            ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
    >
      {label}
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
        <Icon
          size={12}
          className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-slate-600"}
        />
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
