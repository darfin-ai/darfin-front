import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useStore, seedRand } from '../store/store.jsx';
import { useLocale } from '../../../shared/i18n';
import { getQuestions } from '../../community/api/communityApi.js';
import {
  fetchCandleData, fetchOrderBook, fetchExecutions, fetchDailyPrices, fetchStockInfo,
  fetchPaperTradingBalance, fetchPaperTradingHolding, placeBuyOrder, placeSellOrder,
} from '../lib/stockApi.js';
import {
  UP, DOWN, SUB, INK, BRAND,
  won, wonShort, signPct, signNum, tone, timeAgo,
  Avatar, Card, Heart, Modal, primaryBtn, iconBtn, CandleChart, Stub, Skeleton, SkeletonText, displayStockName,
  useTradingFormat, LoginGate,
} from '../components/ui.jsx';

const PERIODS = [
  { key: '1D', label: '일', n: 120 },
  { key: '1W', label: '주', n: 40 },
  { key: '1M', label: '월', n: 24 },
  { key: '1Y', label: '년', n: 10 },
];
const MASTER_CANDLES = 250;

function InteractiveChart({ allCandles, allDates, currentPrice, w, h, showMA5, showMA20, volH, count, resetKey }) {
  const { t } = useLocale();
  const total = allCandles.length;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const visible = clamp(count, 3, total);
  const [start, setStart] = useState(Math.max(0, total - visible));
  const ref = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    setStart(Math.max(0, total - clamp(count, 3, total)));
  }, [resetKey, total]);

  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, start };
    if (ref.current && ref.current.setPointerCapture) try { ref.current.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const onPointerMove = (e) => {
    if (!drag.current || !ref.current) return;
    const candleW = ref.current.getBoundingClientRect().width / visible;
    const dx = Math.round((e.clientX - drag.current.x) * 0.18 / candleW);
    setStart(clamp(drag.current.start - dx, 0, total - visible));
  };
  const endDrag = () => { drag.current = null; };
  const slice = allCandles.slice(start, start + visible);
  const sliceDates = allDates ? allDates.slice(start, start + visible) : undefined;
  const atEnd = start + visible >= total;

  return (
    <div>
      <div ref={ref} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerLeave={endDrag}
        style={{ cursor: drag.current ? 'grabbing' : 'grab', touchAction: 'pan-y', userSelect: 'none', overflow: 'hidden' }}>
        <CandleChart candles={slice} w={w} h={h} showMA5={showMA5} showMA20={showMA20} volH={volH}
          currentPrice={atEnd ? currentPrice : undefined}
          dates={sliceDates} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: SUB }}>
        <span>{t('trading.chart.past')}</span>
        <span>{t('trading.chart.dragHint')}</span>
        <span>{atEnd ? t('trading.chart.current') : t('trading.chart.recent')}</span>
      </div>
      {sliceDates && sliceDates.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: SUB, textAlign: 'right' }}>
          {sliceDates.length === 1 ? sliceDates[0] : `${sliceDates[0]} ~ ${sliceDates[sliceDates.length - 1]}`}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
      <span style={{ fontSize: 14, color: SUB, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: bold ? 17 : 14, fontWeight: bold ? 800 : 600, color: color || INK, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
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

// 시가총액(원) → "4조 2,100억" / "4,210억" 형식
function formatMarketCap(won) {
  const eok = Math.round(won / 1e8);
  if (eok >= 10000) {
    const jo = Math.floor(eok / 10000);
    const rest = eok % 10000;
    return `${jo}조${rest ? ' ' + rest.toLocaleString() + '억' : ''}`;
  }
  return `${eok.toLocaleString()}억`;
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

function ChartSkeleton({ height = 360 }) {
  return (
    <div style={{ height, position: 'relative', padding: '18px 8px 38px' }}>
      <div style={{ position: 'absolute', inset: '18px 8px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={1} radius={1} />)}
      </div>
      <div style={{ position: 'absolute', left: 12, right: 72, bottom: 76, height: height - 126, display: 'flex', alignItems: 'flex-end', gap: 5 }}>
        {Array.from({ length: 44 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={36 + ((i * 19) % 170)} radius={3} style={{ flex: 1 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 12, right: 72, bottom: 24, display: 'flex', alignItems: 'flex-end', gap: 5 }}>
        {Array.from({ length: 44 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={10 + ((i * 11) % 34)} radius={2} style={{ flex: 1 }} />
        ))}
      </div>
      <Skeleton width={56} height={22} radius={6} style={{ position: 'absolute', right: 4, top: 72 }} />
    </div>
  );
}

function OrderBookSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={'a' + i} style={{ display: 'grid', gridTemplateColumns: '1fr 96px 1fr', alignItems: 'center', height: 30 }}>
          <Skeleton width={`${38 + i * 9}%`} height={16} radius={4} style={{ justifySelf: 'end' }} />
          <Skeleton width={58} height={16} style={{ justifySelf: 'center' }} />
          <span />
        </div>
      ))}
      <Skeleton height={38} radius={10} style={{ margin: '4px 0' }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={'b' + i} style={{ display: 'grid', gridTemplateColumns: '1fr 96px 1fr', alignItems: 'center', height: 30 }}>
          <span />
          <Skeleton width={58} height={16} style={{ justifySelf: 'center' }} />
          <Skeleton width={`${78 - i * 8}%`} height={16} radius={4} />
        </div>
      ))}
    </>
  );
}

function QuoteRowsSkeleton({ count = 6, columns = '1.2fr 0.9fr 0.9fr 1fr' }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} style={{ display: 'grid', gridTemplateColumns: columns, gap: 4, padding: '8px 4px', borderTop: '1px solid #F6F8FA' }}>
      <Skeleton width={68} height={13} />
      <Skeleton width={44} height={13} style={{ justifySelf: 'end' }} />
      <Skeleton width={54} height={13} style={{ justifySelf: 'end' }} />
      <Skeleton width={58} height={13} style={{ justifySelf: 'end' }} />
    </div>
  ));
}

function formatTradeTime(value) {
  if (!value) return '방금 전';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderResultModal({ result, onClose }) {
  const { t } = useLocale();
  const { won, signNum, qtyShares } = useTradingFormat();
  const isBuy = result.side === 'BUY';
  const accent = isBuy ? UP : DOWN;
  const holding = result.holding;
  const balance = result.balance;
  const realizedPnl = result.realizedPnl ?? 0;

  return (
    <Modal onClose={onClose} width={500}>
      <div style={{ padding: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, background: accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: INK, marginBottom: 4 }}>{t('trading.format.orderComplete', { side: isBuy ? t('trading.detail.buy') : t('trading.detail.sell') })}</div>
            <div style={{ fontSize: 13, color: SUB }}>{formatTradeTime(result.tradedAt)} · {result.orderType === 'MARKET' ? t('trading.detail.market') : t('trading.detail.limit')}</div>
          </div>
        </div>

        <div style={{ border: '1px solid #EEF1F4', borderRadius: 16, padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Avatar stock={result.stock} size={42} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.stockName}</div>
              <div style={{ fontSize: 12, color: SUB }}>{result.stockCode}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 900, color: accent, background: accent + '12', padding: '6px 10px', borderRadius: 8 }}>
              {isBuy ? t('trading.detail.buy') : t('trading.detail.sell')}
            </span>
          </div>
          <Row label={t('trading.detail.execPrice')} value={won(result.price)} bold />
          <Row label={t('trading.detail.execQty')} value={qtyShares(result.quantity)} />
          <Row label={t('trading.detail.totalOrder')} value={won(result.totalAmount)} bold color={INK} />
          {!isBuy && (
            <Row label={t('trading.trades.colRealizedPnl')} value={(realizedPnl > 0 ? '+' : '') + won(realizedPnl)} color={tone(realizedPnl)} bold />
          )}
        </div>

        <div style={{ background: 'var(--trading-muted-bg-strong, #F9FAFB)', borderRadius: 16, padding: 18, marginBottom: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: INK, marginBottom: 12 }}>{t('trading.detail.myHolding')}</div>
          <Row label={t('trading.detail.availableToOrder', { amount: '' }).trim()} value={balance?.availableBalance == null ? '-' : won(balance.availableBalance)} bold />
          <Row label={t('trading.detail.myHolding')} value={holding?.quantity == null ? '-' : qtyShares(holding.quantity)} />
        </div>

        <button onClick={onClose} style={{ ...primaryBtn, width: '100%', height: 52, fontSize: 16, fontWeight: 900 }}>
          {t('trading.funds.continue')}
        </button>
      </div>
    </Modal>
  );
}

function OrderPanel({ stock, price, setPrice, priceType, setPriceType }) {
  const { state, refreshPortfolio } = useStore();
  const { t } = useLocale();
  const { won, wonShort, signPct, signNum, qtyShares } = useTradingFormat();
  const ts = tickSize(stock.price);
  const [tab, setTab] = useState('BUY'); // 'BUY' | 'SELL' | 'HOLDING'
  const [balance, setBalance] = useState(null); // API 1: { availableBalance }
  const [holding, setHolding] = useState(null); // API 2: { quantity, avgBuyPrice, valuationPnl, valuationPnlRate, ... }
  const [accountLoading, setAccountLoading] = useState(true);
  const [qty, setQty] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [orderError, setOrderError] = useState(null);

  const isBuy = tab === 'BUY';
  const isSell = tab === 'SELL';

  // 탭 전환/종목 변경 시마다 잔액·보유 현황 재조회
  const refresh = () => {
    setAccountLoading(true);
    Promise.allSettled([
      fetchPaperTradingBalance().then(setBalance).catch(() => setBalance(null)),
      fetchPaperTradingHolding(stock.code).then(setHolding).catch(() => setHolding(null)),
    ]).finally(() => setAccountLoading(false));
  };
  // stock.code가 빠르게 바뀌면(연속 탐색) 이전 종목 응답이 늦게 도착해 새 종목 값을 덮어쓸 수 있어 취소 가드 필요
  useEffect(() => {
    if (!state.isLoggedIn) { setAccountLoading(false); return; } // 비로그인은 위 게이트가 대신 렌더되므로 401 호출 자체를 안 보낸다
    let cancelled = false;
    setAccountLoading(true);
    Promise.allSettled([
      fetchPaperTradingBalance().then(data => { if (!cancelled) setBalance(data); }).catch(() => { if (!cancelled) setBalance(null); }),
      fetchPaperTradingHolding(stock.code).then(data => { if (!cancelled) setHolding(data); }).catch(() => { if (!cancelled) setHolding(null); }),
    ]).finally(() => { if (!cancelled) setAccountLoading(false); });
    return () => { cancelled = true; };
  }, [tab, stock.code, state.isLoggedIn]);
  useEffect(() => { setQty(0); setOrderError(null); }, [tab, stock.code]);

  const effPrice = priceType === 'market' ? stock.price : price;
  const priceValid = effPrice > 0; // 지정가를 0으로 지웠을 때 최대수량/제출이 뚫리는 걸 방지
  const cash = balance?.availableBalance ?? 0;
  const ownedQty = holding?.quantity ?? 0;
  const maxQty = isBuy ? (priceValid ? Math.floor(cash / effPrice) : 0) : ownedQty;
  const total = qty * effPrice;
  const isValidOrder = qty > 0 && priceValid && (isBuy ? total <= cash : qty <= ownedQty);
  const canSubmit = !submitting && isValidOrder;

  const stepPrice = (d) => setPrice(p => Math.max(ts, Math.round((p + d * ts) / ts) * ts));
  const ratio = (r) => setQty(Math.max(0, Math.floor(maxQty * r)));

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setOrderError(null);
    const body = {
      stockCode: stock.code,
      orderType: priceType === 'market' ? 'MARKET' : 'LIMIT',
      price: priceType === 'market' ? null : effPrice,
      quantity: qty,
    };
    const submittedSide = isBuy ? 'BUY' : 'SELL';
    const submittedPrice = effPrice;
    const submittedTotal = total;
    try {
      const order = isBuy ? await placeBuyOrder(body) : await placeSellOrder(body);
      setQty(0);
      setAccountLoading(true);
      const [balanceRes, holdingRes] = await Promise.allSettled([
        fetchPaperTradingBalance(),
        fetchPaperTradingHolding(stock.code),
        refreshPortfolio(), // "내 자산" 페이지의 잔액·보유(state.holdings/funds)도 즉시 갱신
      ]);
      const nextBalance = balanceRes.status === 'fulfilled' ? balanceRes.value : null;
      const nextHolding = holdingRes.status === 'fulfilled' ? holdingRes.value : null;
      setBalance(nextBalance);
      setHolding(nextHolding);
      setOrderResult({
        order,
        side: submittedSide,
        orderType: body.orderType,
        stock: { ...stock, name: order.stockName },
        stockCode: order.stockCode || stock.code,
        stockName: displayStockName({ ...stock, name: order.stockName }),
        quantity: Number(order.quantity ?? body.quantity) || 0,
        price: Number(order.price ?? submittedPrice) || 0,
        totalAmount: Number(order.totalAmount ?? submittedTotal) || 0,
        realizedPnl: order.realizedPnl,
        tradedAt: order.tradedAt || Date.now(),
        balance: nextBalance,
        holding: nextHolding,
      });
    } catch (e) {
      setOrderError(e?.response?.data?.message || t('trading.detail.orderFail', { side: isBuy ? t('trading.detail.buy') : t('trading.detail.sell') }));
    } finally {
      setSubmitting(false);
      setAccountLoading(false);
    }
  };

  const accent = isBuy ? UP : DOWN;
  const lblStyle = { fontSize: 14, color: SUB, fontWeight: 600, flexShrink: 0, width: 72 };
  const obStep = { width: 44, height: 48, flexShrink: 0, borderRadius: 10, border: '1px solid #E5E8EB', background: 'var(--trading-card, #fff)', fontSize: 20, fontWeight: 700, color: SUB, cursor: 'pointer' };

  if (!state.isLoggedIn) {
    return (
      <Card style={{ padding: 20 }}>
        <PanelTitle right={<span style={{ fontSize: 12, color: SUB, whiteSpace: 'nowrap' }}>{t('trading.detail.paperTrading')}</span>}>{t('trading.detail.generalOrder')}</PanelTitle>
        <LoginGate />
      </Card>
    );
  }

  return (
    <Card style={{ padding: 20 }}>
      <PanelTitle right={<span style={{ fontSize: 12, color: SUB, whiteSpace: 'nowrap' }}>{t('trading.detail.paperTrading')}</span>}>{t('trading.detail.generalOrder')}</PanelTitle>

      <div style={{ display: 'flex', background: 'var(--trading-muted-bg, #F2F4F6)', borderRadius: 12, padding: 4, marginBottom: 18 }}>
        {[['BUY', t('trading.detail.buy'), UP], ['SELL', t('trading.detail.sell'), DOWN], ['HOLDING', t('trading.detail.myHolding'), INK]].map(([k, l, c]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex: 1, height: 40, borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 800,
              background: tab === k ? 'var(--trading-card, #fff)' : 'transparent', color: tab === k ? c : SUB,
              boxShadow: tab === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
        ))}
      </div>

      {tab === 'HOLDING' ? (
        accountLoading ? (
          <SkeletonText lines={3} widths={['100%', '88%', '96%']} height={18} gap={14} />
        ) : ownedQty > 0 ? (
          <div>
            <Row label={t('trading.detail.qtyHeld')} value={qtyShares(holding.quantity)} />
            <Row label={t('trading.detail.avgBuyPrice')} value={won(holding.avgBuyPrice)} />
            <Row label={t('trading.detail.valuationPnl')} value={`${(holding.valuationPnl > 0 ? '+' : '') + won(holding.valuationPnl)} (${signPct(holding.valuationPnlRate)})`} color={tone(holding.valuationPnlRate)} bold />
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: SUB, fontSize: 14, padding: '40px 0' }}>{t('trading.detail.noHolding')}</div>
        )
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <span style={lblStyle}>{t('trading.detail.orderType')}</span>
            <div style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E5E8EB', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 14, fontWeight: 700, color: INK, justifyContent: 'space-between' }}>
              {t('trading.detail.regularSessionOrder')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span style={lblStyle}>{isBuy ? t('trading.detail.buyPrice') : t('trading.detail.sellPrice')}</span>
            <div style={{ flex: 1, display: 'flex', background: 'var(--trading-muted-bg, #F2F4F6)', borderRadius: 10, padding: 3 }}>
              {[['limit', t('trading.detail.limit')], ['market', t('trading.detail.market')]].map(([k, l]) => (
                <button key={k} onClick={() => setPriceType(k)} style={{ flex: 1, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: priceType === k ? 'var(--trading-card, #fff)' : 'transparent', color: priceType === k ? INK : SUB, boxShadow: priceType === k ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 72, flexShrink: 0 }} />
            {priceType === 'market' ? (
              <div style={{ flex: 1, height: 48, borderRadius: 10, background: 'var(--trading-muted-bg-strong, #F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: SUB }}>{t('trading.detail.marketAt', { price: won(stock.price) })}</div>
            ) : (
              <>
                <button onClick={() => stepPrice(-1)} style={obStep}>−</button>
                <div style={{ flex: 1, height: 48, borderRadius: 10, border: '1px solid #E5E8EB', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px' }}>
                  <input value={wonShort(price)} onChange={e => { const n = parseInt(e.target.value.replace(/\D/g, '')) || 0; setPrice(n); }}
                    style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'right', fontSize: 18, fontWeight: 800, color: INK, background: 'transparent' }} />
                  <span style={{ fontSize: 14, color: SUB, marginLeft: 4 }}>{t('trading.units.won')}</span>
                </div>
                <button onClick={() => stepPrice(1)} style={obStep}>＋</button>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={lblStyle}>{t('trading.detail.quantity')}</span>
            <button onClick={() => setQty(q => Math.max(0, q - 1))} style={obStep}>−</button>
            <div style={{ flex: 1, height: 48, borderRadius: 10, border: '1px solid #E5E8EB', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px' }}>
              <input value={qty === 0 ? '' : qty} placeholder={t('trading.detail.qtyPlaceholder')} onChange={e => { const n = parseInt(e.target.value.replace(/\D/g, '')) || 0; setQty(n); }}
                style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'right', fontSize: 18, fontWeight: 800, color: INK, background: 'transparent' }} />
              <span style={{ fontSize: 14, color: SUB, marginLeft: 4 }}>{t('trading.units.shares')}</span>
            </div>
            <button onClick={() => setQty(q => q + 1)} style={obStep}>＋</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {[[0.1, t('trading.ratios.r10')], [0.25, t('trading.ratios.r25')], [0.5, t('trading.ratios.r50')], [1, t('trading.ratios.max')]].map(([r, l]) => (
              <button key={l} onClick={() => ratio(r)} style={{ flex: 1, height: 36, borderRadius: 10, border: '1px solid #E5E8EB', background: 'var(--trading-card, #fff)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: SUB }}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <span style={lblStyle}>{t('trading.detail.totalOrder')}</span>
            <div style={{ flex: 1, height: 48, borderRadius: 10, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 14px', fontSize: 18, fontWeight: 800, color: total > 0 ? INK : '#C5CBD3' }}>
              {total > 0 ? won(total) : t('trading.detail.enterAmount')}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: SUB, marginBottom: 16 }}>
            {accountLoading ? (
              <Skeleton width={150} height={13} style={{ marginLeft: 'auto' }} />
            ) : isBuy ? t('trading.detail.availableToOrder', { amount: won(cash) }) : t('trading.detail.ownedQty', { qty: ownedQty })}
          </div>

          {submitting && (
            <div style={{ fontSize: 13, color: SUB, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
              {isBuy ? t('trading.detail.buyProcessing') : t('trading.detail.sellProcessing')}
            </div>
          )}

          {!submitting && !accountLoading && !isValidOrder && qty > 0 && (
            <div style={{ fontSize: 13, color: UP, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
              {!priceValid ? t('trading.detail.enterPrice') : isBuy ? t('trading.detail.insufficientCash') : t('trading.detail.exceedsOwned')}
            </div>
          )}

          {orderError && (
            <div style={{ fontSize: 13, color: DOWN, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
              {orderError}
            </div>
          )}

          <button onClick={submit} disabled={!canSubmit} style={{
            width: '100%', height: 54, borderRadius: 14, border: 'none', fontSize: 17, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed',
            background: canSubmit ? accent : '#E5E8EB', color: canSubmit ? '#fff' : '#B0B8C1' }}>
            {submitting ? (isBuy ? t('trading.detail.buyProcessing') : t('trading.detail.sellProcessing')) : qty > 0 ? (isBuy ? t('trading.detail.buySubmit', { amount: won(total) }) : t('trading.detail.sellSubmit', { amount: won(total) })) : (isBuy ? t('trading.detail.buyAction') : t('trading.detail.sellAction'))}
          </button>
        </>
      )}

      {orderResult && <OrderResultModal result={orderResult} onClose={() => setOrderResult(null)} />}
    </Card>
  );
}

function DetailTabs({ stock, info }) {
  const { t } = useLocale();
  const [tab, setTab] = useState('info');
  const tabs = [
    { key: 'info', label: t('trading.detail.stockInfo') }
  ];
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #EEF1F4', padding: '0 8px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ position: 'relative', padding: '16px 16px', border: 'none', background: 'none',
            cursor: 'pointer', fontSize: 15, fontWeight: 700, color: tab === t.key ? INK : '#8B95A1', whiteSpace: 'nowrap' }}>
            {t.label}
            {tab === t.key && <span style={{ position: 'absolute', left: 12, right: 12, bottom: -1, height: 3, background: BRAND, borderRadius: 2 }} />}
          </button>
        ))}
      </div>
      <div style={{ padding: 24 }}>
        {tab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px 24px' }}>
                {info.map(([k, v], i) => (
              <div key={i}>
                <div style={{ fontSize: 13, color: SUB, marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'fin' && <FinancialsChart stock={stock} bare />}
        {tab === 'community' && <Community stock={stock} bare />}
      </div>
    </Card>
  );
}

export function Detail() {
  const { state, getStock, genCandles, navigate, toggleWatch, subscribeDetail } = useStore();
  const { t } = useLocale();
  const { won, wonShort, signPct, signNum, formatMarketCap, formatRankValue } = useTradingFormat();
  const code = state.route.params.code;
  const stock = getStock(code);

  // 상세 페이지 마운트/종목 변경 시 실시간 체결(EXECUTION) 구독 1회 전송
  useEffect(() => { subscribeDetail(code); }, [code, subscribeDetail]);
  const [period, setPeriod] = useState('1W');
  const [ma5, setMa5] = useState(true);
  const [ma20, setMa20] = useState(false);
  const [orderPrice, setOrderPrice] = useState(stock?.price || 0);
  const [priceType, setPriceType] = useState('limit');
  const [apiCandles, setApiCandles] = useState(null);        // 일봉: null=로딩, []=실패, [...]=성공
  const [candlesLoading, setCandlesLoading] = useState(true);
  const [stockInfo, setStockInfo] = useState(undefined);     // 종목 개요: undefined=로딩("...") | null=404·에러("-") | { marketCap, week52High, week52Low, per, sector }

  // 종목 개요 API 호출 (종목 변경 시 1회) — 404(데이터 없음)면 '-' 표시
  useEffect(() => {
    let cancelled = false;
    setStockInfo(undefined);
    fetchStockInfo(code)
      .then(data => { if (!cancelled) setStockInfo(data); })
      .catch(() => { if (!cancelled) setStockInfo(null); });
    return () => { cancelled = true; };
  }, [code]);

  // 종목 변경 시 주문가 리셋
  useEffect(() => { setOrderPrice(stock?.price || 0); }, [code]);
  // 처음 stock이 로드될 때 주문가 초기화 (code 변경 이후 stock이 뒤늦게 세팅되는 경우)
  useEffect(() => {
    if (stock?.price && orderPrice === 0) setOrderPrice(stock.price);
  }, [stock?.price]);

  // 일봉 데이터 API 호출 (종목 변경 시 1회)
  useEffect(() => {
    let cancelled = false;
    setCandlesLoading(true);
    setApiCandles(null);
    fetchCandleData(code)
      .then(data => { console.log(data);
        if (!cancelled) setApiCandles(data); })
      .catch(() => { if (!cancelled) setApiCandles([]); })
      .finally(() => { if (!cancelled) setCandlesLoading(false); });
    return () => { cancelled = true; };
  }, [code]);

  const periodObj = PERIODS.find(p => p.key === period) || PERIODS[1];
  const expectedCount = periodObj.n;

  const formatCandleDate = (date, unit = '1D') => {
    if (!date) return '';
    if (unit === '1W') {
      return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
    }
    if (unit === '1M') {
      return `${date.slice(0, 4)}.${date.slice(4, 6)}`;
    }
    if (unit === '1Y') {
      return `${date.slice(0, 4)}`;
    }
    if (date.length >= 8) {
      return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
    }
    if (date.length === 10) {
      return `${date.slice(4, 6)}.${date.slice(6, 8)} ${date.slice(8, 10)}${t('trading.format.hourSuffix')}`;
    }
    return date;
  };

  const mapCandles = (candles, unit = '1D') => candles.map((c, i) => {
    const rawDate = c.dateLabel || c.date || c.D || '';
    return {
      i,
      open: c.open,
      close: c.close,
      hi: c.high ?? c.hi,
      lo: c.low ?? c.lo,
      volume: c.volume ?? c.vol,
      date: c.dateLabel || formatCandleDate(rawDate, unit),
    };
  });

  const getWeekKey = (date) => {
    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(4, 6)) - 1;
    const day = Number(date.slice(6, 8));
    const dt = new Date(year, month, day);
    const dayOfWeek = dt.getDay();
    const monday = new Date(dt);
    monday.setDate(dt.getDate() - ((dayOfWeek + 6) % 7));
    const y = monday.getFullYear();
    const m = String(monday.getMonth() + 1).padStart(2, '0');
    const d = String(monday.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  const aggregateDailyCandles = (candles, unit) => {
    if (!candles || !candles.length) return [];
    const groups = new Map();
    candles.forEach((c) => {
      const date = c.date || c.D;
      if (!date || date.length < 8) return;
      let key;
      let label;
      if (unit === '1W') {
        key = getWeekKey(date);
        label = formatCandleDate(key, '1W');
      } else if (unit === '1M') {
        key = `${date.slice(0, 4)}${date.slice(4, 6)}`;
        label = formatCandleDate(`${key}01`, '1M');
      } else if (unit === '1Y') {
        key = date.slice(0, 4);
        label = formatCandleDate(`${key}0101`, '1Y');
      } else {
        key = date.slice(0, 8);
        label = formatCandleDate(key, '1D');
      }
      const open = c.open ?? c.O;
      const close = c.close ?? c.C;
      const high = c.high ?? c.H;
      const low = c.low ?? c.L;
      const volume = c.volume ?? c.V ?? 0;
      const prev = groups.get(key);
      if (!prev) {
        groups.set(key, { key, dateLabel: label, open, close, hi: high, lo: low, volume });
      } else {
        groups.set(key, {
          key,
          dateLabel: prev.dateLabel,
          open: prev.open,
          close,
          hi: Math.max(prev.hi, high),
          lo: Math.min(prev.lo, low),
          volume: prev.volume + volume,
        });
      }
    });
    return Array.from(groups.values());
  };

  const allCandles = useMemo(() => {
    if (!apiCandles || apiCandles.length === 0) {
      return stock ? mapCandles(genCandles(stock, expectedCount)) : [];
    }
    if (period === '1D') {
      return mapCandles(apiCandles.slice(-expectedCount), '1D');
    }
    if (period === '1W') {
      return mapCandles(aggregateDailyCandles(apiCandles, '1W').slice(-expectedCount), '1W');
    }
    if (period === '1M') {
      return mapCandles(aggregateDailyCandles(apiCandles, '1M').slice(-expectedCount), '1M');
    }
    if (period === '1Y') {
      return mapCandles(aggregateDailyCandles(apiCandles, '1Y').slice(-expectedCount), '1Y');
    }
    return mapCandles(apiCandles.slice(-expectedCount), '1D');
  }, [apiCandles, period, stock, expectedCount]);

  const candleDates = useMemo(() => allCandles.map(c => c.date || ''), [allCandles]);

  // 마지막 캔들을 현재가로 실시간 업데이트
  const liveCandles = useMemo(() => {
    if (!allCandles.length || !stock?.price) return allCandles;
    const last = allCandles[allCandles.length - 1];
    return [...allCandles.slice(0, -1), {
      ...last,
      close: stock.price,
      hi: Math.max(last.hi, stock.price),
      lo: Math.min(last.lo, stock.price),
    }];
  }, [allCandles, stock?.price]);

  if (!stock) return <Stub name={t('trading.detail.notFound')} />;
  const col = tone(stock.pct);
  const watched = state.watchlist.includes(code);

  const infoLoading = stockInfo === undefined;
  const infoField = (val, formatter) => infoLoading ? <Skeleton width={92} height={18} /> : (val == null ? '-' : formatter(val));
  const info = [
    [t('trading.detail.marketCap'), infoField(stockInfo?.marketCap, formatMarketCap)],
    [t('trading.detail.tradeValue'), formatRankValue(stock.value ?? 0, 'tradeValue')],
    [t('trading.detail.week52High'), infoField(stockInfo?.week52High, won)],
    [t('trading.detail.week52Low'), infoField(stockInfo?.week52Low, won)],
    [t('trading.detail.per'), infoField(stockInfo?.per, v => t('trading.format.perTimes', { n: v.toFixed(2) }))],
    [t('trading.detail.sector'), infoField(stockInfo?.sector, v => v)],
  ];

  return (
    <div style={{ maxWidth: 1480, margin: '0 auto', padding: '24px 28px 80px' }}>
      <button onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #E5E8EB', background: 'var(--trading-card, #fff)', color: SUB, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 18, whiteSpace: 'nowrap', height: 44, padding: '0 18px', borderRadius: 12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        {t('trading.detail.backToChart')}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <Avatar stock={stock} size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{displayStockName(stock)}</span>
                <span style={{ fontSize: 14, color: SUB }}>{stock.code}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: INK, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{won(stock.price)}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: col, whiteSpace: 'nowrap' }}>{signNum(stock.changeAmt)} ({signPct(stock.pct)})</span>
              </div>
            </div>
            <Heart filled={watched} onClick={() => toggleWatch(code)} size={26} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 332px', gap: 20, marginBottom: 20, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6, background: '#F2F4F6', borderRadius: 12, padding: 4 }}>
                    {PERIODS.map(p => (
                      <button key={p.key} onClick={() => setPeriod(p.key)} style={{ padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700, background: period === p.key ? 'var(--trading-card, #fff)' : 'transparent', color: period === p.key ? INK : SUB,
                        boxShadow: period === p.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{t({
                          '1D': 'trading.chart.periodDay',
                          '1W': 'trading.chart.periodWeek',
                          '1M': 'trading.chart.periodMonth',
                          '1Y': 'trading.chart.periodYear',
                        }[p.key])}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <MAToggle on={ma5} color="#F5A623" label="MA5" onClick={() => setMa5(v => !v)} />
                    <MAToggle on={ma20} color="#7C3AED" label="MA20" onClick={() => setMa20(v => !v)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 18, marginBottom: 8, fontSize: 12, color: SUB }}>
                  <span><span style={{ color: UP, fontWeight: 800 }}>■</span> {t('trading.chart.bullish')}</span>
                  <span><span style={{ color: DOWN, fontWeight: 800 }}>■</span> {t('trading.chart.bearish')}</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2" strokeLinecap="round"><path d="M5 9l-3 3 3 3M19 9l3 3-3 3M2 12h20" /></svg>
                    {t('trading.chart.dragMove')}
                  </span>
                </div>
                {candlesLoading ? (
                  <ChartSkeleton height={360} />
                ) : (
                  <InteractiveChart allCandles={liveCandles} allDates={candleDates} currentPrice={stock.price}
                    w={596} h={360} showMA5={ma5} showMA20={ma20} volH={70} count={periodObj.n} resetKey={period + code} />
                )}
              </Card>
              <DetailTabs stock={stock} info={info} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <OrderBook stock={stock} selectedPrice={priceType === 'limit' ? orderPrice : null}
                onPick={(p) => { setPriceType('limit'); setOrderPrice(p); }} />
              <TickTape stock={stock} />
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <OrderPanel stock={stock} price={orderPrice} setPrice={setOrderPrice} priceType={priceType} setPriceType={setPriceType} />
        </div>
      </div>
    </div>
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

function FinancialsChart({ stock, bare }) {
  const { t } = useLocale();
  const { eokKMan, signPct } = useTradingFormat();
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
  const labels = { revenue: t('trading.format.finRevenue'), operating: t('trading.format.finOperating'), net: t('trading.format.finNet') };
  const vals = data.map(d => d[metric]);
  const max = Math.max(...vals) * 1.18;
  const last = data[data.length - 1], yoyBase = data[data.length - 5] || data[0];
  const yoy = yoyBase[metric] ? ((last[metric] - yoyBase[metric]) / Math.abs(yoyBase[metric]) * 100) : 0;
  const fmt = eokKMan;
  const metricTabs = (
    <div style={{ display: 'flex', gap: 4, background: '#F2F4F6', borderRadius: 10, padding: 4 }}>
      {Object.entries(labels).map(([k, l]) => (
        <button key={k} onClick={() => setMetric(k)} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
          background: metric === k ? '#fff' : 'transparent', color: metric === k ? INK : '#8B95A1', boxShadow: metric === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
      ))}
    </div>
  );
  const body = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{fmt(last[metric])}</span>
        <span style={{ fontSize: 14, color: SUB, whiteSpace: 'nowrap' }}>{last.q} {labels[metric]}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: tone(yoy), marginLeft: 'auto', whiteSpace: 'nowrap' }}>{t('trading.format.yoyCompare', { rate: signPct(yoy) })}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, height: 170 }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d[metric] / max) * 150);
          const isLast = i === data.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8, height: '100%' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: isLast ? BRAND : SUB, whiteSpace: 'nowrap' }}>{d[metric] >= 10000 ? t('trading.format.revenueJo', { n: (d[metric] / 10000).toFixed(1) }) : d[metric].toLocaleString()}</span>
              <div style={{ width: '70%', maxWidth: 56, height: h, borderRadius: '8px 8px 0 0', background: isLast ? BRAND : '#C8D6F5' }} />
              <span style={{ fontSize: 12, color: SUB }}>{d.q}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 18, borderTop: '1px solid #F2F4F6' }}>
        {[[t('trading.format.operatingMargin'), (last.operating / last.revenue * 100).toFixed(1) + '%'], [t('trading.format.netMargin'), (last.net / last.revenue * 100).toFixed(1) + '%'], [t('trading.format.filingBasis'), t('trading.format.quarterlyReport')]].map(([k, v], i) => (
          <div key={i} style={{ flex: 1, background: 'var(--trading-muted-bg-strong, #F9FAFB)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{v}</div>
          </div>
        ))}
      </div>
    </>
  );
  if (bare) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 13, color: SUB, fontWeight: 600 }}>{t('trading.format.recentQuarters')}</span>
        {metricTabs}
      </div>
      {body}
    </div>
  );
  return (
    <Card style={{ marginBottom: 20 }}>
      <PanelTitle right={metricTabs}>{t('trading.detail.finTrend')}</PanelTitle>
      {body}
    </Card>
  );
}

function TickTape({ stock }) {
  const { lastExecution } = useStore();
  const { t } = useLocale();
  const { wonShort, signPct } = useTradingFormat();
  const [tab, setTab] = useState('real');
  const [expanded, setExpanded] = useState(false);
  const [ticks, setTicks] = useState([]);
  const [ticksLoading, setTicksLoading] = useState(true);

  // 최근 체결 초기 로드 (종목 변경 시 1회)
  useEffect(() => {
    let cancelled = false;
    setTicks([]);
    setTicksLoading(true);
    fetchExecutions(stock.code)
      .then(data => { if (!cancelled) setTicks((data || []).slice(0, 50)); })
      .catch(() => { if (!cancelled) setTicks([]); })
      .finally(() => { if (!cancelled) setTicksLoading(false); });
    return () => { cancelled = true; };
  }, [stock.code]);

  // 실시간 체결(EXECUTION) 수신 시 맨 앞에 추가, 최대 50개 유지
  useEffect(() => {
    if (!lastExecution) return;
    setTicks(prev => [lastExecution, ...prev].slice(0, 50));
  }, [lastExecution]);

  const [daily, setDaily] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const dailyLoadedCode = useRef(null);

  // 일별 탭 처음 열릴 때(종목당) 1회만 호출
  useEffect(() => {
    if (tab !== 'daily' || dailyLoadedCode.current === stock.code) return;
    dailyLoadedCode.current = stock.code;
    setDaily([]);
    setDailyLoading(true);
    fetchDailyPrices(stock.code)
      .then(data => setDaily(data || []))
      .catch(() => setDaily([]))
      .finally(() => setDailyLoading(false));
  }, [tab, stock.code]);
  const moreBtn = { width: '100%', marginTop: 10, height: 38, borderRadius: 10, border: '1px solid #EEF1F4', background: '#F9FAFB', color: '#4E5968', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
  return (
    <Card style={{ padding: 18 }}>
      <PanelTitle right={
        <div style={{ display: 'flex', gap: 4, background: '#F2F4F6', borderRadius: 9, padding: 3 }}>
          {[['real', t('trading.detail.realtime')], ['daily', t('trading.detail.daily')]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: tab === k ? '#fff' : 'transparent', color: tab === k ? INK : '#8B95A1', boxShadow: tab === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>}>{t('trading.detail.tickTape')}</PanelTitle>
      {tab === 'real' ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr 1fr', gap: 4, padding: '0 4px 8px', fontSize: 12, color: SUB, fontWeight: 600 }}>
            <span>{t('trading.detail.execPrice')}</span><span style={{ textAlign: 'right' }}>{t('trading.detail.execQty')}</span><span style={{ textAlign: 'right' }}>{t('trading.detail.execChange')}</span><span style={{ textAlign: 'right' }}>{t('trading.detail.execTime')}</span>
          </div>
          {ticksLoading ? <QuoteRowsSkeleton /> : (expanded ? ticks : ticks.slice(0, 6)).map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr 1fr', gap: 4, padding: '7px 4px', fontSize: 13, borderTop: '1px solid #F6F8FA' }}>
              <span style={{ fontWeight: 700, color: tone(t.changeRate) }}>{wonShort(t.price)}</span>
              <span style={{ textAlign: 'right', color: SUB }}>{t.quantity}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: tone(t.changeRate) }}>{signPct(t.changeRate)}</span>
              <span style={{ textAlign: 'right', color: SUB }}>{t.time}</span>
            </div>
          ))}
          {!ticksLoading && <button onClick={() => setExpanded(v => !v)} style={moreBtn}>{expanded ? t('trading.detail.collapse') : t('trading.detail.moreExecutions', { n: Math.max(0, ticks.length - 6) })}</button>}
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.9fr 1.2fr', gap: 4, padding: '0 4px 8px', fontSize: 12, color: SUB, fontWeight: 600 }}>
            <span>{t('trading.detail.date')}</span><span style={{ textAlign: 'right' }}>{t('trading.detail.close')}</span><span style={{ textAlign: 'right' }}>{t('trading.detail.execChange')}</span><span style={{ textAlign: 'right' }}>{t('trading.detail.volume')}</span>
          </div>
          {dailyLoading ? <QuoteRowsSkeleton columns="1fr 1.2fr 0.9fr 1.2fr" /> : (expanded ? daily : daily.slice(0, 6)).map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.9fr 1.2fr', gap: 4, padding: '8px 4px', fontSize: 13, borderTop: '1px solid #F6F8FA' }}>
              <span style={{ color: SUB }}>{d.date.slice(5).replace('-', '.')}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: INK }}>{d.closePrice.toLocaleString()}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: tone(d.changeRate) }}>{signPct(d.changeRate)}</span>
              <span style={{ textAlign: 'right', color: SUB }}>{t('trading.format.volumeK', { n: Math.round(d.volume / 1000).toLocaleString() })}</span>
            </div>
          ))}
          {!dailyLoading && daily.length > 6 && <button onClick={() => setExpanded(v => !v)} style={moreBtn}>{expanded ? t('trading.detail.collapse') : t('trading.detail.more')}</button>}
        </div>
      )}
    </Card>
  );
}

function OrderBook({ stock, selectedPrice, onPick }) {
  const { lastOrderBook } = useStore();
  const { t } = useLocale();
  const { wonShort, signPct, numLocale } = useTradingFormat();
  const [book, setBook] = useState(null); // null = 로딩 중, { asks, bids } = 로드 완료

  // 호가 초기 로드 (종목 변경 시 1회)
  useEffect(() => {
    let cancelled = false;
    setBook(null);
    fetchOrderBook(stock.code)
      .then(data => { if (!cancelled) setBook(data); })
      .catch(() => { if (!cancelled) setBook({ asks: [], bids: [] }); });
    return () => { cancelled = true; };
  }, [stock.code]);

  // ORDERBOOK 이벤트 수신 시 asks/bids 전체 교체 (merge 아님)
  useEffect(() => {
    if (!lastOrderBook) return;
    setBook(prev => ({ ...(prev || {}), asks: lastOrderBook.asks, bids: lastOrderBook.bids }));
  }, [lastOrderBook]);

  // asks[0]/bids[0] = 최우선호가(현재가에 가장 가까움) → asks는 화면 표시상 역순(먼 호가가 위, 최우선호가가 현재가 바로 위)
  const { asks, bids, maxQ } = useMemo(() => {
    const asks = (book?.asks || []).map(a => ({ price: a.price, qty: a.quantity })).reverse();
    const bids = (book?.bids || []).map(b => ({ price: b.price, qty: b.quantity }));
    const maxQ = Math.max(1, ...asks.map(a => a.qty), ...bids.map(b => b.qty));
    return { asks, bids, maxQ };
  }, [book]);

  const OBRow = ({ lvl, side }) => {
    const col = side === 'ask' ? DOWN : UP;
    const barPct = (lvl.qty / maxQ) * 100;
    const sel = selectedPrice != null && lvl.price === selectedPrice;
    return (
      <div onClick={() => onPick && onPick(lvl.price)} title={t('trading.detail.clickToSetPrice')}
        style={{ display: 'grid', gridTemplateColumns: '1fr 96px 1fr', alignItems: 'center', height: 30, cursor: onPick ? 'pointer' : 'default',
          borderRadius: 6, outline: sel ? `2px solid ${col}` : 'none', background: sel ? col + '0E' : 'transparent' }}>
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
          {side === 'ask' && <>
            <div style={{ position: 'absolute', right: 0, top: 4, bottom: 4, width: barPct + '%', background: DOWN + '14', borderRadius: 4 }} />
            <span style={{ position: 'relative', fontSize: 12, color: SUB, fontWeight: 600 }}>{lvl.qty.toLocaleString(numLocale)}</span>
          </>}
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: sel ? 800 : 700, color: col }}>{wonShort(lvl.price)}</div>
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
          {side === 'bid' && <>
            <div style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: barPct + '%', background: UP + '14', borderRadius: 4 }} />
            <span style={{ position: 'relative', fontSize: 12, color: SUB, fontWeight: 600 }}>{lvl.qty.toLocaleString(numLocale)}</span>
          </>}
        </div>
      </div>
    );
  };
  return (
    <Card style={{ padding: 18 }}>
      <PanelTitle right={<span style={{ fontSize: 12, color: SUB, whiteSpace: 'nowrap' }}>{t('trading.detail.clickToSetPrice')}</span>}>{t('trading.detail.quotes')}</PanelTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 96px 1fr', gap: 8, marginBottom: 8, padding: '0 4px', fontSize: 11, fontWeight: 800, color: SUB }}>
        <span style={{ textAlign: 'right' }}>{t('trading.detail.sell')}</span>
        <span style={{ textAlign: 'center' }}>{t('trading.detail.quotes')}</span>
        <span>{t('trading.detail.buy')}</span>
      </div>
      {!book ? (
        <OrderBookSkeleton />
      ) : (
        <>
          {asks.map((a, i) => <OBRow key={'a' + i} lvl={a} side="ask" />)}
          <div onClick={() => onPick && onPick(stock.price)} title={t('trading.detail.clickToSetPrice')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 38, margin: '4px 0', background: selectedPrice === stock.price ? tone(stock.pct) + '12' : '#F9FAFB', borderRadius: 10,
              cursor: onPick ? 'pointer' : 'default', outline: selectedPrice === stock.price ? `2px solid ${tone(stock.pct)}` : 'none' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: SUB, background: 'var(--trading-card, #fff)', border: '1px solid #E5E8EB', borderRadius: 6, padding: '2px 6px' }}>{t('trading.home.colPrice')}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: tone(stock.pct) }}>{wonShort(stock.price)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: tone(stock.pct) }}>{signPct(stock.pct)}</span>
          </div>
          {bids.map((b, i) => <OBRow key={'b' + i} lvl={b} side="bid" />)}
        </>
      )}
    </Card>
  );
}

function Community({ stock, bare }) {
  const { t } = useLocale();
  const { timeAgo } = useTradingFormat();
  const routerNavigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const stockName = stock ? displayStockName(stock, '') : '';

  useEffect(() => {
    if (!stock?.code) return;
    let cancelled = false;
    const terms = [...new Set([stockName, stock.short, stock.code].filter(Boolean))];

    async function loadCommunity() {
      setStatus('loading');
      try {
        let questions = [];
        for (const term of terms) {
          const data = await getQuestions(term);
          const list = Array.isArray(data) ? data : [];
          questions = list.filter(q => {
            const qCode = q.stock?.stockCode || q.stockCode;
            const qName = q.stock?.companyName || q.stockName || '';
            return qCode === stock.code || (qName && (qName.includes(stockName) || stockName.includes(qName) || qName.includes(term)));
          });
          if (questions.length) break;
        }
        if (!cancelled) {
          setPosts(questions);
          setStatus('ok');
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('종목 상세 커뮤니티 조회 실패', error);
          setStatus('error');
        }
      }
    }

    loadCommunity();
    return () => { cancelled = true; };
  }, [stock?.code, stock.short, stockName]);

  const inner = (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <button
          onClick={() => routerNavigate('/community/write')}
          style={{ ...primaryBtn, height: 46, padding: '0 22px', whiteSpace: 'nowrap' }}
        >
          {t('trading.detail.communityAsk')}
        </button>
        <button
          onClick={() => routerNavigate('/community')}
          style={{ height: 46, padding: '0 18px', borderRadius: 12, border: '1px solid #E5E8EB', background: 'var(--trading-card, #fff)', color: SUB, fontSize: 14, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {t('trading.detail.viewAllPosts')}
        </button>
      </div>
      {status === 'loading' ? (
        <SkeletonText lines={3} widths={['64%', '92%', '78%']} height={14} gap={12} />
      ) : status === 'error' ? (
        <div style={{ fontSize: 14, color: SUB, textAlign: 'center', padding: '24px 0' }}>{t('trading.detail.communityError')}</div>
      ) : posts.length === 0 ? <div style={{ fontSize: 14, color: SUB, textAlign: 'center', padding: '24px 0' }}>{t('trading.detail.communityEmpty')}</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map(post => (
            <div key={post.id} onClick={() => routerNavigate(`/community/${post.id}`)} style={{ borderTop: '1px solid #F2F4F6', paddingTop: 16, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{(post.authorNickname || t('trading.home.anonymous')).charAt(0)}</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{post.authorNickname || t('trading.home.anonymous')}</span>
                <span style={{ fontSize: 12, color: SUB }}>{timeAgo(new Date(post.createdAt).getTime())}</span>
                {post.isResolved && <span style={{ fontSize: 11, fontWeight: 800, color: '#1FA463', background: '#EAF8F0', padding: '3px 7px', borderRadius: 6 }}>{t('trading.detail.resolved')}</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.5, color: INK, marginBottom: 5 }}>{post.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: SUB, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.content}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: SUB }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SUB} strokeWidth="2"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" strokeLinejoin="round" /></svg>
                  {t('trading.detail.answers', { n: post.answerCount ?? 0 })}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: SUB }}>{t('trading.detail.views', { n: post.views ?? 0 })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
  if (bare) return inner;
  return (
    <Card style={{ marginTop: 20 }}>
      <PanelTitle right={<span style={{ fontSize: 13, color: SUB, whiteSpace: 'nowrap' }}>{t('trading.detail.postCount', { n: posts.length })}</span>}>{t('trading.detail.communityTitle', { name: displayStockName(stock) })}</PanelTitle>
      {inner}
    </Card>
  );
}

Object.assign(window, { Detail, OrderPanel, Row, FinancialsChart, TickTape, OrderBook, Community });
