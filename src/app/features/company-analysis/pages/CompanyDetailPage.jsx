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

/**
 * LLM 단계(overview)가 이 회사의 최신 filing까지 처리됐는지 판단. LLM은 이제
 * 순수 on-demand로 돈다(스케줄러는 diff까지만 미리 해둠) — 클릭했는데 overview가
 * 아직 없는 상태가 예외가 아니라 일상적인 경우다. financials/diffs/recentFilings는
 * overview와 무관하게 이미 채워져 있으므로 페이지 전체를 막지 않고, overview에
 * 의존하는 패널들만 로딩 스켈레톤으로 대체한다.
 */
function isProcessed(detail) {
  return Boolean(detail?.overview);
}

// overview가 없을 때 완료 여부를 확인하는 폴링 주기/횟수 — 클릭 시 이 회사의
// LLM 처리 작업이 큐 맨 앞으로 승격되므로(darfin-main), 완료되면 스켈레톤이
// 자동으로 실제 패널로 바뀐다. 무한 폴링 방지를 위해 횟수 상한을 둔다.
const POLL_INTERVAL_MS = 12_000;
const MAX_POLLS = 10;

function AiAnalysisPendingCard({ stillPolling }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="mb-4 text-sm font-medium text-slate-700">AI가 이 공시를 분석하고 있어요</p>
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-24 w-full" />
      </div>
      <p className="mt-4 text-xs text-slate-400">
        {stillPolling
          ? '완료되면 이 화면이 자동으로 갱신됩니다.'
          : '생각보다 오래 걸리고 있어요. 잠시 후 다시 방문해주세요.'}
      </p>
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

  // overview가 아직 없으면 주기적으로 다시 조회 — 이 회사 클릭이 이미 큐에서
  // 우선순위를 올려놨으므로, 처리가 끝나면 스켈레톤이 자동으로 실제 패널로
  // 바뀐다(사용자가 새로고침할 필요 없음).
  useEffect(() => {
    if (!detail || isProcessed(detail) || pollCount >= MAX_POLLS) return;
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
    return <p className="py-20 text-center text-sm text-slate-400">불러오는 중...</p>;
  }

  if (error) {
    return <p className="py-20 text-center text-sm text-red-500">{error}</p>;
  }

  if (notFound || !detail) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-slate-500">해당 기업을 찾을 수 없어요.</p>
        <Link to="/company" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
          기업 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const { company, financials, findings, diffs, profile, strategyShifts, overview, recentFilings } = detail;
  const stillPolling = pollCount < MAX_POLLS;

  const similarRows = allRows.filter(
    (row) => row.company.id !== company.id && row.company.sector && row.company.sector === company.sector,
  );

  return (
    <div className="w-full">
      <IdentityStrip company={company} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview">
          {/* Tab bar — sits just below the identity strip */}
          <TabsList className="mb-6 w-auto gap-1 bg-slate-100/80 p-1">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="financials">재무 추이</TabsTrigger>
            <TabsTrigger value="diffs">공시 변경</TabsTrigger>
          </TabsList>

          {/* ── 개요 ──────────────────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="space-y-8">
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
                <BusinessEvolutionTimeline profile={profile} strategyShifts={strategyShifts ?? []} />
                <RecentFilingsPanel filings={recentFilings} />
              </div>

              {/* overview/findings는 LLM 산출물 — 아직이면 스켈레톤, 나머지(위/아래)는
                  diff만 끝나면 이미 채워져 있으므로 항상 보여준다 */}
              {overview ? (
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

                  <div className={`grid grid-cols-1 gap-6 ${selection ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
                    <div className="min-w-0 space-y-8">
                      <ReasoningChainFeed
                        findings={findings}
                        selectedHopSourceRef={selection?.hop.sourceRef ?? null}
                        onSelectHop={(finding, hop) => setSelection({ finding, hop })}
                      />
                    </div>

                    {/* Sidebar — only shown after a hop is selected in the reasoning chain */}
                    {selection && (
                      <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
                        <VerificationRail selection={selection} />
                      </aside>
                    )}
                  </div>
                </>
              ) : (
                <AiAnalysisPendingCard stillPolling={stillPolling} />
              )}

              <SimilarCompaniesPanel rows={similarRows} sector={company.sector} />
            </div>
          </TabsContent>

          {/* ── 재무 추이 ─────────────────────────────────────────── */}
          <TabsContent value="financials">
            <FinancialTrendCharts financials={financials} />
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
