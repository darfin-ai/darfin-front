import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { getCompanies, getCompanyDetail } from '../../../../mocks/companyAnalysis';
import { IdentityStrip } from '../components/IdentityStrip';
import { ScoreOverview } from '../components/ScoreOverview';
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
import { ChangeSignalPanel } from '../components/ChangeSignalPanel';
import { AiAnalysisTab } from '../components/AiAnalysisTab';
import { ShareholderPanel } from '../components/ShareholderPanel';
import { DividendPanel } from '../components/DividendPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui/tabs';

export function CompanyDetailPage() {
  const { id } = useParams();
  const detail = getCompanyDetail(id);
  const [selection, setSelection] = useState(null);

  if (!detail) {
    const companySummary = getCompanies().find((c) => c.id === id);

    if (!companySummary) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">해당 기업을 찾을 수 없어요.</p>
          <Link to="/company" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
            기업 목록으로 돌아가기
          </Link>
        </div>
      );
    }

    return (
      <div className="w-full">
        <IdentityStrip company={companySummary} />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-base font-medium text-slate-700">{companySummary.name}의 상세 분석을 준비하고 있어요.</p>
          <p className="mt-2 text-sm text-slate-500">정기공시 기반 심층 분석은 순차적으로 추가될 예정이에요.</p>
          <Link to="/company" className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline">
            기업 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const { company, scores, financials, findings, diffs, profile, strategyShifts, overview, recentFilings } = detail;

  const latestQuarter = scores[0]?.history.at(-1)?.quarter ?? '';

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
            <TabsTrigger value="ai">AI 분석</TabsTrigger>
          </TabsList>

          {/* ── 개요 ──────────────────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="space-y-8">
              {/* Zone 1 — 사업 변화 흐름 + 최근 보고서 */}
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
                <BusinessEvolutionTimeline profile={profile} strategyShifts={strategyShifts ?? []} />
                <RecentFilingsPanel filings={recentFilings} />
              </div>

              {/* Zone 2 — 개요 panels (only when overview data exists) */}
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

              <ChangeSignalPanel scores={scores} quarter={latestQuarter} />

              {/* Zone 2 + sidebar */}
              <div className={`grid grid-cols-1 gap-6 ${selection ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
                <div className="min-w-0 space-y-8">
                  {/* Zone 2 — What changed & why */}
                  <ReasoningChainFeed
                    findings={findings}
                    selectedHopSourceRef={selection?.hop.sourceRef ?? null}
                    onSelectHop={(finding, hop) => setSelection({ finding, hop })}
                  />
                  {/* Zone 3 — Score breakdown */}
                  <ScoreOverview scores={scores} />
                </div>

                {/* Sidebar — only shown after a hop is selected */}
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
            <SectionDiffList diffs={diffs} />
          </TabsContent>

          {/* ── AI 분석 ──────────────────────────────────────────── */}
          <TabsContent value="ai">
            <AiAnalysisTab companyName={company.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
