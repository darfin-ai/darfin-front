import { useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Sparkles, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { formatKorDate } from '../../../shared/utils/dateUtils';

const AVATAR_COLORS = {
  blue:   { bg: '#E6F1FB', text: '#185FA5' },
  teal:   { bg: '#E1F5EE', text: '#0F6E56' },
  amber:  { bg: '#FAEEDA', text: '#854F0B' },
  purple: { bg: '#EEEDFE', text: '#534AB7' },
  coral:  { bg: '#FAECE7', text: '#993C1D' },
};

const DIRECTION_STYLE = {
  up:      { bg: '#EBF4E3', text: '#4D7A1A', Icon: TrendingUp },
  down:    { bg: '#FCEBEB', text: '#A32D2D', Icon: TrendingDown },
  new:     { bg: '#EEEDFE', text: '#534AB7', Icon: Sparkles },
  neutral: { bg: '#F3F4F6', text: '#6B7280', Icon: Minus },
};

const SEVERITY_STYLE = {
  sign_reversal: { bg: '#FCEBEB', text: '#A32D2D', label: '⚠ Sign reversal' },
  material:      { bg: '#E6F1FB', text: '#185FA5', label: '🚩 Material' },
  changed:       { bg: '#FAEEDA', text: '#854F0B', label: 'Changed' },
  minor:         { bg: '#F1EFE8', text: '#5F5E5A', label: 'Minor' },
  new_section:   { bg: '#EEEDFE', text: '#534AB7', label: '✦ New section' },
};

const HIGH_SIGNAL_SEVERITIES = new Set(['sign_reversal', 'material', 'new_section']);

const SECTION_PILLS = ['사업의 개요', '재무제표', 'MD&A', '이사회', '리스크 요인', '배당 정책', '주요 계약'];

const RISK_SEVERITY_STYLE = {
  high:   { bg: '#FCEBEB', text: '#A32D2D', label: '높음' },
  medium: { bg: '#FAEEDA', text: '#854F0B', label: '중간' },
  low:    { bg: '#F1EFE8', text: '#5F5E5A', label: '낮음' },
};

const RISK_CATEGORY_STYLE = {
  '시장':    { bg: '#E6F1FB', text: '#185FA5' },
  '운영':    { bg: '#FAEEDA', text: '#854F0B' },
  '지정학적': { bg: '#FCEBEB', text: '#A32D2D' },
  '규제':    { bg: '#F1EFE8', text: '#5F5E5A' },
  '기술':    { bg: '#EEEDFE', text: '#534AB7' },
};

const DIRECTOR_TYPE_STYLE = {
  '사내이사': { bg: '#E6F1FB', text: '#185FA5' },
  '사외이사': { bg: '#DCEFD5', text: '#4D7A1A' },
  '독립이사': { bg: '#F1EFE8', text: '#5F5E5A' },
};

const CONTRACT_TYPE_STYLE = {
  '공급계약':     { bg: '#E6F1FB', text: '#185FA5' },
  '기술제휴':     { bg: '#EEEDFE', text: '#534AB7' },
  '라이선스':     { bg: '#FAEEDA', text: '#854F0B' },
  '크로스라이선스': { bg: '#E1F5EE', text: '#0F6E56' },
};

function formatQuarter(q) {
  if (/^\d{4}$/.test(q)) {
    return `'${q.slice(0, 2)}Q${parseInt(q.slice(2), 10)}`;
  }
  return `'${q}`;
}

function Sparkline({ data }) {
  const { label, points } = data;
  const W = 260;
  const CHART_H = 62;
  const SVG_H = 80;
  const LABEL_Y = 77;

  const values = points.map(p => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const pad = range * 0.1;
  const yMax = maxVal + pad;
  const yMin = minVal - pad;
  const yRange = yMax - yMin;
  const hasNegative = values.some(v => v < 0);
  const n = points.length;

  const toX = i => n > 1 ? Math.round((i / (n - 1)) * W) : W / 2;
  const toY = v => Math.round(((yMax - v) / yRange) * CHART_H);
  const zeroY = toY(0);

  const polyPoints = points.map((p, i) => `${toX(i)},${toY(p.value)}`).join(' ');

  return (
    <div style={{ display: 'inline-block', float: 'right', marginLeft: 20, marginBottom: 8, width: W }}>
      <div style={{ textAlign: 'right', fontSize: 10, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace', marginBottom: 3 }}>
        {label}
      </div>
      <svg width={W} height={SVG_H} style={{ display: 'block' }}>
        {hasNegative && zeroY >= 0 && zeroY <= CHART_H && (
          <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="#D1D5DB" strokeWidth={1} strokeDasharray="3,3" />
        )}
        <polyline points={polyPoints} fill="none" stroke="#378ADD" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <text
            key={i}
            x={toX(i)}
            y={LABEL_Y}
            textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
            fontSize={10}
            fill="#9CA3AF"
            fontFamily="ui-monospace, Consolas, monospace"
          >
            {formatQuarter(p.quarter)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function AiSummaryBlock({ filing }) {
  return (
    <div style={{ background: '#F0F2F5', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>
          AI 종합 요약
        </span>
        <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace' }}>
          {formatKorDate(filing.filedDate)} 기준
        </span>
      </div>
      <p style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.75, margin: 0, maxWidth: 680 }}>
        {filing.aiSummary}
      </p>
    </div>
  );
}

function SummarySkeletonBlock() {
  return (
    <div style={{ background: '#F0F2F5', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
      <div className="skeleton-line" style={{ height: 10, width: '22%', borderRadius: 3, marginBottom: 14 }} />
      <div className="skeleton-line" style={{ height: 12, width: '100%', borderRadius: 3, marginBottom: 8 }} />
      <div className="skeleton-line" style={{ height: 12, width: '80%', borderRadius: 3 }} />
    </div>
  );
}

function SectionJumpBar({ onJumpToSection }) {
  return (
    <div
      className="hide-scrollbar"
      style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', gap: 6, padding: '9px 22px',
        overflowX: 'auto', scrollbarWidth: 'none',
        background: '#fff', borderBottom: '0.5px solid #E5E4E7', flexShrink: 0,
      }}
    >
      {SECTION_PILLS.map(section => (
        <button
          key={section}
          onClick={() => onJumpToSection(section)}
          style={{
            fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0,
            backgroundColor: '#F0F2F5', border: '0.5px solid #E5E4E7',
            borderRadius: 999, padding: '4px 12px', color: '#6B7280',
            cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1A1A1A'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F0F2F5'; e.currentTarget.style.color = '#6B7280'; }}
        >
          {section}
        </button>
      ))}
    </div>
  );
}

function FinancialTable({ data, isOpen, onToggle }) {
  const { quarters, rows } = data;
  const lastIdx = quarters.length - 1;

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 0', border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>
          재무제표 요약
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace' }}>분기보고서 기준</span>
          <span style={{ color: '#C0C4CC', display: 'flex', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.18s ease' }}>
            <ChevronDown size={14} />
          </span>
        </div>
      </button>

      {isOpen && (
        <div style={{ overflowX: 'auto', marginTop: 6 }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 360, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 140, textAlign: 'left', paddingBottom: 5, paddingRight: 16, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }} />
                {quarters.map((q, i) => (
                  <th key={q} style={{ textAlign: 'right', paddingBottom: 5, paddingLeft: 8, paddingRight: 8, fontSize: 10, fontWeight: i === lastIdx ? 700 : 400, color: i === lastIdx ? '#1A1A1A' : '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'nowrap', borderLeft: i === lastIdx ? '0.5px solid #E5E4E7' : 'none' }}>
                    {q}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} style={{ borderTop: '0.5px solid #F3F4F6' }}>
                  <td style={{ paddingTop: 5, paddingBottom: 5, paddingRight: 16, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{row.label}</td>
                  {row.values.map((val, i) => {
                    const delta = row.deltas[i];
                    return (
                      <td key={i} style={{ textAlign: 'right', paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8, verticalAlign: 'top', borderLeft: i === lastIdx ? '0.5px solid #E5E4E7' : 'none' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', fontFamily: 'ui-monospace, Consolas, monospace', lineHeight: 1.3 }}>
                          {val !== null ? val.toLocaleString() : '—'}
                        </div>
                        {delta !== null && (
                          <div style={{ fontSize: 10, lineHeight: 1.3, fontFamily: 'ui-monospace, Consolas, monospace', color: delta > 0 ? '#4D7A1A' : delta < 0 ? '#A32D2D' : '#9CA3AF' }}>
                            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SeverityDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1px 0' }}>
      <div style={{ flex: 1, height: '0.5px', background: '#E5E4E7' }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#C0C4CC', whiteSpace: 'nowrap' }}>
        기타 변동사항
      </span>
      <div style={{ flex: 1, height: '0.5px', background: '#E5E4E7' }} />
    </div>
  );
}

function DisclosureSourceDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 20px' }}>
      <div style={{ flex: 1, height: '0.5px', background: '#E5E4E7' }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#C0C4CC', whiteSpace: 'nowrap' }}>
        공시 원문 섹션
      </span>
      <div style={{ flex: 1, height: '0.5px', background: '#E5E4E7' }} />
    </div>
  );
}

function SectionCard({ label, children }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #E5E4E7', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 12 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function BusinessOverviewSection({ data }) {
  return (
    <SectionCard label="사업의 개요">
      <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: '0 0 14px', maxWidth: 720 }}>{data.description}</p>
      <div style={{ display: 'flex', background: '#F7F8FA', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>임직원 수</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: 'ui-monospace, Consolas, monospace' }}>{data.employeeCount.toLocaleString('ko-KR')}명</div>
        </div>
        <div style={{ width: '0.5px', background: '#E5E4E7', margin: '0 16px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>자회사 수</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: 'ui-monospace, Consolas, monospace' }}>{data.subsidiaryCount}개</div>
        </div>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingBottom: 6, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>사업부문</th>
            <th style={{ textAlign: 'right', paddingBottom: 6, paddingLeft: 8, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>매출액(조원)</th>
            <th style={{ textAlign: 'right', paddingBottom: 6, paddingLeft: 8, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>비중(%)</th>
            <th style={{ textAlign: 'right', paddingBottom: 6, paddingLeft: 8, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>YoY</th>
          </tr>
        </thead>
        <tbody>
          {data.segments.map(seg => (
            <tr key={seg.segment} style={{ borderTop: '0.5px solid #F3F4F6' }}>
              <td style={{ paddingTop: 6, paddingBottom: 6, fontSize: 14, color: '#1A1A1A' }}>{seg.segment}</td>
              <td style={{ paddingTop: 6, paddingBottom: 6, paddingLeft: 8, fontSize: 13, fontFamily: 'ui-monospace, Consolas, monospace', color: '#1A1A1A', textAlign: 'right' }}>{seg.revenue.toFixed(1)}</td>
              <td style={{ paddingTop: 6, paddingBottom: 6, paddingLeft: 8, fontSize: 13, fontFamily: 'ui-monospace, Consolas, monospace', color: '#6B7280', textAlign: 'right' }}>{seg.share}%</td>
              <td style={{ paddingTop: 6, paddingBottom: 6, paddingLeft: 8, fontSize: 13, fontFamily: 'ui-monospace, Consolas, monospace', textAlign: 'right', color: seg.yoy === null ? '#9CA3AF' : seg.yoy > 0 ? '#4D7A1A' : seg.yoy < 0 ? '#A32D2D' : '#9CA3AF' }}>
                {seg.yoy === null ? '—' : `${seg.yoy > 0 ? '+' : ''}${seg.yoy.toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

function MdaSectionBlock({ data }) {
  return (
    <SectionCard label="MD&A">
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {data.kpis.map(kpi => {
          const DirIcon = kpi.direction === 'up' ? TrendingUp : kpi.direction === 'down' ? TrendingDown : Minus;
          const iconColor = kpi.direction === 'up' ? '#4D7A1A' : kpi.direction === 'down' ? '#A32D2D' : '#9CA3AF';
          return (
            <div key={kpi.label} style={{ background: '#F7F8FA', borderRadius: 8, padding: '10px 14px', flex: '1 1 90px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>{kpi.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', fontFamily: 'ui-monospace, Consolas, monospace' }}>{kpi.value}</span>
                <DirIcon size={12} color={iconColor} />
              </div>
            </div>
          );
        })}
      </div>
      {data.paragraphs.map(para => (
        <div key={para.title} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{para.title}</div>
          <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, margin: 0 }}>{para.body}</p>
        </div>
      ))}
    </SectionCard>
  );
}

function BoardSectionBlock({ data }) {
  return (
    <SectionCard label="이사회">
      {data.members.map((member, i) => {
        const typeStyle = DIRECTOR_TYPE_STYLE[member.type] ?? { bg: '#F1EFE8', text: '#5F5E5A' };
        return (
          <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i > 0 ? '0.5px solid #F3F4F6' : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginRight: 6 }}>{member.name}</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{member.title}</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4, backgroundColor: typeStyle.bg, color: typeStyle.text, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {member.type}
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
              ~{formatKorDate(member.termEnd)}
            </span>
            {member.committee && (
              <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', flexShrink: 0 }}>{member.committee}</span>
            )}
          </div>
        );
      })}
    </SectionCard>
  );
}

function RiskSectionBlock({ data }) {
  return (
    <SectionCard label="리스크 요인">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.risks.map(risk => {
          const catStyle = RISK_CATEGORY_STYLE[risk.category] ?? { bg: '#F1EFE8', text: '#5F5E5A' };
          const sevStyle = RISK_SEVERITY_STYLE[risk.severity] ?? RISK_SEVERITY_STYLE.low;
          return (
            <div key={risk.id} style={{ border: '0.5px solid #E5E4E7', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4, backgroundColor: catStyle.bg, color: catStyle.text, whiteSpace: 'nowrap' }}>
                  {risk.category}
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>{risk.title}</span>
                <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4, backgroundColor: sevStyle.bg, color: sevStyle.text, whiteSpace: 'nowrap' }}>
                  {sevStyle.label}
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: 0 }}>{risk.description}</p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function DividendSectionBlock({ data }) {
  const callout = [
    { label: 'DPS',    value: `${data.currentDps.toLocaleString('ko-KR')}원` },
    { label: '배당수익률', value: `${data.currentYield.toFixed(2)}%` },
    { label: '배당성향', value: `${data.currentPayout.toFixed(1)}%` },
  ];

  return (
    <SectionCard label="배당 정책">
      <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: '0 0 14px', maxWidth: 720 }}>{data.policyStatement}</p>
      <div style={{ display: 'flex', background: '#F0F2F5', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
        {callout.map((item, i) => (
          <div key={item.label} style={{ flex: 1, display: 'flex', alignItems: 'stretch' }}>
            {i > 0 && <div style={{ width: '0.5px', background: '#E5E4E7', marginRight: 16, flexShrink: 0 }} />}
            <div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: 'ui-monospace, Consolas, monospace' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingBottom: 5, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>연도</th>
            <th style={{ textAlign: 'right', paddingBottom: 5, paddingLeft: 8, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>DPS(원)</th>
            <th style={{ textAlign: 'right', paddingBottom: 5, paddingLeft: 8, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>수익률(%)</th>
            <th style={{ textAlign: 'right', paddingBottom: 5, paddingLeft: 8, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>성향(%)</th>
          </tr>
        </thead>
        <tbody>
          {data.history.map(row => (
            <tr key={row.year} style={{ borderTop: '0.5px solid #F3F4F6' }}>
              <td style={{ paddingTop: 5, paddingBottom: 5, fontSize: 13, color: '#1A1A1A' }}>{row.year}</td>
              <td style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 8, fontSize: 13, fontFamily: 'ui-monospace, Consolas, monospace', color: '#1A1A1A', textAlign: 'right' }}>{row.dps !== null ? row.dps.toLocaleString('ko-KR') : '—'}</td>
              <td style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 8, fontSize: 13, fontFamily: 'ui-monospace, Consolas, monospace', color: '#6B7280', textAlign: 'right' }}>{row.yield !== null ? row.yield.toFixed(1) : '—'}</td>
              <td style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 8, fontSize: 13, fontFamily: 'ui-monospace, Consolas, monospace', color: '#6B7280', textAlign: 'right' }}>{row.payoutRatio !== null ? row.payoutRatio.toFixed(1) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

function ContractsSectionBlock({ data }) {
  return (
    <SectionCard label="주요 계약">
      {data.contracts.map((contract, i) => {
        const typeStyle = CONTRACT_TYPE_STYLE[contract.contractType] ?? { bg: '#F1EFE8', text: '#5F5E5A' };
        return (
          <div key={contract.id} style={{ paddingTop: 12, paddingBottom: 12, borderTop: i > 0 ? '0.5px solid #E5E4E7' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{contract.counterparty}</span>
              <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4, backgroundColor: typeStyle.bg, color: typeStyle.text, whiteSpace: 'nowrap', marginLeft: 8 }}>
                {contract.contractType}
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: '0 0 6px' }}>{contract.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#6B7280', fontFamily: 'ui-monospace, Consolas, monospace' }}>{contract.amount ?? '금액 미공개'}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'nowrap' }}>
                {formatKorDate(contract.termStart)} – {contract.termEnd ? formatKorDate(contract.termEnd) : '진행 중'}
              </span>
            </div>
          </div>
        );
      })}
    </SectionCard>
  );
}

function FindingCard({ finding, isOpen, onToggle, onViewInFiling }) {
  const dir = DIRECTION_STYLE[finding.direction] ?? DIRECTION_STYLE.neutral;
  const severity = finding.severity ? SEVERITY_STYLE[finding.severity] : null;
  const { Icon } = dir;

  return (
    <div style={{ border: '0.5px solid #E5E4E7', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 14px', background: isOpen ? '#FAFAFA' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#FAFAFA'; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = '#fff'; }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, backgroundColor: dir.bg, color: dir.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} />
        </div>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{finding.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {severity && (
            <span style={{ backgroundColor: severity.bg, color: severity.text, fontSize: 10, fontWeight: 500, borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap' }}>
              {severity.label}
            </span>
          )}
          {finding.pageRef !== null && (
            <span style={{ fontSize: 11, color: '#B0B7C3', fontFamily: 'ui-monospace, Consolas, monospace' }}>p.{finding.pageRef}</span>
          )}
          <span style={{ color: '#C0C4CC', display: 'flex' }}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </div>
      </button>

      {isOpen && (
        <div style={{ borderTop: '0.5px solid #E5E4E7', padding: '12px 14px 14px', paddingLeft: 54 }}>
          <div style={{ overflow: 'hidden' }}>
            {finding.chartData && <Sparkline data={finding.chartData} />}
            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, margin: 0 }}>{finding.summary}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ fontSize: 11, color: '#B0B7C3', fontFamily: 'ui-monospace, Consolas, monospace' }}>
              DART 공시 원문{finding.pageRef !== null ? ` · p. ${finding.pageRef}` : ''}
            </span>
            <button
              onClick={() => onViewInFiling(finding)}
              style={{ fontSize: 12, fontWeight: 500, color: '#185FA5', background: '#F0F7FE', border: '1px solid #C9DFF5', borderRadius: 6, padding: '4px 11px', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E6F1FB'}
              onMouseLeave={e => e.currentTarget.style.background = '#F0F7FE'}
            >
              공시에서 보기 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @param {{ filing: import('../../types/darfin').FilingInfo, onViewInFiling: function, onJumpToSection: function }} props
 */
export default function FilingFindingsPanel({ filing, onViewInFiling, onJumpToSection }) {
  const [openId, setOpenId] = useState(null);
  const [financialOpen, setFinancialOpen] = useState(false);
  const sectionRefs = useRef({});

  const { company } = filing;
  const avatar = AVATAR_COLORS[company.colorKey] ?? AVATAR_COLORS.blue;
  const isNew = company.latestFiling?.status === 'new';

  const handleToggle = (id) => setOpenId(prev => (prev === id ? null : id));

  const handleJumpToSection = (section) => {
    if (section === '재무제표') setFinancialOpen(true);
    requestAnimationFrame(() => {
      sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    onJumpToSection?.(section);
  };

  const highFindings = filing.findings.filter(f => HIGH_SIGNAL_SEVERITIES.has(f.severity));
  const lowFindings  = filing.findings.filter(f => !HIGH_SIGNAL_SEVERITIES.has(f.severity));
  const showDivider  = highFindings.length > 0 && lowFindings.length > 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F7F8FA', height: '100%', overflowY: 'auto' }}>

      <div style={{ background: '#fff', borderBottom: '1px solid #E5E4E7', padding: '16px 22px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, backgroundColor: avatar.bg, color: avatar.text, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.02em' }}>
            {company.initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 17, fontWeight: 500, color: '#1A1A1A' }}>{company.name}</span>
              {isNew && (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#185FA5', backgroundColor: '#E6F1FB', borderRadius: 4, padding: '1px 7px' }}>New filing</span>
              )}
              {filing.stockPrice != null && (
                <>
                  <span style={{ color: '#C0C4CC', fontSize: 13, lineHeight: 1 }}>·</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>{filing.stockPrice.price.toLocaleString('ko-KR')}원</span>
                  <span style={{ fontSize: 12, color: filing.stockPrice.changePercent >= 0 ? '#3B6D11' : '#A32D2D', marginLeft: -4 }}>
                    {filing.stockPrice.changePercent >= 0 ? '▲' : '▼'}{Math.abs(filing.stockPrice.changePercent).toFixed(1)}%
                  </span>
                </>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3, fontFamily: 'ui-monospace, Consolas, monospace' }}>
              {filing.reportType} · {filing.rcpNo}
            </div>
          </div>
        </div>

        {filing.aiComplete && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#639922', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#639922', fontWeight: 500 }}>AI analysis complete</span>
          </div>
        )}
      </div>

      <SectionJumpBar onJumpToSection={handleJumpToSection} />

      <div style={{ padding: '20px 24px', maxWidth: 860, margin: '0 auto', width: '100%' }}>

        {filing.aiSummary != null
          ? <AiSummaryBlock filing={filing} />
          : !filing.aiComplete
            ? <SummarySkeletonBlock />
            : null
        }

        <div ref={el => { sectionRefs.current['재무제표'] = el; }} style={{ scrollMarginTop: 44 }}>
          {filing.financialTable && (
            <FinancialTable
              data={filing.financialTable}
              isOpen={financialOpen}
              onToggle={() => setFinancialOpen(prev => !prev)}
            />
          )}
        </div>

        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>
            AI Findings ({filing.findings.length})
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {highFindings.map(finding => (
            <FindingCard
              key={finding.id}
              finding={finding}
              isOpen={openId === finding.id}
              onToggle={() => handleToggle(finding.id)}
              onViewInFiling={onViewInFiling}
            />
          ))}
          {showDivider && <SeverityDivider />}
          {lowFindings.map(finding => (
            <FindingCard
              key={finding.id}
              finding={finding}
              isOpen={openId === finding.id}
              onToggle={() => handleToggle(finding.id)}
              onViewInFiling={onViewInFiling}
            />
          ))}
        </div>

        {filing.sections && (
          <>
            <DisclosureSourceDivider />

            {filing.sections.businessOverview && (
              <div ref={el => { sectionRefs.current['사업의 개요'] = el; }} style={{ scrollMarginTop: 44 }}>
                <BusinessOverviewSection data={filing.sections.businessOverview} />
              </div>
            )}

            {filing.sections.mda && (
              <div ref={el => { sectionRefs.current['MD&A'] = el; }} style={{ scrollMarginTop: 44 }}>
                <MdaSectionBlock data={filing.sections.mda} />
              </div>
            )}

            {filing.sections.board && (
              <div ref={el => { sectionRefs.current['이사회'] = el; }} style={{ scrollMarginTop: 44 }}>
                <BoardSectionBlock data={filing.sections.board} />
              </div>
            )}

            {filing.sections.risks && (
              <div ref={el => { sectionRefs.current['리스크 요인'] = el; }} style={{ scrollMarginTop: 44 }}>
                <RiskSectionBlock data={filing.sections.risks} />
              </div>
            )}

            {filing.sections.dividend && (
              <div ref={el => { sectionRefs.current['배당 정책'] = el; }} style={{ scrollMarginTop: 44 }}>
                <DividendSectionBlock data={filing.sections.dividend} />
              </div>
            )}

            {filing.sections.contracts && (
              <div ref={el => { sectionRefs.current['주요 계약'] = el; }} style={{ scrollMarginTop: 44 }}>
                <ContractsSectionBlock data={filing.sections.contracts} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
