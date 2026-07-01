import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/store.jsx';
import {
  UP, DOWN, SUB, INK, BRAND,
  won, wonShort, signPct, signNum, tone, timeAgo,
  Avatar, Sparkline, CandleChart, Card, Pill, Tab, Heart,
} from '../components/ui.jsx';

// ===== Home dashboard (Toss layout, domestic only) =====
function MarketCard({ idx, big }) {
  const col = idx.up ? UP : DOWN;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
      <div style={{ flexShrink: 0 }}><Sparkline pts={idx.spark} color={col} w={big ? 120 : 70} h={big ? 56 : 40} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#4E5968', whiteSpace: 'nowrap' }}>{idx.name}</span>
          {idx.tag && <span style={{ fontSize: 11, fontWeight: 700, color: SUB, background: '#F2F4F6', padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap' }}>{idx.tag}</span>}
        </div>
        <div style={{ fontSize: big ? 26 : 19, fontWeight: 800, color: INK, letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          {idx.value.toLocaleString('ko-KR', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: col, marginTop: 2 }}>
          {signNum(idx.amt)} ({signPct(idx.pct)})
        </div>
      </div>
    </div>
  );
}

// ---------- Darfin signature pieces ----------
function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 5, height: 20, borderRadius: 3, background: BRAND, display: 'inline-block' }} />
        <span style={{ fontSize: 20, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{children}</span>
      </div>
      {action && <button onClick={onAction} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: SUB }}>{action} ›</button>}
    </div>
  );
}

// 1. 코스피/코스닥 지수 (TR_ID: FHPUP02100000) 반영 컴포넌트
function MiniIndexCard({ idx }) {
  if (!idx) {
    return (
      <Card style={{ padding: '14px 18px', flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#4E5968', marginBottom: 6 }}>시장 지표</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: SUB, height: 28, display: 'flex', alignItems: 'center' }}>KIS 데이터를 불러오는 중입니다</div>
      </Card>
    );
  }
  const isUp = idx.pct >= 0;
  const col = isUp ? UP : DOWN;
  return (
    <Card style={{ padding: '14px 18px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#4E5968', whiteSpace: 'nowrap' }}>{idx.name}</span>
        {idx.tag && <span style={{ fontSize: 11, fontWeight: 700, color: col, background: col + '14', padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }}>{idx.tag}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: INK, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          {(idx.value || 0).toLocaleString('ko-KR', { minimumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: col, whiteSpace: 'nowrap' }}>
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
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '36px 36px', marginBottom: 28,
        background: 'linear-gradient(120deg,#1B64DA 0%,#2E7DF0 55%,#3D8BFF 100%)', color: '#fff' }}>
        <HeroGlow />
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.18)', padding: '6px 12px', borderRadius: 999, marginBottom: 16 }}>✦ AI 모의투자</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em' }}>실전처럼 연습하는 모의투자,<br />Darfin에서 시작하세요</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 12, lineHeight: 1.6 }}>가상 자금 1,000만 원으로 국내 주식을 사고팔며<br />AI가 내 투자 성향을 분석해줘요.</div>
          <button onClick={goToLogin} style={{ marginTop: 22, height: 52, padding: '0 28px', borderRadius: 14, border: 'none',
            background: '#fff', color: BRAND, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>1,000만 원으로 시작하기</button>
        </div>
      </div>
    );
  }

  const rows = state.holdings.map(h => {
    const s = getStock(h.code);
    // snapPrice: 실시간 틱/시뮬레이션을 섞지 않은 10초 주기 실측값 — "내 모의투자 자산"은 10초마다만 갱신
    const currentPrice = s ? s.snapPrice : h.avgPrice;
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
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '28px 32px', marginBottom: 28,
      background: 'linear-gradient(120deg,#103E8C 0%,#1B64DA 60%,#2E7DF0 100%)', color: '#fff' }}>
      <HeroGlow />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.82)', marginBottom: 10, whiteSpace: 'nowrap' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>나</span>
            내 모의투자 자산
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>{won(assets)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 800, background: 'rgba(255,255,255,0.16)', padding: '7px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>
              {pnlUp ? '▲' : '▼'} {signNum(pnl)}원 ({signPct(pnlPct)})
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>평가손익</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 250, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.72)' }}>주문 가능 현금</span>
            <span style={{ fontWeight: 800 }}>{won(cash)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.72)' }}>보유 종목</span>
            <span style={{ fontWeight: 800 }}>{state.holdings.length}종목</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={() => navigate('portfolio')} style={heroBtn(true)}>내 주식</button>
            <button onClick={() => navigate('ai')} style={heroBtn(false)}>✦ AI 리포트</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function HeroGlow() {
  return (
    <>
      <div style={{ position: 'absolute', top: -80, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
      <div style={{ position: 'absolute', bottom: -120, right: 160, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
    </>
  );
}
const heroBtn = (solid) => ({ flex: 1, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap',
  background: solid ? '#fff' : 'rgba(255,255,255,0.16)', color: solid ? BRAND : '#fff' });

const RANK_COLS = '28px 28px 40px 1fr 112px 86px 120px 96px';

function StockRow({ rank, stock, onClick, watched, onWatch, maxValue, onHover, rankTab }) {
  const col = tone(stock.pct);
  const displayValue = stock.value || 0;
  const barW = maxValue > 0 ? Math.round((displayValue / maxValue) * 100) : 0;

  let valText = `${displayValue.toLocaleString()}억원`;
  if (rankTab === 'volume') valText = `${displayValue.toLocaleString()}주`;
  else if (rankTab === 'topGainers' || rankTab === 'topLosers') valText = `${displayValue.toLocaleString()}원`;

  return (
    <div onClick={onClick}
      style={{ display: 'grid', gridTemplateColumns: RANK_COLS, alignItems: 'center',
        gap: 8, padding: '10px 8px', borderRadius: 12, cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; onHover && onHover(); }}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      {/* 찜 */}
      <div style={{ display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
        <Heart filled={watched} onClick={onWatch} size={18} />
      </div>

      {/* 순위 */}
      <span style={{ fontSize: 14, fontWeight: 700, color: '#8B95A1', textAlign: 'center' }}>{rank}</span>

      {/* 아이콘 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar stock={stock} size={34} />
      </div>

      {/* 종목명 */}
      <span style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {stock.short || stock.name}
      </span>

      {/* 현재가 */}
      <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: INK }}>{won(stock.price)}</div>

      {/* 등락률 */}
      <div style={{ textAlign: 'right' }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 8, fontSize: 13, fontWeight: 700,
          color: col, background: stock.pct > 0 ? '#FEF0F1' : stock.pct < 0 ? '#EFF5FF' : '#F2F4F6' }}>
          {signPct(stock.pct)}
        </span>
      </div>

      {/* 거래대금/거래량 */}
      <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#4E5968' }}>{valText}</div>

      {/* 비중 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 6, background: '#F2F4F6', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: barW + '%', height: '100%', background: col, opacity: 0.85 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: SUB, width: 24, textAlign: 'right' }}>{Math.min(99, barW)}</span>
      </div>
    </div>
  );
}

function HomeMain() {
  const { state, market, marketError, stocks, industries, navigate, toggleWatch, rankTab, setRankTab } = useStore();
  const [tab, setTab] = useState('chart');

  const [hoveredCode, setHoveredCode] = useState('');
  
  const maxValue = useMemo(() => {
    if (!stocks || stocks.length === 0) return 0;
    return Math.max(...stocks.map(s => s.value || 0));
  }, [stocks]);

  const displayStocks = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];
    return [...stocks];
  }, [stocks]);

  const activeHovered = useMemo(() => {
    if (!displayStocks.length) return null;
    const found = displayStocks.find(s => s.code === hoveredCode);
    return found || displayStocks[0];
  }, [hoveredCode, displayStocks]);

  // 탭 변경 시에만 hover 초기화 — stocks가 300ms마다 바뀌어도 리셋하지 않음
  useEffect(() => {
    setHoveredCode('');
  }, [rankTab]);

  return (
    <div>
      <InvestHero />

      {/* market status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1FA463' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{market?.status?.label || '장 운영중'}</span>
          <span style={{ fontSize: 14, color: SUB }}>{market?.status?.hours || '09:00 ~ 15:30'}</span>
          <span style={{ fontSize: 13, color: marketError ? DOWN : SUB, marginLeft: 4 }}>
            · {marketError ? 'KIS 시장 지표 연결 실패' : '실시간 자동 갱신 중'}
          </span>
        </div>
      </div>

      {/* 1. 코스피/코스닥 지수 연동 섹션 (TR_ID: FHPUP02100000) */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <MiniIndexCard idx={market?.kospi} />
        <MiniIndexCard idx={market?.kosdaq} />
        <MiniIndexCard idx={market?.usd} />
      </div>

      {/* tabs */}
      <div style={{ borderBottom: '1px solid #EEF1F4', marginBottom: 18 }}>
        <Tab active={tab === 'chart'} onClick={() => setTab('chart')}>실시간 차트</Tab>
        <Tab active={tab === 'industry'} onClick={() => setTab('industry')}>지금 뜨는 산업</Tab>
      </div>

      {tab === 'chart' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 392px', gap: 24, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <Pill active={rankTab === 'tradeValue'} onClick={() => setRankTab('tradeValue')}>거래대금</Pill>
              <Pill active={rankTab === 'volume'} onClick={() => setRankTab('volume')}>거래량</Pill>
              <Pill active={rankTab === 'topGainers'} onClick={() => setRankTab('topGainers')}>급상승</Pill>
              <Pill active={rankTab === 'topLosers'} onClick={() => setRankTab('topLosers')}>급하락</Pill>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: BRAND }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                투자위험 주식 숨기기
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: RANK_COLS, gap: 8, padding: '0 8px 10px', fontSize: 12, color: SUB, fontWeight: 600 }}>
              <span />
              <span style={{ textAlign: 'center' }}>순위</span>
              <span />
              <span>종목</span>
              <span style={{ textAlign: 'right' }}>현재가</span>
              <span style={{ textAlign: 'right' }}>등락률</span>
              <span style={{ textAlign: 'right' }}>
                {rankTab === 'tradeValue' ? '거래대금' : rankTab === 'volume' ? '거래량' : '당일변동'}
              </span>
              <span style={{ textAlign: 'right' }}>비중비율</span>
            </div>
            
            {displayStocks.length > 0 ? (
              displayStocks.map((s, i) => (
                <StockRow key={s.code} rank={i + 1} stock={s} maxValue={maxValue} rankTab={rankTab}
                  watched={state.watchlist.includes(s.code)} onWatch={() => toggleWatch(s.code)}
                  onHover={() => setHoveredCode(s.code)}
                  onClick={() => navigate('detail', { code: s.code })} />
              ))
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 14, color: SUB }}>데이터를 불러오는 중입니다...</div>
            )}
          </div>
          
          <div style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 3. 당일 투자자 동향 연동 섹션 (TR_ID: HHPPG046600C1) */}
            <InvestorTrendCard market={market} />
            {activeHovered && <StockPreviewCard stock={activeHovered} />}
          </div>
        </div>
      )}

      {/* 2. 지금 뜨는 산업 연동 섹션 (TR_ID: FHPUP02140000) */}
      {tab === 'industry' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4E5968' }}>최근 거래대금 및 상승률 상위 업종</span>
            <span style={{ fontSize: 12, color: SUB }}>· 등락률은 당일 업종 평균 기준</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: BRAND, background: '#EFF5FF', padding: '3px 8px', borderRadius: 6, marginLeft: 'auto', whiteSpace: 'nowrap' }}>실시간 업데이트</span>
          </div>
          <Card style={{ padding: 8 }}>
            {industries && industries.length > 0 ? (
              industries.map((ind, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: i < industries.length - 1 ? '1px solid #F6F8FA' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#8B95A1', width: 18 }}>{i + 1}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>{ind.name}</span>
                    {ind.code && <span style={{ fontSize: 12, color: SUB }}>({ind.code})</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {ind.value && <span style={{ fontSize: 14, color: '#4E5968', fontWeight: 500 }}>{ind.value.toLocaleString()}억원</span>}
                    <span style={{ fontSize: 16, fontWeight: 800, color: tone(ind.pct), minWidth: 64, textAlign: 'right' }}>{signPct(ind.pct)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 14, color: SUB }}>업종 지표 데이터를 불러오는 중입니다...</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// 일봉 → 주봉 집계 (월요일 기준)
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
  const { navigate, state, getStock } = useStore();
  // 모든 훅을 조건 분기 전에 선언 (Rules of Hooks)
  const [candles, setCandles] = useState([]);
  const [dates,   setDates]   = useState([]);
  const [status,  setStatus]  = useState('idle'); // idle | loading | ok | error

  const stock     = rawStock ? (getStock(rawStock.code) || rawStock) : null;
  const stockCode = stock?.code ?? null;

  useEffect(() => {
    if (!stockCode) return;

    // 캐시 히트
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

  // 훅 이후 조건부 렌더링
  if (!stock) return null;

  const col       = tone(stock.pct);
  const posts     = (state.community[stock.code] || []).slice(0, 2);
  const changeAmt = stock.changeAmt || 0;

  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }}
        onClick={() => navigate('detail', { code: stock.code })}>
        <Avatar stock={stock} size={36} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.short || stock.name}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: INK }}>{won(stock.price)}</span>
            <span style={{ color: col, marginLeft: 6 }}>{signNum(changeAmt)} ({signPct(stock.pct)})</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: SUB, marginBottom: 4 }}>주봉</div>
      {status === 'loading' && (
        <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: SUB }}>불러오는 중...</div>
      )}
      {status === 'error' && (
        <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: SUB }}>차트를 불러올 수 없어요</div>
      )}
      {status === 'ok' && (
        <CandleChart candles={candles} dates={dates} w={356} h={170} volH={36} currentPrice={stock.price} />
      )}
      <div style={{ borderTop: '1px solid #F2F4F6', marginTop: 14, paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>커뮤니티</span>
          <span onClick={() => navigate('detail', { code: stock.code })} style={{ fontSize: 12, color: SUB, cursor: 'pointer' }}>더보기 ›</span>
        </div>
        {posts.length === 0 ? (
          <div style={{ fontSize: 13, color: SUB, padding: '8px 0' }}>아직 글이 없어요. 첫 글을 남겨보세요.</div>
        ) : posts.map(p => (
          <div key={p.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.author === '나' ? BRAND : '#D1D6DB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{p.author.charAt(0)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.author}</span>
                <span style={{ fontSize: 11, color: SUB }}>{timeAgo(p.ts)}</span>
              </div>
              <div style={{ fontSize: 13, color: '#4E5968', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.text}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 3. 투자자 동향 (TR_ID: HHPPG046600C1) 반영 컴포넌트
function InvestorTrendCard({ market }) {
  if (!market || !market.invSentiment) return null;
  const maxAbs = Math.max(...market.invSentiment.map(s => Math.abs(s.val || 0)), 1);
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>국내 투자자 동향</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: SUB, whiteSpace: 'nowrap' }}>오늘 · 백만원</span>
      </div>
      {market.invSentiment.map((s, i) => {
        const col = s.buy ? UP : DOWN;
        const pct = Math.min(100, (Math.abs(s.val || 0) / maxAbs) * 100);
        return (
          <div key={i} style={{ marginBottom: i < market.invSentiment.length - 1 ? 18 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{s.who}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: col, whiteSpace: 'nowrap' }}>
                {s.buy ? '순매수' : '순매도'} {Math.abs(s.val || 0).toLocaleString()}
              </span>
            </div>
            <div style={{ height: 8, background: '#F2F4F6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: pct + '%', height: '100%', background: col }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function WatchRail() {
  const { state, getStock, navigate, toggleWatch } = useStore();
  const top = state.watchlist.map(getStock).filter(Boolean).slice(0, 10);
  return (
    <aside style={{ width: 320, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 84 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 16 }}>관심</div>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 18px 8px' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>관심 주식 TOP 10</div>
            <div style={{ fontSize: 13, color: SUB, marginTop: 4 }}>관심 종목을 등록하면 상위 10개 종목이 표시됩니다.</div>
          </div>
          {top.map((s) => {
            const changeAmt = s.changeAmt || 0;
            return (
              <div key={s.code} onClick={() => navigate('detail', { code: s.code })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar stock={s} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.short || s.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{wonShort(s.price)}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tone(s.pct) }}>{signNum(changeAmt)} ({signPct(s.pct)})</div>
                </div>
                <Heart filled onClick={(e) => { e.stopPropagation(); toggleWatch(s.code); }} size={18} />
              </div>
            );
          })}
          <button onClick={() => navigate('watchlist')} style={{ width: '100%', padding: 14, border: 'none', borderTop: '1px solid #F2F4F6', background: 'none', color: BRAND, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>관심 종목 전체 보기</button>
        </Card>
      </div>
    </aside>
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
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 45,
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderTop: '1px solid #EEF1F4',
      transform: show ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.28s cubic-bezier(0.2,0.8,0.2,1)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 28px', height: 52, display: 'flex', alignItems: 'center', gap: 8 }}>
        {items.map((it, i) => {
          const col = tone(it.pct);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 7, padding: '0 14px', borderLeft: i === 0 ? 'none' : '1px solid #F2F4F6', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4E5968' }}>{it.name}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>{(it.value || 0).toLocaleString('ko-KR', { minimumFractionDigits: 2 })}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{signNum(it.amt)} ({signPct(it.pct)})</span>
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
      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '28px 28px 100px', display: 'flex', gap: 40 }}>
        <div style={{ flex: 1, minWidth: 0 }}><HomeMain /></div>
        <WatchRail />
      </div>
      <MarketTicker />
    </>
  );
}

if (typeof window !== 'undefined') {
  Object.assign(window, { Home });
}
