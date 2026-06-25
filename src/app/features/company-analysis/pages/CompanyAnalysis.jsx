import { useParams, Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { getFilingByParam, FILING_BY_ID, MOCK_COMPANIES } from '../data/filings';
import CompanyAnalysisPage from '../components/CompanyAnalysisPage';

const AVATAR_COLORS = {
  blue:   { bg: '#E6F1FB', text: '#185FA5' },
  teal:   { bg: '#E1F5EE', text: '#0F6E56' },
  amber:  { bg: '#FAEEDA', text: '#854F0B' },
  purple: { bg: '#EEEDFE', text: '#534AB7' },
  coral:  { bg: '#FAECE7', text: '#993C1D' },
};

const TIER_COLOR = {
  high:     '#A32D2D',
  moderate: '#854F0B',
  low:      '#4D7A1A',
  none:     '#9CA3AF',
};

function CompanySwitcher({ currentCompanyId }) {
  return (
    <div style={{
      background: '#fff',
      borderBottom: '0.5px solid #E5E4E7',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      flexShrink: 0,
    }}>
      {/* Back link */}
      <Link
        to="/company"
        style={{
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 12, color: '#9CA3AF', textDecoration: 'none',
          whiteSpace: 'nowrap', flexShrink: 0,
          padding: '10px 0',
          transition: 'color 0.1s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#1A1A1A'}
        onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
      >
        <ChevronLeft size={13} />
        기업 분석
      </Link>

      {/* Divider */}
      <div style={{ width: '0.5px', height: 16, background: '#E5E4E7', flexShrink: 0 }} />

      {/* Company chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
        {MOCK_COMPANIES.map(company => {
          const filing  = FILING_BY_ID[company.id] ?? null;
          const score   = filing?.intelligence?.signalScore?.score ?? null;
          const tier    = filing?.intelligence?.signalScore?.tier ?? 'none';
          const isActive = company.id === currentCompanyId;
          const avatar  = AVATAR_COLORS[company.colorKey] ?? AVATAR_COLORS.blue;
          const isPending = company.latestFiling?.status === 'pending';
          const hasNoFiling = !company.latestFiling;

          return (
            <Link
              key={company.id}
              to={`/company/${company.corpCode}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '5px 10px 5px 7px',
                borderRadius: 8,
                border: isActive ? '1px solid #2563EB' : '1px solid #E5E4E7',
                background: isActive ? '#EFF6FF' : '#F7F8FA',
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'border-color 0.1s, background 0.1s',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.background = '#fff'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#E5E4E7'; e.currentTarget.style.background = '#F7F8FA'; }}}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                backgroundColor: avatar.bg, color: avatar.text,
                fontSize: 8, fontWeight: 700, letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {company.initials}
              </div>
              <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: isActive ? '#1D4ED8' : '#374151', whiteSpace: 'nowrap' }}>
                {company.name}
              </span>
              {score !== null && (
                <span style={{ fontSize: 12, fontWeight: 700, color: TIER_COLOR[tier], fontFamily: 'ui-monospace, Consolas, monospace' }}>
                  {score}
                </span>
              )}
              {isPending && (
                <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 4px', borderRadius: 3, background: '#FEF3C7', color: '#92400E' }}>
                  분석 중
                </span>
              )}
              {hasNoFiling && (
                <span style={{ fontSize: 9, color: '#C0C4CC' }}>—</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function CompanyAnalysis() {
  const { id } = useParams();
  const decoded = decodeURIComponent(id ?? '');
  const filing = getFilingByParam(decoded);
  const currentCompanyId = filing?.company?.id ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <CompanySwitcher currentCompanyId={currentCompanyId} />
      {!filing ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 300 }}>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>회사 정보를 찾을 수 없습니다</p>
        </div>
      ) : (
        <CompanyAnalysisPage filing={filing} onViewInFiling={() => {}} />
      )}
    </div>
  );
}
