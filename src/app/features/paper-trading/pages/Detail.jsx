import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useStore, seedRand } from '../store/store.jsx';
import { getQuestions } from '../../community/api/communityApi.js';
import {
  fetchCandleData, fetchOrderBook, fetchExecutions, fetchDailyPrices, fetchStockInfo,
  fetchPaperTradingBalance, fetchPaperTradingHolding, placeBuyOrder, placeSellOrder,
} from '../lib/stockApi.js';
import {
  won, wonShort, signPct, signNum, timeAgo,
  Avatar, Card, Heart, Modal, CandleChart, Stub, Skeleton, SkeletonText, displayStockName,
  BTN_PRIMARY, BTN_SECONDARY, BTN_BUY, BTN_SELL,
  CONTAINER, META, LABEL,
  TAB_ACTIVE, TAB_IDLE, TAB_INDICATOR,
  SEGMENT_TRACK, SEGMENT_ACTIVE, SEGMENT_IDLE,
  PRICE_UP, PRICE_DOWN,
  chartColor, priceToneClass,
  CHART_UP, CHART_DOWN,
  ALERT_ERROR,
} from '../components/ui.jsx';

const PERIODS = [
  { key: '1D', label: '일', n: 120 },
  { key: '1W', label: '주', n: 40 },
  { key: '1M', label: '월', n: 24 },
  { key: '1Y', label: '년', n: 10 },
];
const MASTER_CANDLES = 250;

const OB_STEP_BTN =
  'w-11 h-12 shrink-0 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xl font-bold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors';
const FIELD_LABEL = `${LABEL} shrink-0 w-[72px]`;
const RATIO_BTN =
  'flex-1 h-9 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors';
const MORE_BTN =
  'w-full mt-2.5 h-[38px] rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-sm font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';

function InteractiveChart({ allCandles, allDates, currentPrice, w, h, showMA5, showMA20, volH, count, resetKey }) {
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
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="touch-pan-y select-none overflow-hidden"
        style={{ cursor: drag.current ? 'grabbing' : 'grab' }}
      >
        <CandleChart candles={slice} w={w} h={h} showMA5={showMA5} showMA20={showMA20} volH={volH}
          currentPrice={atEnd ? currentPrice : undefined}
          dates={sliceDates} />
      </div>
      <div className={`flex items-center justify-between mt-2 text-xs ${META}`}>
        <span>◀ 과거</span>
        <span>좌우로 드래그해 과거 시세를 볼 수 있어요</span>
        <span>{atEnd ? '현재 ▶' : '최근 ▶'}</span>
      </div>
      {sliceDates && sliceDates.length > 0 && (
        <div className={`mt-1.5 text-xs ${META} text-right`}>
          {sliceDates.length === 1 ? sliceDates[0] : `${sliceDates[0]} ~ ${sliceDates[sliceDates.length - 1]}`}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, colorClass }) {
  return (
    <div className="flex justify-between items-center py-[5px]">
      <span className={`text-sm ${META} whitespace-nowrap`}>{label}</span>
      <span className={`${bold ? 'text-[17px] font-extrabold' : 'text-sm font-semibold'} whitespace-nowrap text-slate-900 dark:text-slate-100 ${colorClass || ''}`}>{value}</span>
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

function formatMarketCap(won) {
  const eok = Math.round(won / 1e8);
  if (eok >= 10000) {
    const jo = Math.floor(eok / 10000);
    const rest = eok % 10000;
    return `${jo}조${rest ? ' ' + rest.toLocaleString() + '억' : ''}`;
  }
  return `${eok.toLocaleString()}억`;
}

function PanelHeader({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="w-1 h-5 rounded-sm bg-blue-600 shrink-0" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">{children}</h2>
      </div>
      {right}
    </div>
  );
}

function ChartSkeleton({ height = 360 }) {
  return (
    <div className="relative px-2 pt-[18px] pb-[38px]" style={{ height }}>
      <div className="absolute inset-x-2 top-[18px] bottom-[60px] flex flex-col justify-between">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={1} radius={1} />)}
      </div>
      <div className="absolute left-3 right-[72px] bottom-[76px] flex items-end gap-[5px]" style={{ height: height - 126 }}>
        {Array.from({ length: 44 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={36 + ((i * 19) % 170)} radius={3} style={{ flex: 1 }} />
        ))}
      </div>
      <div className="absolute left-3 right-[72px] bottom-6 flex items-end gap-[5px]">
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
        <div key={'a' + i} className="grid grid-cols-[1fr_96px_1fr] items-center h-[30px]">
          <Skeleton width={`${38 + i * 9}%`} height={16} radius={4} style={{ justifySelf: 'end' }} />
          <Skeleton width={58} height={16} style={{ justifySelf: 'center' }} />
          <span />
        </div>
      ))}
      <Skeleton height={38} radius={10} style={{ margin: '4px 0' }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={'b' + i} className="grid grid-cols-[1fr_96px_1fr] items-center h-[30px]">
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
    <div key={i} className="grid gap-1 px-1 py-2 border-t border-slate-100 dark:border-slate-800" style={{ gridTemplateColumns: columns }}>
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
  const isBuy = result.side === 'BUY';
  const accent = chartColor(isBuy ? 1 : -1);
  const holding = result.holding;
  const balance = result.balance;
  const realizedPnl = result.realizedPnl ?? 0;

  return (
    <Modal onClose={onClose} width={500}>
      <div className="p-7">
        <div className="flex items-center gap-3.5 mb-5">
          <div
            className="w-[54px] h-[54px] rounded-[18px] flex items-center justify-center"
            style={{ background: accent + '14' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <div>
            <div className="text-[22px] font-black text-slate-900 dark:text-slate-100 mb-1">{isBuy ? '매수' : '매도'} 체결 완료</div>
            <div className={`text-sm ${META}`}>{formatTradeTime(result.tradedAt)} · {result.orderType === 'MARKET' ? '시장가' : '지정가'} 주문</div>
          </div>
        </div>

        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-[18px] mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar stock={result.stock} size={42} />
            <div className="min-w-0">
              <div className="text-[17px] font-black text-slate-900 dark:text-slate-100 truncate">{result.stockName}</div>
              <div className={`text-xs ${META}`}>{result.stockCode}</div>
            </div>
            <span
              className="ml-auto text-sm font-black px-2.5 py-1.5 rounded-lg"
              style={{ color: accent, background: accent + '12' }}
            >
              {isBuy ? '매수' : '매도'}
            </span>
          </div>
          <Row label="체결가" value={won(result.price)} bold />
          <Row label="체결 수량" value={`${result.quantity.toLocaleString()}주`} />
          <Row label="총 체결 금액" value={won(result.totalAmount)} bold />
          {!isBuy && (
            <Row label="실현 손익" value={`${signNum(realizedPnl)}원`} bold colorClass={priceToneClass(realizedPnl)} />
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-[18px] mb-5">
          <div className="text-[15px] font-black text-slate-900 dark:text-slate-100 mb-3">주문 후 내 자산</div>
          <Row label="주문 가능 현금" value={balance?.availableBalance == null ? '-' : won(balance.availableBalance)} bold />
          <Row label="해당 종목 보유" value={holding?.quantity == null ? '-' : `${holding.quantity.toLocaleString()}주`} />
        </div>

        <button onClick={onClose} className={`${BTN_PRIMARY} w-full h-[52px] text-base font-black`}>
          확인
        </button>
      </div>
    </Modal>
  );
}

function OrderPanel({ stock, price, setPrice, priceType, setPriceType }) {
  const { refreshPortfolio } = useStore();
  const ts = tickSize(stock.price);
  const [tab, setTab] = useState('BUY');
  const [balance, setBalance] = useState(null);
  const [holding, setHolding] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [qty, setQty] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  const isBuy = tab === 'BUY';
  const isSell = tab === 'SELL';

  const refresh = () => {
    setAccountLoading(true);
    Promise.allSettled([
      fetchPaperTradingBalance().then(setBalance).catch(() => setBalance(null)),
      fetchPaperTradingHolding(stock.code).then(setHolding).catch(() => setHolding(null)),
    ]).finally(() => setAccountLoading(false));
  };
  useEffect(() => {
    let cancelled = false;
    setAccountLoading(true);
    Promise.allSettled([
      fetchPaperTradingBalance().then(data => { if (!cancelled) setBalance(data); }).catch(() => { if (!cancelled) setBalance(null); }),
      fetchPaperTradingHolding(stock.code).then(data => { if (!cancelled) setHolding(data); }).catch(() => { if (!cancelled) setHolding(null); }),
    ]).finally(() => { if (!cancelled) setAccountLoading(false); });
    return () => { cancelled = true; };
  }, [tab, stock.code]);
  useEffect(() => { setQty(0); }, [tab, stock.code]);

  const effPrice = priceType === 'market' ? stock.price : price;
  const priceValid = effPrice > 0;
  const cash = balance?.availableBalance ?? 0;
  const ownedQty = holding?.quantity ?? 0;
  const maxQty = isBuy ? (priceValid ? Math.floor(cash / effPrice) : 0) : ownedQty;
  const total = qty * effPrice;
  const canSubmit = !submitting && qty > 0 && priceValid && (isBuy ? total <= cash : qty <= ownedQty);

  const stepPrice = (d) => setPrice(p => Math.max(ts, Math.round((p + d * ts) / ts) * ts));
  const ratio = (r) => setQty(Math.max(0, Math.floor(maxQty * r)));

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorToast(null);
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
        refreshPortfolio(),
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
      setErrorToast(e.response?.data?.message || `${isBuy ? '매수' : '매도'} 주문에 실패했어요.`);
    } finally {
      setSubmitting(false);
      setAccountLoading(false);
    }
  };

  const tabColorClass = (k) => {
    if (tab !== k) return '';
    if (k === 'BUY') return PRICE_UP;
    if (k === 'SELL') return PRICE_DOWN;
    return 'text-slate-900 dark:text-slate-100';
  };

  return (
    <Card className="p-5">
      <PanelHeader right={<span className={`text-xs ${META} whitespace-nowrap`}>모의투자</span>}>일반주문</PanelHeader>

      <div className={`${SEGMENT_TRACK} mb-[18px] text-[15px] font-extrabold`}>
        {[['BUY', '매수'], ['SELL', '매도'], ['HOLDING', '내 보유']].map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`flex-1 h-10 rounded-[9px] border-none cursor-pointer ${tab === k ? SEGMENT_ACTIVE : SEGMENT_IDLE} ${tabColorClass(k)}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'HOLDING' ? (
        accountLoading ? (
          <SkeletonText lines={3} widths={['100%', '88%', '96%']} height={18} gap={14} />
        ) : ownedQty > 0 ? (
          <div>
            <Row label="보유 수량" value={holding.quantity + '주'} />
            <Row label="평균 매수가" value={won(holding.avgBuyPrice)} />
            <Row label="평가 손익" value={`${signNum(holding.valuationPnl)}원 (${signPct(holding.valuationPnlRate)})`} colorClass={priceToneClass(holding.valuationPnlRate)} bold />
          </div>
        ) : (
          <div className={`text-center ${META} text-sm py-10`}>보유 종목 없음</div>
        )
      ) : (
        <>
          <div className="flex items-center mb-3.5">
            <span className={FIELD_LABEL}>주문 유형</span>
            <div className="flex-1 h-11 rounded-[10px] border border-slate-200 dark:border-slate-700 flex items-center px-3.5 text-sm font-bold text-slate-900 dark:text-slate-100 justify-between">
              정규장 주문
            </div>
          </div>

          <div className="flex items-center mb-2.5">
            <span className={FIELD_LABEL}>{isBuy ? '구매' : '판매'} 가격</span>
            <div className={`flex-1 ${SEGMENT_TRACK}`}>
              {[['limit', '지정가'], ['market', '시장가']].map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPriceType(k)}
                  className={`h-[34px] rounded-lg border-none cursor-pointer text-[13px] font-bold ${priceType === k ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-[72px] shrink-0" />
            {priceType === 'market' ? (
              <div className={`flex-1 h-12 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-sm font-bold ${META}`}>
                시장가 ({won(stock.price)})
              </div>
            ) : (
              <>
                <button type="button" onClick={() => stepPrice(-1)} className={OB_STEP_BTN}>−</button>
                <div className="flex-1 h-12 rounded-[10px] border border-slate-200 dark:border-slate-700 flex items-center justify-end px-3">
                  <input
                    value={wonShort(price)}
                    onChange={e => { const n = parseInt(e.target.value.replace(/\D/g, '')) || 0; setPrice(n); }}
                    className="w-full border-none outline-none text-right text-lg font-extrabold text-slate-900 dark:text-slate-100 bg-transparent"
                  />
                  <span className={`text-sm ${META} ml-1`}>원</span>
                </div>
                <button type="button" onClick={() => stepPrice(1)} className={OB_STEP_BTN}>＋</button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className={FIELD_LABEL}>수량</span>
            <button type="button" onClick={() => setQty(q => Math.max(0, q - 1))} className={OB_STEP_BTN}>−</button>
            <div className="flex-1 h-12 rounded-[10px] border border-slate-200 dark:border-slate-700 flex items-center justify-end px-3">
              <input
                value={qty === 0 ? '' : qty}
                placeholder="수량 입력"
                onChange={e => { const n = parseInt(e.target.value.replace(/\D/g, '')) || 0; setQty(n); }}
                className="w-full border-none outline-none text-right text-lg font-extrabold text-slate-900 dark:text-slate-100 bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <span className={`text-sm ${META} ml-1`}>주</span>
            </div>
            <button type="button" onClick={() => setQty(q => q + 1)} className={OB_STEP_BTN}>＋</button>
          </div>
          <div className="flex gap-2 mb-[18px]">
            {[[0.1, '10%'], [0.25, '25%'], [0.5, '50%'], [1, '최대']].map(([r, l]) => (
              <button key={l} type="button" onClick={() => ratio(r)} className={RATIO_BTN}>{l}</button>
            ))}
          </div>

          <div className="flex items-center mb-1.5">
            <span className={FIELD_LABEL}>총 주문 금액</span>
            <div className={`flex-1 h-12 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end px-3.5 text-lg font-extrabold ${total > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'}`}>
              {total > 0 ? won(total) : '금액 입력'}
            </div>
          </div>
          <div className={`text-right text-[13px] ${META} mb-4`}>
            {accountLoading ? (
              <Skeleton width={150} height={13} style={{ marginLeft: 'auto' }} />
            ) : isBuy ? `주문 가능 금액 ${won(cash)}` : `보유 수량 ${ownedQty}주`}
          </div>

          {!canSubmit && qty > 0 && (
            <div className={`text-[13px] ${PRICE_UP} font-semibold mb-3 text-center`}>
              {!priceValid ? '주문 가격을 입력해주세요.' : isBuy ? '주문 가능 금액이 부족해요.' : '보유 수량을 초과했어요.'}
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={`w-full h-[54px] rounded-[14px] border-none text-[17px] font-extrabold ${
              canSubmit
                ? (isBuy ? BTN_BUY : BTN_SELL) + ' cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {submitting ? '주문 처리 중…' : qty > 0 ? `${won(total)} ${isBuy ? '매수하기' : '매도하기'}` : `${isBuy ? '매수' : '매도'}하기`}
          </button>
        </>
      )}

      {errorToast && (
        <div className={`${ALERT_ERROR} mt-3.5 flex items-center gap-2 rounded-xl py-3 px-3.5`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 8v5M12 16h.01M12 3l9 16H3l9-16z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="text-sm font-bold">{errorToast}</span>
        </div>
      )}
      {orderResult && <OrderResultModal result={orderResult} onClose={() => setOrderResult(null)} />}
    </Card>
  );
}

function DetailTabs({ stock, info }) {
  const [tab, setTab] = useState('info');
  const tabs = [
    { key: 'info', label: '종목 정보' }
  ];
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-2">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={tab === t.key ? TAB_ACTIVE : TAB_IDLE}>
            {t.label}
            {tab === t.key && <span className={TAB_INDICATOR} />}
          </button>
        ))}
      </div>
      <div className="p-6">
        {tab === 'info' && (
          <div className="grid grid-cols-3 gap-x-6 gap-y-5">
            {info.map(([k, v], i) => (
              <div key={i}>
                <div className={`text-[13px] ${META} mb-1`}>{k}</div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">{v}</div>
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
  const code = state.route.params.code;
  const stock = getStock(code);

  useEffect(() => { subscribeDetail(code); }, [code, subscribeDetail]);
  const [period, setPeriod] = useState('1W');
  const [ma5, setMa5] = useState(true);
  const [ma20, setMa20] = useState(false);
  const [orderPrice, setOrderPrice] = useState(stock?.price || 0);
  const [priceType, setPriceType] = useState('limit');
  const [apiCandles, setApiCandles] = useState(null);
  const [candlesLoading, setCandlesLoading] = useState(true);
  const [stockInfo, setStockInfo] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    setStockInfo(undefined);
    fetchStockInfo(code)
      .then(data => { if (!cancelled) setStockInfo(data); })
      .catch(() => { if (!cancelled) setStockInfo(null); });
    return () => { cancelled = true; };
  }, [code]);

  useEffect(() => { setOrderPrice(stock?.price || 0); }, [code]);
  useEffect(() => {
    if (stock?.price && orderPrice === 0) setOrderPrice(stock.price);
  }, [stock?.price]);

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
      return `${date.slice(4, 6)}.${date.slice(6, 8)} ${date.slice(8, 10)}시`;
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

  if (!stock) return <Stub name="종목" />;
  const pctClass = priceToneClass(stock.pct);
  const watched = state.watchlist.includes(code);

  const infoLoading = stockInfo === undefined;
  const infoField = (val, formatter) => infoLoading ? <Skeleton width={92} height={18} /> : (val == null ? '-' : formatter(val));
  const info = [
    ['시가총액', infoField(stockInfo?.marketCap, formatMarketCap)],
    ['거래대금', (stock.value ?? 0).toLocaleString() + '억원'],
    ['52주 최고', infoField(stockInfo?.week52High, won)],
    ['52주 최저', infoField(stockInfo?.week52Low, won)],
    ['PER', infoField(stockInfo?.per, v => v.toFixed(2) + '배')],
    ['업종', infoField(stockInfo?.sector, v => v)],
  ];

  return (
    <div className={`${CONTAINER} py-6 pb-20`}>
      <button
        type="button"
        onClick={() => navigate('home')}
        className={`${BTN_SECONDARY} mb-[18px] h-11 px-[18px] rounded-xl text-base font-bold`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        실시간 차트
      </button>
      <div className="grid grid-cols-[1fr_380px] gap-7 items-start">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Avatar stock={stock} size={56} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">{displayStockName(stock)}</span>
                <span className={`text-sm ${META}`}>{stock.code}</span>
              </div>
              <div className="flex items-baseline gap-2.5 mt-1 flex-wrap">
                <span className="text-[30px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">{won(stock.price)}</span>
                <span className={`text-[17px] font-bold whitespace-nowrap ${pctClass}`}>{signNum(stock.changeAmt)} ({signPct(stock.pct)})</span>
              </div>
            </div>
            <Heart filled={watched} onClick={() => toggleWatch(code)} size={26} />
          </div>

          <div className="grid grid-cols-[1fr_332px] gap-5 mb-5 items-start">
            <div className="flex flex-col gap-5">
              <Card>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className={SEGMENT_TRACK}>
                    {PERIODS.map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPeriod(p.key)}
                        className={`px-3 py-2 rounded-[9px] border-none cursor-pointer text-[13px] font-bold ${period === p.key ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MAToggle on={ma5} color="#F5A623" label="MA5" onClick={() => setMa5(v => !v)} />
                    <MAToggle on={ma20} color="#7C3AED" label="MA20" onClick={() => setMa20(v => !v)} />
                  </div>
                </div>
                <div className={`flex gap-[18px] mb-2 text-xs ${META}`}>
                  <span><span className={`${PRICE_UP} font-extrabold`}>■</span> 양봉</span>
                  <span><span className={`${PRICE_DOWN} font-extrabold`}>■</span> 음봉</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 9l-3 3 3 3M19 9l3 3-3 3M2 12h20" /></svg>
                    드래그로 이동
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
            <div className="flex flex-col gap-5">
              <OrderBook stock={stock} selectedPrice={priceType === 'limit' ? orderPrice : null}
                onPick={(p) => { setPriceType('limit'); setOrderPrice(p); }} />
              <TickTape stock={stock} />
            </div>
          </div>
        </div>

        <div className="sticky top-[84px] flex flex-col gap-4">
          <OrderPanel stock={stock} price={orderPrice} setPrice={setOrderPrice} priceType={priceType} setPriceType={setPriceType} />
        </div>
      </div>
    </div>
  );
}

function MAToggle({ on, color, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 h-[34px] px-3 rounded-[10px] cursor-pointer text-[13px] font-bold border transition-colors ${
        on ? '' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500'
      }`}
      style={on ? { borderColor: color, background: color + '14', color } : undefined}
    >
      <span
        className="w-3.5 h-[3px] rounded-sm"
        style={{ background: on ? color : '#C5CBD3' }}
      />
      {label}
    </button>
  );
}

function FinancialsChart({ stock, bare }) {
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
  const metricTabs = (
    <div className={SEGMENT_TRACK}>
      {Object.entries(labels).map(([k, l]) => (
        <button
          key={k}
          type="button"
          onClick={() => setMetric(k)}
          className={`px-3 py-[7px] rounded-lg border-none cursor-pointer text-[13px] font-bold whitespace-nowrap ${metric === k ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
  const body = (
    <>
      <div className="flex items-baseline gap-2.5 mb-[18px]">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">{fmt(last[metric])}</span>
        <span className={`text-sm ${META} whitespace-nowrap`}>{last.q} {labels[metric]}</span>
        <span className={`text-sm font-bold ml-auto whitespace-nowrap ${priceToneClass(yoy)}`}>전년比 {signPct(yoy)}</span>
      </div>
      <div className="flex items-end justify-between gap-3 h-[170px]">
        {data.map((d, i) => {
          const h = Math.max(4, (d[metric] / max) * 150);
          const isLast = i === data.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
              <span className={`text-xs font-bold whitespace-nowrap ${isLast ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {(d[metric] / (d[metric] >= 10000 ? 10000 : 1)).toLocaleString(undefined, { maximumFractionDigits: d[metric] >= 10000 ? 1 : 0 })}{d[metric] >= 10000 ? '조' : ''}
              </span>
              <div
                className={`w-[70%] max-w-14 rounded-t-lg ${isLast ? 'bg-blue-600' : 'bg-blue-200 dark:bg-blue-900/50'}`}
                style={{ height: h }}
              />
              <span className={`text-xs ${META}`}>{d.q}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2.5 mt-5 pt-[18px] border-t border-slate-100 dark:border-slate-800">
        {[['영업이익률', (last.operating / last.revenue * 100).toFixed(1) + '%'], ['순이익률', (last.net / last.revenue * 100).toFixed(1) + '%'], ['공시 기준', '분기보고서']].map(([k, v], i) => (
          <div key={i} className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl py-3 px-3.5">
            <div className={`text-xs ${META} mb-1`}>{k}</div>
            <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{v}</div>
          </div>
        ))}
      </div>
    </>
  );
  if (bare) return (
    <div>
      <div className="flex items-center justify-between mb-[18px] flex-wrap gap-2.5">
        <span className={`text-[13px] ${META} font-semibold`}>최근 6개 분기 · 단일 매출 기준</span>
        {metricTabs}
      </div>
      {body}
    </div>
  );
  return (
    <Card className="mb-5">
      <PanelHeader right={metricTabs}>정기공시 · 재무 추이</PanelHeader>
      {body}
    </Card>
  );
}

function TickTape({ stock }) {
  const { lastExecution } = useStore();
  const [tab, setTab] = useState('real');
  const [expanded, setExpanded] = useState(false);
  const [ticks, setTicks] = useState([]);
  const [ticksLoading, setTicksLoading] = useState(true);

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

  useEffect(() => {
    if (!lastExecution) return;
    setTicks(prev => [lastExecution, ...prev].slice(0, 50));
  }, [lastExecution]);

  const [daily, setDaily] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const dailyLoadedCode = useRef(null);

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

  return (
    <Card className="p-[18px]">
      <PanelHeader right={
        <div className={SEGMENT_TRACK}>
          {[['real', '실시간'], ['daily', '일별']].map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`px-3 py-1.5 rounded-[7px] border-none cursor-pointer text-[13px] font-bold ${tab === k ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
            >
              {l}
            </button>
          ))}
        </div>
      }>시세</PanelHeader>
      {tab === 'real' ? (
        <div>
          <div className={`grid grid-cols-[1.2fr_0.9fr_0.9fr_1fr] gap-1 px-1 pb-2 text-xs ${META} font-semibold`}>
            <span>체결가</span><span className="text-right">체결량</span><span className="text-right">등락률</span><span className="text-right">시간</span>
          </div>
          {ticksLoading ? <QuoteRowsSkeleton /> : (expanded ? ticks : ticks.slice(0, 6)).map((t, i) => (
            <div key={i} className="grid grid-cols-[1.2fr_0.9fr_0.9fr_1fr] gap-1 px-1 py-[7px] text-[13px] border-t border-slate-100 dark:border-slate-800">
              <span className={`font-bold ${priceToneClass(t.changeRate)}`}>{wonShort(t.price)}</span>
              <span className="text-right text-slate-600 dark:text-slate-400">{t.quantity}</span>
              <span className={`text-right font-bold ${priceToneClass(t.changeRate)}`}>{signPct(t.changeRate)}</span>
              <span className={`text-right ${META}`}>{t.time}</span>
            </div>
          ))}
          {!ticksLoading && <button type="button" onClick={() => setExpanded(v => !v)} className={MORE_BTN}>{expanded ? '접기' : `체결 더보기 (${Math.max(0, ticks.length - 6)})`}</button>}
        </div>
      ) : (
        <div>
          <div className={`grid grid-cols-[1fr_1.2fr_0.9fr_1.2fr] gap-1 px-1 pb-2 text-xs ${META} font-semibold`}>
            <span>일자</span><span className="text-right">종가</span><span className="text-right">등락률</span><span className="text-right">거래량</span>
          </div>
          {dailyLoading ? <QuoteRowsSkeleton columns="1fr 1.2fr 0.9fr 1.2fr" /> : (expanded ? daily : daily.slice(0, 6)).map((d, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.2fr_0.9fr_1.2fr] gap-1 px-1 py-2 text-[13px] border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">{d.date.slice(5).replace('-', '.')}</span>
              <span className="text-right font-bold text-slate-900 dark:text-slate-100">{d.closePrice.toLocaleString()}</span>
              <span className={`text-right font-bold ${priceToneClass(d.changeRate)}`}>{signPct(d.changeRate)}</span>
              <span className={`text-right ${META}`}>{Math.round(d.volume / 10000).toLocaleString()}만</span>
            </div>
          ))}
          {!dailyLoading && daily.length > 6 && <button type="button" onClick={() => setExpanded(v => !v)} className={MORE_BTN}>{expanded ? '접기' : '더보기'}</button>}
        </div>
      )}
    </Card>
  );
}

function OrderBook({ stock, selectedPrice, onPick }) {
  const { lastOrderBook } = useStore();
  const [book, setBook] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setBook(null);
    fetchOrderBook(stock.code)
      .then(data => { if (!cancelled) setBook(data); })
      .catch(() => { if (!cancelled) setBook({ asks: [], bids: [] }); });
    return () => { cancelled = true; };
  }, [stock.code]);

  useEffect(() => {
    if (!lastOrderBook) return;
    setBook(prev => ({ ...(prev || {}), asks: lastOrderBook.asks, bids: lastOrderBook.bids }));
  }, [lastOrderBook]);

  const { asks, bids, maxQ } = useMemo(() => {
    const asks = (book?.asks || []).map(a => ({ price: a.price, qty: a.quantity })).reverse();
    const bids = (book?.bids || []).map(b => ({ price: b.price, qty: b.quantity }));
    const maxQ = Math.max(1, ...asks.map(a => a.qty), ...bids.map(b => b.qty));
    return { asks, bids, maxQ };
  }, [book]);

  const OBRow = ({ lvl, side }) => {
    const col = side === 'ask' ? CHART_DOWN : CHART_UP;
    const colClass = side === 'ask' ? PRICE_DOWN : PRICE_UP;
    const barPct = (lvl.qty / maxQ) * 100;
    const sel = selectedPrice != null && lvl.price === selectedPrice;
    return (
      <div
        onClick={() => onPick && onPick(lvl.price)}
        title="클릭해서 주문가로 설정"
        className={`grid grid-cols-[1fr_96px_1fr] items-center h-[30px] rounded-md ${onPick ? 'cursor-pointer' : 'cursor-default'}`}
        style={{
          outline: sel ? `2px solid ${col}` : 'none',
          background: sel ? col + '0E' : 'transparent',
        }}
      >
        <div className="relative h-full flex items-center justify-end pr-2">
          {side === 'ask' && <>
            <div className="absolute right-0 top-1 bottom-1 rounded" style={{ width: barPct + '%', background: CHART_DOWN + '14' }} />
            <span className="relative text-xs text-slate-600 dark:text-slate-400 font-semibold">{lvl.qty.toLocaleString()}</span>
          </>}
        </div>
        <div className={`text-center text-sm ${sel ? 'font-extrabold' : 'font-bold'} ${colClass}`}>{wonShort(lvl.price)}</div>
        <div className="relative h-full flex items-center pl-2">
          {side === 'bid' && <>
            <div className="absolute left-0 top-1 bottom-1 rounded" style={{ width: barPct + '%', background: CHART_UP + '14' }} />
            <span className="relative text-xs text-slate-600 dark:text-slate-400 font-semibold">{lvl.qty.toLocaleString()}</span>
          </>}
        </div>
      </div>
    );
  };

  const priceCol = chartColor(stock.pct);
  const priceClass = priceToneClass(stock.pct);

  return (
    <Card className="p-[18px]">
      <PanelHeader right={<span className={`text-xs ${META} whitespace-nowrap`}>클릭→주문가 설정</span>}>호가</PanelHeader>
      <div className={`grid grid-cols-[1fr_96px_1fr] gap-2 mb-2 px-1 text-[11px] font-extrabold ${META}`}>
        <span className="text-right">매도잔량</span>
        <span className="text-center">호가</span>
        <span>매수잔량</span>
      </div>
      {!book ? (
        <OrderBookSkeleton />
      ) : (
        <>
          {asks.map((a, i) => <OBRow key={'a' + i} lvl={a} side="ask" />)}
          <div
            onClick={() => onPick && onPick(stock.price)}
            title="클릭해서 주문가로 설정"
            className={`flex items-center justify-center gap-2 h-[38px] my-1 rounded-[10px] ${onPick ? 'cursor-pointer' : 'cursor-default'} ${selectedPrice === stock.price ? '' : 'bg-slate-50 dark:bg-slate-800/50'}`}
            style={{
              background: selectedPrice === stock.price ? priceCol + '12' : undefined,
              outline: selectedPrice === stock.price ? `2px solid ${priceCol}` : 'none',
            }}
          >
            <span className={`text-[11px] font-extrabold ${META} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5`}>현재가</span>
            <span className={`text-base font-extrabold ${priceClass}`}>{wonShort(stock.price)}</span>
            <span className={`text-[13px] font-bold ${priceClass}`}>{signPct(stock.pct)}</span>
          </div>
          {bids.map((b, i) => <OBRow key={'b' + i} lvl={b} side="bid" />)}
        </>
      )}
    </Card>
  );
}

function Community({ stock, bare }) {
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
      <div className="flex gap-2.5 mb-[22px]">
        <button
          type="button"
          onClick={() => routerNavigate('/community/write')}
          className={`${BTN_PRIMARY} h-[46px] px-[22px] whitespace-nowrap`}
        >
          커뮤니티에 질문하기
        </button>
        <button
          type="button"
          onClick={() => routerNavigate('/community')}
          className={`${BTN_SECONDARY} h-[46px] px-[18px] rounded-xl text-sm font-extrabold whitespace-nowrap`}
        >
          전체 글 보기
        </button>
      </div>
      {status === 'loading' ? (
        <SkeletonText lines={3} widths={['64%', '92%', '78%']} height={14} gap={12} />
      ) : status === 'error' ? (
        <div className={`text-sm ${META} text-center py-6`}>커뮤니티 글을 불러올 수 없어요.</div>
      ) : posts.length === 0 ? (
        <div className={`text-sm ${META} text-center py-6`}>아직 등록된 글이 없어요.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <div key={post.id} onClick={() => routerNavigate(`/community/${post.id}`)} className="border-t border-slate-100 dark:border-slate-800 pt-4 cursor-pointer">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[13px]">{(post.authorNickname || '익').charAt(0)}</div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{post.authorNickname || '익명'}</span>
                <span className={`text-xs ${META}`}>{timeAgo(new Date(post.createdAt).getTime())}</span>
                {post.isResolved && <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-[7px] py-[3px] rounded-md">해결됨</span>}
              </div>
              <div className="text-[15px] font-extrabold leading-snug text-slate-900 dark:text-slate-100 mb-1">{post.title}</div>
              <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-2.5 overflow-hidden text-ellipsis line-clamp-2">{post.content}</div>
              <div className="flex items-center gap-4">
                <span className={`flex items-center gap-1.5 text-[13px] font-bold ${META}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" strokeLinejoin="round" /></svg>
                  답변 {post.answerCount ?? 0}
                </span>
                <span className={`text-[13px] font-bold ${META}`}>조회 {post.views ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
  if (bare) return inner;
  return (
    <Card className="mt-5">
      <PanelHeader right={<span className={`text-[13px] ${META} whitespace-nowrap`}>{posts.length}개 글</span>}>커뮤니티 · {displayStockName(stock)}</PanelHeader>
      {inner}
    </Card>
  );
}

Object.assign(window, { Detail, OrderPanel, Row, FinancialsChart, TickTape, OrderBook, Community });
