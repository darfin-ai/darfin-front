import { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import styles from './FilingExplorer.module.css';

const RISK_CATEGORY_STYLE = {
  '시장':    { bg: '#E6F1FB', text: '#185FA5' },
  '운영':    { bg: '#FAEEDA', text: '#854F0B' },
  '지정학적': { bg: '#FCEBEB', text: '#A32D2D' },
  '규제':    { bg: '#F1EFE8', text: '#5F5E5A' },
  '기술':    { bg: '#EEEDFE', text: '#534AB7' },
};

const RISK_SEVERITY_STYLE = {
  high:   { bg: '#FCEBEB', text: '#A32D2D', label: '높음' },
  medium: { bg: '#FAEEDA', text: '#854F0B', label: '중간' },
  low:    { bg: '#F1EFE8', text: '#5F5E5A', label: '낮음' },
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

function fmtDate(str) {
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function BusinessOverviewContent({ data }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.7, margin: '0 0 12px' }}>{data.description}</p>
      <div style={{ display: 'flex', background: '#F7F8FA', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#9CA3AF' }}>임직원</div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace, Consolas, monospace' }}>
            {data.employeeCount.toLocaleString('ko-KR')}명
          </div>
        </div>
        <div style={{ width: '0.5px', background: '#E5E4E7', margin: '0 12px' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#9CA3AF' }}>자회사</div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace, Consolas, monospace' }}>
            {data.subsidiaryCount}개
          </div>
        </div>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {['사업부문', '매출(조원)', '비중', 'YoY'].map((h, i) => (
              <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: 10, fontWeight: 400, color: '#9CA3AF', paddingBottom: 5, paddingLeft: i > 0 ? 8 : 0 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.segments.map(seg => (
            <tr key={seg.segment} style={{ borderTop: '0.5px solid #F3F4F6' }}>
              <td style={{ paddingTop: 5, paddingBottom: 5, fontSize: 13, color: '#1A1A1A' }}>{seg.segment}</td>
              <td style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 8, fontSize: 13, fontFamily: 'ui-monospace, Consolas, monospace', textAlign: 'right' }}>{seg.revenue.toFixed(1)}</td>
              <td style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 8, fontSize: 12, color: '#6B7280', fontFamily: 'ui-monospace, Consolas, monospace', textAlign: 'right' }}>{seg.share}%</td>
              <td style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 8, fontSize: 12, fontFamily: 'ui-monospace, Consolas, monospace', textAlign: 'right', color: seg.yoy === null ? '#9CA3AF' : seg.yoy > 0 ? '#4D7A1A' : '#A32D2D' }}>
                {seg.yoy === null ? '—' : `${seg.yoy > 0 ? '+' : ''}${seg.yoy.toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MdaContent({ data }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {data.kpis.map(kpi => {
          const DirIcon = kpi.direction === 'up' ? TrendingUp : kpi.direction === 'down' ? TrendingDown : Minus;
          const col = kpi.direction === 'up' ? '#4D7A1A' : kpi.direction === 'down' ? '#A32D2D' : '#9CA3AF';
          return (
            <div key={kpi.label} style={{ background: '#F7F8FA', borderRadius: 7, padding: '8px 12px', flex: '1 1 80px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>{kpi.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', fontFamily: 'ui-monospace, Consolas, monospace' }}>{kpi.value}</span>
                <DirIcon size={11} color={col} />
              </div>
            </div>
          );
        })}
      </div>
      {data.paragraphs.map(p => (
        <div key={p.title} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 3 }}>{p.title}</div>
          <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.7, margin: 0 }}>{p.body}</p>
        </div>
      ))}
    </div>
  );
}

function BoardContent({ data }) {
  return (
    <div>
      {data.members.map((m, i) => {
        const st = DIRECTOR_TYPE_STYLE[m.type] ?? { bg: '#F1EFE8', text: '#5F5E5A' };
        return (
          <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: i > 0 ? '0.5px solid #F3F4F6' : 'none' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', marginRight: 6 }}>{m.name}</span>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{m.title}</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 3, backgroundColor: st.bg, color: st.text, whiteSpace: 'nowrap' }}>{m.type}</span>
            <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'nowrap' }}>~{fmtDate(m.termEnd)}</span>
            {m.committee && <span style={{ fontSize: 10, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{m.committee}</span>}
          </div>
        );
      })}
    </div>
  );
}

function RisksContent({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.risks.map(r => {
        const cat = RISK_CATEGORY_STYLE[r.category] ?? { bg: '#F1EFE8', text: '#5F5E5A' };
        const sev = RISK_SEVERITY_STYLE[r.severity] ?? RISK_SEVERITY_STYLE.low;
        return (
          <div key={r.id} style={{ border: '0.5px solid #E5E4E7', borderRadius: 7, padding: '9px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 3, backgroundColor: cat.bg, color: cat.text, whiteSpace: 'nowrap' }}>{r.category}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{r.title}</span>
              <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 3, backgroundColor: sev.bg, color: sev.text, whiteSpace: 'nowrap' }}>{sev.label}</span>
            </div>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, margin: 0 }}>{r.description}</p>
          </div>
        );
      })}
    </div>
  );
}

function DividendContent({ data }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.7, margin: '0 0 12px' }}>{data.policyStatement}</p>
      <div style={{ display: 'flex', background: '#F0F2F5', borderRadius: 7, padding: '8px 12px', marginBottom: 12 }}>
        {[
          { label: 'DPS', value: `${data.currentDps.toLocaleString('ko-KR')}원` },
          { label: '수익률', value: `${data.currentYield.toFixed(2)}%` },
          { label: '성향', value: `${data.currentPayout.toFixed(1)}%` },
        ].map((item, i) => (
          <div key={item.label} style={{ flex: 1, display: 'flex', alignItems: 'stretch' }}>
            {i > 0 && <div style={{ width: '0.5px', background: '#E5E4E7', marginRight: 12, flexShrink: 0 }} />}
            <div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace, Consolas, monospace' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {['연도', 'DPS(원)', '수익률(%)', '성향(%)'].map((h, i) => (
              <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: 10, fontWeight: 400, color: '#9CA3AF', paddingBottom: 4, paddingLeft: i > 0 ? 8 : 0 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.history.map(row => (
            <tr key={row.year} style={{ borderTop: '0.5px solid #F3F4F6' }}>
              <td style={{ paddingTop: 4, paddingBottom: 4, fontSize: 12, color: '#1A1A1A' }}>{row.year}</td>
              <td style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 8, fontSize: 12, fontFamily: 'ui-monospace, Consolas, monospace', textAlign: 'right' }}>{row.dps !== null ? row.dps.toLocaleString('ko-KR') : '—'}</td>
              <td style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 8, fontSize: 12, fontFamily: 'ui-monospace, Consolas, monospace', color: '#6B7280', textAlign: 'right' }}>{row.yield !== null ? row.yield.toFixed(1) : '—'}</td>
              <td style={{ paddingTop: 4, paddingBottom: 4, paddingLeft: 8, fontSize: 12, fontFamily: 'ui-monospace, Consolas, monospace', color: '#6B7280', textAlign: 'right' }}>{row.payoutRatio !== null ? row.payoutRatio.toFixed(1) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContractsContent({ data }) {
  return (
    <div>
      {data.contracts.map((c, i) => {
        const st = CONTRACT_TYPE_STYLE[c.contractType] ?? { bg: '#F1EFE8', text: '#5F5E5A' };
        return (
          <div key={c.id} style={{ paddingTop: i > 0 ? 10 : 0, paddingBottom: 10, borderTop: i > 0 ? '0.5px solid #E5E4E7' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{c.counterparty}</span>
              <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 3, backgroundColor: st.bg, color: st.text, marginLeft: 8 }}>{c.contractType}</span>
            </div>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, margin: '0 0 4px' }}>{c.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#6B7280', fontFamily: 'ui-monospace, Consolas, monospace' }}>{c.amount ?? '금액 미공개'}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'nowrap' }}>
                {fmtDate(c.termStart)} – {c.termEnd ? fmtDate(c.termEnd) : '진행 중'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FinancialTableContent({ data }) {
  const { quarters, rows } = data;
  const lastIdx = quarters.length - 1;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: 320, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ width: 140, textAlign: 'left', paddingBottom: 4, paddingRight: 12, fontSize: 10, fontWeight: 400, color: '#9CA3AF' }} />
            {quarters.map((q, i) => (
              <th key={q} style={{ textAlign: 'right', paddingBottom: 4, paddingLeft: 8, paddingRight: 8, fontSize: 10, fontWeight: i === lastIdx ? 700 : 400, color: i === lastIdx ? '#1A1A1A' : '#9CA3AF', fontFamily: 'ui-monospace, Consolas, monospace', whiteSpace: 'nowrap', borderLeft: i === lastIdx ? '0.5px solid #E5E4E7' : 'none' }}>
                {q}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label} style={{ borderTop: '0.5px solid #F3F4F6' }}>
              <td style={{ paddingTop: 5, paddingBottom: 5, paddingRight: 12, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{row.label}</td>
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
  );
}

function renderSectionContent(sectionKey, sections, financialTable) {
  if (sectionKey === 'financial') {
    return financialTable ? <FinancialTableContent data={financialTable} /> : null;
  }
  const data = sections?.[sectionKey];
  if (!data) return <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>내용 없음</p>;

  switch (sectionKey) {
    case 'businessOverview': return <BusinessOverviewContent data={data} />;
    case 'mda':              return <MdaContent data={data} />;
    case 'board':            return <BoardContent data={data} />;
    case 'risks':            return <RisksContent data={data} />;
    case 'dividend':         return <DividendContent data={data} />;
    case 'contracts':        return <ContractsContent data={data} />;
    default:                 return null;
  }
}

function SectionRow({ id, label, sectionKey, dotColor, signalLink, dimmed, isFirst, isOpen, onToggle, sections, financialTable }) {
  const content = renderSectionContent(sectionKey, sections, financialTable);
  if (!content) return null;

  return (
    <div className={`${styles.sectionRow} ${isFirst ? styles.noTopBorder : ''}`}>
      <button
        className={styles.sectionHeader}
        onClick={() => onToggle(id)}
      >
        <div
          className={styles.sectionDot}
          style={{ background: dotColor ?? '#D1D5DB' }}
        />
        <span className={`${styles.sectionLabelText} ${dimmed ? styles.dimmed : ''}`}>
          {label}
        </span>
        {signalLink && (
          <span className={styles.signalLink}>
            <div className={styles.signalLinkDot} style={{ background: dotColor }} />
            {signalLink}
          </span>
        )}
        <span className={styles.chevron}>
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
      </button>
      {isOpen && (
        <div className={styles.sectionContent}>
          {content}
        </div>
      )}
    </div>
  );
}

/**
 * @param {{
 *   sections: import('../../../../shared/types/darfin').FilingSections | null,
 *   explorerMeta: object | null,
 *   financialTable: object | null,
 * }} props
 */
export default function FilingExplorer({ sections, explorerMeta, financialTable }) {
  const [openId, setOpenId] = useState(null);

  const hasSections = sections !== null;
  const hasFinancial = financialTable !== null;

  if (!hasSections && !hasFinancial) return null;

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  const boundaryLabel = explorerMeta?.boundaryLabel ?? '공시 원문 기반';
  const dartUrl = explorerMeta?.dartUrl ?? null;
  const rcpNo = explorerMeta?.rcpNo ?? null;

  const signalLinkedSections = explorerMeta?.signalLinkedSections ?? [];
  const remainingSections = explorerMeta?.remainingSections ?? [];

  const fallbackRemaining = !explorerMeta ? [
    hasSections && sections.businessOverview && { id: 'fb_overview',   sectionKey: 'businessOverview', label: '사업의 개요' },
    hasSections && sections.mda             && { id: 'fb_mda',         sectionKey: 'mda',              label: 'MD&A' },
    hasSections && sections.board           && { id: 'fb_board',       sectionKey: 'board',            label: '이사회' },
    hasSections && sections.risks           && { id: 'fb_risks',       sectionKey: 'risks',            label: '리스크 요인' },
    hasSections && sections.dividend        && { id: 'fb_dividend',    sectionKey: 'dividend',         label: '배당 정책' },
    hasSections && sections.contracts       && { id: 'fb_contracts',   sectionKey: 'contracts',        label: '주요 계약' },
    hasFinancial                            && { id: 'fb_financial',   sectionKey: 'financial',        label: '재무제표' },
  ].filter(Boolean) : [];

  const effectiveRemaining = explorerMeta ? remainingSections : fallbackRemaining;

  return (
    <div className={styles.wrap}>
      <div className={styles.boundary}>
        <div className={styles.boundaryLine} />
        <span className={styles.boundaryLabel}>{boundaryLabel}</span>
        <div className={styles.boundaryLine} />
      </div>

      <div className={styles.card}>
        {explorerMeta && hasFinancial && (
          <div className={`${styles.sectionRow} ${styles.noTopBorder}`}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggle('__financial__')}
            >
              <div className={styles.sectionDot} style={{ background: '#D1D5DB' }} />
              <span className={styles.sectionLabelText}>재무제표 (요약)</span>
              <span className={styles.chevron}>
                {openId === '__financial__' ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
            </button>
            {openId === '__financial__' && (
              <div className={styles.sectionContent}>
                <FinancialTableContent data={financialTable} />
              </div>
            )}
          </div>
        )}

        {signalLinkedSections.map((sec, i) => (
          <SectionRow
            key={sec.id}
            id={sec.id}
            label={sec.label}
            sectionKey={sec.sectionKey}
            dotColor={sec.dotColor}
            signalLink={sec.linkedSignalTitle}
            dimmed={false}
            isFirst={!explorerMeta && i === 0}
            isOpen={openId === sec.id}
            onToggle={toggle}
            sections={sections}
            financialTable={financialTable}
          />
        ))}

        {effectiveRemaining.length > 0 && (
          <>
            {(signalLinkedSections.length > 0 || (explorerMeta && hasFinancial)) && (
              <div className={styles.remainingDivider}>
                <span className={styles.remainingLabel}>Supporting sections</span>
              </div>
            )}
            {effectiveRemaining.map((sec, i) => (
              <SectionRow
                key={sec.id}
                id={sec.id}
                label={sec.label}
                sectionKey={sec.sectionKey}
                dotColor="#D1D5DB"
                signalLink={null}
                dimmed={!!explorerMeta}
                isFirst={!explorerMeta && signalLinkedSections.length === 0 && i === 0}
                isOpen={openId === sec.id}
                onToggle={toggle}
                sections={sections}
                financialTable={financialTable}
              />
            ))}
          </>
        )}

        {(dartUrl || rcpNo) && (
          <div className={styles.dartFooter}>
            {dartUrl ? (
              <a
                className={styles.dartLink}
                href={dartUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={11} />
                DART 원문 보기
              </a>
            ) : (
              <span className={styles.dartLink} style={{ cursor: 'default', color: '#B0B7C3' }}>
                DART 원문
              </span>
            )}
            {rcpNo && (
              <span className={styles.dartRcp}>RCP {rcpNo}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
