import { Link } from 'react-router';
import { LayoutDashboard } from 'lucide-react';
import { formatRelativeKorean } from '../../../shared/utils/dateUtils';
import { CompanyLogo } from './CompanyLogo';

const TIER_COLOR = {
  high:     '#A32D2D',
  moderate: '#854F0B',
  low:      '#4D7A1A',
  none:     '#9CA3AF',
};

function CompanyRow({ company, filing, isActive }) {
  const score = filing?.intelligence?.signalScore?.score ?? null;
  const tier  = filing?.intelligence?.signalScore?.tier ?? 'none';
  const isPending = company.latestFiling?.status === 'pending';
  const hasNoFiling = !company.latestFiling;

  return (
    <Link
      to={`/company/${company.corpCode}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 14px',
        background: isActive ? '#F0F4FF' : 'transparent',
        borderLeft: isActive ? '2px solid #2563EB' : '2px solid transparent',
        textDecoration: 'none',
        transition: 'background 0.12s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F7F8FA'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <CompanyLogo corpCode={company.corpCode} initials={company.initials} colorKey={company.colorKey} size={30} radius={7} />

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {company.name}
          </span>
          {isPending && (
            <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3, backgroundColor: '#FEF3C7', color: '#92400E', flexShrink: 0 }}>
              분석 중
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1, fontFamily: 'ui-monospace, Consolas, monospace' }}>
          {hasNoFiling ? '공시 없음' : (
            <>
              {company.latestFiling.type}
              {company.latestFiling.filedAt && ` · ${formatRelativeKorean(company.latestFiling.filedAt)}`}
            </>
          )}
        </div>
      </div>

      {/* Score badge */}
      {score !== null ? (
        <span style={{
          fontSize: 13, fontWeight: 700, color: TIER_COLOR[tier] ?? '#9CA3AF',
          fontFamily: 'ui-monospace, Consolas, monospace', flexShrink: 0,
        }}>
          {score}
        </span>
      ) : !hasNoFiling && !isPending ? null : null}
    </Link>
  );
}

export default function TrackedCompaniesSidebar({ companies, filingById, currentCompanyId }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: '#fff',
      borderRight: '0.5px solid #E5E4E7',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '0.5px solid #E5E4E7' }}>
        <Link
          to="/company"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            textDecoration: 'none', color: '#6B7280',
            fontSize: 12, fontWeight: 500,
            transition: 'color 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#1A1A1A'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
        >
          <LayoutDashboard size={14} />
          기업 분석 홈
        </Link>
      </div>

      {/* Section label */}
      <div style={{ padding: '10px 14px 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#C0C4CC' }}>
        관심 기업
      </div>

      {/* Company list */}
      <div style={{ flex: 1 }}>
        {companies.map(company => (
          <CompanyRow
            key={company.id}
            company={company}
            filing={filingById[company.id] ?? null}
            isActive={company.id === currentCompanyId}
          />
        ))}
      </div>
    </div>
  );
}
