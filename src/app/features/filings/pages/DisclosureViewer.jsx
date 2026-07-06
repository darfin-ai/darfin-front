import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ANALYSIS_CATEGORY_LABELS } from "../constants";
import {
  AlertTriangle,
  BookA,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileArchive,
  Highlighter,
  Info,
  Loader2,
  Sparkles,
  Wand2
} from "lucide-react";
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

// ── 하이라이트 세그먼트 빌더 ─────────────────────────────────────
// AI 분석 항목(charOffset 기반)과 전문용어(startIndex 기반)를
// 하나의 세그먼트 배열로 병합한다.
// 타입: "plain" | "highlight"(AI 핵심 문장) | "term"(전문용어)
// 우선순위: 두 종류가 겹치면 highlight > term (AI 분석 우선)
// 전문용어는 termId 기준으로 원문에서 첫 번째 등장 위치에만 밑줄을 친다.
function buildSegments(text, analysisItems, termHighlights, showHighlight, showTerms) {
  if (!text) return [{ type: "plain", text: "" }];

  // 겹치지 않도록 마스크 배열로 관리
  const mask = new Array(text.length).fill(null); // null | "highlight" | "term"

  // 1. AI 분석 핵심 문장 (우선순위 높음)
  if (showHighlight) {
    for (const item of analysisItems) {
      const s = item.charOffsetStart, e = item.charOffsetEnd;
      if (s >= 0 && e > s && e <= text.length) {
        for (let i = s; i < e; i++) {
          if (mask[i] === null) mask[i] = { type: "highlight", item };
        }
      }
    }
  }

  // 2. 전문용어 밑줄 — termId 기준 첫 번째 등장 위치에만 적용
  // (백엔드에서 중복이 내려오거나 캐시 데이터가 남아있어도 프론트에서 한 번 더 보장)
  if (showTerms) {
    const seenTermIds = new Set();
    // startIndex 오름차순으로 정렬해서 원문 앞쪽 등장이 항상 첫 번째가 되도록 한다
    const sortedTerms = [...termHighlights].sort((a, b) => a.startIndex - b.startIndex);

    for (const th of sortedTerms) {
      if (seenTermIds.has(th.termId)) continue; // 이미 처리한 용어 skip

      const s = th.startIndex, e = th.endIndex;
      if (s >= 0 && e > s && e <= text.length) {
        for (let i = s; i < e; i++) {
          if (mask[i] === null) mask[i] = { type: "term", th };
        }
        seenTermIds.add(th.termId); // 첫 번째 등장 완료 → 이후 중복 skip
      }
    }
  }

  // 마스크 → 연속 세그먼트 배열로 변환
  const segments = [];
  let i = 0;
  while (i < text.length) {
    const cell = mask[i];
    if (cell === null) {
      let j = i + 1;
      while (j < text.length && mask[j] === null) j++;
      segments.push({ type: "plain", text: text.slice(i, j) });
      i = j;
    } else if (cell.type === "highlight") {
      const item = cell.item;
      let j = i + 1;
      while (j < text.length && mask[j] !== null && mask[j].type === "highlight" && mask[j].item === item) j++;
      segments.push({ type: "highlight", text: text.slice(i, j), item });
      i = j;
    } else {
      // term
      const th = cell.th;
      let j = i + 1;
      while (j < text.length && mask[j] !== null && mask[j].type === "term" && mask[j].th === th) j++;
      segments.push({ type: "term", text: text.slice(i, j), th });
      i = j;
    }
  }
  return segments;
}

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
          disabled:cursor-not-allowed ${checked ? checkedBg : "bg-slate-300"}`}
      >
        <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-0.5 data-[state=checked]:translate-x-4.5" />
      </Switch.Root>
      <span className="text-xs text-slate-500 select-none whitespace-nowrap">{label}</span>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────
export function DisclosureViewer() {
  const { id: rceptNo } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [disclosure, setDisclosure] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const [originalText, setOriginalText] = useState(null);
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

  const originalPanelRef = useRef(null);
  const glossaryListRef = useRef(null);

  // ── 데이터 로딩 ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getDisclosureDetail(rceptNo)
      .then((d) => { if (mounted) setDisclosure(d); })
      .catch((e) => { if (mounted) setLoadError(e.message ?? "공시 정보를 불러오지 못했습니다."); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [rceptNo]);

  useEffect(() => {
    let mounted = true;
    setIsLoadingOriginal(true);
    setOriginalTextError(null);
    getDisclosureOriginalText(rceptNo)
      .then((d) => { if (mounted) setOriginalText(d.text); })
      .catch((e) => { if (mounted) setOriginalTextError(e.message ?? "공시 원문을 불러오지 못했습니다."); })
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
  const hasSummary = Boolean(disclosure?.summaryText);
  const analysisItems = disclosure?.analysisItems ?? [];
  const criticalAlert = getCriticalAlert(disclosure?.extra);
  const cardBorderClass = criticalAlert ? "border-red-300 ring-1 ring-red-100" : "border-slate-200";
  const summaryBadges = hasSummary
    ? [{ axisLabel: "위험도", riskLabel: disclosure.riskLabel, riskTier: disclosure.riskTier }]
    : [];

  const highlightCount = analysisItems.filter(
    (i) => i.charOffsetStart >= 0 && i.charOffsetEnd > i.charOffsetStart
  ).length;

  // 용어사전 탭에서 중복 제거 (같은 용어가 여러 번 등장하면 termId 기준으로 한 번만)
  const uniqueTerms = termHighlights.reduce((acc, th) => {
    if (!acc.find((t) => t.termId === th.termId)) acc.push(th);
    return acc;
  }, []);

  // ── 상호작용 핸들러 ──────────────────────────────────────────

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
    catch (e) { setSummarizeError(e.message ?? "AI 요약 생성에 실패했습니다."); }
    finally { setIsSummarizing(false); }
  };

  const handleAnalyze = async () => {
    if (isAnalyzing || !originalText) return;
    setIsAnalyzing(true); setAnalyzeError(null);
    try { await generateAnalysis({ rceptNo, corpName: companyName, dartFullText: originalText }); await refreshDetail(); }
    catch (e) { setAnalyzeError(e.message ?? "AI 핵심 분석 생성에 실패했습니다."); }
    finally { setIsAnalyzing(false); }
  };

  const handleDownloadZip = async () => {
    if (isDownloading || !rceptNo) return;
    setIsDownloading(true); setShowDownloadMenu(false);
    try { await downloadDisclosureZip(rceptNo); }
    catch (e) { window.alert(e.message ?? "원문 ZIP 다운로드에 실패했습니다."); }
    finally { setIsDownloading(false); }
  };

  const handleOpenDartViewer = () => { setShowDownloadMenu(false); window.open(getDartViewerUrl(rceptNo), "_blank", "noopener,noreferrer"); };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-11rem)] min-h-[720px] flex items-center justify-center text-slate-400">
        <Loader2 size={28} className="animate-spin mr-3" />
        공시 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (loadError || !disclosure) {
    return (
      <div className="h-[calc(100vh-11rem)] min-h-[720px] flex flex-col items-center justify-center text-slate-500 gap-3">
        <AlertTriangle size={32} className="text-red-400" />
        <p>{loadError ?? "공시 정보를 찾을 수 없습니다."}</p>
        <Link to="/disclosure" className="text-blue-600 text-sm font-medium hover:underline">공시 통합검색으로 돌아가기</Link>
      </div>
    );
  }

  // 세그먼트 빌드 (원문 텍스트를 highlight/term/plain으로 분해)
  const segments = originalText
    ? buildSegments(originalText, analysisItems, termHighlights, highlightEnabled, termsEnabled)
    : null;

  return (
    <div className="h-[calc(100vh-11rem)] min-h-[720px] flex flex-col -mt-4 animate-in fade-in duration-300">

      {/* ── 헤더 ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{disclosure.typeLabel}</span>
              <span className="text-sm text-slate-500">{disclosure.filedAt}</span>
              {hasSummary && <RiskBadge riskLabel={disclosure.riskLabel} riskTier={disclosure.riskTier} size="sm" />}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 truncate">{disclosure.title} - {companyName}</h1>
          </div>
        </div>

        {/* 다운로드 드롭다운 */}
        <div className="relative shrink-0">
          <button onClick={() => setShowDownloadMenu((v) => !v)} disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600
              hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm">
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            원문
            <ChevronDown size={14} className={`transition-transform ${showDownloadMenu ? "rotate-180" : ""}`} />
          </button>
          {showDownloadMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-20 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <button onClick={handleOpenDartViewer} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                  <ExternalLink size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">DART 공식 뷰어로 열기</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">DART 사이트에서 HWP·PDF 형태로 원문을 열람합니다</p>
                  </div>
                </button>
                <div className="border-t border-slate-100" />
                <button onClick={handleDownloadZip} disabled={isDownloading}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left disabled:opacity-50">
                  <FileArchive size={18} className="text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">원문 ZIP 다운로드
                      {isDownloading && <Loader2 size={12} className="inline-block ml-1.5 animate-spin" />}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">DART Open API 원본 파일(.zip) 저장</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">

        {/* ── 좌측: 공시 원문 패널 ──────────────────────────── */}
        <section className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">

          {/* 패널 헤더 — 두 개 독립 토글 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0 gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 shrink-0">
              <BookOpen size={16} className="text-blue-600" />
              공시 원문
            </div>
            {!isLoadingOriginal && !originalTextError && (
              <div className="flex items-center gap-4">
                <ToggleSwitch
                  label={`핵심 문장 하이라이트${highlightCount > 0 ? ` (${highlightCount})` : ""}`}
                  icon={<Highlighter size={14} className={highlightEnabled ? "text-yellow-600" : "text-slate-400"} />}
                  checked={highlightEnabled}
                  onCheckedChange={setHighlightEnabled}
                  disabled={highlightCount === 0}
                  checkedBg="bg-yellow-500"
                />
                <div className="w-px h-4 bg-slate-200" />
                <ToggleSwitch
                  label={isLoadingTerms ? "로딩 중..." : `전문용어${termHighlights.length > 0 ? ` (${uniqueTerms.length})` : ""}`}
                  icon={<BookA size={14} className={termsEnabled ? "text-blue-600" : "text-slate-400"} />}
                  checked={termsEnabled}
                  onCheckedChange={setTermsEnabled}
                  disabled={!originalText || isLoadingTerms}
                  checkedBg="bg-blue-500"
                />
              </div>
            )}
          </div>

          {/* 범례 */}
          {((highlightEnabled && highlightCount > 0) || (termsEnabled && termHighlights.length > 0)) && (
            <div className="flex items-center gap-4 px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 shrink-0">
              {highlightEnabled && highlightCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-3 rounded-sm bg-yellow-200 border border-yellow-400" />
                  AI 분석 핵심 문장 (클릭 → 분석 탭)
                </span>
              )}
              {termsEnabled && termHighlights.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block text-blue-800 border-b-2 border-dotted border-blue-500">用語</span>
                  전문용어 (클릭 → 용어 사전 탭)
                </span>
              )}
            </div>
          )}

          {/* 원문 본문 */}
          {isLoadingOriginal ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-slate-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">DART에서 공시 원문을 불러오는 중입니다...</p>
            </div>
          ) : originalTextError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
              <AlertTriangle size={32} className="text-red-400" />
              <p className="text-sm text-red-600">{originalTextError}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6" ref={originalPanelRef}>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                {segments
                  ? segments.map((seg, i) => {
                      if (seg.type === "plain") return <span key={i}>{seg.text}</span>;

                      if (seg.type === "highlight") {
                        const isActive = activeHighlightKey === seg.item.targetKey;
                        return (
                          <mark
                            key={i}
                            data-highlight-key={seg.item.targetKey}
                            onClick={() => { setActiveTab("analysis"); setActiveHighlightKey(seg.item.targetKey); setTimeout(() => setActiveHighlightKey(null), 2000); }}
                            className={`bg-yellow-200 rounded-sm px-0.5 cursor-pointer transition-all duration-200
                              ${isActive ? "outline outline-2 outline-offset-1 outline-yellow-500" : ""}`}
                            title={`[${ANALYSIS_CATEGORY_LABELS[seg.item.analysisCategory] ?? seg.item.analysisCategory}] ${seg.item.riskLevel}`}
                          >{seg.text}</mark>
                        );
                      }

                      if (seg.type === "term") {
                        const isActive = activeTermId === seg.th.termId;
                        return (
                          <abbr
                            key={i}
                            data-term-id={seg.th.termId}
                            onClick={() => handleTermInTextClick(seg.th.termId)}
                            title={seg.th.definition?.slice(0, 120) + "…"}
                            className={`cursor-pointer border-b-2 border-dotted transition-all duration-200 no-underline
                              ${isActive
                                ? "border-blue-600 text-blue-900 bg-blue-50"
                                : "border-blue-400 text-blue-800 hover:border-blue-600"}`}
                            style={{ textDecoration: "none" }}
                          >{seg.text}</abbr>
                        );
                      }
                      return null;
                    })
                  : originalText}
              </p>
            </div>
          )}
        </section>

        {/* ── 우측: AI 요약 / 핵심 분석 / 용어 사전 탭 ────────── */}
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className={`w-[420px] flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden shrink-0 ${cardBorderClass}`}
        >
          <Tabs.List className="flex border-b border-slate-200">
            <ViewerTab value="summary" activeTab={activeTab} activeClass="border-blue-600 text-blue-600">AI 요약</ViewerTab>
            <ViewerTab value="analysis" activeTab={activeTab} activeClass="border-emerald-500 text-emerald-600">
              핵심 분석
              {analysisItems.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                  {analysisItems.length}
                </span>
              )}
            </ViewerTab>
            <ViewerTab value="glossary" activeTab={activeTab} activeClass="border-indigo-500 text-indigo-600">
              용어 사전
              {uniqueTerms.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
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
                    <div className="flex items-center gap-2 text-blue-600 font-bold"><Sparkles size={18} /><span>핵심 내용 정리</span></div>
                    <RiskBadgeGroup badges={summaryBadges} size="md" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{disclosure.summaryText}</p>
                  <p className="text-sm text-slate-600 leading-relaxed bg-blue-50 p-3 rounded-lg">{disclosure.investorComment}</p>
                </>
              ) : (
                <>
                  <EmptyState icon={<Sparkles size={28} className="text-slate-300" />} message="아직 생성된 AI 요약이 없습니다." />
                  <GenerateButton label="압축 후 요약하기" loadingLabel="요약 생성 중..." isLoading={isSummarizing} disabled={!originalText} onClick={handleSummarize} colorClass="bg-blue-600 hover:bg-blue-700" />
                  {summarizeError && <p className="text-xs text-red-600 text-center">{summarizeError}</p>}
                </>
              )}
            </Tabs.Content>

            {/* 핵심 분석 탭 */}
            <Tabs.Content value="analysis" className="space-y-3 animate-in fade-in outline-none">
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4"><Highlighter size={18} /><span>AI 근거 분석</span></div>
              {analysisItems.length > 0 ? (
                <div className="space-y-3">
                  {analysisItems.map((item, index) => {
                    const isActive = activeHighlightKey === item.targetKey;
                    const hasCoords = item.charOffsetStart >= 0 && item.charOffsetEnd > item.charOffsetStart;
                    return (
                      <div
                        key={`${item.analysisCategory}-${index}`}
                        onClick={() => hasCoords && handleAnalysisItemClick(item)}
                        className={`border border-slate-200 rounded-xl p-4 bg-white transition-all duration-200
                          ${isActive ? "ring-2 ring-yellow-400 ring-offset-1 border-yellow-300" : ""}
                          ${hasCoords ? "cursor-pointer hover:shadow-sm hover:border-slate-300" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-800">{ANALYSIS_CATEGORY_LABELS[item.analysisCategory] ?? item.analysisCategory}</h4>
                            {hasCoords && <span className="flex items-center gap-0.5 text-[10px] text-slate-400"><ChevronRight size={10} />원문으로</span>}
                          </div>
                          <RiskBadge axisLabel="위험도" riskLabel={item.riskLevel} riskTier={item.riskTier} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 mb-2 bg-yellow-50 border border-yellow-100 px-2 py-1 rounded italic leading-relaxed">"{item.targetKey}"</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.materialImpact}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <EmptyState icon={<Highlighter size={28} className="text-slate-300" />} message="아직 생성된 AI 분석이 없습니다." />
                  <GenerateButton label="압축 후 분석하기" loadingLabel="분석 생성 중..." isLoading={isAnalyzing} disabled={!originalText} onClick={handleAnalyze} colorClass="bg-emerald-600 hover:bg-emerald-700" />
                  {analyzeError && <p className="text-xs text-red-600 text-center">{analyzeError}</p>}
                </>
              )}
            </Tabs.Content>

            {/* 용어 사전 탭 */}
            <Tabs.Content value="glossary" className="animate-in fade-in outline-none">
              <div className="flex items-center gap-2 text-indigo-600 font-bold mb-3">
                <Info size={18} />
                <span>금융·공시 전문용어 사전</span>
              </div>

              {!termsEnabled ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-3">전문용어 표시를 켜면 이 문서에서 발견된 용어 목록이 표시됩니다.</p>
                  <button
                    onClick={() => setTermsEnabled(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    전문용어 표시 켜기
                  </button>
                </div>
              ) : isLoadingTerms ? (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">원문에서 전문용어를 찾는 중...</span>
                </div>
              ) : uniqueTerms.length === 0 ? (
                <EmptyState icon={<Info size={28} className="text-slate-300" />} message="이 원문에서 사전에 등록된 전문용어를 찾지 못했습니다." />
              ) : (
                <>
                  <p className="text-xs text-slate-500 mb-3">
                    이 원문에서 <strong>{uniqueTerms.length}</strong>개의 전문용어를 찾았습니다.
                    용어를 클릭하면 원문에서 해당 위치로 이동합니다.
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
                              ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                              : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className={`text-sm font-semibold border-b-2 border-dotted inline pb-px
                              ${isActive ? "border-blue-600 text-blue-900" : "border-blue-400 text-blue-800"}`}>
                              {th.term}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                {th.category}
                              </span>
                              {count > 1 && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                  {count}회
                                </span>
                              )}
                              <ChevronRight size={12} className="text-slate-400" />
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
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

function ViewerTab({ value, activeTab, activeClass, children }) {
  return (
    <Tabs.Trigger value={value}
      className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors flex items-center justify-center gap-1
        ${activeTab === value ? activeClass : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
      {children}
    </Tabs.Trigger>
  );
}

function GenerateButton({ label, loadingLabel, isLoading, disabled, onClick, colorClass }) {
  return (
    <button type="button" onClick={onClick} disabled={isLoading || disabled}
      className={`w-full py-3 text-white rounded-xl font-bold text-sm transition-colors shadow-sm
        flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}>
      {isLoading ? <><Loader2 size={16} className="animate-spin" />{loadingLabel}</> : <><Wand2 size={16} />{label}</>}
    </button>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-slate-400">
      {icon}<p className="text-sm">{message}</p>
    </div>
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

function getCriticalAlert(extraJson) {
  if (!extraJson) return null;
  let extra;
  try { extra = typeof extraJson === "string" ? JSON.parse(extraJson) : extraJson; } catch { return null; }
  if (extra?.auditOpinion && extra.auditOpinion !== "적정")
    return { message: `감사의견 ${extra.auditOpinion}: 상장유지 및 거래정지 가능성 확인 필요`, detail: "감사의견은 다른 지표보다 우선해서 검토해야 하는 위험 신호입니다." };
  if (extra?.isTrueSaleConfirmed === false)
    return { message: "진정한 양도 여부가 불확실한 자산유동화 위험", detail: "자산 보호 범위와 투자자 상환 가능성을 추가로 확인해야 합니다." };
  if (extra?.willDelist === true)
    return { message: "상장폐지 추진 가능성 확인 필요", detail: "공개매수 이후 상장폐지 절차가 진행될 수 있습니다." };
  if (extra?.hasInjunctionRequest === true)
    return { message: "가처분 신청 포함으로 의사결정 효력 정지 가능성", detail: "경영 의사결정이 지연되거나 무효화될 위험이 있습니다." };
  return null;
}
