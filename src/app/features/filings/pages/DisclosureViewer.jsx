import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { getAnalysisCategoryLabel } from "../constants";
import { useLocale } from "@/app/shared/i18n";
import { usePageMeta } from "@/app/shared/hooks/usePageMeta";
import {
  AlertTriangle,
  ArrowLeft,
  BookA,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileArchive,
  Highlighter,
  Info,
  Lightbulb,
  Loader2,
  Sparkles,
  Wand2
} from "lucide-react";
import {
  AI_CALLOUT,
  AI_CALLOUT_BODY,
  AI_CALLOUT_LEAD,
  ALERT_ERROR,
  BACK_LINK,
  BADGE_INFO,
  BTN_PRIMARY,
  BTN_SECONDARY,
  CARD,
  LABEL,
  META,
  TAB_ACTIVE,
  TAB_IDLE,
  TAB_INDICATOR
} from "@/app/shared/lib/uiRecipes";
import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import {
  downloadDisclosureZip,
  generateAnalysis,
  generateSummary,
  getDisclosureDetail,
  getDartViewerUrl,
  getDisclosureOriginalText,
  getDisclosureTerms
} from "../api/disclosureApi";
import { RiskBadge, RiskBadgeGroup } from "../components/RiskBadge";
import { OriginalDocument } from "../components/OriginalDocument";
import { DocumentToc } from "../components/DocumentToc";

// ── 토글 스위치 컴포넌트 ─────────────────────────────────────────
function ToggleSwitch({ label, icon, checked, onCheckedChange, disabled, checkedBg }) {
  return (
    <div className={`flex items-center gap-2 ${disabled ? "opacity-40" : ""}`}>
      {icon}
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={`relative w-9 h-5 rounded-full transition-colors outline-none cursor-pointer
          disabled:cursor-not-allowed ${checked ? checkedBg : "bg-slate-300 dark:bg-slate-600"}`}
      >
        <Switch.Thumb className="block w-4 h-4 bg-white dark:bg-slate-200 rounded-full shadow transition-transform translate-x-0.5 data-[state=checked]:translate-x-4.5" />
      </Switch.Root>
      <span className={`${META} select-none whitespace-nowrap`}>{label}</span>
    </div>
  );
}

// ── 문장 단위 줄바꿈 ──────────────────────────────────────────────
// AI 요약(investorComment)은 2~3문장이 공백만으로 이어진 한 덩어리 문자열로 온다.
// 문장 끝(.!?다) 뒤에 공백 + 다음 문장이 이어지는 지점만 끊어서 문장마다 줄을 나눠 보여준다.
// "69.2%"처럼 소수점 뒤에 공백이 없는 경우는 매치되지 않아 안전하다.
function splitIntoSentences(text) {
  if (!text) return [];
  return text
    .split(/(?<=[.!?다])\s+(?=[가-힣A-Za-z0-9"'(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────
export function DisclosureViewer() {
  const { id: rceptNo } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const [disclosure, setDisclosure] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const [originalText, setOriginalText] = useState(null);
  // 문단/표 단위로 구조화한 블록 목록 — 표를 실제 <table>로 그리는 데 사용한다.
  // charStart/charEnd가 null인 블록은 구조 표시에만 쓰이고 하이라이트 대상에서는 제외된다.
  const [originalBlocks, setOriginalBlocks] = useState(null);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(true);
  const [originalTextError, setOriginalTextError] = useState(null);

  // 전문용어 — API에서 받은 TermHighlightDto[]
  const [termHighlights, setTermHighlights] = useState([]);
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);
  // 용어사전 탭에서 현재 포커스된 termId
  const [activeTermId, setActiveTermId] = useState(null);
  // 원문에서 현재 포커스된 AI 분석 targetKey
  const [activeHighlightKey, setActiveHighlightKey] = useState(null);

  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [termsEnabled, setTermsEnabled] = useState(false);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const [activeHeadingId, setActiveHeadingId] = useState(null);

  const originalPanelRef = useRef(null);
  const glossaryListRef = useRef(null);

  // ── 데이터 로딩 ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getDisclosureDetail(rceptNo)
      .then((d) => { if (mounted) setDisclosure(d); })
      .catch((e) => { if (mounted) setLoadError(e.message ?? t("disclosure.viewer.loadError")); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [rceptNo]);

  useEffect(() => {
    let mounted = true;
    setIsLoadingOriginal(true);
    setOriginalTextError(null);
    getDisclosureOriginalText(rceptNo)
      .then((d) => { if (mounted) { setOriginalText(d.text); setOriginalBlocks(d.blocks ?? null); } })
      .catch((e) => { if (mounted) setOriginalTextError(e.message ?? t("disclosure.viewer.originalError")); })
      .finally(() => { if (mounted) setIsLoadingOriginal(false); });
    return () => { mounted = false; };
  }, [rceptNo]);

  // 전문용어 토글을 처음 켤 때만 API 호출
  useEffect(() => {
    if (!termsEnabled || termHighlights.length > 0 || isLoadingTerms) return;
    setIsLoadingTerms(true);
    getDisclosureTerms(rceptNo)
      .then((data) => setTermHighlights(data ?? []))
      .catch(() => setTermHighlights([]))
      .finally(() => setIsLoadingTerms(false));
  }, [termsEnabled, rceptNo]);

  const companyName = searchParams.get("company") || disclosure?.companyName;

  usePageMeta({
    title: disclosure?.title
      ? t("seo.disclosureDetail.title", { title: disclosure.title })
      : t("seo.disclosure.title"),
    description: disclosure?.title
      ? t("seo.disclosureDetail.description", { title: disclosure.title })
      : t("seo.disclosure.description"),
  });

  const hasSummary = Boolean(disclosure?.summaryText);
  const analysisItems = disclosure?.analysisItems ?? [];
  const criticalAlert = getCriticalAlert(disclosure?.extra, t);
  const cardBorderClass = criticalAlert
    ? "border-red-300 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900/50"
    : "dark:border-slate-800";
  const summaryBadges = hasSummary
    ? [{ riskLabel: disclosure.riskLabel, riskTier: disclosure.riskTier }]
    : [];

  const highlightCount = analysisItems.filter(
    (i) => i.charOffsetStart >= 0 && i.charOffsetEnd > i.charOffsetStart
  ).length;

  // 용어사전 탭에서 중복 제거 (같은 용어가 여러 번 등장하면 termId 기준으로 한 번만)
  const uniqueTerms = termHighlights.reduce((acc, th) => {
    if (!acc.find((t) => t.termId === th.termId)) acc.push(th);
    return acc;
  }, []);

  // 좌측 목차 레일용 제목 목록. OriginalDocument가 그리는 anchor id(odoc-h-{블록index})와
  // 동일한 index 기준으로 만들어야 스크롤/활성표시가 맞물린다.
  const headings = useMemo(() => {
    if (!originalBlocks) return [];
    return originalBlocks
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => b.type === "heading" && b.text)
      .map(({ b, i }) => ({ id: `odoc-h-${i}`, level: b.level || 2, text: b.text }));
  }, [originalBlocks]);

  // ── 상호작용 핸들러 ──────────────────────────────────────────

  const scrollToHeadingInPanel = useCallback((id) => {
    const root = originalPanelRef.current;
    const el = root?.querySelector(`#${CSS.escape(id)}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const root = originalPanelRef.current;
    if (!root || headings.length === 0) return;
    const els = headings
      .map((h) => root.querySelector(`#${CSS.escape(h.id)}`))
      .filter(Boolean);
    if (els.length === 0) return;

    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = headings.find((h) => visible.has(h.id));
        if (first) setActiveHeadingId(first.id);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings, originalText]);

  // AI 분석 카드 클릭 → 원문 해당 문장으로 스크롤
  const handleAnalysisItemClick = useCallback((item) => {
    setActiveHighlightKey(item.targetKey);
    setHighlightEnabled(true);
    if (originalPanelRef.current) {
      const el = originalPanelRef.current.querySelector(
        `[data-highlight-key="${CSS.escape(item.targetKey)}"]`
      );
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setActiveHighlightKey(null), 2000);
  }, []);

  // 용어사전 탭의 용어 클릭 → 원문 첫 번째 등장 위치로 스크롤
  const handleTermClick = useCallback((termId) => {
    setActiveTermId(termId);
    setTermsEnabled(true);

    if (originalPanelRef.current) {
      const el = originalPanelRef.current.querySelector(
        `[data-term-id="${termId}"]`
      );
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setActiveTermId(null), 2000);
  }, []);

  // 원문의 전문용어 클릭 → 용어사전 탭 이동 + 해당 용어 카드 강조
  const handleTermInTextClick = useCallback((termId) => {
    setActiveTab("glossary");
    setActiveTermId(termId);

    // 용어사전 탭의 해당 카드로 스크롤
    setTimeout(() => {
      if (glossaryListRef.current) {
        const el = glossaryListRef.current.querySelector(`[data-glossary-term-id="${termId}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    setTimeout(() => setActiveTermId(null), 2000);
  }, []);

  const refreshDetail = async () => { const d = await getDisclosureDetail(rceptNo); setDisclosure(d); };

  const handleSummarize = async () => {
    if (isSummarizing || !originalText) return;
    setIsSummarizing(true); setSummarizeError(null);
    try { await generateSummary({ rceptNo, corpName: companyName, dartContext: originalText }); await refreshDetail(); }
    catch (e) { setSummarizeError(e.message ?? t("disclosure.viewer.summarizeError")); }
    finally { setIsSummarizing(false); }
  };

  const handleAnalyze = async () => {
    if (isAnalyzing || !originalText) return;
    setIsAnalyzing(true); setAnalyzeError(null);
    try { await generateAnalysis({ rceptNo, corpName: companyName, dartFullText: originalText }); await refreshDetail(); }
    catch (e) { setAnalyzeError(e.message ?? t("disclosure.viewer.analyzeError")); }
    finally { setIsAnalyzing(false); }
  };

  const handleDownloadZip = async () => {
    if (isDownloading || !rceptNo) return;
    setIsDownloading(true); setShowDownloadMenu(false);
    try { await downloadDisclosureZip(rceptNo); }
    catch (e) { window.alert(e.message ?? t("disclosure.download.zipError")); }
    finally { setIsDownloading(false); }
  };

  const handleOpenDartViewer = () => { setShowDownloadMenu(false); window.open(getDartViewerUrl(rceptNo), "_blank", "noopener,noreferrer"); };

  const handleHighlightSelectFromText = useCallback((targetKey) => {
    setActiveTab("analysis");
    setActiveHighlightKey(targetKey);
    setTimeout(() => setActiveHighlightKey(null), 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-11rem)] min-h-[720px] flex items-center justify-center text-slate-400 dark:text-slate-500">
        <Loader2 size={28} className="animate-spin mr-3" />
        {t("disclosure.viewer.loading")}
      </div>
    );
  }

  if (loadError || !disclosure) {
    return (
      <div className="h-[calc(100vh-11rem)] min-h-[720px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
        <AlertTriangle size={32} className="text-red-400 dark:text-red-500" />
        <p>{loadError ?? t("disclosure.viewer.notFound")}</p>
        <Link to="/disclosure" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">{t("disclosure.viewer.backToSearch")}</Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-11rem)] min-h-[720px] flex flex-col px-4 sm:px-6 lg:px-8 pt-4 pb-8 animate-in fade-in duration-300">

      {/* ── 헤더 ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`${BACK_LINK} shrink-0`}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{t("disclosure.viewer.backToSearch")}</span>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={BADGE_INFO}>{disclosure.typeLabel}</span>
              <span className={`text-sm ${META}`}>{disclosure.filedAt}</span>
              {hasSummary && <RiskBadge riskLabel={disclosure.riskLabel} riskTier={disclosure.riskTier} size="lg" />}
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-1 truncate">{disclosure.title} - {companyName}</h1>
          </div>
        </div>

        {/* 다운로드 드롭다운 */}
        <div className="relative shrink-0">
          <button onClick={() => setShowDownloadMenu((v) => !v)} disabled={isDownloading}
            className={`flex items-center gap-1.5 ${BTN_SECONDARY} shadow-sm`}>
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {t("disclosure.viewer.originalShort")}
            <ChevronDown size={14} className={`transition-transform ${showDownloadMenu ? "rotate-180" : ""}`} />
          </button>
          {showDownloadMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-20 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
                <button onClick={handleOpenDartViewer} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <ExternalLink size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t("disclosure.download.openDart")}</p>
                    <p className={`${META} mt-0.5 leading-snug`}>{t("disclosure.download.openDartDesc")}</p>
                  </div>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800" />
                <button onClick={handleDownloadZip} disabled={isDownloading}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left disabled:opacity-50">
                  <FileArchive size={18} className="text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t("disclosure.download.downloadZip")}
                      {isDownloading && <Loader2 size={12} className="inline-block ml-1.5 animate-spin" />}
                    </p>
                    <p className={`${META} mt-0.5`}>{t("disclosure.download.downloadZipDesc")}</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">

        {!isLoadingOriginal && !originalTextError && headings.length >= 2 && (
          <DocumentToc
            headings={headings}
            activeId={activeHeadingId}
            onSelect={scrollToHeadingInPanel}
          />
        )}

        {/* ── 가운데: 공시 원문 패널 ──────────────────────────── */}
        <section className={`flex-1 ${CARD} shadow-sm flex flex-col overflow-hidden`}>

          {/* 패널 헤더 — 두 개 독립 토글 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0 gap-4">
            <div className={`flex items-center gap-2 ${LABEL} shrink-0`}>
              <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
              {t("disclosure.viewer.original")}
            </div>
            {!isLoadingOriginal && !originalTextError && (
              <div className="flex items-center gap-4">
                <ToggleSwitch
                  label={t("disclosure.viewer.highlightToggle", {
                    count: highlightCount > 0 ? ` (${highlightCount})` : "",
                  })}
                  icon={<Highlighter size={14} className={highlightEnabled ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"} />}
                  checked={highlightEnabled}
                  onCheckedChange={setHighlightEnabled}
                  disabled={highlightCount === 0}
                  checkedBg="bg-blue-500"
                />
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                <ToggleSwitch
                  label={
                    isLoadingTerms
                      ? t("disclosure.viewer.termsLoading")
                      : t("disclosure.viewer.termsToggle", {
                          count: termHighlights.length > 0 ? ` (${uniqueTerms.length})` : "",
                        })
                  }
                  icon={<BookA size={14} className={termsEnabled ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"} />}
                  checked={termsEnabled}
                  onCheckedChange={setTermsEnabled}
                  disabled={!originalText || isLoadingTerms}
                  checkedBg="bg-slate-500"
                />
              </div>
            )}
          </div>

          {/* 범례 */}
          {((highlightEnabled && highlightCount > 0) || (termsEnabled && termHighlights.length > 0)) && (
            <div className={`flex items-center gap-4 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${META} shrink-0`}>
              {highlightEnabled && highlightCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700" />
                  {t("disclosure.viewer.legendHighlight")}
                </span>
              )}
              {termsEnabled && termHighlights.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block text-slate-600 dark:text-slate-300 border-b-2 border-dotted border-slate-400 dark:border-slate-500">용어</span>
                  {t("disclosure.viewer.legendTerms")}
                </span>
              )}
            </div>
          )}

          {/* 원문 본문 */}
          {isLoadingOriginal ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-slate-400 dark:text-slate-500">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">{t("disclosure.viewer.loadingOriginal")}</p>
            </div>
          ) : originalTextError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-400 dark:text-slate-500">
              <AlertTriangle size={32} className="text-red-400 dark:text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{originalTextError}</p>
              <button
                type="button"
                onClick={handleOpenDartViewer}
                className={`flex items-center gap-1.5 ${BTN_PRIMARY} mt-1`}
              >
                <ExternalLink size={16} />
                {t("disclosure.download.openDart")}
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6" ref={originalPanelRef}>
              <OriginalDocument
                text={originalText}
                blocks={originalBlocks}
                analysisItems={analysisItems}
                termHighlights={termHighlights}
                highlightEnabled={highlightEnabled}
                termsEnabled={termsEnabled}
                activeHighlightKey={activeHighlightKey}
                activeTermId={activeTermId}
                onHighlightSelect={handleHighlightSelectFromText}
                onTermSelect={handleTermInTextClick}
              />
            </div>
          )}
        </section>

        {/* ── 우측: AI 요약 / 핵심 분석 / 용어 사전 탭 ────────── */}
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className={`w-[420px] flex flex-col ${CARD} shadow-sm overflow-hidden shrink-0 ${cardBorderClass}`}
        >
          <Tabs.List className="flex border-b border-slate-200 dark:border-slate-800">
            <ViewerTab value="summary" activeTab={activeTab}>{t("disclosure.viewer.tabSummary")}</ViewerTab>
            <ViewerTab value="analysis" activeTab={activeTab}>
              {t("disclosure.viewer.tabAnalysis")}
              {analysisItems.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                  {analysisItems.length}
                </span>
              )}
            </ViewerTab>
            <ViewerTab value="glossary" activeTab={activeTab}>
              {t("disclosure.viewer.tabGlossary")}
              {uniqueTerms.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                  {uniqueTerms.length}
                </span>
              )}
            </ViewerTab>
          </Tabs.List>

          <div className="flex-1 overflow-y-auto p-5">

            {/* AI 요약 탭 */}
            <Tabs.Content value="summary" className="space-y-4 animate-in fade-in outline-none">
              <CriticalAlertBanner message={criticalAlert?.message} detail={criticalAlert?.detail} />
              {hasSummary ? (
                <>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold"><Sparkles size={18} /><span>{t("disclosure.viewer.summaryTitle")}</span></div>
                    <RiskBadgeGroup badges={summaryBadges} size="lg" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">{disclosure.summaryText}</p>
                  <div className={`${AI_CALLOUT} gap-3`}>
                    <Lightbulb size={15} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" />
                    <div className="min-w-0 space-y-1.5">
                      <p className={`${AI_CALLOUT_LEAD} mb-1`}>{t("disclosure.viewer.investorPerspective")}</p>
                      {splitIntoSentences(disclosure.investorComment).map((sentence, i) => (
                        <p key={i} className={AI_CALLOUT_BODY}>{sentence}</p>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <EmptyState icon={<Sparkles size={28} className="text-slate-300 dark:text-slate-600" />} message={t("disclosure.viewer.emptySummary")} />
                  <GenerateButton label={t("disclosure.viewer.generateSummary")} loadingLabel={t("disclosure.viewer.generatingSummary")} isLoading={isSummarizing} disabled={!originalText} onClick={handleSummarize} />
                  {summarizeError && <p className="text-xs text-red-600 dark:text-red-400 text-center">{summarizeError}</p>}
                </>
              )}
            </Tabs.Content>

            {/* 핵심 분석 탭 */}
            <Tabs.Content value="analysis" className="space-y-3 animate-in fade-in outline-none">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-4"><Highlighter size={18} /><span>{t("disclosure.viewer.analysisTitle")}</span></div>
              {analysisItems.length > 0 ? (
                <div className="space-y-4">
                  {analysisItems.map((item, index) => {
                    const isActive = activeHighlightKey === item.targetKey;
                    const hasCoords = item.charOffsetStart >= 0 && item.charOffsetEnd > item.charOffsetStart;
                    // 분석 결과가 하나뿐이면 여러 개일 때 쓰던 촘촘한 글자 크기 그대로는
                    // 가독성이 떨어져서, 이 경우만 더 크게 키운다.
                    const isSingle = analysisItems.length === 1;
                    return (
                      <div
                        key={`${item.analysisCategory}-${index}`}
                        onClick={() => hasCoords && handleAnalysisItemClick(item)}
                        className={`border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-200 bg-white dark:bg-slate-900
                          ${isSingle ? "p-5" : "p-4.5"}
                          ${isActive ? "ring-2 ring-amber-400 dark:ring-amber-500 ring-offset-1 dark:ring-offset-slate-900 border-amber-300 dark:border-amber-700" : ""}
                          ${hasCoords ? "cursor-pointer hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className={`font-bold text-slate-900 dark:text-slate-100 ${isSingle ? "text-lg" : "text-base"}`}>{getAnalysisCategoryLabel(t, item.analysisCategory)}</h4>
                            {hasCoords && <span className={`flex items-center gap-0.5 text-[10px] ${META}`}><ChevronRight size={10} />{t("disclosure.viewer.goToOriginal")}</span>}
                          </div>
                          <RiskBadge riskLabel={item.riskLevel} riskTier={item.riskTier} size="md" />
                        </div>
                        <p className={`font-medium text-slate-600 dark:text-slate-300 mb-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 px-2.5 py-1.5 rounded italic leading-relaxed ${isSingle ? "text-base" : "text-sm"}`}>"{item.targetKey}"</p>
                        <div className="space-y-1.5">
                          {splitIntoSentences(item.materialImpact).map((sentence, si) => (
                            <p
                              key={si}
                              className={`font-medium text-slate-700 dark:text-slate-300 leading-relaxed ${isSingle ? "text-lg" : "text-base"}`}
                            >
                              {sentence}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <EmptyState icon={<Highlighter size={28} className="text-slate-300 dark:text-slate-600" />} message={t("disclosure.viewer.emptyAnalysis")} />
                  <GenerateButton label={t("disclosure.viewer.generateAnalysis")} loadingLabel={t("disclosure.viewer.generatingAnalysis")} isLoading={isAnalyzing} disabled={!originalText} onClick={handleAnalyze} />
                  {analyzeError && <p className="text-xs text-red-600 dark:text-red-400 text-center">{analyzeError}</p>}
                </>
              )}
            </Tabs.Content>

            {/* 용어 사전 탭 */}
            <Tabs.Content value="glossary" className="animate-in fade-in outline-none">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-3">
                <Info size={18} />
                <span>{t("disclosure.viewer.glossaryTitle")}</span>
              </div>

              {!termsEnabled ? (
                <div className="text-center py-8">
                  <p className={`text-sm ${META} mb-3`}>{t("disclosure.viewer.glossaryHint")}</p>
                  <button
                    onClick={() => setTermsEnabled(true)}
                    className={BTN_PRIMARY}
                  >
                    {t("disclosure.viewer.glossaryEnable")}
                  </button>
                </div>
              ) : isLoadingTerms ? (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-400 dark:text-slate-500">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">{t("disclosure.viewer.glossaryLoading")}</span>
                </div>
              ) : uniqueTerms.length === 0 ? (
                <EmptyState icon={<Info size={28} className="text-slate-300 dark:text-slate-600" />} message={t("disclosure.viewer.glossaryEmpty")} />
              ) : (
                <>
                  <p className={`${META} mb-3`}>
                    {t("disclosure.viewer.glossaryFound", { count: uniqueTerms.length })}
                  </p>
                  <div className="space-y-2" ref={glossaryListRef}>
                    {uniqueTerms.map((th) => {
                      const isActive = activeTermId === th.termId;
                      // 같은 용어의 등장 횟수
                      const count = termHighlights.filter((t) => t.termId === th.termId).length;
                      return (
                        <div
                          key={th.termId}
                          data-glossary-term-id={th.termId}
                          onClick={() => handleTermClick(th.termId)}
                          className={`border rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200
                            ${isActive
                              ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-200 dark:ring-blue-800"
                              : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className={`text-sm font-semibold border-b-2 border-dotted inline pb-px
                              ${isActive ? "border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-300" : "border-slate-400 dark:border-slate-500 text-slate-600 dark:text-slate-300"}`}>
                              {th.term}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                {th.category}
                              </span>
                              {count > 1 && (
                                <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                  {count}{t("disclosure.risk.countSuffix")}
                                </span>
                              )}
                              <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />
                            </div>
                          </div>
                          <p className={`text-xs ${META} leading-relaxed line-clamp-2`}>
                            {th.definition}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}

// ── 서브 컴포넌트 ──────────────────────────────────────────────

function ViewerTab({ value, activeTab, children }) {
  const isActive = activeTab === value;
  return (
    <Tabs.Trigger
      value={value}
      className={`flex-1 flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isActive ? TAB_ACTIVE : TAB_IDLE}`}
    >
      {children}
      {isActive && <span className={TAB_INDICATOR} />}
    </Tabs.Trigger>
  );
}

function GenerateButton({ label, loadingLabel, isLoading, disabled, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={isLoading || disabled}
      className={`w-full py-3 ${BTN_PRIMARY} !h-auto rounded-xl shadow-sm`}>
      {isLoading ? <><Loader2 size={16} className="animate-spin" />{loadingLabel}</> : <><Wand2 size={16} />{label}</>}
    </button>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-slate-400 dark:text-slate-500">
      {icon}<p className="text-sm">{message}</p>
    </div>
  );
}

function CriticalAlertBanner({ message, detail }) {
  if (!message) return null;
  return (
    <div className={`flex items-start gap-3 ${ALERT_ERROR} mb-4`}>
      <AlertTriangle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">{message}</p>
        {detail && <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function getCriticalAlert(extraJson, t) {
  if (!extraJson) return null;
  let extra;
  try { extra = typeof extraJson === "string" ? JSON.parse(extraJson) : extraJson; } catch { return null; }
  if (extra?.auditOpinion && extra.auditOpinion !== "적정")
    return {
      message: t("disclosure.criticalAlerts.auditOpinion.message", { opinion: extra.auditOpinion }),
      detail: t("disclosure.criticalAlerts.auditOpinion.detail"),
    };
  if (extra?.isTrueSaleConfirmed === false)
    return {
      message: t("disclosure.criticalAlerts.trueSaleRisk.message"),
      detail: t("disclosure.criticalAlerts.trueSaleRisk.detail"),
    };
  if (extra?.willDelist === true)
    return {
      message: t("disclosure.criticalAlerts.willDelist.message"),
      detail: t("disclosure.criticalAlerts.willDelist.detail"),
    };
  if (extra?.hasInjunctionRequest === true)
    return {
      message: t("disclosure.criticalAlerts.injunction.message"),
      detail: t("disclosure.criticalAlerts.injunction.detail"),
    };
  return null;
}
