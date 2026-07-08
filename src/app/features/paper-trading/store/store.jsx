import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { fetchMarketIndices, fetchInvestorSentiment, fetchIndustryRanks, fetchWatchlist, addWatchlistItem, removeWatchlistItem, fetchPortfolio, paperCharge, paperReset, paperInitAmount, fetchStockSummaries } from '../lib/stockApi';
import { subscribe as stompSubscribe } from '../lib/stompClient';
// ===== Darfin global store + seed data =====
// Korean finance convention: 상승=빨강(red), 하락=파랑(blue)

const STOCK_META = {
  '000660': { color: '#E8344E' },
  '005930': { color: '#1428A0' },
  // 필요한 종목만 최소한으로
};

// 자금 이력 ts(epoch ms)가 오늘(KST 자정 기준)인지 판단 — 서버의 일일 충전 한도 판정과 동일 기준
function isTodayKst(ts) {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const dayIndex = (t) => Math.floor((t + KST_OFFSET) / 86400000);
  return dayIndex(ts) === dayIndex(Date.now());
}

// deterministic pseudo-random seeded by string
export function seedRand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// generate OHLCV candles ending near current price, trending toward today's pct
export function genCandles(stock, n) {
  const rnd = seedRand(stock.code + ':' + n);
  const end = stock.price;
  const drift = stock.pct >= 0 ? 1 : -1;
  // walk backwards from a start price to the end price
  const start = end * (1 - (stock.pct / 100) * 0.5 - drift * 0.18 - rnd() * 0.05);
  const candles = [];
  let prevClose = start;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const target = start + (end - start) * t;
    const vol = (0.012 + rnd() * 0.02);
    const open = prevClose;
    let close = target * (1 + (rnd() - 0.5) * vol * 2);
    if (i === n - 1) close = end;
    const hi = Math.max(open, close) * (1 + rnd() * vol);
    const lo = Math.min(open, close) * (1 - rnd() * vol);
    const volume = Math.round((0.6 + rnd()) * 1e6);
    candles.push({ i, open, close, hi, lo, volume });
    prevClose = close;
  }
  return candles;
}

// short sparkline points (0..1 normalized) for indices / cards
export function genSpark(seed, n, up) {
  const rnd = seedRand(seed);
  const pts = [];
  let v = 0.5;
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5) * 0.22 + (up ? 0.02 : -0.02);
    v = Math.max(0.05, Math.min(0.95, v));
    pts.push(v);
  }
  // force end direction
  pts[n - 1] = up ? Math.max(...pts) * 0.96 : Math.min(...pts) * 1.04;
  return pts;
}

const MARKET = {
  status: { label: '국내 정규장', hours: '09:00 ~ 15:30', open: true },
  kospi: null,
  kosdaq: null,
  usd: null,
  invSentiment: [
    { who: '개인',   val: 19395,  buy: true },
    { who: '외국인', val: -30305, buy: false },
    { who: '기관',   val: 9470,   buy: true },
  ],
};

const INDUSTRIES = [
  { name: '반도체 장비',  pct: 3.4 },
  { name: '온디바이스 AI', pct: 2.8 },
  { name: '자동차 부품',  pct: 1.5 },
  { name: 'HBM',         pct: 1.1 },
  { name: '제약/바이오',  pct: -0.8 },
];

const SCHEDULE = [
  { time: '오늘', text: '주간 신규실업수당 청구건수 발표' },
  { time: '오늘', text: '근원 생산자물가지수 발표(전월 대비)' },
  { time: '내일', text: '한국은행 기준금리 결정' },
];

const AI_COMMENTS = {
  '240810': '반도체 장비 투자 확대로 원익IPS 수주 기대감이 커지며 매수세가 유입됐어요.',
  '000660': 'HBM 공급 부족 지속과 메모리 가격 반등 기대에 외국인 매수가 이어지고 있어요.',
  '005930': '복합 대외 변수 영향으로 1.3% 하락했지만, 파운드리 회복 기대는 유효해요.',
  '348370': '2차전지 소재 신규 공급계약 소식에 장중 급등하며 상한가에 근접했어요.',
  '036930': '주요 고객사 증설 모멘텀으로 장비 발주가 늘어 강한 상승세를 보이고 있어요.',
};

const UNKNOWN_STOCK_NAME = '종목명 확인 중';
const STOCK_NAME_FIELDS = [
  'name', 'stockName', 'companyName', 'short', 'korName', 'koreanName',
  'stckName', 'stock_name', 'prdtName', 'prdt_name', 'htsKorIsnm', 'hts_kor_isnm',
];

function isStockCode(value) {
  return typeof value === 'string' && /^\d{6}$/.test(value.trim());
}

function usableStockName(value, code) {
  if (typeof value !== 'string') return '';
  const name = value.trim();
  if (!name || name === code || isStockCode(name)) return '';
  return name;
}

function pickStockName(source, code) {
  if (!source || typeof source !== 'object') return '';
  for (const field of STOCK_NAME_FIELDS) {
    const name = usableStockName(source[field], code);
    if (name) return name;
  }
  return '';
}

function normalizeStockName(source, code, previous) {
  return pickStockName(source, code) || pickStockName(previous, code) || UNKNOWN_STOCK_NAME;
}

function normalizeStockRecord(source, previous = {}) {
  const code = source?.code || source?.stockCode || previous?.code || '';
  const name = normalizeStockName(source, code, previous);
  return {
    ...previous,
    ...source,
    code,
    name,
    stockName: name,
    short: usableStockName(source?.short, code) || usableStockName(previous?.short, code) || name,
  };
}

function defaultState() {
  return {
    route: { name: 'home', params: {} },
    isLoggedIn: false,
    funds: { initialized: false, initialAmount: 10000000, cashBalance: 10000000, chargeCountToday: 0 },
    holdings: [],
    trades: [],
    watchlist: [], // 로그인 사용자의 DB 관심종목을 StoreProvider에서 별도로 불러와 채운다
    fundHistory: [], // 로그인 사용자의 DB 자금 이력을 refreshPortfolio에서 별도로 불러와 채운다
    aiReports: [],
  };
}

const LS_KEY = 'darfin_v1';
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const base = defaultState();
    const merged = { ...base, ...saved, route: base.route }; // route always starts at home
    // AI reports are user-owned DB data. Never resurrect them from browser cache.
    merged.aiReports = [];
    delete merged.community;
    // isLoggedIn/watchlist는 서버가 실제 출처(auth 세션 / DB) — 캐시된 값을 신뢰하지 않는다
    merged.isLoggedIn = false;
    merged.watchlist = [];
    return merged;
  } catch (e) { return defaultState(); }
}

const StoreContext = createContext(null);

export function StoreProvider({ children, initialLoggedIn, onLogout }) {
  const [state, setState] = useState(loadState);
  const [market, setMarket] = useState(MARKET);
  const [marketError, setMarketError] = useState(false);
  const [industries, setIndustries] = useState(INDUSTRIES);
  const [kisLoading, setKisLoading] = useState({
    ranks: true,
    market: true,
    sentiment: true,
    industries: true,
    watchlist: false,
    portfolio: false,
    summaries: false,
  });
  const routerNavigate = useNavigate();

  // ── 홈 화면 왼쪽: 4개 탭(거래대금/거래량/급상승/급하락) 순위 ──
  const [rankTab, setRankTab] = useState('tradeValue'); // 'tradeValue' | 'volume' | 'topGainers' | 'topLosers'
  const [allRanks, setAllRanks] = useState({ tradeValue: [], volume: [], topGainers: [], topLosers: [] }); // 4개 탭 데이터 전부 보관
  const [priceMap, setPriceMap] = useState({}); // /topic/price/{code} 실시간 틱 { code: { price, pct, value, volume } }
  const [stockNameCache, setStockNameCache] = useState({});
  const stockNameCacheRef = useRef({});

  // ── 홈 화면 오른쪽: 관심종목 10개 실시간 시세 ──
  const [watchStocks, setWatchStocks] = useState([]);

  // ── 종목 상세 페이지: /topic/detail/{code}/* 구독 중인 종목의 실시간 체결/호가 ──
  const [lastExecution, setLastExecution] = useState(null); // 가장 최근 체결 메시지 1건
  const [lastOrderBook, setLastOrderBook] = useState(null); // 가장 최근 호가 메시지(asks/bids 전체 교체용)

  useEffect(() => {
    try {
      const persistable = { ...state };
      delete persistable.aiReports;
      localStorage.setItem(LS_KEY, JSON.stringify(persistable));
    } catch (e) {
      console.warn('모의투자 상태 저장 실패', e);
    }
  }, [state]);

  // 관심종목 + 보유종목(모의투자) 코드를 합쳐서 실시간 구독 — 보유종목도 실제 KIS 틱으로 갱신되게 한다
  const subscribedCodes = useMemo(() => {
    return Array.from(new Set([...state.watchlist, ...state.holdings.map(h => h.code)]));
  }, [state.watchlist, state.holdings]);

  const applyMarketIndices = useCallback((data) => {
    setMarket(prev => ({
      ...prev,
      kospi: toMarketItem(data?.kospi, '코스피'),
      kosdaq: toMarketItem(data?.kosdaq, '코스닥'),
      usd: toMarketItem(data?.usd, '달러 환율'),
    }));
    setMarketError(false);
  }, []);

  const applyInvestorSentiment = useCallback((raw) => {
    const list = toSentimentList(raw);
    if (list) setMarket(prev => ({ ...prev, invSentiment: list }));
  }, []);

  const applyIndustryRanks = useCallback((raw) => {
    const list = toIndustryList(raw);
    if (list) setIndustries(list);
  }, []);

  const rememberStockNames = useCallback((items) => {
    const list = Array.isArray(items) ? items : [items].filter(Boolean);
    if (list.length === 0) return;
    setStockNameCache(prev => {
      let changed = false;
      const next = { ...prev };
      list.forEach(item => {
        const code = item?.code || item?.stockCode;
        if (!code) return;
        const normalized = normalizeStockRecord(item, prev[code]);
        if (normalized.name === UNKNOWN_STOCK_NAME) return;
        if (prev[code]?.name !== normalized.name || prev[code]?.short !== normalized.short) {
          next[code] = normalized;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    stockNameCacheRef.current = stockNameCache;
  }, [stockNameCache]);

  // 실제 로그인 상태(AuthContext/JWT)를 state.isLoggedIn에 반영 — 이전에는 이 prop이
  // 버려져서 로그인 여부와 무관하게 항상 로그인된 것처럼 보이는 버그가 있었다.
  useEffect(() => {
    setState(s => {
      const nextLoggedIn = !!initialLoggedIn;
      if (s.isLoggedIn === nextLoggedIn && (nextLoggedIn || s.aiReports.length === 0)) return s;
      return {
        ...s,
        isLoggedIn: nextLoggedIn,
        aiReports: nextLoggedIn ? s.aiReports : [],
      };
    });
  }, [initialLoggedIn]);

  // 관심종목: 로그인된 사용자의 DB 데이터를 서버에서 불러온다. 비로그인 시 빈 배열.
  useEffect(() => {
    if (!initialLoggedIn) {
      setState(s => (s.watchlist.length ? { ...s, watchlist: [] } : s));
      setKisLoading(prev => ({ ...prev, watchlist: false }));
      return;
    }
    let cancelled = false;
    setKisLoading(prev => ({ ...prev, watchlist: true }));
    fetchWatchlist()
      .then(items => {
        if (cancelled) return;
        const list = Array.isArray(items) ? items : [];
        const codes = list.map(item => typeof item === 'string' ? item : item.code).filter(Boolean);
        const namedStocks = list
          .filter(item => item && typeof item === 'object' && item.code)
          .map(item => normalizeStockRecord(item));
        rememberStockNames(namedStocks);
        setState(s => ({ ...s, watchlist: codes }));
        if (namedStocks.length > 0) setWatchStocks(namedStocks);
      })
      .catch(e => console.warn('관심종목 조회 실패', e))
      .finally(() => { if (!cancelled) setKisLoading(prev => ({ ...prev, watchlist: false })); });
    return () => { cancelled = true; };
  }, [initialLoggedIn]);

  // 모의투자 포트폴리오 조회 — 로그인 시 + 상세 페이지 주문 성공 후 재호출해 로컬 상태를 덮어씀.
  // /funds/paper/* 와 /funds/paper-trading/*는 같은 계좌/테이블을 쓰므로, 상세 페이지에서
  // 주문해도 이걸 다시 불러줘야 "내 자산" 페이지 잔액·보유가 즉시 갱신된다.
  const applyPortfolio = useCallback((portfolio) => {
    setState(s => ({
      ...s,
      funds: {
        initialized: true,
        initialAmount: portfolio.funds.initialAmount,
        cashBalance: portfolio.funds.cashBalance,
        // 서버가 오늘 자정(KST) 이후 CHARGE 이력 수로 일일 한도를 강제하므로, 화면 표시용 카운트도 그 이력에서 계산한다.
        chargeCountToday: (portfolio.fundHistory || []).filter(h => h.type === 'CHARGE' && isTodayKst(h.ts)).length,
      },
      holdings: portfolio.holdings.map(h => ({
        code: h.code,
        name: normalizeStockName(h, h.code),
        short: normalizeStockName(h, h.code),
        qty: h.qty,
        avgPrice: h.avgPrice,
        currentPrice: h.currentPrice,
        valuationPnl: h.valuationPnl,
        valuationPnlRate: h.valuationPnlRate,
      })),
      trades: portfolio.trades.map(t => ({
        id: String(t.id), code: t.code, type: t.type,
        qty: t.qty, price: t.price, ts: t.ts, pnl: t.pnl, holdDays: t.holdDays,
      })),
      fundHistory: (portfolio.fundHistory || []).map(h => ({ id: String(h.id), type: h.type, amount: h.amount, ts: h.ts })),
    }));
  }, []);

  const refreshPortfolio = useCallback(() => {
    setKisLoading(prev => ({ ...prev, portfolio: true }));
    return fetchPortfolio()
      .then(applyPortfolio)
      .catch(e => console.warn('포트폴리오 조회 실패', e))
      .finally(() => setKisLoading(prev => ({ ...prev, portfolio: false })));
  }, [applyPortfolio]);

  useEffect(() => {
    rememberStockNames(state.holdings);
  }, [rememberStockNames, state.holdings]);

  // 비로그인 시 holdings/trades 초기화, funds는 기본값 유지. 로그인 시 서버에서 로드.
  useEffect(() => {
    if (!initialLoggedIn) {
      setState(s => ({ ...s, holdings: [], trades: [],
        funds: { initialized: false, initialAmount: 10000000, cashBalance: 10000000, chargeCountToday: 0 } }));
      return;
    }
    refreshPortfolio();
  }, [initialLoggedIn, refreshPortfolio]);

  // STOMP 구독 1회: /app/rank(캐시 스냅샷, 구독 즉시 1회) + /topic/rank(10초 주기 실시간 갱신)
  useEffect(() => {
    const handleRank = (msg) => {
      if (!msg) return;
      const normalizeRankList = (list) => (Array.isArray(list) ? list : [])
        .map(item => normalizeStockRecord(item, stockNameCacheRef.current[item?.code]));
      setAllRanks({
        tradeValue: normalizeRankList(msg.tradeValue),
        volume: normalizeRankList(msg.volume),
        topGainers: normalizeRankList(msg.topGainers),
        topLosers: normalizeRankList(msg.topLosers),
      });
      rememberStockNames([...(msg.tradeValue || []), ...(msg.volume || []), ...(msg.topGainers || []), ...(msg.topLosers || [])]);
      setKisLoading(prev => ({ ...prev, ranks: false }));
      if (msg.marketOverview) {
        applyMarketIndices({
          kospi: msg.marketOverview.indices?.find(item => item.code === '0001'),
          kosdaq: msg.marketOverview.indices?.find(item => item.code === '1001'),
          usd: msg.marketOverview.usdKrw,
        });
      }
      // 60초 캐시 주기로 포함될 때만 갱신 (없으면 REST 초기값 유지)
      if (msg.investorSentiment) applyInvestorSentiment(msg.investorSentiment);
      if (msg.industries) applyIndustryRanks(msg.industries);
    };

    const unsubSnapshot = stompSubscribe('/app/rank', handleRank);
    const unsubTopic = stompSubscribe('/topic/rank', handleRank);

    return () => { unsubSnapshot(); unsubTopic(); };
  }, [applyMarketIndices, applyInvestorSentiment, applyIndustryRanks, rememberStockNames]); // 마운트 시 1회 구독

  const summaryCodes = useMemo(() => {
    return Array.from(new Set([...state.watchlist, ...state.holdings.map(h => h.code)]));
  }, [state.watchlist, state.holdings]);

  const rankCodesNeedingNames = useMemo(() => {
    return Array.from(new Set([
      ...allRanks.tradeValue,
      ...allRanks.volume,
      ...allRanks.topGainers,
      ...allRanks.topLosers,
    ]
      .filter(s => s?.code && (!pickStockName(s, s.code) || s.name === UNKNOWN_STOCK_NAME))
      .map(s => s.code)));
  }, [allRanks]);

  // 관심종목/보유종목 초기 스냅샷 — REST로 이름/로고/기준가 로드 (실시간 갱신은 아래 /topic/price/{code} 구독이 담당)
  useEffect(() => {
    if (summaryCodes.length === 0) {
      setWatchStocks([]);
      setKisLoading(prev => ({ ...prev, summaries: false }));
      return;
    }
    let cancelled = false;

    setKisLoading(prev => ({ ...prev, summaries: true }));
    fetchStockSummaries(summaryCodes)
      .then(stocks => {
        if (cancelled) return;
        const normalized = (stocks || []).map(stock => normalizeStockRecord(stock, stockNameCache[stock?.code]));
        rememberStockNames(normalized);
        setWatchStocks(normalized);
      })
      .catch(e => console.warn('관심/보유 종목 시세 조회 실패', e))
      .finally(() => { if (!cancelled) setKisLoading(prev => ({ ...prev, summaries: false })); });
    return () => { cancelled = true; };
  }, [rememberStockNames, stockNameCache, summaryCodes]);

  useEffect(() => {
    if (rankCodesNeedingNames.length === 0) return;
    let cancelled = false;
    fetchStockSummaries(rankCodesNeedingNames)
      .then(stocks => {
        if (cancelled) return;
        rememberStockNames((stocks || []).map(stock => normalizeStockRecord(stock, stockNameCache[stock?.code])));
      })
      .catch(e => console.warn('순위 종목명 보강 조회 실패', e));
    return () => { cancelled = true; };
  }, [rankCodesNeedingNames, rememberStockNames, stockNameCache]);

  // 순위표(4탭) + 관심종목/보유종목 코드 전체에 대해 /topic/price/{code} 실시간 틱 구독을 동기화
  const priceTargetCodes = useMemo(() => {
    const set = new Set(subscribedCodes);
    [...allRanks.tradeValue, ...allRanks.volume, ...allRanks.topGainers, ...allRanks.topLosers].forEach(s => {
      if (s) set.add(s.code);
    });
    return set;
  }, [allRanks, subscribedCodes]);

  const priceSubsRef = useRef(new Map()); // code -> unsubscribe fn
  useEffect(() => {
    const subs = priceSubsRef.current;

    priceTargetCodes.forEach(code => {
      if (subs.has(code)) return;
      const unsub = stompSubscribe(`/topic/price/${code}`, (tick) => {
        if (!tick) return;
        setPriceMap(prev => ({
          ...prev,
          [tick.code]: { price: tick.price, pct: tick.pct, value: tick.tradeValue, volume: tick.volume },
        }));
      });
      subs.set(code, unsub);
    });

    for (const code of Array.from(subs.keys())) {
      if (!priceTargetCodes.has(code)) {
        subs.get(code)();
        subs.delete(code);
      }
    }
  }, [priceTargetCodes]);

  useEffect(() => {
    let cancelled = false;

    const loadMarket = async () => {
      const [indicesRes, sentimentRes, industriesRes] = await Promise.allSettled([
        fetchMarketIndices(),
        fetchInvestorSentiment(),
        fetchIndustryRanks(),
      ]);

      if (cancelled) return;

      if (indicesRes.status === 'fulfilled') applyMarketIndices(indicesRes.value);
      else { console.warn('시장 지표 조회 실패', indicesRes.reason); setMarketError(true); }

      if (sentimentRes.status === 'fulfilled') applyInvestorSentiment(sentimentRes.value);
      else console.warn('투자자 동향 조회 실패', sentimentRes.reason);

      if (industriesRes.status === 'fulfilled') applyIndustryRanks(industriesRes.value);
      else console.warn('산업 순위 조회 실패', industriesRes.reason);

      setKisLoading(prev => ({ ...prev, market: false, sentiment: false, industries: false }));
    };

    loadMarket();
    const timer = setInterval(loadMarket, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [applyMarketIndices, applyInvestorSentiment, applyIndustryRanks]);

  // 현재 탭 데이터: 실제 KIS 틱(priceMap)이 있으면 우선 반영
  const stocks = useMemo(() => {
    const base = allRanks[rankTab] ?? [];
    return base.map(s => {
      const live = priceMap[s.code]; // 실제 KIS 실시간 틱
      const cached = stockNameCache[s.code];
      const baseStock = normalizeStockRecord(s, cached);
      if (!live) return baseStock;
      return normalizeStockRecord({
        ...baseStock,
        ...live,
        code: s.code,
        value: live.value ?? s.value,
        volume: live.volume ?? s.volume,
      }, cached);
    });
  }, [allRanks, rankTab, priceMap, stockNameCache]);

  const enrichedWatchStocks = useMemo(() => {
    return watchStocks.map(stock => normalizeStockRecord(stock, stockNameCache[stock.code]));
  }, [stockNameCache, watchStocks]);
 
  // ----- derived helpers -----

  // 4개 탭 전체 + 관심종목 + 보유종목 + 직접 수신한 틱을 하나의 맵으로 통합
  const stockMap = useMemo(() => {
    const m = {};
    [
      ...allRanks.tradeValue,
      ...allRanks.volume,
      ...allRanks.topGainers,
      ...allRanks.topLosers,
      ...enrichedWatchStocks,
      ...state.holdings.map(h => ({
        code: h.code,
        name: normalizeStockName(h, h.code, stockNameCache[h.code]),
        short: normalizeStockName(h, h.code, stockNameCache[h.code]),
        price: h.currentPrice ?? h.avgPrice ?? 0,
        pct: 0,
      })),
      ...Object.entries(priceMap).map(([code, live]) => ({ code, price: live.price, pct: live.pct })),
      ...Object.values(stockNameCache),
    ].forEach(s => {
      if (!s || !s.code) return;
      const live = priceMap[s.code];
      const price = live?.price ?? s.price ?? 0;
      const pct = Number(live?.pct != null ? live.pct : (s.pct ?? 0)) || 0;
      const value = live?.value ?? s.value;
      const volume = live?.volume ?? s.volume;
      const changeAmt = Math.round(price - price / (1 + pct / 100));
      const prev = m[s.code] || stockNameCache[s.code] || {};
      const isLiveOnly = Object.prototype.hasOwnProperty.call(priceMap, s.code)
        && s.price === priceMap[s.code]?.price
        && s.value == null
        && s.volume == null;
      const snapPrice = isLiveOnly
        ? (prev.snapPrice ?? prev.price ?? s.price ?? 0)
        : (s.price ?? prev.snapPrice ?? 0);
      const snapPct = isLiveOnly
        ? (prev.snapPct ?? 0)
        : (Number(s.pct ?? prev.snapPct ?? 0) || 0);
      m[s.code] = normalizeStockRecord({
        ...prev,
        ...s,
        price,
        pct,
        value,
        volume,
        changeAmt,
        snapPrice,
        snapPct,
      }, prev);
    });
    return m;
  }, [allRanks, enrichedWatchStocks, state.holdings, priceMap, stockNameCache]);
 
  // 중복된 선언 축소 (하나만 남김)
  const getStock = useCallback((code) => stockMap[code], [stockMap]);

  // ----- actions -----
  const navigate = useCallback((name, params = {}) => {
    setState(s => ({ ...s, route: { name, params } }));
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, []);

  // "로그인" CTA(관심종목/포트폴리오 등 게이트) — 실제 로그인 페이지로 이동
  const goToLogin = useCallback(() => routerNavigate('/login'), [routerNavigate]);

  // 관심종목 추가/삭제 — DB에 즉시 반영(낙관적 갱신) 후 실패 시 콘솔 경고만 남긴다.
  // 비로그인 상태면 어차피 서버가 401을 반환하므로 여기서 바로 로그인 페이지로 보낸다.
  const toggleWatch = useCallback((code) => {
    if (!initialLoggedIn) { goToLogin(); return; }
    setState(s => {
      const has = s.watchlist.includes(code);
      if (has) {
        removeWatchlistItem(code).catch(e => console.warn('관심종목 삭제 실패', e));
        return { ...s, watchlist: s.watchlist.filter(c => c !== code) };
      }
      if (s.watchlist.length >= 30) return s; // 최대 30개
      addWatchlistItem(code).catch(e => console.warn('관심종목 추가 실패', e));
      return { ...s, watchlist: [code, ...s.watchlist] };
    });
  }, [initialLoggedIn, goToLogin]);

  // 종목 상세 페이지 마운트(또는 종목 변경) 시 1회 호출 — 해당 종목의 실시간 체결/호가만 이 세션으로 수신
  const detailSubsRef = useRef(null); // { unsubExec, unsubBook } | null
  const subscribeDetail = useCallback((code) => {
    setLastExecution(null);
    setLastOrderBook(null);
    if (detailSubsRef.current) {
      detailSubsRef.current.unsubExec();
      detailSubsRef.current.unsubBook();
      detailSubsRef.current = null;
    }
    if (!code) return;
    const unsubExec = stompSubscribe(`/topic/detail/${code}/execution`, (msg) => {
      if (!msg) return;
      setLastExecution({ price: msg.price, quantity: msg.quantity, changeRate: msg.changeRate, time: msg.time });
    });
    const unsubBook = stompSubscribe(`/topic/detail/${code}/orderbook`, (msg) => {
      if (!msg) return;
      setLastOrderBook({ asks: msg.asks, bids: msg.bids });
    });
    detailSubsRef.current = { unsubExec, unsubBook };
  }, []);

  // 충전/초기화/초기금액 설정은 DB가 유일한 출처(서버가 일일 한도도 강제)이므로,
  // 낙관적으로 화면을 먼저 갱신한 뒤 서버 응답으로 즉시 덮어써 동기화한다.
  const chargeFunds = useCallback((amount) => {
    if (!initialLoggedIn) return;
    setState(s => {
      if (s.funds.chargeCountToday >= 3) return s; // 1일 3회 제한
      return { ...s, funds: { ...s.funds, cashBalance: s.funds.cashBalance + amount, chargeCountToday: s.funds.chargeCountToday + 1 } };
    });
    paperCharge(amount).then(applyPortfolio).catch(e => { console.warn('충전 실패', e); refreshPortfolio(); });
  }, [initialLoggedIn, applyPortfolio, refreshPortfolio]);

  const resetFunds = useCallback(() => {
    if (!initialLoggedIn) return;
    setState(s => ({ ...s, holdings: [], trades: [], funds: { ...s.funds, cashBalance: s.funds.initialAmount, chargeCountToday: 0 } }));
    paperReset().then(applyPortfolio).catch(e => { console.warn('초기화 실패', e); refreshPortfolio(); });
  }, [initialLoggedIn, applyPortfolio, refreshPortfolio]);

  const setInitialFunds = useCallback((amount) => {
    if (!initialLoggedIn) return;
    setState(s => ({ ...s, funds: { initialized: true, initialAmount: amount, cashBalance: amount, chargeCountToday: 0 } }));
    paperInitAmount(amount).then(applyPortfolio).catch(e => { console.warn('초기금액 설정 실패', e); refreshPortfolio(); });
  }, [initialLoggedIn, applyPortfolio, refreshPortfolio]);

  const addAiReport = useCallback((report) => {
    setState(s => ({ ...s, aiReports: [{ id: 'r' + Date.now(), ts: Date.now(), ...report }, ...s.aiReports] }));
  }, []);

  const setAiReports = useCallback((reports) => {
    setState(s => {
      const map = new Map();
      (reports || []).forEach((report) => {
        if (!report || !report.health) return;
        const key = report.remoteReportId ? `remote:${report.remoteReportId}` : `local:${report.id || report.ts || Date.now()}`;
        map.set(key, {
          id: report.id || `r${report.remoteReportId || report.ts || Date.now()}`,
          ...report,
        });
      });
      const aiReports = Array.from(map.values()).sort((a, b) => (b.ts || 0) - (a.ts || 0));
      return { ...s, aiReports };
    });
  }, []);

  const value = {
    state, getStock, stocks, watchStocks, stockMap, rankTab, setRankTab,
    market, industries, schedule: SCHEDULE, aiComments: AI_COMMENTS,
    marketError, kisLoading,
    genCandles, genSpark, seedRand,
    navigate, goToLogin, toggleWatch, refreshPortfolio, chargeFunds, resetFunds, setInitialFunds, addAiReport, setAiReports,
    lastExecution, lastOrderBook, subscribeDetail,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() { return useContext(StoreContext); }

function toMarketItem(raw, fallbackName) {
  if (!raw || raw.price == null) return null;

  const pct = Number(raw.pct ?? 0);
  const amt = Number(raw.change ?? 0);
  const spark = Array.isArray(raw.spark) && raw.spark.length > 1
    ? raw.spark.map(Number).filter(Number.isFinite)
    : null;

  return {
    code: raw.code,
    name: raw.name || fallbackName,
    value: Number(raw.price),
    pct,
    amt,
    up: pct >= 0,
    spark,
  };
}

// 백엔드 투자자 동향 응답 → { who, val, buy }[] 변환
// 백엔드가 이미 정규화한 형태(who 필드 존재) 또는 KIS invType 코드(01/02/03) 형태 모두 처리
const INV_LABEL = { '01': '개인', '02': '외국인', '03': '기관', '04': '기타' };
function toSentimentList(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const list = raw.map(s => {
    const who = s.who ?? INV_LABEL[s.invType] ?? s.invType ?? '';
    const val = Number(s.val ?? s.netBuy ?? s.buyAmt ?? 0);
    return { who, val, buy: val >= 0 };
  }).filter(s => s.who);
  return list.length > 0 ? list : null;
}

// 백엔드 산업 순위 응답 → { name, pct, code?, value? }[] 변환
function toIndustryList(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const list = raw.map(ind => ({
    name: ind.name ?? ind.industryName ?? ind.upjong_nm ?? '',
    pct: Number(ind.pct ?? ind.changeRate ?? ind.prdy_ctrt ?? 0),
    code: ind.code ?? ind.industryCode ?? undefined,
    value: ind.value != null ? Number(ind.value) : undefined,
  })).filter(ind => ind.name);
  return list.length > 0 ? list : null;
}

// RAW_STOCKS 제거하여 런타임 ReferenceError 방지
Object.assign(window, { StoreContext, StoreProvider, useStore, genCandles, genSpark, seedRand });
