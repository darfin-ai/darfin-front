import { useState, useMemo } from 'react';
import { useStore, seedRand } from '../store/store.jsx';
import {
  UP, DOWN, SUB, INK, BRAND,
  won, wonShort, signPct, signNum, tone, timeAgo,
  Avatar, Card, Modal, primaryBtn, iconBtn, CandleChart, Stub,
} from '../components/ui.jsx';

const PERIODS = [
  { key: '1D', label: '1일', n: 48 },
  { key: '1W', label: '1주일', n: 40 },
  { key: '1M', label: '1개월', n: 30 },
  { key: '3M', label: '3개월', n: 60 },
  { key: '6M', label: '6개월', n: 90 },
  { key: '1Y', label: '1년', n: 120 },
];

function OrderModal({ stock, side, onClose }) {
  const { state, buy, sell } = useStore();
  const holding = state.holdings.find(h => h.code === stock.code);
  const ownedQty = holding ? holding.qty : 0;
  const [qty, setQty] = useState(1);
  const price = stock.price;
  const total = qty * price;
  const isBuy = side === 'BUY';
  const cash = state.funds.cashBalance;
  const maxBuy = Math.floor(cash / price);
  const canSubmit = isBuy ? (qty > 0 && total <= cash) : (qty > 0 && qty <= ownedQty);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!canSubmit) return;
    if (isBuy) buy(stock.code, qty, price); else sell(stock.code, qty, price);
    setDone(true);
  };

  if (done) {
    return (
      <Modal onClose={onClose} width={420}>
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: isBuy ? '#FEF0F1' : '#EFF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={isBuy ? UP : DOWN} strokeWidth="2.6"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: INK, marginBottom: 8 }}>{isBuy ? '매수' : '매도'} 체결 완료</div>
          <div style={{ fontSize: 15, color: '#4E5968', lineHeight: 1.6 }}>{stock.name} {qty}주를 {won(price)}에<br />{isBuy ? '매수' : '매도'}했어요. (KIS 현재가 기준 즉시 체결)</div>
          <button onClick={onClose} style={{ ...primaryBtn, width: '100%', height: 50, marginTop: 24 }}>확인</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} width={440}>
      <div style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <Avatar stock={stock} size={44} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>{stock.name}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: tone(stock.pct) }}>{won(price)} {signPct(stock.pct)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', background: '#F2F4F6', borderRadius: 12, padding: 4, marginBottom: 22 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 9, fontWeight: 800, fontSize: 15,
            background: '#fff', color: isBuy ? UP : DOWN, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>{isBuy ? '매수' : '매도'}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#4E5968' }}>수량</span>
          <span style={{ fontSize: 13, color: SUB }}>{isBuy ? `최대 ${maxBuy}주 가능` : `보유 ${ownedQty}주`}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button onClick={() => setQty(q => Math.max(1, q - 1))} style={stepBtn}>−</button>
          <input value={qty} onChange={e => setQty(Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 0))}
            style={{ flex: 1, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 800, color: INK, border: '1px solid #E5E8EB', borderRadius: 12 }} />
          <button onClick={() => setQty(q => q + 1)} style={stepBtn}>+</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {[10, 50, 100].map(p => (
            <button key={p} onClick={() => setQty(Math.max(1, Math.floor((isBuy ? maxBuy : ownedQty) * p / 100)))}
              style={quickBtn}>{p}%</button>
          ))}
          <button onClick={() => setQty(isBuy ? maxBuy : ownedQty)} style={quickBtn}>{isBuy ? '최대' : '전량'}</button>
        </div>

        <div style={{ background: '#F9FAFB', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <InfoRow label="주문 금액" value={won(total)} bold />
          <InfoRow label={isBuy ? '주문 가능 현금' : '체결 후 현금'} value={won(isBuy ? cash : cash + total)} />
        </div>
        {!canSubmit && qty > 0 && (
          <div style={{ fontSize: 13, color: UP, marginBottom: 14, fontWeight: 600 }}>
            {isBuy ? '주문 가능 현금이 부족해요.' : '보유 수량을 초과했어요.'}
          </div>
        )}
        <button onClick={submit} disabled={!canSubmit} style={{
          width: '100%', height: 54, borderRadius: 14, border: 'none', fontSize: 17, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed',
          background: canSubmit ? (isBuy ? UP : DOWN) : '#E5E8EB', color: canSubmit ? '#fff' : '#B0B8C1' }}>
          {won(total)} {isBuy ? '매수' : '매도'}
        </button>
      </div>
    </Modal>
  );
}
const stepBtn = { width: 52, height: 52, borderRadius: 12, border: '1px solid #E5E8EB', background: '#fff', fontSize: 24, fontWeight: 700, color: '#4E5968', cursor: 'pointer' };
const quickBtn = { flex: 1, height: 38, borderRadius: 10, border: '1px solid #E5E8EB', background: '#fff', fontSize: 13, fontWeight: 700, color: '#4E5968', cursor: 'pointer' };
function InfoRow({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
      <span style={{ fontSize: 14, color: SUB, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: bold ? 17 : 14, fontWeight: bold ? 800 : 600, color: INK, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

export function Detail() {
  const { state, getStock, genCandles, navigate, toggleWatch, aiComments } = useStore();
  const code = state.route.params.code;
  const stock = getStock(code);
  const [period, setPeriod] = useState('3M');
  const [ma5, setMa5] = useState(true);
  const [ma20, setMa20] = useState(false);
  const [order, setOrder] = useState(null);
  const periodObj = PERIODS.find(p => p.key === period);
  const candles = useMemo(() => genCandles(stock, periodObj.n), [code, period]);
  if (!stock) return <Stub name="종목" />;
  const col = tone(stock.pct);
  const holding = state.holdings.find(h => h.code === code);
  const watched = state.watchlist.includes(code);
  const comment = aiComments[code] || `${stock.sector} 업황 개선 기대감에 매수세가 유입되고 있어요.`;

  const info = [
    ['시가총액', stock.value >= 100 ? (stock.value * 9.2 / 10).toFixed(1) + '조' : (stock.value * 92).toLocaleString() + '억'],
    ['거래대금', stock.value + '억원'],
    ['52주 최고', won(Math.round(stock.price * 1.34))],
    ['52주 최저', won(Math.round(stock.price * 0.72))],
    ['PER', (8 + (stock.value % 17)).toFixed(1) + '배'],
    ['업종', stock.sector],
  ];

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: '24px 28px 80px' }}>
      <button onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', color: SUB, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 18, whiteSpace: 'nowrap' }}>‹ 실시간 차트</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>
        <div>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <Avatar stock={stock} size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{stock.name}</span>
                <span style={{ fontSize: 14, color: SUB }}>{stock.code}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: INK, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{won(stock.price)}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: col, whiteSpace: 'nowrap' }}>{signNum(stock.changeAmt)} ({signPct(stock.pct)})</span>
              </div>
            </div>
            <HeartBtn filled={watched} onClick={() => toggleWatch(code)} size={26} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 332px', gap: 20, marginBottom: 20, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6, background: '#F2F4F6', borderRadius: 12, padding: 4 }}>
                    {PERIODS.map(p => (
                      <button key={p.key} onClick={() => setPeriod(p.key)} style={{ padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700, background: period === p.key ? '#fff' : 'transparent', color: period === p.key ? INK : '#8B95A1',
                        boxShadow: period === p.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{p.label}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <MAToggle on={ma5} color="#F5A623" label="MA5" onClick={() => setMa5(v => !v)} />
                    <MAToggle on={ma20} color="#7C3AED" label="MA20" onClick={() => setMa20(v => !v)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 18, marginBottom: 8, fontSize: 12, color: SUB }}>
                  <span><span style={{ color: UP, fontWeight: 800 }}>■</span> 양봉</span>
                  <span><span style={{ color: DOWN, fontWeight: 800 }}>■</span> 음봉</span>
                  <span style={{ marginLeft: 'auto' }}>거래량</span>
                </div>
                <CandleChart candles={candles} w={596} h={360} showMA5={ma5} showMA20={ma20} volH={70} />
              </Card>
              <Card>
                <div style={{ fontSize: 18, fontWeight: 800, color: INK, marginBottom: 18 }}>종목 정보</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px 24px' }}>
                  {info.map(([k, v], i) => (
                    <div key={i}>
                      <div style={{ fontSize: 13, color: SUB, marginBottom: 4 }}>{k}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <OrderBook stock={stock} />
              <TickTape stock={stock} />
            </div>
          </div>

          <FinancialsChart stock={stock} />
          <Community stock={stock} />
        </div>

        {/* right: order + AI */}
        <div style={{ position: 'sticky', top: 120, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            {holding && (
              <div style={{ background: '#F9FAFB', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: SUB, marginBottom: 8 }}>내 보유</div>
                <InfoRow label="보유 수량" value={holding.qty + '주'} />
                <InfoRow label="평균 매수가" value={won(holding.avgPrice)} />
                <InfoRow label="평가 손익" value={signNum((stock.price - holding.avgPrice) * holding.qty) + '원'} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setOrder('SELL')} disabled={!holding} style={{ flex: 1, height: 54, borderRadius: 14, border: 'none', fontSize: 17, fontWeight: 800,
                background: holding ? '#EFF5FF' : '#F2F4F6', color: holding ? DOWN : '#C5CBD3', cursor: holding ? 'pointer' : 'not-allowed' }}>매도</button>
              <button onClick={() => setOrder('BUY')} style={{ flex: 1, height: 54, borderRadius: 14, border: 'none', fontSize: 17, fontWeight: 800, background: UP, color: '#fff', cursor: 'pointer' }}>매수</button>
            </div>
            <div style={{ fontSize: 12, color: SUB, textAlign: 'center', marginTop: 12 }}>모의투자 · KIS 현재가 기준 즉시 체결</div>
          </Card>
          <Card style={{ background: 'linear-gradient(135deg,#F4F8FF,#fff)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: BRAND, marginBottom: 10, whiteSpace: 'nowrap' }}>✦ Darfin AI 한줄 코멘트</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: '#333D4B' }}>{comment}</div>
          </Card>
        </div>
      </div>
      {order && <OrderModal stock={stock} side={order} onClose={() => setOrder(null)} />}
    </div>
  );
}

function HeartBtn({ filled, onClick, size = 22 }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} style={{ ...iconBtn, width: size + 12, height: size + 12 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? UP : 'none'} stroke={filled ? UP : '#C5CBD3'} strokeWidth="2">
        <path d="M12 21s-7-4.6-9.3-8.4C1 9.5 2.4 6 5.6 6c2 0 3.2 1.2 4.4 2.6C11.2 7.2 12.4 6 14.4 6c3.2 0 4.6 3.5 2.9 6.6C19 16.4 12 21 12 21z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function MAToggle({ on, color, label, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 10,
      border: '1px solid ' + (on ? color : '#E5E8EB'), background: on ? color + '14' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: on ? color : '#8B95A1' }}>
      <span style={{ width: 14, height: 3, borderRadius: 2, background: on ? color : '#C5CBD3' }} />{label}
    </button>
  );
}

function tickSize(p) {
  if (p >= 500000) return 1000;
  if (p >= 100000) return 500;
  if (p >= 50000) return 100;
  if (p >= 10000) return 50;
  if (p >= 5000) return 10;
  if (p >= 1000) return 5;
  return 1;
}
function PanelTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 4, height: 16, borderRadius: 2, background: BRAND }} />
        <span style={{ fontSize: 17, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{children}</span>
      </div>
      {right}
    </div>
  );
}

function FinancialsChart({ stock }) {
  const [metric, setMetric] = useState('revenue');
  const data = useMemo(() => {
    const rnd = seedRand(stock.code + ':fin');
    const quarters = ['24.1Q', '24.2Q', '24.3Q', '24.4Q', '25.1Q', '25.2Q'];
    const base = 800 + Math.round(stock.value * 22 + rnd() * 3000);
    const grow = stock.pct >= 0 ? 0.07 : 0.02;
    return quarters.map((q, i) => {
      const rev = Math.round(base * (1 + grow * i + (rnd() - 0.5) * 0.12));
      const op = Math.round(rev * (0.12 + rnd() * 0.1));
      const net = Math.round(op * (0.68 + rnd() * 0.16));
      return { q, revenue: rev, operating: op, net };
    });
  }, [stock.code]);
  const labels = { revenue: '매출액', operating: '영업이익', net: '당기순이익' };
  const vals = data.map(d => d[metric]);
  const max = Math.max(...vals) * 1.18;
  const last = data[data.length - 1], yoyBase = data[data.length - 5] || data[0];
  const yoy = yoyBase[metric] ? ((last[metric] - yoyBase[metric]) / Math.abs(yoyBase[metric]) * 100) : 0;
  const fmt = (v) => v >= 10000 ? (v / 10000).toFixed(2) + '조원' : v.toLocaleString() + '억원';
  return (
    <Card style={{ marginBottom: 20 }}>
      <PanelTitle right={
        <div style={{ display: 'flex', gap: 4, background: '#F2F4F6', borderRadius: 10, padding: 4 }}>
          {Object.entries(labels).map(([k, l]) => (
            <button key={k} onClick={() => setMetric(k)} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
              background: metric === k ? '#fff' : 'transparent', color: metric === k ? INK : '#8B95A1', boxShadow: metric === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>}>정기공시 · 재무 추이</PanelTitle>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{fmt(last[metric])}</span>
        <span style={{ fontSize: 14, color: SUB, whiteSpace: 'nowrap' }}>{last.q} {labels[metric]}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: tone(yoy), marginLeft: 'auto', whiteSpace: 'nowrap' }}>전년比 {signPct(yoy)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, height: 170 }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d[metric] / max) * 150);
          const isLast = i === data.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8, height: '100%' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: isLast ? BRAND : '#8B95A1', whiteSpace: 'nowrap' }}>{(d[metric] / (d[metric] >= 10000 ? 10000 : 1)).toLocaleString(undefined, { maximumFractionDigits: d[metric] >= 10000 ? 1 : 0 })}{d[metric] >= 10000 ? '조' : ''}</span>
              <div style={{ width: '70%', maxWidth: 56, height: h, borderRadius: '8px 8px 0 0', background: isLast ? BRAND : '#C8D6F5' }} />
              <span style={{ fontSize: 12, color: SUB }}>{d.q}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 18, borderTop: '1px solid #F2F4F6' }}>
        {[['영업이익률', (last.operating / last.revenue * 100).toFixed(1) + '%'], ['순이익률', (last.net / last.revenue * 100).toFixed(1) + '%'], ['공시 기준', '분기보고서']].map(([k, v], i) => (
          <div key={i} style={{ flex: 1, background: '#F9FAFB', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{v}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TickTape({ stock }) {
  const [tab, setTab] = useState('real');
  const prevClose = stock.price - stock.changeAmt;
  const ticks = useMemo(() => {
    const rnd = seedRand(stock.code + ':tick');
    const ts = tickSize(stock.price);
    let t = 15 * 3600 + 29 * 60 + 50;
    const arr = [];
    for (let i = 0; i < 13; i++) {
      let p = stock.price + Math.round((rnd() - 0.45) * ts * 6 / ts) * ts;
      p = Math.round(p / ts) * ts;
      const qty = Math.max(1, Math.round(rnd() * rnd() * 80));
      const hh = Math.floor(t / 3600), mm = Math.floor((t % 3600) / 60), ss = t % 60;
      arr.push({ p, qty, up: p >= prevClose, time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}` });
      t -= Math.floor(rnd() * 3) + 1;
    }
    return arr;
  }, [stock.code]);
  const daily = useMemo(() => {
    const rnd = seedRand(stock.code + ':daily');
    const arr = []; let p = stock.price;
    for (let i = 0; i < 8; i++) {
      const d = new Date(Date.now() - 86400000 * i);
      const pct = (rnd() - 0.5) * 5;
      const vol = Math.round((0.5 + rnd()) * 1e6);
      arr.push({ date: `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`, close: Math.round(p), pct, vol });
      p = p / (1 + pct / 100);
    }
    return arr;
  }, [stock.code]);
  return (
    <Card style={{ padding: 18 }}>
      <PanelTitle right={
        <div style={{ display: 'flex', gap: 4, background: '#F2F4F6', borderRadius: 9, padding: 3 }}>
          {[['real', '실시간'], ['daily', '일별']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: tab === k ? '#fff' : 'transparent', color: tab === k ? INK : '#8B95A1', boxShadow: tab === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>}>시세</PanelTitle>
      {tab === 'real' ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr 1fr', gap: 4, padding: '0 4px 8px', fontSize: 12, color: SUB, fontWeight: 600 }}>
            <span>체결가</span><span style={{ textAlign: 'right' }}>체결량</span><span style={{ textAlign: 'right' }}>등락률</span><span style={{ textAlign: 'right' }}>시간</span>
          </div>
          {ticks.map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr 1fr', gap: 4, padding: '7px 4px', fontSize: 13, borderTop: '1px solid #F6F8FA' }}>
              <span style={{ fontWeight: 700, color: tone((t.p - prevClose)) }}>{wonShort(t.p)}</span>
              <span style={{ textAlign: 'right', color: '#4E5968' }}>{t.qty}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: tone(t.p - prevClose) }}>{signPct((t.p - prevClose) / prevClose * 100)}</span>
              <span style={{ textAlign: 'right', color: SUB }}>{t.time}</span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.9fr 1.2fr', gap: 4, padding: '0 4px 8px', fontSize: 12, color: SUB, fontWeight: 600 }}>
            <span>일자</span><span style={{ textAlign: 'right' }}>종가</span><span style={{ textAlign: 'right' }}>등락률</span><span style={{ textAlign: 'right' }}>거래량</span>
          </div>
          {daily.map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.9fr 1.2fr', gap: 4, padding: '8px 4px', fontSize: 13, borderTop: '1px solid #F6F8FA' }}>
              <span style={{ color: '#4E5968' }}>{d.date}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: INK }}>{wonShort(d.close)}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: tone(d.pct) }}>{signPct(d.pct)}</span>
              <span style={{ textAlign: 'right', color: SUB }}>{(d.vol / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function OrderBook({ stock }) {
  const prevClose = stock.price - stock.changeAmt;
  const { asks, bids, maxQ } = useMemo(() => {
    const rnd = seedRand(stock.code + ':ob');
    const ts = tickSize(stock.price);
    const asks = [], bids = [];
    for (let i = 5; i >= 1; i--) asks.push({ price: stock.price + i * ts, qty: Math.round(rnd() * 9000 + 300) });
    for (let i = 1; i <= 5; i++) bids.push({ price: stock.price - i * ts, qty: Math.round(rnd() * 9000 + 300) });
    const maxQ = Math.max(...asks.map(a => a.qty), ...bids.map(b => b.qty));
    return { asks, bids, maxQ };
  }, [stock.code]);
  const OBRow = ({ lvl, side }) => {
    const col = side === 'ask' ? DOWN : UP;
    const barPct = (lvl.qty / maxQ) * 100;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 96px 1fr', alignItems: 'center', height: 30 }}>
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
          {side === 'ask' && <>
            <div style={{ position: 'absolute', right: 0, top: 4, bottom: 4, width: barPct + '%', background: DOWN + '14', borderRadius: 4 }} />
            <span style={{ position: 'relative', fontSize: 12, color: '#4E5968', fontWeight: 600 }}>{lvl.qty.toLocaleString()}</span>
          </>}
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: col }}>{wonShort(lvl.price)}</div>
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
          {side === 'bid' && <>
            <div style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: barPct + '%', background: UP + '14', borderRadius: 4 }} />
            <span style={{ position: 'relative', fontSize: 12, color: '#4E5968', fontWeight: 600 }}>{lvl.qty.toLocaleString()}</span>
          </>}
        </div>
      </div>
    );
  };
  return (
    <Card style={{ padding: 18 }}>
      <PanelTitle right={<span style={{ fontSize: 12, color: SUB, whiteSpace: 'nowrap' }}>매도잔량 · 매수잔량</span>}>호가</PanelTitle>
      {asks.map((a, i) => <OBRow key={'a' + i} lvl={a} side="ask" />)}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 38, margin: '4px 0', background: '#F9FAFB', borderRadius: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: tone(stock.pct) }}>{wonShort(stock.price)}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: tone(stock.pct) }}>{signPct(stock.pct)}</span>
      </div>
      {bids.map((b, i) => <OBRow key={'b' + i} lvl={b} side="bid" />)}
    </Card>
  );
}

function Community({ stock }) {
  const { state, addPost, togglePostLike, addComment } = useStore();
  const posts = state.community[stock.code] || [];
  const [text, setText] = useState('');
  const [openId, setOpenId] = useState(null);
  const submit = () => { if (!text.trim()) return; addPost(stock.code, text.trim()); setText(''); };
  return (
    <Card style={{ marginTop: 20 }}>
      <PanelTitle right={<span style={{ fontSize: 13, color: SUB, whiteSpace: 'nowrap' }}>{posts.length}개 글</span>}>커뮤니티 · {stock.name}</PanelTitle>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={`${stock.name}에 대해 질문하거나 의견을 남겨보세요`}
          style={{ flex: 1, height: 46, border: '1px solid #E5E8EB', borderRadius: 12, padding: '0 16px', fontSize: 14, outline: 'none' }} />
        <button onClick={submit} style={{ ...primaryBtn, height: 46, padding: '0 22px', whiteSpace: 'nowrap' }}>등록</button>
      </div>
      {posts.length === 0 ? <div style={{ fontSize: 14, color: SUB, textAlign: 'center', padding: '24px 0' }}>첫 번째 글을 남겨보세요.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map(post => (
            <div key={post.id} style={{ borderTop: '1px solid #F2F4F6', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: post.author === '나' ? BRAND : '#D1D6DB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{post.author.charAt(0)}</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{post.author}</span>
                <span style={{ fontSize: 12, color: SUB }}>{timeAgo(post.ts)}</span>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: '#333D4B', marginBottom: 10 }}>{post.text}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => togglePostLike(stock.code, post.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: post.liked ? UP : SUB }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={post.liked ? UP : 'none'} stroke={post.liked ? UP : SUB} strokeWidth="2"><path d="M7 11v9H4V11zM7 11l4-7c1.5 0 2.5 1 2.5 2.5V9h5c1.1 0 1.9 1 1.6 2l-1.6 7c-.2.9-1 1.5-2 1.5H7" strokeLinejoin="round" /></svg>
                  {post.likes}
                </button>
                <button onClick={() => setOpenId(openId === post.id ? null : post.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: SUB }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" strokeLinejoin="round" /></svg>
                  답글 {post.comments.length}
                </button>
              </div>
              {openId === post.id && (
                <div style={{ marginTop: 12, paddingLeft: 14, borderLeft: '2px solid #F2F4F6', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {post.comments.map(c => (
                    <div key={c.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{c.author}</span>
                        <span style={{ fontSize: 11, color: SUB }}>{timeAgo(c.ts)}</span>
                      </div>
                      <div style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.5 }}>{c.text}</div>
                    </div>
                  ))}
                  <CommentBox onSubmit={(t) => addComment(stock.code, post.id, t)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
function CommentBox({ onSubmit }) {
  const [v, setV] = useState('');
  const go = () => { if (!v.trim()) return; onSubmit(v.trim()); setV(''); };
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} placeholder="답글 달기"
        style={{ flex: 1, height: 38, border: '1px solid #E5E8EB', borderRadius: 10, padding: '0 12px', fontSize: 13, outline: 'none' }} />
      <button onClick={go} style={{ height: 38, padding: '0 16px', borderRadius: 10, border: 'none', background: '#F2F4F6', color: '#4E5968', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>등록</button>
    </div>
  );
}
