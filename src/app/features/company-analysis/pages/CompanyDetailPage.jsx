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

/** 파이프라인이 아직 이 회사를 처리하지 않아 상세 데이터가 사실상 비어있는지 판단. */
function isDataRich(detail) {
  return Boolean(detail?.overview) || (detail?.recentFilings ?? []).length > 0;
}

export function CompanyDetailPage() {
  const { id } = useParams();
  const [selection, setSelection] = useState(null);

  const [detail, setDetail] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setDetail(null);

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

  if (!isDataRich(detail)) {
    return (
      <div className="w-full">
        <IdentityStrip company={company} />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-base font-medium text-slate-700">{company.name}의 상세 분석을 준비하고 있어요.</p>
          <p className="mt-2 text-sm text-slate-500">정기공시 기반 심층 분석은 순차적으로 추가될 예정이에요.</p>
          <Link to="/company" className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline">
            기업 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

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

              {/* Structured 사업의 내용 breakdown — only present for companies with a full CompanyDetail */}
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
                  <ReasoningChainFeed
                    findings={findings}
                    selectedHopSourceRef={selection?.hop.sourceRef ?? null}
                    onSelectHop={(finding, hop) => setSelection({ finding, hop })}
                  />
                  <SimilarCompaniesPanel rows={similarRows} sector={company.sector} />
                </div>

                {/* Sidebar — only shown after a hop is selected in the reasoning chain */}
                {selection && (
                  <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
                    <VerificationRail selection={selection} />
                  </aside>
                )}
              </div>
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
