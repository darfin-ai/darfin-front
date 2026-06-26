import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
// ===== Darfin global store + seed data =====
// Korean finance convention: 상승=빨강(red), 하락=파랑(blue)

// ---------- seed: domestic stock universe (from Toss screenshot) ----------
const RAW_STOCKS = [
  { code: '000660', name: 'SK하이닉스',        price: 2095000, pct: 2.29,   value: 440, sector: '반도체',       color: '#E8344E' },
  { code: '005930', name: '삼성전자',          price: 300000,  pct: -0.82,  value: 251, sector: '반도체',       color: '#1428A0' },
  { code: '091230', name: 'KODEX SK하이닉스레버리지', short: 'KODEX SK하이...', price: 22725, pct: 4.53, value: 203, sector: 'ETF', color: '#2A7DE1' },
  { code: '348370', name: '스피어',            price: 38450,   pct: 29.67,  value: 165, sector: '2차전지',     color: '#E8344E' },
  { code: '462010', name: 'SOL SK하이닉스인버스2X', short: 'SOL SK하이닉스...', price: 14395, pct: -3.16, value: 154, sector: 'ETF', color: '#2A7DE1' },
  { code: '036930', name: '주성엔지니어링',     price: 245500,  pct: 23.36,  value: 137, sector: '반도체 장비', color: '#8B1A1A' },
  { code: '240810', name: '원익IPS',           price: 140400,  pct: 20.30,  value: 112, sector: '반도체 장비', color: '#1B5FA8' },
  { code: '100790', name: '미래에셋벤처투자',   price: 44000,   pct: 11.53,  value: 89,  sector: '금융',        color: '#5B3FA0' },
  { code: '001820', name: '삼화콘덴서',         price: 138300,  pct: 26.18,  value: 76,  sector: '전자부품',     color: '#C0392B' },
  { code: '319400', name: '현대무벡스',         price: 39700,   pct: 12.14,  value: 61,  sector: '기계',        color: '#1FA463' },
  { code: '066570', name: 'LG전자',            price: 221500,  pct: -1.11,  value: 58,  sector: '가전',        color: '#A50034' },
  { code: '009150', name: '삼성전기',          price: 1788000, pct: -0.94,  value: 52,  sector: '전자부품',     color: '#1428A0' },
  { code: '042700', name: '한미반도체',         price: 96800,   pct: 5.42,   value: 48,  sector: '반도체 장비', color: '#0E7C66' },
  { code: '247540', name: '에코프로비엠',       price: 187200,  pct: -2.04,  value: 44,  sector: '2차전지',     color: '#2E7D32' },
];

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
  kospi:  { name: '코스피', value: 7752.76, pct: 0.28, amt: 21.94, up: true,  spark: genSpark('kospi', 30, true) },
  kosdaq: { name: '코스닥', value: 990.53,  pct: 4.08, amt: 38.90, up: true,  spark: genSpark('kosdaq', 30, true), tag: '개인 순매수세' },
  usd:    { name: '달러 환율', value: 1525.30, pct: 0.19, amt: 2.90, up: true,  spark: genSpark('usd', 30, true), tag: '외국인 매도세' },
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
    isLoggedIn: true,
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
    watchlist: ['348370', '036930', '005930', '000660', '100790', '001820', '319400', '066570', '240810', '009150'],
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
    return merged;
  } catch (e) { return defaultState(); }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    const { route, ...persist } = state;
    try { localStorage.setItem(LS_KEY, JSON.stringify(persist)); } catch (e) {}
  }, [state]);

  // ----- derived helpers -----
  const stockMap = useMemo(() => {
    const m = {};
    RAW_STOCKS.forEach(s => {
      const changeAmt = Math.round(s.price - s.price / (1 + s.pct / 100));
      m[s.code] = { ...s, changeAmt };
    });
    return m;
  }, []);
  const getStock = useCallback((code) => stockMap[code], [stockMap]);

  // ----- actions -----
  const navigate = useCallback((name, params = {}) => {
    setState(s => ({ ...s, route: { name, params } }));
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, []);

  const setLoggedIn = useCallback((v) => setState(s => ({ ...s, isLoggedIn: v })), []);

  const toggleWatch = useCallback((code) => setState(s => {
    const has = s.watchlist.includes(code);
    if (has) return { ...s, watchlist: s.watchlist.filter(c => c !== code) };
    if (s.watchlist.length >= 30) return s; // 최대 30개
    return { ...s, watchlist: [code, ...s.watchlist] };
  }), []);

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
    state, getStock, stocks: RAW_STOCKS, stockMap,
    market: MARKET, industries: INDUSTRIES, schedule: SCHEDULE, aiComments: AI_COMMENTS,
    genCandles, genSpark, seedRand,
    navigate, setLoggedIn, toggleWatch, buy, sell, chargeFunds, resetFunds, setInitialFunds, addAiReport,
    addPost, togglePostLike, addComment,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() { return useContext(StoreContext); }

Object.assign(window, { StoreContext, StoreProvider, useStore, genCandles, genSpark, seedRand, RAW_STOCKS });
