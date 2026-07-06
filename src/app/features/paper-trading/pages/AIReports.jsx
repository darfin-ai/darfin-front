import { useEffect, useState } from 'react';
import { useStore } from '../store/store.jsx';
import {
  UP, DOWN, SUB, INK, BRAND,
  signNum, tone, dateLabel,
  Card, primaryBtn,
  PageShell, Empty, LoginGate,
} from '../components/ui.jsx';
import { fetchStoredPortfolioReports, generatePythonPortfolioAnalysis, getDarfinUser } from '../lib/aiEngine.js';

const AXES = [
  { n: '①', t: '행동 패턴', d: '매매 빈도 · 보유 기간 · 손절/익절 · 추격 매수' },
  { n: '②', t: '리스크', d: '업종 집중도 · 종목 집중도 · 손실 비중 · 등급' },
  { n: '③', t: '수익률', d: '총 수익률 · 기여 상위/하위 · 업종 기여도' },
  { n: '④', t: '투자 성향', d: '8개 유형 분류 · 건강도 점수 100점' },
];

function Tag({ kind }) {
  const map = { Info: ['#1B64DA', '#EFF5FF'], Advice: ['#C2740B', '#FFF6E6'] };
  const [c, bg] = map[kind] || map.Info;
  return <span style={{ fontSize: 11, fontWeight: 800, color: c, background: bg, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>{kind}</span>;
}

function ReportSection({ no, title, tags, children }) {
  return (
    <div style={{ borderTop: '1px solid #F2F4F6', paddingTop: 20, marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, background: '#F2F4F6', color: '#4E5968', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{no}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{title}</span>
        <div style={{ display: 'flex', gap: 5, marginLeft: 'auto' }}>{tags.map(t => <Tag key={t} kind={t} />)}</div>
      </div>
      {children}
    </div>
  );
}

function MetricChip({ label, value, warn }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: warn ? '#FFF5F6' : '#F9FAFB', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, color: SUB, marginBottom: 4, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: warn ? UP : INK, whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

function AdviceLine({ text }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#FFF8EC', borderRadius: 10, padding: '12px 14px', marginTop: 10 }}>
      <span style={{ color: '#C2740B', fontWeight: 800, flexShrink: 0 }}>Advice</span>
      <span style={{ fontSize: 14, color: '#5C4A20', lineHeight: 1.5 }}>{text}</span>
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
  const name = x.name || x.code || '-';
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

function downloadReport(r) {
  r = normalizeReport(r);
  const esc = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const b = r.behavior, rk = r.risk, rt = r.returns;
  const sectionRows = [
    ['① 투자 성향 요약', `<b>${esc(r.label)}</b><br>${esc(r.labelReason)}`],
    ...(r.geminiAnalysis ? [['Gemini 종합 해석', esc(r.geminiAnalysis).replace(/\n/g, '<br>')]] : []),
    ['② 포트폴리오 건강도', `${r.health.total} / 100 (${esc(r.health.grade)})<br>` + Object.entries(r.health.breakdown).map(([k, v]) => `${esc(k)} ${v}/25`).join(' · ') + `<br>${esc(r.health.comment)}`],
    ['③ 행동 패턴', esc(b.text) + `<br><i>Advice: ${esc(b.advice)}</i>`],
    ['④ 리스크 진단', esc(rk.text) + `<br><i>Advice: ${esc(rk.advice)}</i>`],
    ['⑤ 수익률 요인', esc(rt.text) + `<br>수익 상위: ${rt.top3.map(x => esc(x.name) + ' ' + signNum(x.v)).join(', ') || '없음'}<br>손실 하위: ${rt.bottom3.map(x => esc(x.name) + ' ' + signNum(x.v)).join(', ') || '없음'}`],
    ['⑥ 개선 Advice Top 3', r.adviceTop3.map((a, i) => `${i + 1}. <b>${esc(a.t)}</b> — ${esc(a.d)}`).join('<br>')],
    ['⑦ 전략 제안', esc(r.strategy)],
  ];
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>Darfin AI 리포트</title>
<style>body{font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#191F28;line-height:1.6}
h1{font-size:24px;margin-bottom:4px}.meta{color:#8B95A1;font-size:13px;margin-bottom:20px}
.badge{display:inline-block;background:#EFF5FF;color:#1B64DA;font-weight:800;padding:6px 14px;border-radius:8px;font-size:14px}
.sec{border-top:1px solid #EEF1F4;padding:16px 0}.sec h2{font-size:16px;margin:0 0 8px}
.note{background:#F9FAFB;border-radius:10px;padding:10px 14px;font-size:12px;color:#8B95A1;margin:16px 0}
.t{color:#4E5968;font-size:14px}</style></head><body>
<h1>✦ 포트폴리오 통합 분석 리포트</h1>
<div class="meta">Google Gemini Pro · ${dateLabel(r.ts || Date.now())} 생성 &nbsp; <span class="badge">${esc(r.label)}</span></div>
<div class="note">※ ${esc(r.disclaimer)}</div>
${sectionRows.map(([t, body]) => `<div class="sec"><h2>${esc(t)}</h2><div class="t">${body}</div></div>`).join('')}
<div class="note">Darfin 모의투자 · 학습용 리포트</div>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Darfin_AI리포트_${dateLabel(r.ts || Date.now()).replace('.', '')}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ReportCard({ report: r }) {
  r = normalizeReport(r);
  const user = getDarfinUser();
  const displayName = r.nickname || user?.nickname || user?.name || user?.email || '회원';
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
            <div style={{ fontSize: 13, color: SUB, whiteSpace: 'nowrap' }}>{displayName}님 · Google Gemini Pro · {dateLabel(r.ts || Date.now())} 생성</div>
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
          Gemini 서버 연결에 실패해 기존 계산 리포트로 생성됐어요. {r.geminiError}
        </div>
      )}
      {r.dbError && (
        <div style={{ fontSize: 12, color: '#C2740B', marginTop: 10, background: '#FFF8EC', borderRadius: 10, padding: '10px 14px', lineHeight: 1.5 }}>
          리포트는 생성됐지만 DB 저장에 실패했어요. {r.dbError}
        </div>
      )}

      <ReportSection no="1" title="투자 성향 요약" tags={['Info']}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: BRAND }}>{r.label}</span>
        </div>
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6 }}>{r.labelReason}</div>
      </ReportSection>

      {r.geminiAnalysis && (
        <ReportSection no="AI" title="Gemini 종합 해석" tags={['Info', 'Advice']}>
          <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{r.geminiAnalysis}</div>
        </ReportSection>
      )}

      <ReportSection no="2" title="포트폴리오 건강도" tags={['Info']}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: gradeColor, lineHeight: 1 }}>{health.total}<span style={{ fontSize: 20, color: SUB }}> / 100</span></div>
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: 13, fontWeight: 800, color: gradeColor, background: gradeColor + '18', padding: '5px 12px', borderRadius: 999 }}>{health.grade}</span>
          </div>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(health.breakdown).map(([k, v]) => <HealthBar key={k} label={k} score={v} max={25} />)}
          </div>
        </div>
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6, marginTop: 14 }}>{health.comment}</div>
      </ReportSection>

      <ReportSection no="3" title="행동 패턴 분석" tags={['Info', 'Advice']}>
        {!b.limited && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <MetricChip label="월 매매" value={(b.metrics.tradesPerMonth ?? 0).toFixed(1) + '회'} warn={(b.metrics.tradesPerMonth ?? 0) >= 6} />
            <MetricChip label="평균 보유" value={(b.metrics.avgHoldDays ?? 0).toFixed(0) + '일'} />
            <MetricChip label="손절 비율" value={(b.metrics.stopLossRatio ?? 0).toFixed(0) + '%'} warn={(b.metrics.stopLossRatio ?? 0) <= 10} />
            <MetricChip label="익절 비율" value={(b.metrics.takeProfitRatio ?? 0).toFixed(0) + '%'} />
            <MetricChip label="추격 매수" value={(b.metrics.chaseBuyCount ?? 0) + '건'} warn={(b.metrics.chaseBuyCount ?? 0) >= 2} />
          </div>
        )}
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6 }}>{b.text}</div>
        <AdviceLine text={b.advice} />
      </ReportSection>

      <ReportSection no="4" title="리스크 진단" tags={['Info', 'Advice']}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <MetricChip label="리스크 점수" value={(rk.riskScore ?? 0) + '점 · ' + (rk.riskGrade || '-')} warn={(rk.riskScore ?? 0) > 60} />
          <MetricChip label="업종 집중도" value={(rk.sectorConcentration ?? 0).toFixed(0) + '%'} warn={(rk.sectorConcentration ?? 0) > 40} />
          <MetricChip label="종목 집중도" value={(rk.topStockConcentration ?? 0).toFixed(0) + '%'} warn={(rk.topStockConcentration ?? 0) > 30} />
          <MetricChip label="손실 종목" value={(rk.lossStockRatio ?? 0).toFixed(0) + '%'} warn={(rk.lossStockRatio ?? 0) > 50} />
        </div>
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6 }}>{rk.text}</div>
        <AdviceLine text={rk.advice} />
      </ReportSection>

      <ReportSection no="5" title="수익률 요인 분석" tags={['Info']}>
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6, marginBottom: 16 }}>{rt.text}</div>
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

      <ReportSection no="6" title="개선 Advice Top 3" tags={['Advice']}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {r.adviceTop3.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, background: '#FFF8EC', borderRadius: 12, padding: '14px 16px' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C2740B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#5C4A20' }}>{a.t}</div>
                <div style={{ fontSize: 14, color: '#7A6534', lineHeight: 1.5, marginTop: 2 }}>{a.d}</div>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection no="7" title="전략 제안" tags={['Advice']}>
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.7 }}>{r.strategy}</div>
      </ReportSection>
    </Card>
  );
}

function ReportAccordion({ report: r }) {
  r = normalizeReport(r);
  const health = r.health;
  return (
    <details style={{ border: '1px solid #E5E8EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
      <summary style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', cursor: 'pointer', listStyle: 'none' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: BRAND, background: '#EFF5FF', padding: '6px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}>{r.label || '-'}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{dateLabel(r.ts || Date.now())}</span>
        <span style={{ fontSize: 13, color: SUB, marginLeft: 'auto', whiteSpace: 'nowrap' }}>건강도 {health.total ?? '-'}점</span>
      </summary>
      <div style={{ padding: '0 18px 18px' }}>
        <ReportCard report={r} />
      </div>
    </details>
  );
}

export function AIReports() {
  const { state, getStock, addAiReport, setAiReports, navigate } = useStore();
  const [generating, setGenerating] = useState(false);
  const [reportsLoaded, setReportsLoaded] = useState(false);

  useEffect(() => {
    if (!state.isLoggedIn || reportsLoaded) return;
    let cancelled = false;
    fetchStoredPortfolioReports()
      .then((reports) => {
        if (!cancelled && reports.length) setAiReports(reports);
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
        const aiResult = await generatePythonPortfolioAnalysis(state, getStock);
        const user = getDarfinUser();
        const report = {
          ...(aiResult.report || {}),
          nickname: aiResult.report?.nickname || user?.nickname || user?.name || user?.email || '회원',
        };
        addAiReport({
          ...report,
          geminiAnalysis: aiResult.analysis,
          remoteReportId: aiResult.reportId,
          dbError: aiResult.dbError,
        });
      } catch (error) {
        const geminiError = error?.message || 'Python 투자분석 서버 연결 실패';
        console.warn('Python 포트폴리오 분석 실패', error);
        addAiReport({
          label: '분석 실패',
          labelReason: 'Python 백엔드 투자분석 서버 연결에 실패했어요.',
          disclaimer: '이 리포트는 모의투자 학습을 목적으로 제공되며, 특정 종목의 매수·매도를 권유하지 않아요.',
          health: { breakdown: {}, total: 0, grade: '-', comment: '-' },
          behavior: { metrics: {}, text: '-', advice: '-', limited: true },
          risk: { text: '-', advice: '-' },
          returns: { top3: [], bottom3: [], sectorContrib: [], text: '-' },
          adviceTop3: [],
          strategy: '-',
          nickname: getDarfinUser()?.nickname || getDarfinUser()?.name || getDarfinUser()?.email || '회원',
          geminiError,
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageShell title="AI 분석 리포트" sub="Python이 행동 패턴 · 리스크 · 수익률 · 투자 성향을 계산하고 Gemini가 해석을 붙여요"
      right={<button onClick={generate} disabled={generating} style={{ ...primaryBtn, height: 46, opacity: generating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        <span>✦</span>{generating ? '분석 중…' : '리포트 생성'}</button>}>

      <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg,#F4F8FF,#fff)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: BRAND, whiteSpace: 'nowrap' }}>✦ Python 기반 4대 축 분석</span>
          <span style={{ fontSize: 12, color: SUB, marginLeft: 'auto', whiteSpace: 'nowrap' }}>버튼 클릭 시 1회 생성 · 종합 리포트 1개</span>
        </div>
        <div style={{ fontSize: 13, color: '#4E5968', marginBottom: 16, lineHeight: 1.5 }}>모든 수치는 Python 백엔드가 보유 종목·매매 이력·수익률 데이터로 계산한 뒤 Gemini가 해석과 개선 제안을 생성해요.</div>
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
          <span style={{ fontSize: 15, fontWeight: 700, color: BRAND }}>Python 백엔드가 4대 축을 계산하고 Gemini 해석을 붙이고 있어요…</span>
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
