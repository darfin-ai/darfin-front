import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../store/store.jsx';
import {
  UP, DOWN, SUB, INK, BRAND,
  signNum, tone, dateLabel,
  Card, primaryBtn, displayStockName,
  PageShell, Empty, LoginGate,
} from '../components/ui.jsx';
import {
  downloadPortfolioReportPdf,
  fetchStoredPortfolioReports,
  generatePortfolioAnalysis,
  getDarfinUser,
  getDarfinUserId,
} from '../lib/aiEngine.js';
import { normalizeUserText, userDisplayName } from '../../../shared/lib/userText.js';

const AXES = [
  { n: '①', t: '행동 패턴', d: '매매 빈도 · 보유 기간 · 손절/익절 · 추격 매수' },
  { n: '②', t: '리스크', d: '업종 집중도 · 종목 집중도 · 손실 비중 · 등급' },
  { n: '③', t: '수익률', d: '총 수익률 · 기여 상위/하위 · 업종 기여도' },
  { n: '④', t: '투자 성향', d: '8개 유형 분류 · 건강도 점수 100점' },
];

function ReportSection({ no, title, children }) {
  return (
    <div style={{ borderTop: '1px solid #F2F4F6', paddingTop: 24, marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: '#F2F4F6', color: '#4E5968', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{no}</span>
        <span style={{ fontSize: 19, fontWeight: 900, color: INK, whiteSpace: 'nowrap', lineHeight: 1.25 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function MetricChip({ label, value, warn }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: warn ? '#FFF5F6' : '#F9FAFB', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, color: SUB, marginBottom: 5, whiteSpace: 'nowrap', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: warn ? UP : INK, whiteSpace: 'nowrap', lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}

function AdviceLine({ text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#FFF8EC', borderRadius: 12, padding: '13px 15px', marginTop: 12 }}>
      <span style={{ color: '#C2740B', fontWeight: 900, flexShrink: 0, fontSize: 13 }}>개선 제안</span>
      <span style={{ fontSize: 15, color: '#5C4A20', lineHeight: 1.65 }}>{text}</span>
    </div>
  );
}

function EmphasisText({ text }) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: INK, fontWeight: 900 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

const insightHoverable = {
  transition: 'background 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
};

function setInsightHover(e, active, bg = '#F8FBFF') {
  e.currentTarget.style.background = active ? bg : 'transparent';
  e.currentTarget.style.borderColor = active ? '#EAF1FF' : 'transparent';
  e.currentTarget.style.boxShadow = active ? '0 4px 14px rgba(27,100,218,0.06)' : 'none';
}

function DarfinInsight({ text }) {
  const lines = String(text || '').split('\n').map(line => line.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {lines.map((line, i) => {
        if (line.startsWith('###')) {
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: i === 0 ? 0 : 10 }}>
              <span style={{ width: 6, height: 22, borderRadius: 3, background: BRAND, flexShrink: 0 }} />
              <span style={{ fontSize: 18, fontWeight: 900, color: INK, lineHeight: 1.35 }}>{line.replace(/^#+\s*/, '')}</span>
            </div>
          );
        }
        if (/^[-*]\s+/.test(line)) {
          return (
            <div
              key={i}
              onMouseEnter={(e) => setInsightHover(e, true)}
              onMouseLeave={(e) => setInsightHover(e, false)}
              style={{ ...insightHoverable, display: 'flex', gap: 11, alignItems: 'flex-start', background: 'transparent', border: '1px solid transparent', borderRadius: 12, padding: '11px 13px' }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: BRAND, marginTop: 9, flexShrink: 0 }} />
              <div style={{ fontSize: 15, color: '#364153', lineHeight: 1.7 }}>
                <EmphasisText text={line.replace(/^[-*]\s+/, '')} />
              </div>
            </div>
          );
        }
        return (
          <div
            key={i}
            onMouseEnter={(e) => setInsightHover(e, true, '#FFFDF7')}
            onMouseLeave={(e) => setInsightHover(e, false)}
            style={{ ...insightHoverable, fontSize: i === 0 ? 16 : 15, fontWeight: i === 0 ? 700 : 500, color: '#364153', lineHeight: 1.75, background: 'transparent', border: '1px solid transparent', borderLeft: '3px solid transparent', padding: '10px 12px', borderRadius: 10 }}
          >
            <EmphasisText text={line} />
          </div>
        );
      })}
    </div>
  );
}

function HealthBar({ label, score, max }) {
  const pct = (score / max) * 100;
  const col = pct >= 70 ? '#1FA463' : pct >= 45 ? '#F5A623' : '#F04452';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#4E5968', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>{score}<span style={{ color: SUB, fontWeight: 600 }}> / {max}</span></span>
      </div>
      <div style={{ height: 8, background: '#F2F4F6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: col }} />
      </div>
    </div>
  );
}

function ContribRow({ x, positive }) {
  const col = positive ? UP : DOWN;
  const name = displayStockName(x, '-');
  const sector = x.sector || '미분류';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{name}</span>
        <span style={{ fontSize: 12, color: SUB, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sector}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: col, whiteSpace: 'nowrap' }}>{signNum(x.v)}원</span>
    </div>
  );
}

function normalizeReport(report) {
  const r = report || {};
  const health = r.health || {};
  const behavior = r.behavior || {};
  const risk = r.risk || {};
  const returns = r.returns || {};

  return {
    ...r,
    nickname: normalizeUserText(r.nickname),
    label: r.label || '-',
    labelReason: r.labelReason || '-',
    disclaimer: r.disclaimer || '이 리포트는 모의투자 학습을 목적으로 제공되며, 특정 종목의 매수·매도를 권유하지 않아요.',
    health: {
      breakdown: health.breakdown || {},
      total: health.total ?? 0,
      grade: health.grade || '-',
      comment: health.comment || '-',
    },
    behavior: {
      metrics: behavior.metrics || {},
      text: behavior.text || '-',
      advice: behavior.advice || '-',
      limited: behavior.limited ?? true,
    },
    risk: {
      ...risk,
      text: risk.text || '-',
      advice: risk.advice || '-',
    },
    returns: {
      ...returns,
      top3: Array.isArray(returns.top3) ? returns.top3 : [],
      bottom3: Array.isArray(returns.bottom3) ? returns.bottom3 : [],
      sectorContrib: Array.isArray(returns.sectorContrib) ? returns.sectorContrib : [],
      text: returns.text || '-',
    },
    adviceTop3: Array.isArray(r.adviceTop3) ? r.adviceTop3 : [],
    strategy: r.strategy || '-',
  };
}

async function downloadReport(r) {
  r = normalizeReport(r);
  try {
    await downloadPortfolioReportPdf(r.remoteReportId);
  } catch (error) {
    alert(error?.message || 'PDF 다운로드에 실패했습니다.');
  }
}

function ReportCard({ report: r }) {
  r = normalizeReport(r);
  const user = getDarfinUser();
  const displayName = normalizeUserText(r.nickname) || userDisplayName(user);
  const health = r.health;
  const b = r.behavior;
  const rk = r.risk;
  const rt = r.returns;
  const gradeColor = health.grade === '우수' ? '#1FA463' : health.grade === '보통' ? '#F5A623' : '#F04452';
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, background: BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✦</span>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>포트폴리오 통합 분석 리포트</div>
            <div style={{ fontSize: 13, color: SUB, whiteSpace: 'nowrap' }}>{displayName}님 · Darfin AI · {dateLabel(r.ts || Date.now())} 생성</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: BRAND, background: '#EFF5FF', padding: '9px 16px', borderRadius: 10, whiteSpace: 'nowrap' }}>{r.label}</span>
          <button onClick={() => downloadReport(r)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 10,
            border: '1px solid #E5E8EB', background: '#fff', color: '#4E5968', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" /></svg>
            리포트 다운로드
          </button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: SUB, marginTop: 14, background: '#F9FAFB', borderRadius: 10, padding: '10px 14px', lineHeight: 1.5 }}>※ {r.disclaimer}</div>
      {r.geminiError && (
        <div style={{ fontSize: 12, color: '#C2740B', marginTop: 10, background: '#FFF8EC', borderRadius: 10, padding: '10px 14px', lineHeight: 1.5 }}>
          분석 서버 연결에 실패해 리포트 생성이 제한됐어요. {r.geminiError}
        </div>
      )}
      {r.dbError && (
        <div style={{ fontSize: 12, color: '#C2740B', marginTop: 10, background: '#FFF8EC', borderRadius: 10, padding: '10px 14px', lineHeight: 1.5 }}>
          리포트는 생성됐지만 DB 저장에 실패했어요. {r.dbError}
        </div>
      )}

      <ReportSection no="1" title="투자 성향 요약">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: BRAND }}>{r.label}</span>
        </div>
        <div style={{ fontSize: 15, color: '#4E5968', lineHeight: 1.7 }}>{r.labelReason}</div>
      </ReportSection>

      {r.geminiAnalysis && (
        <ReportSection no="AI" title="Darfin AI 종합 해석">
          <DarfinInsight text={r.geminiAnalysis} />
        </ReportSection>
      )}

      <ReportSection no="2" title="포트폴리오 건강도">
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: gradeColor, lineHeight: 1 }}>{health.total}<span style={{ fontSize: 20, color: SUB }}> / 100</span></div>
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: 13, fontWeight: 800, color: gradeColor, background: gradeColor + '18', padding: '5px 12px', borderRadius: 999 }}>{health.grade}</span>
          </div>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(health.breakdown).map(([k, v]) => <HealthBar key={k} label={k} score={v} max={25} />)}
          </div>
        </div>
        <div style={{ fontSize: 15, color: '#4E5968', lineHeight: 1.7, marginTop: 16 }}>{health.comment}</div>
      </ReportSection>

      <ReportSection no="3" title="행동 패턴 분석">
        {!b.limited && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <MetricChip label="월 매매" value={(b.metrics.tradesPerMonth ?? 0).toFixed(1) + '회'} warn={(b.metrics.tradesPerMonth ?? 0) >= 6} />
            <MetricChip label="평균 보유" value={(b.metrics.avgHoldDays ?? 0).toFixed(0) + '일'} />
            <MetricChip label="손절 비율" value={(b.metrics.stopLossRatio ?? 0).toFixed(0) + '%'} warn={(b.metrics.stopLossRatio ?? 0) <= 10} />
            <MetricChip label="익절 비율" value={(b.metrics.takeProfitRatio ?? 0).toFixed(0) + '%'} />
            <MetricChip label="추격 매수" value={(b.metrics.chaseBuyCount ?? 0) + '건'} warn={(b.metrics.chaseBuyCount ?? 0) >= 2} />
          </div>
        )}
        <div style={{ fontSize: 15, color: '#4E5968', lineHeight: 1.75 }}>{b.text}</div>
        <AdviceLine text={b.advice} />
      </ReportSection>

      <ReportSection no="4" title="리스크 진단">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <MetricChip label="리스크 점수" value={(rk.riskScore ?? 0) + '점 · ' + (rk.riskGrade || '-')} warn={(rk.riskScore ?? 0) > 60} />
          <MetricChip label="업종 집중도" value={(rk.sectorConcentration ?? 0).toFixed(0) + '%'} warn={(rk.sectorConcentration ?? 0) > 40} />
          <MetricChip label="종목 집중도" value={(rk.topStockConcentration ?? 0).toFixed(0) + '%'} warn={(rk.topStockConcentration ?? 0) > 30} />
          <MetricChip label="손실 종목" value={(rk.lossStockRatio ?? 0).toFixed(0) + '%'} warn={(rk.lossStockRatio ?? 0) > 50} />
        </div>
        <div style={{ fontSize: 15, color: '#4E5968', lineHeight: 1.75 }}>{rk.text}</div>
        <AdviceLine text={rk.advice} />
      </ReportSection>

      <ReportSection no="5" title="수익률 요인 분석">
        <div style={{ fontSize: 15, color: '#4E5968', lineHeight: 1.75, marginBottom: 16 }}>{rt.text}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: UP, marginBottom: 4 }}>수익 기여 상위</div>
            {rt.top3.length ? rt.top3.map(x => <ContribRow key={x.code} x={x} positive />) : <div style={{ fontSize: 13, color: SUB, padding: '9px 0' }}>해당 없음</div>}
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: DOWN, marginBottom: 4 }}>손실 원인 하위</div>
            {rt.bottom3.length ? rt.bottom3.map(x => <ContribRow key={x.code} x={x} positive={false} />) : <div style={{ fontSize: 13, color: SUB, padding: '9px 0' }}>해당 없음</div>}
          </div>
        </div>
        {rt.sectorContrib.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {rt.sectorContrib.map(s => (
              <span key={s.sector} style={{ fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 999, color: tone(s.v), background: s.v >= 0 ? '#FEF0F1' : '#EFF5FF', whiteSpace: 'nowrap' }}>
                {s.sector} {signNum(s.v)}
              </span>
            ))}
          </div>
        )}
      </ReportSection>

      <ReportSection no="6" title="개선 Advice Top 3">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {r.adviceTop3.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, background: '#FFF8EC', borderRadius: 12, padding: '14px 16px' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C2740B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#5C4A20', lineHeight: 1.35 }}>{a.t}</div>
                <div style={{ fontSize: 15, color: '#7A6534', lineHeight: 1.65, marginTop: 4 }}>{a.d}</div>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection no="7" title="전략 제안">
        <div style={{ fontSize: 15, color: '#4E5968', lineHeight: 1.75 }}>{r.strategy}</div>
      </ReportSection>
    </Card>
  );
}

function ReportAccordion({ report: r }) {
  r = normalizeReport(r);
  const health = r.health;
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid #E5E8EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 18px',
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 800, color: BRAND, background: '#EFF5FF', padding: '6px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}>{r.label || '-'}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{dateLabel(r.ts || Date.now())}</span>
        <span style={{ fontSize: 13, color: SUB, marginLeft: 'auto', whiteSpace: 'nowrap' }}>건강도 {health.total ?? '-'}점</span>
        <ChevronDown
          size={18}
          strokeWidth={2.4}
          aria-hidden="true"
          style={{
            color: SUB,
            flexShrink: 0,
            transition: 'transform 160ms ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          <ReportCard report={r} />
        </div>
      )}
    </div>
  );
}

export function AIReports() {
  const { state, getStock, addAiReport, setAiReports, navigate } = useStore();
  const [generating, setGenerating] = useState(false);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const userKey = getDarfinUserId() || getDarfinUser()?.email || '';

  useEffect(() => {
    setReportsLoaded(false);
  }, [state.isLoggedIn, userKey]);

  useEffect(() => {
    if (!state.isLoggedIn || reportsLoaded) return;
    let cancelled = false;
    fetchStoredPortfolioReports()
      .then((reports) => {
        if (!cancelled) setAiReports(reports);
      })
      .catch((error) => console.warn('저장된 AI 리포트 조회 실패', error))
      .finally(() => {
        if (!cancelled) setReportsLoaded(true);
      });
    return () => { cancelled = true; };
  }, [reportsLoaded, setAiReports, state.isLoggedIn]);

  if (!state.isLoggedIn) return <PageShell title="AI 분석"><LoginGate /></PageShell>;

  const generate = async () => {
    if (state.holdings.length === 0 && state.trades.length === 0) return;
    setGenerating(true);
    try {
      try {
        const aiResult = await generatePortfolioAnalysis(state, getStock);
        const user = getDarfinUser();
        const report = {
          ...(aiResult.report || {}),
          nickname: normalizeUserText(aiResult.report?.nickname) || userDisplayName(user),
        };
        addAiReport({
          ...report,
          geminiAnalysis: aiResult.analysis,
          remoteReportId: aiResult.reportId,
          dbError: aiResult.dbError,
        });
      } catch (error) {
        const geminiError = error?.message || '투자분석 서버 연결 실패';
        console.warn('포트폴리오 분석 실패', error);
        addAiReport({
          label: '분석 실패',
          labelReason: '투자분석 서버 연결에 실패했어요.',
          disclaimer: '이 리포트는 모의투자 학습을 목적으로 제공되며, 특정 종목의 매수·매도를 권유하지 않아요.',
          health: { breakdown: {}, total: 0, grade: '-', comment: '-' },
          behavior: { metrics: {}, text: '-', advice: '-', limited: true },
          risk: { text: '-', advice: '-' },
          returns: { top3: [], bottom3: [], sectorContrib: [], text: '-' },
          adviceTop3: [],
          strategy: '-',
          nickname: userDisplayName(getDarfinUser()),
          geminiError,
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageShell title="AI 분석 리포트" sub="Darfin AI가 행동 패턴 · 리스크 · 수익률 · 투자 성향을 분석해 맞춤 해석을 붙여요"
      right={<button onClick={generate} disabled={generating} style={{ ...primaryBtn, height: 46, opacity: generating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        <span>✦</span>{generating ? '분석 중…' : '리포트 생성'}</button>}>

      <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg,#F4F8FF,#fff)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: BRAND, whiteSpace: 'nowrap' }}>✦ Darfin AI 기반 4대 축 분석</span>
          <span style={{ fontSize: 12, color: SUB, marginLeft: 'auto', whiteSpace: 'nowrap' }}>버튼 클릭 시 1회 생성 · 종합 리포트 1개</span>
        </div>
        <div style={{ fontSize: 13, color: '#4E5968', marginBottom: 16, lineHeight: 1.5 }}>보유 종목·매매 이력·수익률 데이터를 Darfin AI가 분석하고 맞춤 해석과 개선 제안을 생성해요.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {AXES.map(a => (
            <div key={a.n} style={{ background: '#fff', border: '1px solid #EAF0FB', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: BRAND, marginBottom: 6 }}>{a.n} {a.t}</div>
              <div style={{ fontSize: 12, color: SUB, lineHeight: 1.5 }}>{a.d}</div>
            </div>
          ))}
        </div>
      </Card>

      {generating && (
        <Card style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="spin" style={{ width: 22, height: 22, border: '3px solid #D6E4FF', borderTopColor: BRAND, borderRadius: '50%' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: BRAND }}>Darfin AI가 사용자의 보유 종목, 매매 이력, 수익률 흐름을 바탕으로 투자 성향을 분석 중입니다.</span>
        </Card>
      )}

      {state.aiReports.length === 0 && !generating ? (
        <Empty text={state.holdings.length === 0 && state.trades.length === 0 ? '거래 이력이 부족해 분석이 제한돼요. 먼저 종목을 매매해보세요.' : "'리포트 생성'을 눌러 첫 통합 분석 리포트를 받아보세요."}
          cta={state.holdings.length === 0 && state.trades.length === 0 ? '종목 둘러보기' : null} onCta={() => navigate('home')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {state.aiReports[0] && <ReportCard report={state.aiReports[0]} />}
          {state.aiReports.slice(1).map(r => <ReportAccordion key={r.id || r.remoteReportId} report={r} />)}
        </div>
      )}
    </PageShell>
  );
}
