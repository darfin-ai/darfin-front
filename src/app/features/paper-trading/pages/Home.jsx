import { useState, useMemo, useEffect } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/store.jsx';
import { getQuestions } from '../../community/api/communityApi.js';
import {
  won, wonShort, signPct, signNum, timeAgo,
  Avatar, Sparkline, CandleChart, Card, Pill, Tab, Heart, Skeleton, SkeletonText, displayStockName,
  priceToneClass, chartColor, CONTAINER, ROW_HOVER,
  BG_PRICE_UP, BG_PRICE_DOWN, BADGE_NEUTRAL, META,
} from '../components/ui.jsx';

const RANK_COLS = 'grid-cols-[28px_28px_40px_minmax(108px,1fr)_100px_76px_100px_72px]';

function pctBadgeClass(pct) {
  if (pct > 0) return `${priceToneClass(pct)} ${BG_PRICE_UP}`;
  if (pct < 0) return `${priceToneClass(pct)} ${BG_PRICE_DOWN}`;
  return `${priceToneClass(pct)} bg-slate-100 dark:bg-slate-800`;
}

// ===== Home dashboard (Toss layout, domestic only) =====
function MarketCard({ idx, big }) {
  const col = chartColor(idx.pct ?? (idx.up ? 1 : -1));
  const toneCls = priceToneClass(idx.pct ?? (idx.up ? 1 : -1));
  return (
    <div className="flex items-center gap-3.5 flex-1 min-w-0">
      <div className="shrink-0">
        <Sparkline pts={idx.spark} color={col} w={big ? 120 : 70} h={big ? 56 : 40} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{idx.name}</span>
          {idx.tag && <span className={`text-[11px] font-medium ${BADGE_NEUTRAL} px-1.5 py-0.5 whitespace-nowrap`}>{idx.tag}</span>}
        </div>
        <div className={`${big ? 'text-[26px]' : 'text-lg'} font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-tight whitespace-nowrap tabular-nums`}>
          {idx.value.toLocaleString('ko-KR', { minimumFractionDigits: 2 })}
        </div>
        <div className={`text-[13px] font-medium ${toneCls} mt-0.5 tabular-nums`}>
          {signNum(idx.amt)} ({signPct(idx.pct)})
        </div>
      </div>
    </div>
  );
}

// 1. 코스피/코스닥 지수 (TR_ID: FHPUP02100000) 반영 컴포넌트
function MiniIndexCard({ idx }) {
  if (!idx) {
    return (
      <Card className="!p-3.5 !px-[18px] flex-1 min-w-0">
        <div className="mb-2.5"><Skeleton width={72} height={14} /></div>
        <div className="mb-2"><Skeleton width="68%" height={26} /></div>
        <Skeleton width={112} height={13} />
      </Card>
    );
  }
  const toneCls = priceToneClass(idx.pct);
  const tagBg = idx.pct > 0 ? BG_PRICE_UP : idx.pct < 0 ? BG_PRICE_DOWN : 'bg-slate-100 dark:bg-slate-800';
  return (
    <Card className="!p-3.5 !px-[18px] flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{idx.name}</span>
        {idx.tag && (
          <span className={`text-[11px] font-medium ${toneCls} ${tagBg} px-[7px] py-0.5 rounded-md whitespace-nowrap`}>
            {idx.tag}
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap tabular-nums">
          {(idx.value || 0).toLocaleString('ko-KR', { minimumFractionDigits: 2 })}
        </span>
        <span className={`text-[13px] font-medium ${toneCls} whitespace-nowrap tabular-nums`}>
          {signNum(idx.amt)} ({signPct(idx.pct)})
        </span>
      </div>
    </Card>
  );
}

export function InvestHero() {
  const { state, getStock, navigate, goToLogin } = useStore();
  if (!state.isLoggedIn) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-9 mb-7 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white">
        <HeroGlow />
        <div className="relative max-w-[560px]">
          <div className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-white/18 px-3 py-1.5 rounded-full mb-4">
            ✦ AI 모의투자
          </div>
          <div className="text-[32px] font-semibold leading-tight tracking-tight">
            실전처럼 연습하는 모의투자,<br />Darfin에서 시작하세요
          </div>
          <div className="text-[15px] text-white/85 mt-3 leading-relaxed">
            가상 자금 1,000만 원으로 국내 주식을 사고팔며<br />AI가 내 투자 성향을 분석해줘요.
          </div>
          <button
            type="button"
            onClick={goToLogin}
            className="mt-5 h-[52px] px-7 rounded-[14px] border-none bg-white text-blue-600 text-base font-semibold cursor-pointer"
          >
            1,000만 원으로 시작하기
          </button>
        </div>
      </div>
    );
  }

  const rows = state.holdings.map(h => {
    const s = getStock(h.code);
    const currentPrice = s ? s.price : h.currentPrice ?? h.avgPrice;
    return { eval: currentPrice * h.qty, cost: h.avgPrice * h.qty };
  });
  const totalEval = rows.reduce((a, r) => a + r.eval, 0);
  const totalCost = rows.reduce((a, r) => a + r.cost, 0);
  const cash = state.funds.cashBalance;
  const assets = totalEval + cash;
  const pnl = totalEval - totalCost;
  const pnlPct = totalCost ? (pnl / totalCost) * 100 : 0;
  const pnlUp = pnl >= 0;
  return (
    <div className="relative overflow-hidden rounded-3xl py-7 px-8 mb-7 bg-gradient-to-br from-blue-900 via-blue-600 to-blue-500 text-white">
      <HeroGlow />
      <div className="relative flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-white/82 mb-2.5 whitespace-nowrap">
            <span className="w-7 h-7 rounded-lg bg-white/18 inline-flex items-center justify-center">나</span>
            내 모의투자 자산
          </div>
          <div className="text-[40px] font-semibold tracking-tight leading-none whitespace-nowrap tabular-nums">{won(assets)}</div>
          <div className="flex items-center gap-2.5 mt-3.5">
            <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold bg-white/16 px-3.5 py-[7px] rounded-full whitespace-nowrap tabular-nums">
              {pnlUp ? '▲' : '▼'} {signNum(pnl)}원 ({signPct(pnlPct)})
            </span>
            <span className="text-[13px] text-white/70 whitespace-nowrap">평가손익</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-[250px] shrink-0">
          <div className="flex justify-between text-sm whitespace-nowrap">
            <span className="text-white/72">주문 가능 현금</span>
            <span className="font-semibold tabular-nums">{won(cash)}</span>
          </div>
          <div className="flex justify-between text-sm whitespace-nowrap">
            <span className="text-white/72">보유 종목</span>
            <span className="font-semibold tabular-nums">{state.holdings.length}종목</span>
          </div>
          <div className="flex gap-2 mt-1.5">
            <button type="button" onClick={() => navigate('portfolio')} className={heroBtnClass(true)}>내 주식</button>
            <button type="button" onClick={() => navigate('ai')} className={heroBtnClass(false)}>✦ AI 리포트</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroGlow() {
  return (
    <>
      <div className="absolute -top-20 -right-10 w-[280px] h-[280px] rounded-full bg-white/10" />
      <div className="absolute -bottom-[120px] right-40 w-60 h-60 rounded-full bg-white/[0.07]" />
    </>
  );
}

const heroBtnClass = (solid) =>
  `flex-1 h-11 rounded-xl border-none cursor-pointer text-sm font-semibold whitespace-nowrap ${
    solid ? 'bg-white text-blue-600' : 'bg-white/16 text-white'
  }`;

function StockRowSkeleton() {
  return (
    <div className={`grid ${RANK_COLS} items-center gap-2 py-2.5 px-2 rounded-xl`}>
      <div className="justify-self-center"><Skeleton width={20} height={20} radius={10} /></div>
      <div className="justify-self-center"><Skeleton width={16} height={14} /></div>
      <div className="justify-self-center"><Skeleton width={34} height={34} radius={17} /></div>
      <Skeleton width="78%" height={16} />
      <div className="justify-self-end"><Skeleton width={82} height={16} /></div>
      <div className="justify-self-end"><Skeleton width={58} height={24} radius={8} /></div>
      <div className="justify-self-end"><Skeleton width={76} height={14} /></div>
      <div className="justify-self-end"><Skeleton width={48} height={20} radius={6} /></div>
    </div>
  );
}

function StockRowsSkeleton({ count = 10 }) {
  return Array.from({ length: count }).map((_, i) => <StockRowSkeleton key={i} />);
}

function StockRow({ rank, stock, onClick, watched, onWatch, onHover, rankTab }) {
  const displayValue = (rankTab === 'volume' ? stock.volume : stock.value) || 0;

  let valText = `${displayValue.toLocaleString()}억원`;
  if (rankTab === 'volume') valText = `${displayValue.toLocaleString()}주`;
  else if (rankTab === 'topGainers' || rankTab === 'topLosers') valText = `${displayValue.toLocaleString()}원`;

  return (
    <div
      onClick={onClick}
      className={`grid ${RANK_COLS} items-center gap-2 py-2.5 px-2 rounded-xl ${ROW_HOVER}`}
      onMouseEnter={() => onHover && onHover()}
    >
      <div className="flex justify-center" onClick={e => e.stopPropagation()}>
        <Heart filled={watched} onClick={onWatch} size={18} />
      </div>

      <span className="text-sm font-medium text-slate-400 dark:text-slate-500 text-center tabular-nums">{rank}</span>

      <div className="flex justify-center">
        <Avatar stock={stock} size={34} />
      </div>

      <span
        title={displayStockName(stock)}
        className="text-[15px] font-medium text-slate-900 dark:text-slate-100 min-w-[108px] overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {displayStockName(stock)}
      </span>

      <div className="text-right text-[15px] font-medium text-slate-900 dark:text-slate-100 tabular-nums">{won(stock.price)}</div>

      <div className="text-right">
        <span className={`inline-block px-2 py-1 rounded-lg text-[13px] font-medium tabular-nums ${pctBadgeClass(stock.pct)}`}>
          {signPct(stock.pct)}
        </span>
      </div>

      <div className="text-right text-[13px] font-medium text-slate-600 dark:text-slate-400 tabular-nums">{valText}</div>

      <div className="flex justify-end">
        {stock.sector ? (
          <span className={`text-[11px] font-medium ${BADGE_NEUTRAL} px-2 py-[3px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full`}>
            {stock.sector}
          </span>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-600">-</span>
        )}
      </div>
    </div>
  );
}

function HomeMain() {
  const { state, market, marketError, stocks, industries, navigate, toggleWatch, rankTab, setRankTab, kisLoading } = useStore();
  const [tab, setTab] = useState('chart');

  const [hoveredCode, setHoveredCode] = useState('');

  const displayStocks = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];
    return [...stocks];
  }, [stocks]);

  const activeHovered = useMemo(() => {
    if (!displayStocks.length) return null;
    const found = displayStocks.find(s => s.code === hoveredCode);
    return found || displayStocks[0];
  }, [hoveredCode, displayStocks]);

  useEffect(() => {
    setHoveredCode('');
  }, [rankTab]);

  return (
    <div>
      <InvestHero />

      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
          <span className="text-[15px] font-medium text-slate-900 dark:text-slate-100">{market?.status?.label || '장 운영중'}</span>
          <span className={`text-sm ${META}`}>{market?.status?.hours || '09:00 ~ 15:30'}</span>
          <span className={`text-[13px] ml-1 ${marketError ? priceToneClass(-1) : META}`}>
            · {marketError ? 'KIS 시장 지표 연결 실패' : '실시간 자동 갱신 중'}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <MiniIndexCard idx={market?.kospi} />
        <MiniIndexCard idx={market?.kosdaq} />
        <MiniIndexCard idx={market?.usd} />
      </div>

      <div className="border-b border-slate-100 dark:border-slate-800 mb-[18px]">
        <Tab active={tab === 'chart'} onClick={() => setTab('chart')}>실시간 차트</Tab>
        <Tab active={tab === 'industry'} onClick={() => setTab('industry')}>지금 뜨는 산업</Tab>
      </div>

      {tab === 'chart' && (
        <div className="grid grid-cols-[1fr_392px] gap-6 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Pill active={rankTab === 'tradeValue'} onClick={() => setRankTab('tradeValue')}>거래대금</Pill>
              <Pill active={rankTab === 'volume'} onClick={() => setRankTab('volume')}>거래량</Pill>
              <Pill active={rankTab === 'topGainers'} onClick={() => setRankTab('topGainers')}>급상승</Pill>
              <Pill active={rankTab === 'topLosers'} onClick={() => setRankTab('topLosers')}>급하락</Pill>
              <div className="ml-auto flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                <CheckCircle2 size={16} className="shrink-0" />
                투자위험 주식 숨기기
              </div>
            </div>

            <div className={`grid ${RANK_COLS} gap-2 px-2 pb-2.5 text-xs ${META} font-medium`}>
              <span />
              <span className="text-center">순위</span>
              <span />
              <span>종목</span>
              <span className="text-right">현재가</span>
              <span className="text-right">등락률</span>
              <span className="text-right">
                {rankTab === 'tradeValue' ? '거래대금' : rankTab === 'volume' ? '거래량' : '당일변동'}
              </span>
              <span className="text-right">업종</span>
            </div>

            {displayStocks.length > 0 ? (
              displayStocks.map((s, i) => (
                <StockRow key={s.code} rank={i + 1} stock={s} rankTab={rankTab}
                  watched={state.watchlist.includes(s.code)} onWatch={() => toggleWatch(s.code)}
                  onHover={() => setHoveredCode(s.code)}
                  onClick={() => navigate('detail', { code: s.code })} />
              ))
            ) : kisLoading.ranks ? (
              <StockRowsSkeleton />
            ) : (
              <div className={`py-10 text-center text-sm ${META}`}>순위 데이터를 불러올 수 없어요.</div>
            )}
          </div>

          <div className="sticky top-[84px] flex flex-col gap-4">
            <InvestorTrendCard market={market} loading={kisLoading.sentiment} />
            {activeHovered && <StockPreviewCard stock={activeHovered} />}
          </div>
        </div>
      )}

      {tab === 'industry' && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1 flex-wrap">
            <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">최근 거래대금 및 상승률 상위 업종</span>
            <span className={`text-xs ${META}`}>· 등락률은 당일 업종 평균 기준</span>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-[3px] rounded-md ml-auto whitespace-nowrap">
              실시간 업데이트
            </span>
          </div>
          <Card className="!p-2">
            {kisLoading.industries ? (
              <IndustrySkeleton />
            ) : industries && industries.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {industries.map((ind, i) => (
                  <div key={i} className="flex items-center justify-between py-[18px] px-5">
                    <div className="flex items-center gap-3.5">
                      <span className="text-[15px] font-medium text-slate-400 dark:text-slate-500 w-[18px] tabular-nums">{i + 1}</span>
                      <span className="text-[17px] font-medium text-slate-900 dark:text-slate-100">{ind.name}</span>
                      {ind.code && <span className={`text-xs ${META}`}>({ind.code})</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      {ind.value && (
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium tabular-nums">
                          {ind.value.toLocaleString()}억원
                        </span>
                      )}
                      <span className={`text-base font-semibold ${priceToneClass(ind.pct)} min-w-16 text-right tabular-nums`}>
                        {signPct(ind.pct)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`py-10 text-center text-sm ${META}`}>업종 지표 데이터를 불러오는 중입니다...</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function IndustrySkeleton({ count = 5 }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-[18px] px-5">
          <div className="flex items-center gap-3.5">
            <Skeleton width={18} height={16} />
            <Skeleton width={130 + i * 10} height={18} />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton width={72} height={14} />
            <Skeleton width={54} height={18} />
          </div>
        </div>
      ))}
    </div>
  );
}

function toWeekly(daily) {
  const weeks = {};
  for (const d of daily) {
    const s = String(d.date);
    const dt = new Date(+s.slice(0,4), +s.slice(4,6)-1, +s.slice(6,8));
    const dow = dt.getDay();
    dt.setDate(dt.getDate() - (dow === 0 ? 6 : dow - 1));
    const key = `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}`;
    if (!weeks[key]) {
      weeks[key] = { date: key, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume };
    } else {
      weeks[key].high   = Math.max(weeks[key].high, d.high);
      weeks[key].low    = Math.min(weeks[key].low,  d.low);
      weeks[key].close  = d.close;
      weeks[key].volume += d.volume;
    }
  }
  return Object.values(weeks).sort((a, b) => a.date.localeCompare(b.date));
}

const weeklyCache = {};

function StockPreviewCard({ stock: rawStock }) {
  const { navigate, getStock } = useStore();
  const routerNavigate = useRouterNavigate();
  const [candles, setCandles] = useState([]);
  const [dates,   setDates]   = useState([]);
  const [status,  setStatus]  = useState('idle');
  const [communityPosts, setCommunityPosts] = useState([]);
  const [communityStatus, setCommunityStatus] = useState('idle');

  const stock     = rawStock ? (getStock(rawStock.code) || rawStock) : null;
  const stockCode = stock?.code ?? null;
  const stockName = stock ? displayStockName(stock, '') : '';

  useEffect(() => {
    if (!stockCode) return;

    if (weeklyCache[stockCode]) {
      const { c, d } = weeklyCache[stockCode];
      setCandles(c); setDates(d); setStatus('ok');
      return;
    }

    const ctrl = new AbortController();
    setStatus('loading'); setCandles([]); setDates([]);

    fetch(`http://localhost:8080/funds/stocks/${stockCode}/candles`, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) { setStatus('error'); return; }
        const weekly = toWeekly(data);
        const c = weekly.map((w, i) => ({ i, open: w.open, close: w.close, hi: w.high, lo: w.low, volume: w.volume }));
        const d = weekly.map(w => w.date);
        weeklyCache[stockCode] = { c, d };
        setCandles(c); setDates(d); setStatus('ok');
      })
      .catch(err => { if (err.name !== 'AbortError') setStatus('error'); })
      .finally(() => { /* loading 종료는 위에서 처리 */ });

    return () => ctrl.abort();
  }, [stockCode]);

  useEffect(() => {
    if (!stockCode) return;
    let cancelled = false;
    const terms = [...new Set([stockName, stock?.short, stockCode].filter(Boolean))];

    async function loadCommunity() {
      setCommunityStatus('loading');
      setCommunityPosts([]);
      try {
        let questions = [];
        for (const term of terms) {
          const data = await getQuestions(term);
          const list = Array.isArray(data) ? data : [];
          questions = list.filter(q => {
            const qCode = q.stock?.stockCode || q.stockCode;
            const qName = q.stock?.companyName || q.stockName || '';
            return qCode === stockCode || (qName && (qName.includes(stockName) || stockName.includes(qName) || qName.includes(term)));
          });
          if (questions.length) break;
        }
        if (!cancelled) {
          setCommunityPosts(questions.slice(0, 2));
          setCommunityStatus('ok');
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('종목 커뮤니티 조회 실패', error);
          setCommunityStatus('error');
        }
      }
    }

    loadCommunity();
    return () => { cancelled = true; };
  }, [stockCode, stockName, stock?.short]);

  if (!stock) return null;

  const toneCls = priceToneClass(stock.pct);
  const changeAmt = stock.changeAmt || 0;

  return (
    <Card className="!p-[18px]">
      <div
        className="flex items-center gap-2.5 mb-3.5 cursor-pointer"
        onClick={() => navigate('detail', { code: stock.code })}
      >
        <Avatar stock={stock} size={36} />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">
            {displayStockName(stock)}
          </div>
          <div className="text-[13px] font-medium tabular-nums">
            <span className="text-slate-900 dark:text-slate-100">{won(stock.price)}</span>
            <span className={`${toneCls} ml-1.5`}>{signNum(changeAmt)} ({signPct(stock.pct)})</span>
          </div>
        </div>
      </div>
      <div className={`text-xs font-medium ${META} mb-1`}>주봉</div>
      {status === 'loading' && (
        <ChartSkeleton height={170} />
      )}
      {status === 'error' && (
        <div className={`h-[170px] flex items-center justify-center text-[13px] ${META}`}>차트를 불러올 수 없어요</div>
      )}
      {status === 'ok' && (
        <CandleChart candles={candles} dates={dates} w={356} h={170} volH={36} currentPrice={stock.price} />
      )}
      <div className="border-t border-slate-100 dark:border-slate-800 mt-3.5 pt-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">커뮤니티</span>
          <button
            type="button"
            onClick={() => routerNavigate('/community')}
            className={`text-xs ${META} cursor-pointer hover:text-slate-600 dark:hover:text-slate-300`}
          >
            더보기 ›
          </button>
        </div>
        {communityStatus === 'loading' ? (
          <SkeletonText lines={2} widths={['76%', '58%']} height={13} />
        ) : communityStatus === 'error' ? (
          <div className={`text-[13px] ${META} py-2`}>커뮤니티 글을 불러올 수 없어요.</div>
        ) : communityPosts.length === 0 ? (
          <div className={`text-[13px] ${META} py-2`}>아직 글이 없어요. 첫 글을 남겨보세요.</div>
        ) : communityPosts.map(p => (
          <div
            key={p.id}
            onClick={() => routerNavigate(`/community/${p.id}`)}
            className={`flex gap-2 mb-2.5 cursor-pointer ${ROW_HOVER} rounded-lg p-1 -mx-1`}
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-xs shrink-0">
              {(p.authorNickname || '익').charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{p.authorNickname || '익명'}</span>
                <span className={`text-[11px] ${META}`}>{timeAgo(new Date(p.createdAt).getTime())}</span>
              </div>
              <div className="text-[13px] text-slate-600 dark:text-slate-400 leading-normal overflow-hidden text-ellipsis line-clamp-2">
                {p.title || p.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InvestorTrendCard({ market, loading }) {
  if (loading || !market || !market.invSentiment) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-[18px]">
          <Skeleton width={132} height={18} />
          <Skeleton width={58} height={12} />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={i < 2 ? 'mb-[18px]' : ''}>
            <div className="flex justify-between mb-2">
              <Skeleton width={44} height={15} />
              <Skeleton width={96} height={15} />
            </div>
            <Skeleton height={8} radius={4} />
          </div>
        ))}
      </Card>
    );
  }
  const maxAbs = Math.max(...market.invSentiment.map(s => Math.abs(s.val || 0)), 1);
  return (
    <Card>
      <div className="flex items-center justify-between mb-[18px]">
        <span className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">국내 투자자 동향</span>
        <span className={`text-xs font-medium ${META} whitespace-nowrap`}>오늘 · 억원</span>
      </div>
      {market.invSentiment.map((s, i) => {
        const toneCls = priceToneClass(s.buy ? 1 : -1);
        const barBg = s.buy ? 'bg-red-500 dark:bg-red-400' : 'bg-blue-500 dark:bg-blue-400';
        const pct = Math.min(100, (Math.abs(s.val || 0) / maxAbs) * 100);
        return (
          <div key={i} className={i < market.invSentiment.length - 1 ? 'mb-[18px]' : ''}>
            <div className="flex justify-between mb-2">
              <span className="text-[15px] font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{s.who}</span>
              <span className={`text-[15px] font-semibold ${toneCls} whitespace-nowrap tabular-nums`}>
                {s.buy ? '순매수' : '순매도'} {Math.abs(s.val || 0).toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
              <div className={`h-full rounded ${barBg}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function WatchRail() {
  const { state, getStock, navigate, toggleWatch, kisLoading } = useStore();
  const top = state.watchlist.map(getStock).filter(Boolean).slice(0, 10);
  const loading = state.isLoggedIn && (kisLoading.watchlist || kisLoading.summaries) && state.watchlist.length > 0 && top.length === 0;
  return (
    <aside className="w-80 shrink-0">
      <div className="sticky top-[84px]">
        <div className="text-[22px] font-semibold text-slate-900 dark:text-slate-100 mb-4">관심</div>
        <Card className="!p-0">
          <div className="px-[18px] pt-[18px] pb-2">
            <div className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">관심 주식 TOP 10</div>
            <div className={`text-[13px] ${META} mt-1`}>관심 종목을 등록하면 상위 10개 종목이 표시됩니다.</div>
          </div>
          {loading ? (
            <WatchRailSkeleton />
          ) : top.map((s) => {
            const changeAmt = s.changeAmt || 0;
            return (
              <div
                key={s.code}
                onClick={() => navigate('detail', { code: s.code })}
                className={`flex items-center gap-2.5 py-[11px] px-[18px] ${ROW_HOVER}`}
              >
                <Avatar stock={s} size={34} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">
                    {displayStockName(s)}
                  </div>
                </div>
                <div className="text-right shrink-0 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">{wonShort(s.price)}</div>
                  <div className={`text-xs font-medium ${priceToneClass(s.pct)} tabular-nums`}>
                    {signNum(changeAmt)} ({signPct(s.pct)})
                  </div>
                </div>
                <Heart filled onClick={() => toggleWatch(s.code)} size={18} />
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => navigate('watchlist')}
            className="w-full py-3.5 border-none border-t border-slate-100 dark:border-slate-800 bg-transparent text-blue-600 dark:text-blue-400 font-medium text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            관심 종목 전체 보기
          </button>
        </Card>
      </div>
    </aside>
  );
}

function WatchRailSkeleton({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="flex items-center gap-2.5 py-[11px] px-[18px]">
      <Skeleton width={34} height={34} radius={17} />
      <div className="flex-1">
        <Skeleton width="70%" height={14} />
      </div>
      <div className="w-[82px] flex flex-col items-end gap-1.5">
        <Skeleton width={64} height={14} />
        <Skeleton width={74} height={12} />
      </div>
      <Skeleton width={18} height={18} radius={9} />
    </div>
  ));
}

function ChartSkeleton({ height = 170 }) {
  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-x-2 top-3 bottom-7 flex flex-col justify-between">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={1} radius={1} />)}
      </div>
      <div
        className="absolute left-3 right-[78px] bottom-[42px] flex items-end gap-1.5"
        style={{ height: height - 72 }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={Math.min(height - 78, 28 + ((i * 17) % 92))} radius={3} style={{ flex: 1 }} />
        ))}
      </div>
      <div className="absolute left-3 right-[78px] bottom-3 flex gap-1.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={8 + ((i * 7) % 18)} radius={2} style={{ flex: 1 }} />
        ))}
      </div>
    </div>
  );
}

function MarketTicker() {
  const { market } = useStore();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!market) return null;

  const items = [
    market.kospi,
    market.kosdaq,
    market.usd,
  ].filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[45] bg-white/96 dark:bg-slate-900/96 backdrop-blur-[10px] border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-[280ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className={`${CONTAINER} h-[52px] flex items-center gap-2`}>
        {items.map((it, i) => {
          const toneCls = priceToneClass(it.pct);
          return (
            <div
              key={i}
              className={`flex items-baseline gap-[7px] px-3.5 shrink-0 whitespace-nowrap ${
                i > 0 ? 'border-l border-slate-100 dark:border-slate-800' : ''
              }`}
            >
              <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">{it.name}</span>
              <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {(it.value || 0).toLocaleString('ko-KR', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-medium ${toneCls} tabular-nums`}>
                {signNum(it.amt)} ({signPct(it.pct)})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Home() {
  return (
    <>
      <div className={`${CONTAINER} py-7 pb-[100px] flex gap-10`}>
        <div className="flex-1 min-w-0"><HomeMain /></div>
        <WatchRail />
      </div>
      <MarketTicker />
    </>
  );
}

if (typeof window !== 'undefined') {
  Object.assign(window, { Home });
}
