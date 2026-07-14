import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useLocale } from '../../../shared/i18n';
import { fetchCompanies, fetchCompanyDetail, fetchAiAnalysis, unlockAiAnalysis } from '../api/companyAnalysisApi';
import { IdentityStrip } from '../components/IdentityStrip';
import { CompanyDetailSkeleton } from '../components/CompanyDetailSkeleton';
import { SimilarCompaniesPanel } from '../components/SimilarCompaniesPanel';
import { FinancialTrendCharts } from '../components/FinancialTrendCharts';
import { RiskCategoryGrid } from '../components/RiskCategoryGrid';
import { RiskTrajectoryChart } from '../components/RiskTrajectoryChart';
import { DossierTimeline } from '../components/DossierTimeline';
import { RecentFilingsPanel } from '../components/RecentFilingsPanel';
import { DartOverviewHeroStrip } from '../components/dart/DartOverviewHeroStrip';
import { DartGroupEyebrow } from '../components/dart/DartSectionHeader';
import { DartSectionNav } from '../components/dart/DartSectionNav';
import { MajorShareholderPanel } from '../components/dart/MajorShareholderPanel';
import { ShareholderChangePanel } from '../components/dart/ShareholderChangePanel';
import { StockCompositionPanel } from '../components/dart/StockCompositionPanel';
import { CapitalChangePanel } from '../components/dart/CapitalChangePanel';
import { DartDividendPanel } from '../components/dart/DartDividendPanel';
import { TreasuryStockPanel } from '../components/dart/TreasuryStockPanel';
import { EmployeePanel } from '../components/dart/EmployeePanel';
import { ExecutivePanel } from '../components/dart/ExecutivePanel';
import { AuditOpinionPanel } from '../components/dart/AuditOpinionPanel';
import { WatchlistToggleButton } from '../components/WatchlistToggleButton';
import { AiUnlockCard } from '../components/AiUnlockCard';
import { InsufficientTokensDialog } from '../components/InsufficientTokensDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui/tabs';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { hasDartOverviewData } from '../components/dart/dartDerive';
import { latestValue } from '../lib/scoring';
import { useStarredCompanies } from '../lib/useStarredCompanies';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';

const POLL_INTERVAL_MS = 12_000;
const MAX_POLLS = 10;
const DEFAULT_UNLOCK_COST = 2000;

function FindingsSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-3 space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompanyDetailPage() {
  const { t } = useLocale();
  const { id } = useParams();
  const [tab, setTab] = useState('overview');

  const [detail, setDetail] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState(null);
  const [riskPollCount, setRiskPollCount] = useState(0);
  const [detailPollCount, setDetailPollCount] = useState(0);
  const [starLoading, setStarLoading] = useState(false);
  const [starError, setStarError] = useState(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState(null);
  const [insufficientOpen, setInsufficientOpen] = useState(false);

  const { isStarred, star, unstar, refresh: refreshStarred } = useStarredCompanies();
  const starred = isStarred(id);

  const companyForMeta = detail?.company;
  usePageMeta({
    title: companyForMeta
      ? t("seo.companyDetail.title", { name: companyForMeta.name, ticker: companyForMeta.ticker })
      : t("seo.company.title"),
    description: companyForMeta
      ? t("seo.companyDetail.description", { name: companyForMeta.name })
      : t("seo.company.description"),
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setDetail(null);
    setRiskAnalysis(null);
    setRiskError(null);
    setRiskPollCount(0);
    setDetailPollCount(0);
    setTab('overview');

    Promise.all([fetchCompanyDetail(id), fetchCompanies().catch(() => [])])
      .then(([detailData, rows]) => {
        if (cancelled) return;
        setDetail(detailData);
        setAllRows(rows ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || t('company.detail.loadFail'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, t]);

  // preview(파이프라인 미수집) 동안 폴링 — 관심등록 시 Spring이 큐에 넣는
  // onboard_ingest job(filings 백필, 개요/재무추이/AI분석 텍스트 레이어의
  // 전제조건)이 끝나면 detail.preview가 false로 바뀐다. 별표 없이 그냥 열람만
  // 한 회사(job 미등록)는 MAX_POLLS에서 조용히 멈춘다 — 영구 폴링 아님.
  useEffect(() => {
    if (!detail?.preview || detailPollCount >= MAX_POLLS) return;
    const timer = setTimeout(() => {
      fetchCompanyDetail(id)
        .then((fresh) => setDetail(fresh))
        .catch(() => {
          /* 다음 폴링에서 재시도 */
        })
        .finally(() => setDetailPollCount((c) => c + 1));
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [detail, detailPollCount, id]);

  // AI분석 리스크 데이터 — 탭 진입 시 lazy fetch (on-demand 계산이라 상세 응답과 분리).
  // 열람권 미보유 시 status='locked' 게이트가 오므로 preview 여부와 무관하게 조회한다.
  // riskLoading은 의존성/가드에서 제외 — setRiskLoading(true)가 이 effect를 재실행시키면
  // cleanup의 cancelled 플래그가 진행 중인 fetch 결과를 버려 스켈레톤에 갇힌다.
  useEffect(() => {
    // riskError 시 재시도하지 않는다 — 자동 재시도 루프 방지 (탭 재진입/새로고침으로 복구).
    if (tab !== 'ai' || riskAnalysis || riskError) return;
    let cancelled = false;
    setRiskLoading(true);
    fetchAiAnalysis(id)
      .then((data) => {
        if (!cancelled) setRiskAnalysis(data);
      })
      .catch((err) => {
        if (!cancelled) setRiskError(err.message || t('company.risk.loadFail'));
      })
      .finally(() => {
        if (!cancelled) setRiskLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, detail, riskAnalysis, riskError, id, t]);

  // quant_only(내러티브 미완) 동안 폴링 — 기존 AI 인사이트 폴링과 동일 리듬.
  useEffect(() => {
    if (riskAnalysis?.status !== 'quant_only' || riskPollCount >= MAX_POLLS) return;
    const timer = setTimeout(() => {
      fetchAiAnalysis(id)
        .then((fresh) => setRiskAnalysis(fresh))
        .catch(() => {
          /* 다음 폴링에서 재시도 */
        })
        .finally(() => setRiskPollCount((c) => c + 1));
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [riskAnalysis, riskPollCount, id]);

  // 10회(약 2분) 폴링에도 내러티브가 안 끝나면 자동 폴링을 멈춘다 — 사용자가
  // 명시적으로 "다시 확인"을 누르면 riskAnalysis/riskPollCount를 리셋해
  // fetch effect를 재실행시킨다(같은 매커니즘, 수동 트리거).
  const handleRetryRisk = useCallback(() => {
    setRiskAnalysis(null);
    setRiskError(null);
    setRiskPollCount(0);
  }, []);

  // 별표 토글 — 무료 북마크라 확인 다이얼로그 없이 즉시 반영.
  // preview(미온보딩) 종목의 별표는 서버가 온보딩까지 수행하므로 상세를 재조회한다.
  const handleToggleStar = useCallback(async () => {
    if (!detail?.company) return;
    setStarLoading(true);
    setStarError(null);
    try {
      if (starred) {
        await unstar(id);
      } else {
        const wasPreview = detail.preview === true;
        await star(id);
        if (wasPreview) {
          try {
            const fresh = await fetchCompanyDetail(id);
            setDetail(fresh);
          } catch {
            /* pipeline onboarding runs server-side; polling will pick up data later */
          }
        }
      }
    } catch (err) {
      setStarError(err.message || t('company.grid.searchOnboardFail'));
    } finally {
      setStarLoading(false);
    }
  }, [detail, starred, star, unstar, id, t]);

  // AI 분석 열람권 구매 — 성공 시 자동 별표 + 온보딩이 서버에서 일어나므로
  // 관심 목록/상세/AI 데이터를 모두 갱신한다. 402는 토큰 부족 다이얼로그.
  const handleUnlock = useCallback(async () => {
    setUnlockLoading(true);
    setUnlockError(null);
    const wasPreview = detail?.preview === true;
    try {
      await unlockAiAnalysis(id);
      await refreshStarred();
      setRiskAnalysis(null);
      setRiskError(null);
      setRiskPollCount(0);
      if (wasPreview) {
        try {
          const fresh = await fetchCompanyDetail(id);
          setDetail(fresh);
        } catch {
          /* pipeline onboarding runs server-side */
        }
      } else {
        setDetail((prev) => (prev ? { ...prev, aiUnlocked: true } : prev));
      }
    } catch (err) {
      if (err?.status === 402) {
        setInsufficientOpen(true);
      } else {
        setUnlockError(err?.message || t('company.unlock.fail'));
      }
    } finally {
      setUnlockLoading(false);
    }
  }, [detail, id, refreshStarred, t]);

  if (loading) {
    return <CompanyDetailSkeleton tab={tab} onTabChange={setTab} />;
  }

  if (error) {
    return <p className="py-20 text-center text-sm text-red-500 dark:text-red-400">{error}</p>;
  }

  if (notFound || !detail) {
    return (
      <div className="container py-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('company.detail.notFound')}</p>
        <Link to="/company" className="mt-3 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          {t('company.detail.backToList')}
        </Link>
      </div>
    );
  }

  const { company, financials, financialsSeparate, recentFilings, dartOverview } = detail;
  const isPreview = detail.preview === true;
  const showDartOverview = hasDartOverviewData(dartOverview);
  const activeGroups = [
    (dartOverview?.majorShareholders?.rows?.length || dartOverview?.majorShareholderChanges?.rows?.length) && 'dart-group-governance',
    (dartOverview?.stockTotals?.rows?.length || dartOverview?.capitalChanges?.rows?.length) && 'dart-group-capital',
    (dartOverview?.dividends?.rows?.length || dartOverview?.treasuryStock?.rows?.length) && 'dart-group-returns',
    (dartOverview?.employees?.rows?.length || dartOverview?.executives?.rows?.length || dartOverview?.auditOpinions?.rows?.length) && 'dart-group-snapshot',
  ].filter(Boolean);

  const similarRows = allRows.filter(
    (row) => row.company.id !== company.id && row.company.sector && row.company.sector === company.sector,
  );

  const scoreRow = allRows.find((row) => row.company.id === company.id);
  const compositeScore = scoreRow?.scores?.length
    ? Math.round(scoreRow.scores.reduce((sum, c) => sum + latestValue(c), 0))
    : null;

  return (
    <div className="w-full">
      <IdentityStrip company={company} score={compositeScore} />

      <div className="container py-6">
        <WatchlistToggleButton
          starred={starred}
          loading={starLoading}
          onToggle={handleToggleStar}
        />
        {starError && (
          <p className="mb-4 text-sm text-red-500 dark:text-red-400">{starError}</p>
        )}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 w-auto gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1">
            <TabsTrigger value="overview">{t('company.detail.tabOverview')}</TabsTrigger>
            <TabsTrigger value="ai">{t('company.detail.tabAiAnalysis')}</TabsTrigger>
            <TabsTrigger value="financials">{t('company.detail.tabFinancials')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-8">
              {showDartOverview && <DartSectionNav activeGroups={activeGroups} />}
              {showDartOverview ? (
                <>
                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
                    <DartOverviewHeroStrip dartOverview={dartOverview} />
                    {!isPreview && <RecentFilingsPanel filings={recentFilings} />}
                  </div>

                  <div id="dart-group-governance">
                    <DartGroupEyebrow>{t('company.dart.groups.governance')}</DartGroupEyebrow>
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                      <MajorShareholderPanel
                        section={dartOverview.majorShareholders}
                        minoritySection={dartOverview.minorityShareholders}
                      />
                      <ShareholderChangePanel section={dartOverview.majorShareholderChanges} />
                    </div>
                  </div>

                  <div id="dart-group-capital">
                    <DartGroupEyebrow>{t('company.dart.groups.capital')}</DartGroupEyebrow>
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                      <StockCompositionPanel section={dartOverview.stockTotals} />
                      <CapitalChangePanel section={dartOverview.capitalChanges} />
                    </div>
                  </div>

                  <div id="dart-group-returns">
                    <DartGroupEyebrow>{t('company.dart.groups.returns')}</DartGroupEyebrow>
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                      <DartDividendPanel section={dartOverview.dividends} meta={dartOverview.meta} />
                      <TreasuryStockPanel section={dartOverview.treasuryStock} />
                    </div>
                  </div>

                  <div id="dart-group-snapshot">
                    <DartGroupEyebrow>{t('company.dart.groups.snapshot')}</DartGroupEyebrow>
                    <EmployeePanel section={dartOverview.employees} />
                    <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
                      <ExecutivePanel section={dartOverview.executives} />
                      <AuditOpinionPanel section={dartOverview.auditOpinions} />
                    </div>
                  </div>
                </>
              ) : (
                <p className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  {t('company.dart.noData')}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="space-y-8">
              {riskAnalysis?.status === 'locked' ? (
                <AiUnlockCard
                  cost={riskAnalysis.unlockCost ?? DEFAULT_UNLOCK_COST}
                  loading={unlockLoading}
                  error={unlockError}
                  onUnlock={handleUnlock}
                />
              ) : riskAnalysis?.status === 'preview' ? (
                <p className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('company.unlock.preparingNote')}
                </p>
              ) : (
                <>
                  {/* 리스크 상태머신 (on-demand quant + LLM 폴링 보강) */}
                  {riskError && (
                    <p className="text-sm text-red-500 dark:text-red-400">{riskError}</p>
                  )}
                  {riskLoading && !riskAnalysis && <FindingsSkeleton />}
                  {riskAnalysis && riskAnalysis.status === 'insufficient_data' && (
                    <p className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                      {t('company.risk.insufficientNote')}
                    </p>
                  )}
                  {riskAnalysis && riskAnalysis.currentStates?.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                          {t('company.risk.sectionTitle')}
                        </h3>
                        {riskAnalysis.fsDiv && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {t(`company.risk.fsDivNote.${riskAnalysis.fsDiv}`)}
                          </span>
                        )}
                      </div>
                      {riskAnalysis.status === 'quant_only' && riskPollCount < MAX_POLLS && (
                        <p className="rounded-md border border-blue-100 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
                          {t('company.risk.quantOnlyNote')}
                        </p>
                      )}
                      {riskAnalysis.status === 'quant_only' && riskPollCount >= MAX_POLLS && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-100 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                          <span>{t('company.risk.quantOnlyDelayedNote')}</span>
                          <button
                            type="button"
                            onClick={handleRetryRisk}
                            className="shrink-0 rounded-md border border-amber-300 dark:border-amber-700 px-2 py-1 font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40"
                          >
                            {t('company.risk.retryCheck')}
                          </button>
                        </div>
                      )}
                      <RiskCategoryGrid currentStates={riskAnalysis.currentStates} />
                      <RiskTrajectoryChart
                        quarters={riskAnalysis.quarters}
                        trajectories={riskAnalysis.trajectories}
                      />
                      <DossierTimeline events={riskAnalysis.dossierEvents} />
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {t('company.risk.disclaimer')}
                      </p>
                    </section>
                  )}

                  <SimilarCompaniesPanel rows={similarRows} sector={company.sector} />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="financials">
            <FinancialTrendCharts financials={financials} financialsSeparate={financialsSeparate} />
          </TabsContent>
        </Tabs>
      </div>

      <InsufficientTokensDialog
        open={insufficientOpen}
        cost={riskAnalysis?.unlockCost ?? DEFAULT_UNLOCK_COST}
        onOpenChange={setInsufficientOpen}
      />
    </div>
  );
}
