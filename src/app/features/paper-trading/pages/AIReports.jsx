import { useState } from 'react';
import { useStore } from '../store/store.jsx';
import {
  UP, DOWN, SUB, INK, BRAND,
  signNum, tone, dateLabel,
  Card, primaryBtn,
  PageShell, Empty, LoginGate,
} from '../components/ui.jsx';
import { analyzePortfolio, buildReport } from '../lib/aiEngine.js';

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
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{x.name}</span>
        <span style={{ fontSize: 12, color: SUB, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.sector}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: col, whiteSpace: 'nowrap' }}>{signNum(x.v)}원</span>
    </div>
  );
}

function downloadReport(r) {
  const esc = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const b = r.behavior, rk = r.risk, rt = r.returns;
  const sectionRows = [
    ['① 투자 성향 요약', `<b>${esc(r.label)}</b><br>${esc(r.labelReason)}`],
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
  const gradeColor = r.health.grade === '우수' ? '#1FA463' : r.health.grade === '보통' ? '#F5A623' : '#F04452';
  const b = r.behavior, rk = r.risk, rt = r.returns;
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, background: BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✦</span>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>포트폴리오 통합 분석 리포트</div>
            <div style={{ fontSize: 13, color: SUB, whiteSpace: 'nowrap' }}>Google Gemini Pro · {dateLabel(r.ts || Date.now())} 생성</div>
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

      <ReportSection no="1" title="투자 성향 요약" tags={['Info']}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: BRAND }}>{r.label}</span>
        </div>
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6 }}>{r.labelReason}</div>
      </ReportSection>

      <ReportSection no="2" title="포트폴리오 건강도" tags={['Info']}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: gradeColor, lineHeight: 1 }}>{r.health.total}<span style={{ fontSize: 20, color: SUB }}> / 100</span></div>
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: 13, fontWeight: 800, color: gradeColor, background: gradeColor + '18', padding: '5px 12px', borderRadius: 999 }}>{r.health.grade}</span>
          </div>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(r.health.breakdown).map(([k, v]) => <HealthBar key={k} label={k} score={v} max={25} />)}
          </div>
        </div>
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6, marginTop: 14 }}>{r.health.comment}</div>
      </ReportSection>

      <ReportSection no="3" title="행동 패턴 분석" tags={['Info', 'Advice']}>
        {!b.limited && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <MetricChip label="월 매매" value={b.metrics.tradesPerMonth.toFixed(1) + '회'} warn={b.metrics.tradesPerMonth >= 6} />
            <MetricChip label="평균 보유" value={b.metrics.avgHoldDays.toFixed(0) + '일'} />
            <MetricChip label="손절 비율" value={b.metrics.stopLossRatio.toFixed(0) + '%'} warn={b.metrics.stopLossRatio <= 10} />
            <MetricChip label="익절 비율" value={b.metrics.takeProfitRatio.toFixed(0) + '%'} />
            <MetricChip label="추격 매수" value={b.metrics.chaseBuyCount + '건'} warn={b.metrics.chaseBuyCount >= 2} />
          </div>
        )}
        <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6 }}>{b.text}</div>
        <AdviceLine text={b.advice} />
      </ReportSection>

      <ReportSection no="4" title="리스크 진단" tags={['Info', 'Advice']}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <MetricChip label="리스크 점수" value={rk.riskScore + '점 · ' + rk.riskGrade} warn={rk.riskScore > 60} />
          <MetricChip label="업종 집중도" value={rk.sectorConcentration.toFixed(0) + '%'} warn={rk.sectorConcentration > 40} />
          <MetricChip label="종목 집중도" value={rk.topStockConcentration.toFixed(0) + '%'} warn={rk.topStockConcentration > 30} />
          <MetricChip label="손실 종목" value={rk.lossStockRatio.toFixed(0) + '%'} warn={rk.lossStockRatio > 50} />
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

export function AIReports() {
  const { state, getStock, addAiReport, navigate } = useStore();
  const [generating, setGenerating] = useState(false);
  if (!state.isLoggedIn) return <PageShell title="AI 분석"><LoginGate /></PageShell>;

  const generate = () => {
    if (state.holdings.length === 0 && state.trades.length === 0) return;
    setGenerating(true);
    setTimeout(() => {
      const metrics = analyzePortfolio(state, getStock);
      const report = buildReport(metrics);
      addAiReport(report);
      setGenerating(false);
    }, 1700);
  };

  return (
    <PageShell title="AI 분석 리포트" sub="Gemini가 행동 패턴 · 리스크 · 수익률 · 투자 성향 4대 축을 통합 분석해요"
      right={<button onClick={generate} disabled={generating} style={{ ...primaryBtn, height: 46, opacity: generating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        <span>✦</span>{generating ? '분석 중…' : '리포트 생성'}</button>}>

      <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg,#F4F8FF,#fff)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: BRAND, whiteSpace: 'nowrap' }}>✦ Gemini 기반 4대 축 분석</span>
          <span style={{ fontSize: 12, color: SUB, marginLeft: 'auto', whiteSpace: 'nowrap' }}>버튼 클릭 시 1회 생성 · 종합 리포트 1개</span>
        </div>
        <div style={{ fontSize: 13, color: '#4E5968', marginBottom: 16, lineHeight: 1.5 }}>모든 수치는 보유 종목·매매 이력·수익률 데이터로 계산한 뒤 Gemini가 해석과 개선 제안을 생성해요.</div>
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
          <span style={{ fontSize: 15, fontWeight: 700, color: BRAND }}>Gemini가 4대 축을 계산하고 리포트를 작성하고 있어요…</span>
        </Card>
      )}

      {state.aiReports.length === 0 && !generating ? (
        <Empty text={state.holdings.length === 0 && state.trades.length === 0 ? '거래 이력이 부족해 분석이 제한돼요. 먼저 종목을 매매해보세요.' : "'리포트 생성'을 눌러 첫 통합 분석 리포트를 받아보세요."}
          cta={state.holdings.length === 0 && state.trades.length === 0 ? '종목 둘러보기' : null} onCta={() => navigate('home')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {state.aiReports.map(r => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </PageShell>
  );
}
