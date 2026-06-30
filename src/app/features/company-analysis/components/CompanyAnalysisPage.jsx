import { formatKorDate } from '../../../shared/utils/dateUtils';
import ScoreBreakdown from './ScoreBreakdown/ScoreBreakdown';
import RecentSignals from './RecentSignals/RecentSignals';
import ManagementSignals from './ManagementSignals/ManagementSignals';
import MetricChanges from './MetricChanges/MetricChanges';
import FilingExplorer from './FilingExplorer/FilingExplorer';
import {
  mockScoreData,
  mockSignals,
  mockManagementSignals,
  mockMetricChanges,
  mockFilingExplorer,
} from '../data/samsung2602';
import { CompanyLogo } from './CompanyLogo';

const RISK_CHANGE_STYLE = {
  new:         { bg: '#FCEBEB', text: '#A32D2D', label: 'NEW' },
  escalated:   { bg: '#FAEEDA', text: '#854F0B', label: 'ESCALATED' },
  deescalated: { bg: '#DCEFD5', text: '#4D7A1A', label: 'REDUCED' },
};

const RISK_SEVERITY_DOT = {
  high:   '#C0392B',
  medium: '#D97706',
  low:    '#639922',
};

const RISK_SEVERITY_STYLE = {
  high:   { bg: '#FCEBEB', text: '#A32D2D', label: '높음' },
  medium: { bg: '#FAEEDA', text: '#854F0B', label: '중간' },
  low:    { bg: '#F1EFE8', text: '#5F5E5A', label: '낮음' },
};

function groupSignals(signals) {
  const result = { positive: [], risk: [], newDisclosure: [] };
  for (const s of signals ?? []) {
    if (s.direction === 'up')        result.positive.push(s);
    else if (s.direction === 'down') result.risk.push(s);
    else if (s.direction === 'new')  result.newDisclosure.push(s);
  }
  return result;
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 12 }}>
      {children}
    </div>
  );
}

function SectionWrap({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #E5E4E7', borderRadius: 10, padding: '14px 16px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function EscalatedRisksSection({ risks }) {
  if (!risks || risks.length === 0) return null;

  return (
    <SectionWrap>
      <SectionLabel>New &amp; Escalated Risks</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {risks.map(risk => {
          const changeSt = RISK_CHANGE_STYLE[risk.changeType] ?? RISK_CHANGE_STYLE.escalated;
          const sevColor = RISK_SEVERITY_DOT[risk.severity] ?? '#D1D5DB';
          const sevSt = RISK_SEVERITY_STYLE[risk.severity] ?? RISK_SEVERITY_STYLE.low;
          return (
            <div key={risk.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, border: '0.5px solid #E5E4E7' }}>
              <div style={{ marginTop: 3, flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sevColor }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{risk.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 3, backgroundColor: changeSt.bg, color: changeSt.text }}>{changeSt.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 3, backgroundColor: sevSt.bg, color: sevSt.text }}>{sevSt.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {risk.previousMentions !== null && (
                    <span style={{ fontSize: 12, color: '#6B7280' }}>
                      언급 빈도{' '}
                      <span style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontWeight: 500 }}>
                        {risk.previousMentions} → {risk.currentMentions}회
                      </span>
                    </span>
                  )}
                  {risk.revenueExposure && (
                    <span style={{ fontSize: 12, color: '#6B7280' }}>
                      잠재 매출 노출{' '}
                      <span style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontWeight: 600, color: '#A32D2D' }}>{risk.revenueExposure}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrap>
  );
}

function GovernanceSection({ changes }) {
  if (!changes || changes.length === 0) return null;
  return (
    <SectionWrap>
      <SectionLabel>Governance Changes</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {changes.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#185FA5', fontWeight: 500, flexShrink: 0 }}>{c.type}</span>
            <span style={{ fontSize: 13, color: '#374151' }}>{c.description}</span>
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}

function PendingState({ company }) {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
      <div style={{ background: '#fff', border: '0.5px solid #E5E4E7', borderRadius: 10, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
          <CompanyLogo corpCode={company.corpCode} initials={company.initials} colorKey={company.colorKey} size={36} radius={8} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{company.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF9F27' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#EF9F27' }}>AI 분석 진행 중</span>
        </div>
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>공시가 접수되었습니다. 분석이 완료되면 신호와 변동사항이 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

/**
 * @param {{ filing: import('../../../shared/types/darfin').FilingInfo, onViewInFiling: function }} props
 */
export default function CompanyAnalysisPage({ filing, onViewInFiling }) {
  const { company, intelligence } = filing;
  const isSamsung = company.id === '005930';

  if (!filing.aiComplete && !intelligence) {
    return <PendingState company={company} />;
  }

  const scoreData = isSamsung
    ? mockScoreData
    : intelligence?.signalScore
      ? { score: intelligence.signalScore.score, tier: intelligence.signalScore.tier, components: [] }
      : null;
  const signalsData  = isSamsung ? mockSignals          : intelligence ? groupSignals(intelligence.recentSignals) : null;
  const mgmtData     = isSamsung ? mockManagementSignals : intelligence?.managementKeywords?.length > 0
    ? { themes: intelligence.managementKeywords.map(kw => ({ ...kw, isNew: kw.previousCount === 0, sectionDistribution: [], excerpts: [], appearsInHeading: false, headingNote: null, deemphasizedNote: kw.currentCount < kw.previousCount ? `전분기 대비 −${kw.previousCount - kw.currentCount}회 감소` : null })) }
    : null;
  const metricsData  = isSamsung ? mockMetricChanges    : intelligence?.metricChanges?.length > 0
    ? {
        periodLabel: filing.financialTable
          ? `${filing.financialTable.quarters.at(-2)} → ${filing.financialTable.quarters.at(-1)}`
          : null,
        anchor: intelligence.metricChanges,
        conditional: [],
        suppressed: [],
      }
    : null;
  const explorerMeta = isSamsung ? mockFilingExplorer   : null;

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100%' }}>
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E5E4E7', padding: '14px 24px', flexShrink: 0 }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CompanyLogo corpCode={company.corpCode} initials={company.initials} colorKey={company.colorKey} size={34} radius={8} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{company.name}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace' }}>{company.corpCode}</span>
                  {filing.stockPrice && (
                    <>
                      <span style={{ color: '#E5E4E7' }}>·</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                        {filing.stockPrice.price.toLocaleString('ko-KR')}원
                      </span>
                      <span style={{ fontSize: 12, color: filing.stockPrice.changePercent >= 0 ? '#3B6D11' : '#A32D2D' }}>
                        {filing.stockPrice.changePercent >= 0 ? '▲' : '▼'}{Math.abs(filing.stockPrice.changePercent).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, fontFamily: 'ui-monospace, Consolas, monospace' }}>
                  {filing.reportType} · {formatKorDate(filing.filedDate)} · RCP {filing.rcpNo}
                </div>
              </div>
            </div>
            {filing.aiComplete && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#639922' }} />
                <span style={{ fontSize: 11, color: '#639922', fontWeight: 500 }}>AI analysis complete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 860, margin: '0 auto', width: '100%' }}>

        {/* AI summary */}
        {filing.aiSummary && (
          <div style={{ background: '#F0F2F5', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>
                AI 종합 요약
              </span>
              <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                {formatKorDate(filing.filedDate)} 기준
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.75, margin: 0 }}>
              {filing.aiSummary}
            </p>
          </div>
        )}

        {scoreData && (
          <ScoreBreakdown
            data={scoreData}
            label={isSamsung ? 'Score Breakdown' : 'Material Change Score'}
            note={isSamsung ? 'Score is fully deterministic' : (intelligence?.signalScore?.signalCount > 0 ? `${intelligence.signalScore.signalCount}개 신호 감지` : '')}
          />
        )}

        {signalsData && <RecentSignals data={signalsData} />}

        {intelligence && <MetricChanges data={metricsData} />}
        {intelligence && <ManagementSignals data={mgmtData} />}
        {intelligence && <EscalatedRisksSection risks={intelligence.escalatedRisks} />}
        {intelligence && <GovernanceSection changes={intelligence.governanceChanges} />}

        <FilingExplorer
          sections={filing.sections}
          explorerMeta={explorerMeta}
          financialTable={filing.financialTable}
        />

      </div>
    </div>
  );
}
