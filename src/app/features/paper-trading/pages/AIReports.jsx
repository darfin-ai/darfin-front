import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../store/store.jsx';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  PRICE_UP,
  PRICE_DOWN,
  priceToneClass,
  signNum,
  dateLabel,
  Card,
  displayStockName,
  PageShell,
  Empty,
  LoginGate,
} from '../components/ui.jsx';
import {
  AI_CALLOUT,
  AI_CALLOUT_BODY,
  ALERT_WARNING,
  BADGE_INFO,
  BG_PRICE_UP,
  BG_PRICE_DOWN,
  META,
} from '../../../shared/lib/uiRecipes.js';
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

function gradeTone(grade) {
  if (grade === '우수') {
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    };
  }
  if (grade === '보통') {
    return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    };
  }
  return {
    text: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
  };
}

function healthBarColor(pct) {
  if (pct >= 70) return 'bg-emerald-500 dark:bg-emerald-400';
  if (pct >= 45) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-red-500 dark:bg-red-400';
}

function ReportSection({ no, title, children }) {
  return (
    <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-[26px] h-[26px] rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-black">
          {no}
        </span>
        <span className="text-lg font-black text-slate-900 dark:text-slate-100 whitespace-nowrap leading-tight">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function MetricChip({ label, value, warn }) {
  return (
    <div
      className={`flex-1 min-w-0 rounded-xl px-3.5 py-3 ${
        warn
          ? 'bg-red-50 dark:bg-red-950/30'
          : 'bg-slate-50 dark:bg-slate-800/50'
      }`}
    >
      <div className={`text-xs ${META} mb-1.5 whitespace-nowrap font-bold`}>{label}</div>
      <div
        className={`text-lg font-black whitespace-nowrap leading-tight tabular-nums ${
          warn ? PRICE_UP : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function AdviceLine({ text }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3.5 mt-3">
      <span className="text-amber-600 dark:text-amber-400 font-black shrink-0 text-sm">
        개선 제안
      </span>
      <span className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
        {text}
      </span>
    </div>
  );
}

function EmphasisText({ text }) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-black text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function DarfinInsight({ text }) {
  const lines = String(text || '').split('\n').map(line => line.trim()).filter(Boolean);
  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, i) => {
        if (line.startsWith('###')) {
          return (
            <div
              key={i}
              className={`flex items-center gap-2 ${i === 0 ? '' : 'mt-2.5'}`}
            >
              <span className="w-1.5 h-[22px] rounded-sm bg-blue-600 dark:bg-blue-400 shrink-0" />
              <span className="text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
                {line.replace(/^#+\s*/, '')}
              </span>
            </div>
          );
        }
        if (/^[-*]\s+/.test(line)) {
          return (
            <div
              key={i}
              className={`${AI_CALLOUT} items-start transition-all hover:shadow-sm`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
              <div className={`${AI_CALLOUT_BODY} text-[15px]`}>
                <EmphasisText text={line.replace(/^[-*]\s+/, '')} />
              </div>
            </div>
          );
        }
        return (
          <div
            key={i}
            className={`${AI_CALLOUT} transition-all hover:shadow-sm ${
              i === 0 ? 'font-bold text-base' : 'font-medium text-[15px]'
            }`}
          >
            <div className={AI_CALLOUT_BODY}>
              <EmphasisText text={line} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HealthBar({ label, score, max }) {
  const pct = (score / max) * 100;
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">
          {label}
        </span>
        <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
          {score}
          <span className={`${META} font-semibold`}> / {max}</span>
        </span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
        <div
          className={`h-full ${healthBarColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ContribRow({ x, positive }) {
  const toneClass = positive ? PRICE_UP : PRICE_DOWN;
  const name = displayStockName(x, '-');
  const sector = x.sector || '미분류';
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
          {name}
        </span>
        <span className={`text-xs ${META} whitespace-nowrap overflow-hidden text-ellipsis`}>
          {sector}
        </span>
      </div>
      <span className={`text-sm font-extrabold whitespace-nowrap tabular-nums ${toneClass}`}>
        {signNum(x.v)}원
      </span>
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
  const grade = gradeTone(health.grade);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-[13px] bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-xl">
            ✦
          </span>
          <div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              포트폴리오 통합 분석 리포트
            </div>
            <div className={`text-sm ${META} whitespace-nowrap`}>
              {displayName}님 · Darfin AI · {dateLabel(r.ts || Date.now())} 생성
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`text-[15px] font-extrabold whitespace-nowrap px-4 py-2 rounded-[10px] ${BADGE_INFO}`}>
            {r.label}
          </span>
          <button
            type="button"
            onClick={() => downloadReport(r)}
            className={`${BTN_SECONDARY} h-[38px] px-3.5 rounded-[10px] whitespace-nowrap`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
            </svg>
            리포트 다운로드
          </button>
        </div>
      </div>

      <div className={`text-xs ${META} mt-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-[10px] px-3.5 py-2.5 leading-normal`}>
        ※ {r.disclaimer}
      </div>

      {r.geminiError && (
        <div className={`${ALERT_WARNING} mt-2.5 text-xs leading-normal`}>
          분석 서버 연결에 실패해 리포트 생성이 제한됐어요. {r.geminiError}
        </div>
      )}
      {r.dbError && (
        <div className={`${ALERT_WARNING} mt-2.5 text-xs leading-normal`}>
          리포트는 생성됐지만 DB 저장에 실패했어요. {r.dbError}
        </div>
      )}

      <ReportSection no="1" title="투자 성향 요약">
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-[22px] font-extrabold text-blue-600 dark:text-blue-400">
            {r.label}
          </span>
        </div>
        <div className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {r.labelReason}
        </div>
      </ReportSection>

      {r.geminiAnalysis && (
        <ReportSection no="AI" title="Darfin AI 종합 해석">
          <DarfinInsight text={r.geminiAnalysis} />
        </ReportSection>
      )}

      <ReportSection no="2" title="포트폴리오 건강도">
        <div className="flex gap-6 items-center flex-wrap">
          <div className="text-center min-w-[120px]">
            <div className={`text-[44px] font-extrabold leading-none tabular-nums ${grade.text}`}>
              {health.total}
              <span className={`text-xl ${META}`}> / 100</span>
            </div>
            <span
              className={`inline-block mt-2 text-sm font-extrabold px-3 py-1.5 rounded-full ${grade.text} ${grade.bg}`}
            >
              {health.grade}
            </span>
          </div>
          <div className="flex-1 min-w-[220px] flex flex-col gap-3">
            {Object.entries(health.breakdown).map(([k, v]) => (
              <HealthBar key={k} label={k} score={v} max={25} />
            ))}
          </div>
        </div>
        <div className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
          {health.comment}
        </div>
      </ReportSection>

      <ReportSection no="3" title="행동 패턴 분석">
        {!b.limited && (
          <div className="flex gap-2 mb-3.5 flex-wrap">
            <MetricChip
              label="월 매매"
              value={(b.metrics.tradesPerMonth ?? 0).toFixed(1) + '회'}
              warn={(b.metrics.tradesPerMonth ?? 0) >= 6}
            />
            <MetricChip
              label="평균 보유"
              value={(b.metrics.avgHoldDays ?? 0).toFixed(0) + '일'}
            />
            <MetricChip
              label="손절 비율"
              value={(b.metrics.stopLossRatio ?? 0).toFixed(0) + '%'}
              warn={(b.metrics.stopLossRatio ?? 0) <= 10}
            />
            <MetricChip
              label="익절 비율"
              value={(b.metrics.takeProfitRatio ?? 0).toFixed(0) + '%'}
            />
            <MetricChip
              label="추격 매수"
              value={(b.metrics.chaseBuyCount ?? 0) + '건'}
              warn={(b.metrics.chaseBuyCount ?? 0) >= 2}
            />
          </div>
        )}
        <div className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {b.text}
        </div>
        <AdviceLine text={b.advice} />
      </ReportSection>

      <ReportSection no="4" title="리스크 진단">
        <div className="flex gap-2 mb-3.5 flex-wrap">
          <MetricChip
            label="리스크 점수"
            value={(rk.riskScore ?? 0) + '점 · ' + (rk.riskGrade || '-')}
            warn={(rk.riskScore ?? 0) > 60}
          />
          <MetricChip
            label="업종 집중도"
            value={(rk.sectorConcentration ?? 0).toFixed(0) + '%'}
            warn={(rk.sectorConcentration ?? 0) > 40}
          />
          <MetricChip
            label="종목 집중도"
            value={(rk.topStockConcentration ?? 0).toFixed(0) + '%'}
            warn={(rk.topStockConcentration ?? 0) > 30}
          />
          <MetricChip
            label="손실 종목"
            value={(rk.lossStockRatio ?? 0).toFixed(0) + '%'}
            warn={(rk.lossStockRatio ?? 0) > 50}
          />
        </div>
        <div className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {rk.text}
        </div>
        <AdviceLine text={rk.advice} />
      </ReportSection>

      <ReportSection no="5" title="수익률 요인 분석">
        <div className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {rt.text}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3.5">
            <div className={`text-sm font-extrabold ${PRICE_UP} mb-1`}>수익 기여 상위</div>
            {rt.top3.length ? (
              rt.top3.map(x => <ContribRow key={x.code} x={x} positive />)
            ) : (
              <div className={`text-sm ${META} py-2`}>해당 없음</div>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3.5">
            <div className={`text-sm font-extrabold ${PRICE_DOWN} mb-1`}>손실 원인 하위</div>
            {rt.bottom3.length ? (
              rt.bottom3.map(x => <ContribRow key={x.code} x={x} positive={false} />)
            ) : (
              <div className={`text-sm ${META} py-2`}>해당 없음</div>
            )}
          </div>
        </div>
        {rt.sectorContrib.length > 0 && (
          <div className="mt-3.5 flex gap-2 flex-wrap">
            {rt.sectorContrib.map(s => (
              <span
                key={s.sector}
                className={`text-sm font-bold px-3 py-1.5 rounded-full whitespace-nowrap tabular-nums ${priceToneClass(s.v)} ${
                  s.v >= 0 ? BG_PRICE_UP : BG_PRICE_DOWN
                }`}
              >
                {s.sector} {signNum(s.v)}
              </span>
            ))}
          </div>
        )}
      </ReportSection>

      <ReportSection no="6" title="개선 Advice Top 3">
        <div className="flex flex-col gap-3">
          {r.adviceTop3.map((a, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3.5"
            >
              <span className="w-6 h-6 rounded-full bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center text-sm font-extrabold shrink-0">
                {i + 1}
              </span>
              <div>
                <div className="text-base font-black text-amber-700 dark:text-amber-300 leading-snug">
                  {a.t}
                </div>
                <div className="text-[15px] text-amber-600/80 dark:text-amber-400/80 leading-relaxed mt-1">
                  {a.d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection no="7" title="전략 제안">
        <div className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {r.strategy}
        </div>
      </ReportSection>
    </Card>
  );
}

function ReportAccordion({ report: r }) {
  r = normalizeReport(r);
  const health = r.health;
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 border-0 bg-transparent cursor-pointer text-left"
      >
        <span className={`text-sm font-extrabold whitespace-nowrap px-2.5 py-1.5 rounded-lg ${BADGE_INFO}`}>
          {r.label || '-'}
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
          {dateLabel(r.ts || Date.now())}
        </span>
        <span className={`text-sm ${META} ml-auto whitespace-nowrap tabular-nums`}>
          건강도 {health.total ?? '-'}점
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2.4}
          aria-hidden="true"
          className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
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
    <PageShell
      title="AI 분석 리포트"
      sub="Darfin AI가 행동 패턴 · 리스크 · 수익률 · 투자 성향을 분석해 맞춤 해석을 붙여요"
      right={
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className={`${BTN_PRIMARY} h-[46px] whitespace-nowrap`}
        >
          <span>✦</span>
          {generating ? '분석 중…' : '리포트 생성'}
        </button>
      }
    >
      <Card className="mb-5 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[15px] font-extrabold text-blue-600 dark:text-blue-400 whitespace-nowrap">
            ✦ Darfin AI 기반 4대 축 분석
          </span>
          <span className={`text-xs ${META} ml-auto whitespace-nowrap`}>
            버튼 클릭 시 1회 생성 · 종합 리포트 1개
          </span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-normal">
          보유 종목·매매 이력·수익률 데이터를 Darfin AI가 분석하고 맞춤 해석과 개선 제안을 생성해요.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AXES.map(a => (
            <div
              key={a.n}
              className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50 rounded-[14px] p-4"
            >
              <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mb-1.5">
                {a.n} {a.t}
              </div>
              <div className={`text-xs ${META} leading-normal`}>{a.d}</div>
            </div>
          ))}
        </div>
      </Card>

      {generating && (
        <Card className="mb-5 flex items-center gap-3.5">
          <div
            className="h-[22px] w-[22px] animate-spin rounded-full border-[3px] border-blue-100 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400"
            aria-hidden="true"
          />
          <span className="text-[15px] font-bold text-blue-600 dark:text-blue-400">
            Darfin AI가 사용자의 보유 종목, 매매 이력, 수익률 흐름을 바탕으로 투자 성향을 분석 중입니다.
          </span>
        </Card>
      )}

      {state.aiReports.length === 0 && !generating ? (
        <Empty
          text={
            state.holdings.length === 0 && state.trades.length === 0
              ? '거래 이력이 부족해 분석이 제한돼요. 먼저 종목을 매매해보세요.'
              : "'리포트 생성'을 눌러 첫 통합 분석 리포트를 받아보세요."
          }
          cta={state.holdings.length === 0 && state.trades.length === 0 ? '종목 둘러보기' : null}
          onCta={() => navigate('home')}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {state.aiReports[0] && <ReportCard report={state.aiReports[0]} />}
          {state.aiReports.slice(1).map(r => (
            <ReportAccordion key={r.id || r.remoteReportId} report={r} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
