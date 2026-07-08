import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useLocale } from '../../../shared/i18n';
import { fetchCompanies, fetchCompanyDetail, addMonitoredCompany } from '../api/companyAnalysisApi';
import { IdentityStrip } from '../components/IdentityStrip';
import { SimilarCompaniesPanel } from '../components/SimilarCompaniesPanel';
import { FinancialTrendCharts } from '../components/FinancialTrendCharts';
import { ReasoningChainFeed } from '../components/ReasoningChainFeed';
import { SectionDiffList } from '../components/SectionDiffList';
import { VerificationRail } from '../components/VerificationRail';
import { BusinessEvolutionTimeline } from '../components/BusinessEvolutionTimeline';
import { RecentFilingsPanel } from '../components/RecentFilingsPanel';
import { BusinessSegmentPanel } from '../components/BusinessSegmentPanel';
import { ProductRevenuePanel } from '../components/ProductRevenuePanel';
import { CustomerRegionPanel } from '../components/CustomerRegionPanel';
import { KeyRisksPanel } from '../components/KeyRisksPanel';
import { ShareholderPanel } from '../components/ShareholderPanel';
import { DividendPanel } from '../components/DividendPanel';
import { MonitoringActionBanner } from '../components/MonitoringActionBanner';
import { AddMonitoringDialog } from '../components/AddMonitoringDialog';
import { MonitorLimitDialog } from '../components/MonitorLimitDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui/tabs';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { isAiReady } from '../lib/aiStatus';
import { latestValue } from '../lib/scoring';
import { useMonitoredCompanies } from '../lib/useMonitoredCompanies';

const POLL_INTERVAL_MS = 12_000;
const MAX_POLLS = 10;

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
  const navigate = useNavigate();
  const [selection, setSelection] = useState(null);

  const [detail, setDetail] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState(null);

  const { limit, canAddMore, isMonitored, add } = useMonitoredCompanies();
  const monitored = isMonitored(id);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setDetail(null);
    setPollCount(0);

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

  useEffect(() => {
    if (detail?.preview) return;
    const aiPending = !detail?.overview || !isAiReady(detail.overview);
    if (!detail || !aiPending || pollCount >= MAX_POLLS) return;
    const timer = setTimeout(() => {
      fetchCompanyDetail(id)
        .then((fresh) => setDetail(fresh))
        .catch(() => {
          /* 다음 폴링에서 재시도 */
        })
        .finally(() => setPollCount((c) => c + 1));
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [detail, pollCount, id]);

  const handleAddClick = useCallback(() => {
    if (monitored) return;
    if (!canAddMore) {
      setLimitDialogOpen(true);
      return;
    }
    setOnboardError(null);
    setAddDialogOpen(true);
  }, [monitored, canAddMore]);

  const handleConfirmAdd = useCallback(async () => {
    if (!detail?.company) return;
    setOnboardLoading(true);
    setOnboardError(null);
    const wasPreview = detail.preview === true;
    try {
      await add(id);
      setAddDialogOpen(false);
      if (wasPreview) {
        try {
          const fresh = await fetchCompanyDetail(id);
          setDetail(fresh);
          setPollCount(0);
        } catch {
          /* pipeline onboarding runs server-side; polling will pick up data later */
        }
      }
    } catch (err) {
      setOnboardError(err.message || t('company.grid.searchOnboardFail'));
    } finally {
      setOnboardLoading(false);
    }
  }, [add, detail, id, t]);

  if (loading) {
    return <p className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">{t('common.loading')}</p>;
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

  const { company, financials, financialsSeparate, findings, diffs, profile, mdnaHistory, recentFilings } = detail;
  const isPreview = detail.preview === true;
  const waitedOut = pollCount >= MAX_POLLS && !isAiReady(detail.overview);
  const overview = waitedOut && detail.overview
    ? { ...detail.overview, aiInsightsReady: true }
    : detail.overview;
  const findingsReady = isAiReady(overview);

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
        <MonitoringActionBanner
          isMonitored={monitored}
          canAddMore={canAddMore}
          onAdd={handleAddClick}
        />
        {onboardError && (
          <p className="mb-4 text-sm text-red-500 dark:text-red-400">{onboardError}</p>
        )}
        {waitedOut && (
          <p className="mb-4 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            {t('company.detail.aiDelay')}
          </p>
        )}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 w-auto gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1">
            <TabsTrigger value="overview">{t('company.detail.tabOverview')}</TabsTrigger>
            <TabsTrigger value="financials">{t('company.detail.tabFinancials')}</TabsTrigger>
            <TabsTrigger value="diffs">{t('company.detail.tabDiffs')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-8">
              {isPreview ? (
                <p className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('company.detail.addToAnalysisHint')}
                </p>
              ) : (
                <>
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
                <BusinessEvolutionTimeline profile={profile} mdnaHistory={mdnaHistory ?? []} />
                <RecentFilingsPanel filings={recentFilings} />
              </div>

              {overview && (
                <>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ShareholderPanel overview={overview} />
                    <DividendPanel overview={overview} />
                  </div>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <BusinessSegmentPanel overview={overview} profile={profile} />
                    <ProductRevenuePanel overview={overview} />
                  </div>
                  <CustomerRegionPanel overview={overview} />
                  <KeyRisksPanel overview={overview} />
                </>
              )}

              <div className={`grid grid-cols-1 gap-6 ${selection ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
                <div className="min-w-0 space-y-8">
                  {findingsReady ? (
                    <ReasoningChainFeed
                      findings={findings}
                      selectedHopSourceRef={selection?.hop.sourceRef ?? null}
                      onSelectHop={(finding, hop) => setSelection({ finding, hop })}
                    />
                  ) : (
                    <FindingsSkeleton />
                  )}
                </div>

                {selection && (
                  <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
                    <VerificationRail selection={selection} />
                  </aside>
                )}
              </div>

              <SimilarCompaniesPanel rows={similarRows} sector={company.sector} />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="financials">
            <FinancialTrendCharts financials={financials} financialsSeparate={financialsSeparate} />
          </TabsContent>

          <TabsContent value="diffs">
            <SectionDiffList diffs={diffs} recentFilings={recentFilings} />
          </TabsContent>
        </Tabs>
      </div>

      <AddMonitoringDialog
        open={addDialogOpen}
        company={company ? { corpCode: id, name: company.name, ticker: company.ticker } : null}
        loading={onboardLoading}
        onOpenChange={setAddDialogOpen}
        onConfirm={handleConfirmAdd}
      />
      <MonitorLimitDialog
        open={limitDialogOpen}
        limit={limit}
        onOpenChange={setLimitDialogOpen}
        onFocusSearch={() => {
          setLimitDialogOpen(false);
          navigate('/company');
        }}
      />
    </div>
  );
}
