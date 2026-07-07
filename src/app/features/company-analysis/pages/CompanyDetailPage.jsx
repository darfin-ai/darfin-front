import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { fetchCompanies, fetchCompanyDetail } from '../api/companyAnalysisApi';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui/tabs';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { isAiReady } from '../lib/aiStatus';
import { latestValue } from '../lib/scoring';

// overview는 결정론적 부분(패널 수치/차트)이 diff만 끝나면 이미 채워져
// 있으므로 항상 즉시 보여준다. findings(AI 분석 근거)와 각 패널의 "So
// what?" 문단만 LLM 산출물이라 aiInsightsReady가 false인 동안만 로딩
// 상태를 보여주고, 완료 여부를 폴링해서 자동 갱신한다.
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
  const { id } = useParams();
  const [selection, setSelection] = useState(null);

  const [detail, setDetail] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

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
          setError(err.message || '기업 정보를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // AI 인사이트가 아직이면 주기적으로 다시 조회 — 이 회사 클릭이 이미 큐에서
  // 우선순위를 올려놨으므로, 처리가 끝나면 스켈레톤이 자동으로 실제 콘텐츠로
  // 바뀐다(사용자가 새로고침할 필요 없음). overview가 아예 없는 경우(파이프
  // 라인이 이 회사를 아직 처리 안 함)도 서버가 큐에 넣어두므로 같이 폴링한다.
  useEffect(() => {
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

  if (loading) {
    return <p className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">불러오는 중...</p>;
  }

  if (error) {
    return <p className="py-20 text-center text-sm text-red-500 dark:text-red-400">{error}</p>;
  }

  if (notFound || !detail) {
    return (
      <div className="container py-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">해당 기업을 찾을 수 없어요.</p>
        <Link to="/company" className="mt-3 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          기업 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const { company, financials, financialsSeparate, findings, diffs, profile, mdnaHistory, recentFilings } = detail;
  // 폴링 한도까지 기다려도 LLM 단계가 안 끝나면 무한 스켈레톤 대신 지금 있는
  // 결정론적 데이터로 완성 화면을 그린다(인사이트 문단만 빠진 상태). 아래
  // 배너로 지연을 알리고, 완료분은 다음 방문/새로고침에서 자연히 반영된다.
  const waitedOut = pollCount >= MAX_POLLS && !isAiReady(detail.overview);
  const overview = waitedOut && detail.overview
    ? { ...detail.overview, aiInsightsReady: true }
    : detail.overview;
  const findingsReady = isAiReady(overview);

  const similarRows = allRows.filter(
    (row) => row.company.id !== company.id && row.company.sector && row.company.sector === company.sector,
  );

  // 종합 스코어 = 네 score_component 최신 분기 값의 합 (maxPoints 합계 100 기준).
  const scoreRow = allRows.find((row) => row.company.id === company.id);
  const compositeScore = scoreRow?.scores?.length
    ? Math.round(scoreRow.scores.reduce((sum, c) => sum + latestValue(c), 0))
    : null;

  return (
    <div className="w-full">
      <IdentityStrip company={company} score={compositeScore} />

      <div className="container py-6">
        {waitedOut && (
          <p className="mb-4 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            AI 분석이 평소보다 오래 걸리고 있어요. 수치·차트는 최신이며, 분석 코멘트는 준비되는 대로 새로고침 시 반영됩니다.
          </p>
        )}
        <Tabs defaultValue="overview">
          {/* Tab bar — sits just below the identity strip */}
          <TabsList className="mb-6 w-auto gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="financials">재무 추이</TabsTrigger>
            <TabsTrigger value="diffs">공시 변경</TabsTrigger>
          </TabsList>

          {/* ── 개요 ──────────────────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="space-y-8">
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
                <BusinessEvolutionTimeline profile={profile} mdnaHistory={mdnaHistory ?? []} />
                <RecentFilingsPanel filings={recentFilings} />
              </div>

              {/* 패널 수치/차트는 diff만 끝나면 이미 채워져 있으므로 항상 보여준다 —
                  각 패널이 자체적으로 "So what?" 문단만 로딩 상태로 처리한다. */}
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

                {/* Sidebar — only shown after a hop is selected in the reasoning chain */}
                {selection && (
                  <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
                    <VerificationRail selection={selection} />
                  </aside>
                )}
              </div>

              <SimilarCompaniesPanel rows={similarRows} sector={company.sector} />
            </div>
          </TabsContent>

          {/* ── 재무 추이 ─────────────────────────────────────────── */}
          <TabsContent value="financials">
            <FinancialTrendCharts financials={financials} financialsSeparate={financialsSeparate} />
          </TabsContent>

          {/* ── 공시 변경 ─────────────────────────────────────────── */}
          <TabsContent value="diffs">
            <SectionDiffList diffs={diffs} recentFilings={recentFilings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
