import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store/store.jsx';
import {
  UP, DOWN, SUB, INK, BRAND,
  won, wonShort, signPct, signNum, tone,
  Avatar, Sparkline, CandleChart, Card, Pill, Tab, Heart,
} from '../components/ui.jsx';

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

function MiniIndexCard({ idx }) {
  const col = idx.up ? UP : DOWN;
  return (
    <Card style={{ padding: '18px 20px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#4E5968', whiteSpace: 'nowrap' }}>{idx.name}</span>
        {idx.tag && <span style={{ fontSize: 11, fontWeight: 700, color: col, background: col + '14', padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }}>{idx.tag}</span>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: INK, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
        {idx.value.toLocaleString('ko-KR', { minimumFractionDigits: 2 })}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: col, whiteSpace: 'nowrap' }}>{signNum(idx.amt)} ({signPct(idx.pct)})</span>
        <Sparkline pts={idx.spark} color={col} w={86} h={34} />
      </div>
    </Card>
  );
}

function InvestHero() {
  const { state, getStock, navigate } = useStore();
  const toLogin = useNavigate();
  if (!state.isLoggedIn) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '36px 36px', marginBottom: 28,
        background: 'linear-gradient(120deg,#1B64DA 0%,#2E7DF0 55%,#3D8BFF 100%)', color: '#fff' }}>
        <HeroGlow />
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.18)', padding: '6px 12px', borderRadius: 999, marginBottom: 16 }}>✦ AI 모의투자</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em' }}>실전처럼 연습하는 모의투자,<br />Darfin에서 시작하세요</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 12, lineHeight: 1.6 }}>가상 자금 1,000만 원으로 국내 주식을 사고팔며<br />AI가 내 투자 성향을 분석해줘요.</div>
          <button onClick={() => toLogin('/login')} style={{ marginTop: 22, height: 52, padding: '0 28px', borderRadius: 14, border: 'none',
            background: '#fff', color: BRAND, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>1,000만 원으로 시작하기</button>
        </div>
      </div>
    );
  }
  const rows = state.holdings.map(h => { const s = getStock(h.code); return { eval: s.price * h.qty, cost: h.avgPrice * h.qty }; });
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

function StockRow({ rank, stock, onClick, onHover, watched, onWatch, maxValue }) {
  const col = tone(stock.pct);
  const barW = Math.round((stock.value / maxValue) * 100);
  return (
    <div onClick={onClick} style={{ display: 'grid', gridTemplateColumns: '34px 1.5fr 112px 86px 94px 90px', alignItems: 'center',
      gap: 8, padding: '12px 8px', borderRadius: 12, cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; onHover && onHover(); }}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Heart filled={watched} onClick={onWatch} size={18} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span style={{ width: 16, fontSize: 15, fontWeight: 700, color: '#8B95A1', textAlign: 'center' }}>{rank}</span>
        <Avatar stock={stock} size={36} />
        <span style={{ fontSize: 15, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.short || stock.name}</span>
      </div>
      <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: INK }}>{won(stock.price)}</div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ display: 'inline-block', minWidth: 76, padding: '5px 0', borderRadius: 8, fontSize: 14, fontWeight: 700,
          color: col, background: stock.pct > 0 ? '#FEF0F1' : stock.pct < 0 ? '#EFF5FF' : '#F2F4F6' }}>{signPct(stock.pct)}</span>
      </div>
      <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 600, color: '#4E5968' }}>{stock.value}억원</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
        <div style={{ flex: 1, height: 6, background: '#F2F4F6', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: barW + '%', height: '100%', background: col, opacity: 0.85 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: SUB, width: 26, textAlign: 'right' }}>{Math.min(99, barW)}</span>
      </div>
    </div>
  );
}

function DetailPanel({ stock }) {
  const { genCandles, aiComments } = useStore();
  const candles = useMemo(() => genCandles(stock, 60), [stock.code]);
  const col = tone(stock.pct);
  const comment = aiComments[stock.code] || `${stock.sector} 업황 개선 기대감에 매수세가 유입되고 있어요.`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar stock={stock} size={44} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>{stock.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: col }}>{won(stock.price)} <span style={{ marginLeft: 4 }}>{signPct(stock.pct)}</span></div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: SUB }}>일봉</div>
      <CandleChart candles={candles} w={340} h={220} volH={44} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 800, color: INK }}>
          <span style={{ color: BRAND }}>✦</span> 왜 올랐을까?
        </div>
        <span style={{ fontSize: 12, color: SUB }}>2시간 전</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: '#4E5968', background: '#F9FAFB', borderRadius: 14, padding: 16 }}>{comment}</div>
    </div>
  );
}

function HomeMain() {
  const { state, market, stocks, industries, navigate, toggleWatch } = useStore();
  const [tab, setTab] = useState('chart');
  const [filter, setFilter] = useState('amount');
  const [selected, setSelected] = useState(stocks.find(s => s.code === '240810'));
  const maxValue = Math.max(...stocks.map(s => s.value));

  const sorted = useMemo(() => {
    const arr = [...stocks];
    if (filter === 'volume') arr.sort((a, b) => b.value * 0.7 - a.value * 0.7);
    else if (filter === 'up') arr.sort((a, b) => b.pct - a.pct);
    else if (filter === 'down') arr.sort((a, b) => a.pct - b.pct);
    else arr.sort((a, b) => b.value - a.value);
    return arr;
  }, [filter, stocks]);

  return (
    <div>
      <InvestHero />

      {/* market status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1FA463' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{market.status.label}</span>
          <span style={{ fontSize: 14, color: SUB }}>{market.status.hours}</span>
          <span style={{ fontSize: 13, color: SUB, marginLeft: 4 }}>· 오늘 14:09 기준</span>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 16px', borderRadius: 999, whiteSpace: 'nowrap',
          border: 'none', background: '#EFF5FF', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: BRAND }}>
          <span>✦</span> Darfin AI 소개 <span style={{ opacity: 0.5 }}>›</span>
        </button>
      </div>

      {/* indices */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <MiniIndexCard idx={market.kospi} />
        <MiniIndexCard idx={market.kosdaq} />
        <MiniIndexCard idx={market.usd} />
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
              <Pill active={filter === 'amount'} onClick={() => setFilter('amount')}>거래대금</Pill>
              <Pill active={filter === 'volume'} onClick={() => setFilter('volume')}>거래량</Pill>
              <Pill active={filter === 'up'} onClick={() => setFilter('up')}>급상승</Pill>
              <Pill active={filter === 'down'} onClick={() => setFilter('down')}>급하락</Pill>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: BRAND }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                투자위험 주식 숨기기
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '34px 1.5fr 112px 86px 94px 90px', gap: 8, padding: '0 8px 10px', fontSize: 13, color: SUB, fontWeight: 600 }}>
              <span>순위</span><span></span><span style={{ textAlign: 'right' }}>현재가</span>
              <span style={{ textAlign: 'right' }}>등락률</span><span style={{ textAlign: 'right' }}>거래대금</span><span style={{ textAlign: 'right' }}>거래비중</span>
            </div>
            {sorted.map((s, i) => (
              <StockRow key={s.code} rank={i + 1} stock={s} maxValue={maxValue}
                watched={state.watchlist.includes(s.code)} onWatch={() => toggleWatch(s.code)}
                onClick={() => navigate('detail', { code: s.code })}
                onHover={() => setSelected(s)} />
            ))}
          </div>
          <div style={{ position: 'sticky', top: 120, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InvestorTrendCard market={market} />
            {selected && (
              <Card>
                <DetailPanel stock={selected} />
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'industry' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4E5968' }}>최근 5일간 거래대금 증가율 상위 업종</span>
            <span style={{ fontSize: 12, color: SUB }}>· 등락률은 당일 업종 평균 기준</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: BRAND, background: '#EFF5FF', padding: '3px 8px', borderRadius: 6, marginLeft: 'auto', whiteSpace: 'nowrap' }}>오늘 14:09 업데이트</span>
          </div>
          <Card style={{ padding: 8 }}>
            {industries.map((ind, i) => (
              <div key={i} onClick={() => navigate('detail', { code: stocks[i % stocks.length].code })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: i < industries.length - 1 ? '1px solid #F6F8FA' : 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#8B95A1', width: 18 }}>{i + 1}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>{ind.name}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: tone(ind.pct) }}>{signPct(ind.pct)}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function InvestorTrendCard({ market }) {
  const maxAbs = Math.max(...market.invSentiment.map(s => Math.abs(s.val)));
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>국내 투자자 동향</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: SUB, whiteSpace: 'nowrap' }}>오늘 · 백만원</span>
      </div>
      {market.invSentiment.map((s, i) => {
        const col = s.buy ? UP : DOWN;
        const pct = Math.min(100, (Math.abs(s.val) / maxAbs) * 100);
        return (
          <div key={i} style={{ marginBottom: i < 2 ? 18 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: INK, whiteSpace: 'nowrap' }}>{s.who}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: col, whiteSpace: 'nowrap' }}>{s.buy ? '순매수' : '순매도'} {Math.abs(s.val).toLocaleString()}</span>
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
      <div style={{ position: 'sticky', top: 120 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 16 }}>관심</div>
        <Card style={{ padding: 18, marginBottom: 16, background: 'linear-gradient(135deg,#F4F8FF,#fff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: BRAND, marginBottom: 8, whiteSpace: 'nowrap' }}>✦ Darfin AI</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, lineHeight: 1.5 }}>삼성전자 복합 대외 변수 영향으로 1.3% 하락</div>
        </Card>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 18px 8px' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: INK }}>관심 주식 TOP 10</div>
            <div style={{ fontSize: 13, color: SUB, marginTop: 4 }}>내 관심 그룹 · 현재가·등락률은 오늘 14:09 기준</div>
          </div>
          {top.map((s, i) => (
            <div key={s.code} onClick={() => navigate('detail', { code: s.code })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Avatar stock={s} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.short || s.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{wonShort(s.price)}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: tone(s.pct) }}>{signNum(s.changeAmt)} ({signPct(s.pct)})</div>
              </div>
              <Heart filled onClick={() => toggleWatch(s.code)} size={18} />
            </div>
          ))}
          <button onClick={() => navigate('watchlist')} style={{ width: '100%', padding: 14, border: 'none', borderTop: '1px solid #F2F4F6', background: 'none', color: BRAND, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>관심 종목 전체 보기</button>
        </Card>
      </div>
    </aside>
  );
}

export function Home() {
  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: '28px 28px 80px', display: 'flex', gap: 40 }}>
      <div style={{ flex: 1, minWidth: 0 }}><HomeMain /></div>
      <WatchRail />
    </div>
  );
}
