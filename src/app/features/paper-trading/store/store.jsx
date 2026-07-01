import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { fetchMarketIndices, fetchWatchlist, addWatchlistItem, removeWatchlistItem } from '../lib/stockApi';
// ===== Darfin global store + seed data =====
// Korean finance convention: 상승=빨강(red), 하락=파랑(blue)

const STOCK_META = {
  '000660': { color: '#E8344E' },
  '005930': { color: '#1428A0' },
  // 필요한 종목만 최소한으로
};

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

function defaultState() {
  return {
    route: { name: 'home', params: {} },
    isLoggedIn: false,
    funds: { initialized: true, initialAmount: 10000000, cashBalance: 4156000, chargeCountToday: 0 },
    holdings: [
      { code: '005930', qty: 10, avgPrice: 295000 },
      { code: '240810', qty: 8,  avgPrice: 118000 },
      { code: '000660', qty: 1,  avgPrice: 1950000 },
    ],
    trades: [
      { id: 't6', code: '319400', type: 'SELL', qty: 20, price: 39700,   ts: Date.now() - 86400000 * 1, pnl: 96000 },
      { id: 't5', code: '066570', type: 'SELL', qty: 5,  price: 221500,  ts: Date.now() - 86400000 * 4, pnl: -47500 },
      { id: 't4', code: '319400', type: 'BUY',  qty: 20, price: 34900,   ts: Date.now() - 86400000 * 14, pnl: null },
      { id: 't3b', code: '066570', type: 'BUY', qty: 5,  price: 231000,  ts: Date.now() - 86400000 * 18, pnl: null },
      { id: 't3', code: '000660', type: 'BUY',  qty: 1,  price: 1950000, ts: Date.now() - 86400000 * 2, pnl: null },
      { id: 't2', code: '240810', type: 'BUY',  qty: 8,  price: 118000,  ts: Date.now() - 86400000 * 5, pnl: null },
      { id: 't1', code: '005930', type: 'BUY',  qty: 10, price: 295000,  ts: Date.now() - 86400000 * 9, pnl: null },
    ],
    watchlist: [], // 로그인 사용자의 DB 관심종목을 StoreProvider에서 별도로 불러와 채운다
    fundHistory: [
      { id: 'f1', type: 'INIT',   amount: 10000000, ts: Date.now() - 86400000 * 12 },
    ],
    aiReports: [],
    community: {
      '000660': [
        { id: 'c1', author: '반도체러버', ts: Date.now() - 3600000 * 5, text: 'HBM4 양산 일정이 예상보다 빠른 것 같은데, 다들 어떻게 보세요? 3분기 실적 기대해도 될까요?', likes: 24, liked: false,
          comments: [
            { id: 'cc1', author: '존버중', ts: Date.now() - 3600000 * 4, text: '엔비디아향 공급 비중이 커서 저는 긍정적으로 봅니다.' },
            { id: 'cc2', author: '소심한개미', ts: Date.now() - 3600000 * 2, text: '단기 과열 구간이라 분할 접근이 안전할 듯해요.' },
          ] },
        { id: 'c2', author: '모의왕', ts: Date.now() - 86400000, text: '52주 신고가 갱신했네요. 추격 매수 들어가신 분 계신가요?', likes: 11, liked: false, comments: [] },
      ],
      '240810': [
        { id: 'c3', author: '장비주전문', ts: Date.now() - 3600000 * 8, text: '원익IPS 수주잔고가 계속 늘고 있어서 내년 실적 기대됩니다. 업종 전체가 같이 가네요.', likes: 8, liked: false, comments: [
          { id: 'cc3', author: '뉴비투자', ts: Date.now() - 3600000 * 6, text: '저도 모의로 담아봤어요. 변동성은 감안해야 할 듯!' },
        ] },
      ],
    },
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
    // migrate: drop legacy AI reports (old format without .health) and ensure community exists
    merged.aiReports = (merged.aiReports || []).filter(r => r && r.health);
    if (!merged.community) merged.community = base.community;
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
  const routerNavigate = useNavigate();

  // ── 홈 화면 왼쪽: 4개 탭(거래대금/거래량/급상승/급하락) 순위 ──
  const [rankTab, setRankTab] = useState('tradeValue'); // 'tradeValue' | 'volume' | 'topGainers' | 'topLosers'
  const [allRanks, setAllRanks] = useState({ tradeValue: [], volume: [], topGainers: [], topLosers: [] }); // 4개 탭 데이터 전부 보관
  const [priceMap, setPriceMap] = useState({}); // PRICE 메시지로 덮어쓰는 실시간 가격 { code: { price, pct } }
  const [simPrices, setSimPrices] = useState({}); // 시뮬레이션 가격 { code: { price, pct } } — RANK 수신 시 리셋

  // ── 홈 화면 오른쪽: 관심종목 10개 실시간 시세 ──
  const [watchStocks, setWatchStocks] = useState([]);

  const wsRef = useRef(null);
  // 관심종목 + 보유종목(모의투자) 코드를 합쳐서 구독 — 보유종목도 실시간(10초) 실제가로 갱신되게 한다
  const subscribedCodes = useMemo(() => {
    return Array.from(new Set([...state.watchlist, ...state.holdings.map(h => h.code)]));
  }, [state.watchlist, state.holdings]);
  const subscribedCodesRef = useRef(subscribedCodes);

  const applyMarketIndices = useCallback((data) => {
    setMarket(prev => ({
      ...prev,
      kospi: toMarketItem(data?.kospi, '코스피'),
      kosdaq: toMarketItem(data?.kosdaq, '코스닥'),
      usd: toMarketItem(data?.usd, '달러 환율'),
    }));
    setMarketError(false);
  }, []);

  // 구독 코드 목록을 ref로 항상 최신값 유지 (WebSocket onopen에서 stale closure 방지)
  useEffect(() => {
    subscribedCodesRef.current = subscribedCodes;
  }, [subscribedCodes]);

  // 실제 로그인 상태(AuthContext/JWT)를 state.isLoggedIn에 반영 — 이전에는 이 prop이
  // 버려져서 로그인 여부와 무관하게 항상 로그인된 것처럼 보이는 버그가 있었다.
  useEffect(() => {
    setState(s => (s.isLoggedIn === !!initialLoggedIn ? s : { ...s, isLoggedIn: !!initialLoggedIn }));
  }, [initialLoggedIn]);

  // 관심종목: 로그인된 사용자의 DB 데이터를 서버에서 불러온다. 비로그인 시 빈 배열.
  useEffect(() => {
    if (!initialLoggedIn) {
      setState(s => (s.watchlist.length ? { ...s, watchlist: [] } : s));
      return;
    }
    let cancelled = false;
    fetchWatchlist()
      .then(codes => { if (!cancelled) setState(s => ({ ...s, watchlist: codes })); })
      .catch(e => console.warn('관심종목 조회 실패', e));
    return () => { cancelled = true; };
  }, [initialLoggedIn]);

  // WebSocket 1회 연결: RANK / PRICE / WATCHLIST 수신
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws/stocks');
    wsRef.current = ws;

    ws.onopen = () => {
      const codes = subscribedCodesRef.current;
      if (codes.length > 0) {
        ws.send(JSON.stringify({ type: 'SUBSCRIBE', codes }));
      }
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === 'RANK') {
        setAllRanks({
          tradeValue: msg.tradeValue,
          volume: msg.volume,
          topGainers: msg.topGainers,
          topLosers: msg.topLosers,
        });
        if (msg.marketOverview) {
          applyMarketIndices({
            kospi: msg.marketOverview.indices?.find(item => item.code === '0001'),
            kosdaq: msg.marketOverview.indices?.find(item => item.code === '1001'),
            usd: msg.marketOverview.usdKrw,
          });
        }
        setSimPrices({}); // 실제 데이터 수신 시 시뮬레이션 오프셋 초기화
      }

      if (msg.type === 'PRICE') {
        setPriceMap(prev => ({ ...prev, [msg.code]: { price: msg.price, pct: msg.pct } }));
      }

      if (msg.type === 'WATCHLIST') {
        setWatchStocks(msg.stocks);
      }
    };

    ws.onerror = (e) => console.error('WS 오류', e);
    ws.onclose = () => console.warn('WS 종료');

    return () => ws.close();
  }, [applyMarketIndices]); // 마운트 시 1회 연결

  useEffect(() => {
    let cancelled = false;

    const loadMarket = async () => {
      try {
        const data = await fetchMarketIndices();
        if (!cancelled) applyMarketIndices(data);
      } catch (e) {
        console.warn('시장 지표 조회 실패', e);
        if (!cancelled) setMarketError(true);
      }
    };

    loadMarket();
    const timer = setInterval(loadMarket, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [applyMarketIndices]);

  // 관심종목/보유종목이 바뀌면 WebSocket으로 구독 갱신 (REST 폴링 불필요)
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || subscribedCodes.length === 0) return;
    ws.send(JSON.stringify({ type: 'SUBSCRIBE', codes: subscribedCodes }));
  }, [subscribedCodes]);

  // 랭크 종목 마이크로 시뮬레이션: KIS WebSocket 구독 한도 우회
  // - 실제 KIS 틱(priceMap)이 있는 종목은 스킵 — stocks useMemo에서 priceMap이 우선
  // - RANK 수신(allRanks 변경) 시 useEffect 재실행 → 이전 타이머 정리 + 오프셋 초기화
  useEffect(() => {
    const allStocks = Object.values(
      [...allRanks.tradeValue, ...allRanks.volume, ...allRanks.topGainers, ...allRanks.topLosers]
        .reduce((acc, s) => { acc[s.code] = s; return acc; }, {})
    );
    if (allStocks.length === 0) return;

    // 종목마다 독립적인 다음 틱 시각 — 초기 스태거로 첫 업데이트도 분산
    const nextTickAt = {};
    const now = Date.now();
    allStocks.forEach(s => {
      nextTickAt[s.code] = now + Math.random() * 2000; // 0~2초 내 랜덤 첫 틱
    });

    // 300ms마다 "업데이트 시간이 된 종목만" 틱 처리
    const timer = setInterval(() => {
      const t = Date.now();
      setSimPrices(prev => {
        const next = { ...prev };
        let changed = false;
        for (const s of allStocks) {
          if (t < nextTickAt[s.code]) continue; // 아직 아님

          const cur = next[s.code] || { price: s.price, pct: Number(s.pct) };
          const tickRange = cur.price * 0.0004;
          const trendBias = cur.pct >= 0 ? 0.08 : -0.08;
          const delta = (Math.random() - 0.5 + trendBias) * tickRange;
          const newPrice = Math.max(1, Math.round(cur.price + delta));

          if (Math.abs((newPrice - s.price) / s.price) < 0.005) {
            next[s.code] = { price: newPrice, pct: cur.pct + (delta / cur.price * 100) };
            changed = true;
          }

          // 다음 틱은 1~4초 사이 랜덤
          nextTickAt[s.code] = t + 1000 + Math.random() * 3000;
        }
        return changed ? next : prev;
      });
    }, 300);

    return () => clearInterval(timer);
  }, [allRanks]); // RANK 갱신 시 타이머 재시작

  // 현재 탭 데이터: 실시간 KIS 틱 > 시뮬레이션 > RANK 스냅샷 순 우선순위
  const stocks = useMemo(() => {
    const base = allRanks[rankTab] ?? [];
    return base.map(s => {
      const live = priceMap[s.code]; // 실제 KIS WebSocket 틱
      if (live) return { ...s, price: live.price, pct: live.pct };
      const sim = simPrices[s.code]; // 시뮬레이션
      if (sim) return { ...s, price: sim.price, pct: sim.pct };
      return s;
    });
  }, [allRanks, rankTab, priceMap, simPrices]);
 
  // ----- derived helpers -----

  // 4개 탭 전체 + 관심종목을 하나의 맵으로 통합
  // watchStocks가 마지막이라 rank보다 최신 가격으로 덮어씀
  const stockMap = useMemo(() => {
    const m = {};
    [
      ...allRanks.tradeValue,
      ...allRanks.volume,
      ...allRanks.topGainers,
      ...allRanks.topLosers,
      ...watchStocks,
    ].forEach(s => {
      if (!s) return;
      const live = priceMap[s.code];
      const sim = simPrices[s.code];
      const price = live?.price ?? sim?.price ?? s.price ?? 0;
      const pct = Number(live?.pct != null ? live.pct : sim?.pct != null ? sim.pct : (s.pct ?? 0)) || 0;
      const changeAmt = Math.round(price - price / (1 + pct / 100));
      // snapPrice/snapPct: 실시간 틱·시뮬레이션을 섞지 않은 10초 주기 실측값 그대로.
      // 모의투자 "내 자산" 계산처럼 10초에 한 번만 바뀌어야 하는 곳에서 사용한다.
      m[s.code] = { ...s, price, pct, changeAmt, snapPrice: s.price ?? 0, snapPct: Number(s.pct ?? 0) || 0 };
    });
    return m;
  }, [allRanks, watchStocks, priceMap, simPrices]);
 
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

  const buy = useCallback((code, qty, price) => {
    setState(s => {
      const cost = qty * price;
      if (cost > s.funds.cashBalance) return s; // insufficient
      const holdings = [...s.holdings];
      const idx = holdings.findIndex(h => h.code === code);
      if (idx >= 0) {
        const h = holdings[idx];
        const totalQty = h.qty + qty;
        const avg = Math.round((h.avgPrice * h.qty + price * qty) / totalQty);
        holdings[idx] = { ...h, qty: totalQty, avgPrice: avg };
      } else holdings.push({ code, qty, avgPrice: price });
      const trades = [{ id: 't' + Date.now(), code, type: 'BUY', qty, price, ts: Date.now(), pnl: null }, ...s.trades];
      return { ...s, holdings, trades, funds: { ...s.funds, cashBalance: s.funds.cashBalance - cost } };
    });
  }, []);

  const sell = useCallback((code, qty, price) => {
    setState(s => {
      const idx = s.holdings.findIndex(h => h.code === code);
      if (idx < 0) return s;
      const h = s.holdings[idx];
      const sellQty = Math.min(qty, h.qty);
      const proceeds = sellQty * price;
      const pnl = Math.round((price - h.avgPrice) * sellQty);
      let holdings = [...s.holdings];
      if (sellQty >= h.qty) holdings.splice(idx, 1);
      else holdings[idx] = { ...h, qty: h.qty - sellQty };
      const trades = [{ id: 't' + Date.now(), code, type: 'SELL', qty: sellQty, price, ts: Date.now(), pnl }, ...s.trades];
      return { ...s, holdings, trades, funds: { ...s.funds, cashBalance: s.funds.cashBalance + proceeds } };
    });
  }, []);

  const chargeFunds = useCallback((amount) => {
    setState(s => {
      if (s.funds.chargeCountToday >= 3) return s; // 1일 3회 제한
      return {
        ...s,
        funds: { ...s.funds, cashBalance: s.funds.cashBalance + amount, chargeCountToday: s.funds.chargeCountToday + 1 },
        fundHistory: [{ id: 'f' + Date.now(), type: 'CHARGE', amount, ts: Date.now() }, ...s.fundHistory],
      };
    });
  }, []);

  const resetFunds = useCallback(() => {
    setState(s => ({
      ...s,
      holdings: [],
      trades: [],
      funds: { ...s.funds, cashBalance: s.funds.initialAmount, chargeCountToday: 0 },
      fundHistory: [{ id: 'f' + Date.now(), type: 'RESET', amount: s.funds.initialAmount, ts: Date.now() }, ...s.fundHistory],
      // ai_reports 유지
    }));
  }, []);

  const setInitialFunds = useCallback((amount) => {
    setState(s => ({
      ...s,
      funds: { initialized: true, initialAmount: amount, cashBalance: amount, chargeCountToday: 0 },
      fundHistory: [{ id: 'f' + Date.now(), type: 'INIT', amount, ts: Date.now() }, ...s.fundHistory],
    }));
  }, []);

  const addAiReport = useCallback((report) => {
    setState(s => ({ ...s, aiReports: [{ id: 'r' + Date.now(), ts: Date.now(), ...report }, ...s.aiReports] }));
  }, []);

  const addPost = useCallback((code, text) => {
    setState(s => {
      const list = s.community[code] || [];
      const post = { id: 'c' + Date.now(), author: '나', ts: Date.now(), text, likes: 0, liked: false, comments: [] };
      return { ...s, community: { ...s.community, [code]: [post, ...list] } };
    });
  }, []);
  const togglePostLike = useCallback((code, postId) => {
    setState(s => {
      const list = (s.community[code] || []).map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p);
      return { ...s, community: { ...s.community, [code]: list } };
    });
  }, []);
  const addComment = useCallback((code, postId, text) => {
    setState(s => {
      const list = (s.community[code] || []).map(p => p.id === postId
        ? { ...p, comments: [...p.comments, { id: 'cc' + Date.now(), author: '나', ts: Date.now(), text }] } : p);
      return { ...s, community: { ...s.community, [code]: list } };
    });
  }, []);

  const value = {
    state, getStock, stocks, watchStocks, stockMap, rankTab, setRankTab,
    market, industries: INDUSTRIES, schedule: SCHEDULE, aiComments: AI_COMMENTS,
    marketError,
    genCandles, genSpark, seedRand,
    navigate, goToLogin, toggleWatch, buy, sell, chargeFunds, resetFunds, setInitialFunds, addAiReport,
    addPost, togglePostLike, addComment,
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

// RAW_STOCKS 제거하여 런타임 ReferenceError 방지
Object.assign(window, { StoreContext, StoreProvider, useStore, genCandles, genSpark, seedRand });
