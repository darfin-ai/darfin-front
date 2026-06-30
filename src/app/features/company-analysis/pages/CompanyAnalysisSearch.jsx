import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Search, Plus } from 'lucide-react';
import { MOCK_COMPANIES, FILING_BY_ID } from '../data/filings';
import { formatRelativeKorean } from '../../../shared/utils/dateUtils';
import { CompanyLogo } from '../components/CompanyLogo';

const TIER_COLOR = {
  high:     '#A32D2D',
  moderate: '#854F0B',
  low:      '#4D7A1A',
  none:     '#9CA3AF',
};

const SEVERITY_ORDER = { high: 0, moderate: 1, low: 2, none: 3, pending: 4, nofiling: 5 };

const GROUPS = [
  { key: 'high',     label: '즉시 확인 필요', dot: '#C0392B' },
  { key: 'moderate', label: '변동 감지됨',    dot: '#D97706' },
  { key: 'low',      label: '경미한 변동',    dot: '#639922' },
  { key: 'none',     label: '변동 없음',      dot: '#B0B7C3' },
  { key: 'pending',  label: '분석 진행 중',   dot: '#EF9F27' },
  { key: 'nofiling', label: '공시 없음',      dot: '#D1D5DB' },
];

function getGroup(company, filing) {
  if (!company.latestFiling) return 'nofiling';
  if (company.latestFiling.status === 'pending') return 'pending';
  return filing?.intelligence?.signalScore?.tier ?? 'none';
}

function CompanyCard({ company, filing }) {
  const score = filing?.intelligence?.signalScore?.score ?? null;
  const tier  = filing?.intelligence?.signalScore?.tier ?? 'none';
  const signalCount = filing?.intelligence?.signalScore?.signalCount ?? 0;
  const isPending = company.latestFiling?.status === 'pending';
  const topSignal = filing?.intelligence?.recentSignals?.[0];

  const description = isPending
    ? 'AI 분석 진행 중...'
    : (filing?.aiSummary ?? topSignal?.title ?? null);

  return (
    <Link
      to={`/company/${company.corpCode}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: '#fff', border: '0.5px solid #E5E4E7', borderRadius: 10,
        padding: '13px 16px', marginBottom: 8, textDecoration: 'none',
        transition: 'border-color 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E4E7'; }}
    >
      <CompanyLogo corpCode={company.corpCode} initials={company.initials} colorKey={company.colorKey} size={34} radius={8} />

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{company.name}</span>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace' }}>{company.corpCode}</span>
          {filing?.stockPrice && (
            <>
              <span style={{ color: '#E5E4E7' }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                {filing.stockPrice.price.toLocaleString('ko-KR')}원
              </span>
              <span style={{ fontSize: 11, color: filing.stockPrice.changePercent >= 0 ? '#3B6D11' : '#A32D2D' }}>
                {filing.stockPrice.changePercent >= 0 ? '▲' : '▼'}{Math.abs(filing.stockPrice.changePercent).toFixed(1)}%
              </span>
            </>
          )}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {description}
          </div>
        )}
      </div>

      {/* Score */}
      {score !== null && (
        <span style={{
          fontSize: 20, fontWeight: 700, color: TIER_COLOR[tier] ?? '#9CA3AF',
          fontFamily: 'ui-monospace, Consolas, monospace', flexShrink: 0,
        }}>
          {score}
        </span>
      )}
      {isPending && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 3,
          background: '#FEF3C7', color: '#92400E', flexShrink: 0,
        }}>
          분석 중
        </span>
      )}

      {/* Right meta */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 64 }}>
        {signalCount > 0 && (
          <div style={{ fontSize: 11, fontWeight: 600, color: TIER_COLOR[tier], marginBottom: 2 }}>
            신호 {signalCount}개
          </div>
        )}
        {company.latestFiling?.filedAt && (
          <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace' }}>
            {formatRelativeKorean(company.latestFiling.filedAt)}
          </div>
        )}
      </div>
    </Link>
  );
}

export function CompanyAnalysisSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('severity');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/company/${encodeURIComponent(query.trim())}`);
  };

  const sorted = [...MOCK_COMPANIES].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'ko');
    if (sort === 'latest') {
      return (b.latestFiling?.filedAt ?? '').localeCompare(a.latestFiling?.filedAt ?? '');
    }
    const ag = SEVERITY_ORDER[getGroup(a, FILING_BY_ID[a.id])] ?? 99;
    const bg = SEVERITY_ORDER[getGroup(b, FILING_BY_ID[b.id])] ?? 99;
    return ag - bg;
  });

  const grouped = {};
  for (const c of sorted) {
    const key = getGroup(c, FILING_BY_ID[c.id]);
    (grouped[key] ??= []).push(c);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Header bar */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E5E4E7', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, height: 52 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap' }}>기업 분석</span>
          <div style={{ width: '0.5px', height: 16, background: '#E5E4E7', flexShrink: 0 }} />
          <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative', maxWidth: 320 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="기업명 또는 종목코드 검색"
              style={{
                width: '100%', padding: '7px 10px 7px 30px',
                border: '0.5px solid #E5E4E7', borderRadius: 8,
                fontSize: 13, color: '#1A1A1A', background: '#F7F8FA',
                outline: 'none', transition: 'border-color 0.1s, background 0.1s',
              }}
              onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#E5E4E7'; e.target.style.background = '#F7F8FA'; }}
            />
          </form>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: '#F7F8FA', flex: 1 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 24px' }}>

          {/* Section toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>
              관심 기업
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {[
                { key: 'severity', label: '심각도순' },
                { key: 'latest',   label: '최신순' },
                { key: 'name',     label: '기업명순' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  style={{
                    fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
                    border: `0.5px solid ${sort === key ? '#2563EB' : '#E5E4E7'}`,
                    background: sort === key ? '#EFF6FF' : '#fff',
                    color: sort === key ? '#1D4ED8' : '#6B7280',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >
                  {label}
                </button>
              ))}
              <div style={{ width: '0.5px', height: 14, background: '#E5E4E7', margin: '0 2px' }} />
              <button style={{
                fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6,
                border: '0.5px solid #E5E4E7', background: '#fff',
                color: '#6B7280', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Plus size={11} />
                기업 추가
              </button>
            </div>
          </div>

          {/* Company list */}
          {sort === 'severity'
            ? GROUPS.filter(g => grouped[g.key]?.length > 0).map(group => (
                <div key={group.key} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: group.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>{group.label}</span>
                  </div>
                  {grouped[group.key].map(c => (
                    <CompanyCard key={c.id} company={c} filing={FILING_BY_ID[c.id] ?? null} />
                  ))}
                </div>
              ))
            : sorted.map(c => (
                <CompanyCard key={c.id} company={c} filing={FILING_BY_ID[c.id] ?? null} />
              ))
          }

        </div>
      </div>
    </div>
  );
}
