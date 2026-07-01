import axios from 'axios';
import { getAccessToken } from '../../../shared/api/apiClient';

const client = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
});

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── 순위 4종 (홈 화면 왼쪽 탭 — 거래대금/거래량/급상승/급하락) ──
// KIS 실전 도메인 호출이지만 조회 전용. 백엔드가 1회 호출로 14개를 한꺼번에 줌.

export async function fetchTradeValueRank() {
  const { data } = await client.get('/funds/ranks/trade-value');
  return data;
}

export async function fetchVolumeRank() {
  const { data } = await client.get('/funds/ranks/volume');
  return data;
}

export async function fetchTopGainers() {
  const { data } = await client.get('/funds/ranks/top-gainers');
  return data;
}

export async function fetchTopLosers() {
  const { data } = await client.get('/funds/ranks/top-losers');
  return data;
}

/**
 * 탭 키값으로 알맞은 순위 API를 호출하는 통합 함수.
 * tab: 'tradeValue' | 'volume' | 'topGainers' | 'topLosers'
 */
export async function fetchRankByTab(tab) {
  switch (tab) {
    case 'volume': return fetchVolumeRank();
    case 'topGainers': return fetchTopGainers();
    case 'topLosers': return fetchTopLosers();
    case 'tradeValue':
    default: return fetchTradeValueRank();
  }
}

// ── 관심종목 (홈 화면 오른쪽 — 사용자가 찜한 종목들의 현재가) ──
// KIS 모의투자 도메인 호출. 종목 코드 배열을 넘기면 백엔드가 순차 처리(Rate Limit 회피) 후 반환.

export async function fetchStockSummaries(codes) {
  const { data } = await client.get('/funds/stocks/summaries', {
    params: { codes: codes.join(',') },
  });
  return data;
}

export async function fetchStockSummary(code) {
  const { data } = await client.get(`/funds/stocks/${code}/summary`);
  return data;
}

/**
 * 일봉 차트 데이터 (최대 ~200개, oldest-first).
 * 반환: [{ date, open, high, low, close, volume }, ...]
 */
export async function fetchCandleData(code) {
  const { data } = await client.get(`/funds/stocks/${code}/candles`, { timeout: 30000 });
  return data;
}

/**
 * 분봉 차트 데이터 (최근 ~90개, oldest-first).
 * 반환: [{ date(HHMMSS), open, high, low, close, volume }, ...]
 */
export async function fetchIntradayData(code) {
  const { data } = await client.get(`/funds/stocks/${code}/candles/intraday`, { timeout: 30000 });
  return data;
}

/**
 * 시봉 차트 데이터 — 분봉을 시간 단위로 집계 (최근 ~35개, oldest-first).
 * 반환: [{ date(YYYYMMDDHH), open, high, low, close, volume }, ...]
 */
export async function fetchWeeklyData(code) {
  const { data } = await client.get(`/funds/stocks/${code}/candles/weekly`, { timeout: 60000 });
  return data;
}

/**
 * 호가 초기 로드.
 * 반환: { currentPrice, changeRate, asks: [{price, quantity}], bids: [{price, quantity}] }
 * asks[0]/bids[0]이 현재가에 가장 가까운 최우선호가.
 */
export async function fetchOrderBook(code) {
  const { data } = await client.get(`/funds/stocks/${code}/orderbook`);
  return data;
}

/**
 * 최근 체결 초기 로드 (최신 순).
 * 반환: [{ price, quantity, changeRate, time }, ...]
 */
export async function fetchExecutions(code) {
  const { data } = await client.get(`/funds/stocks/${code}/executions`);
  return data;
}

/**
 * 일별 시세 (최신 순, 최대 100일).
 * 반환: [{ date(YYYY-MM-DD), closePrice, changeRate, volume }, ...]
 */
export async function fetchDailyPrices(code) {
  const { data } = await client.get(`/funds/stocks/${code}/daily`);
  return data;
}

// ── 국내 시장 지표 및 동향 API 추가 ──

/**
 * 코스피/코스닥/환율 등 지수 조회 (TR_ID: FHPUP02100000 기반)
 */
export async function fetchMarketIndices() {
  const { data } = await client.get('/funds/market/indices');
  return data;
}

/**
 * 지수 일봉 차트 (KOSPI=0001, KOSDAQ=1001). 최대 ~200개, oldest-first.
 * 반환: [{ date, open, high, low, close, volume }, ...]
 */
export async function fetchIndexCandles(indexCode) {
  const { data } = await client.get(`/funds/market/indices/${indexCode}/candles`, { timeout: 30000 });
  return data;
}

/**
 * USD/KRW 환율 일봉 차트. 최대 ~200개, oldest-first.
 */
export async function fetchUsdKrwCandles() {
  const { data } = await client.get('/funds/market/exchange/usd-krw/candles', { timeout: 30000 });
  return data;
}

/**
 * 지수 당일 분봉(오늘 장중 흐름). 1분 간격, oldest-first.
 * 환율은 이 계정 권한으로 분봉을 제공하지 않아 해당 엔드포인트가 없다.
 */
export async function fetchIndexIntradayCandles(indexCode) {
  const { data } = await client.get(`/funds/market/indices/${indexCode}/candles/intraday`, { timeout: 30000 });
  return data;
}

/**
 * 지금 뜨는 산업 / 업종별 시세 조회 (TR_ID: FHPUP02140000 기반)
 */
export async function fetchIndustryRanks() {
  const { data } = await client.get('/funds/market/industries');
  return data;
}

/**
 * 당일 투자자별 매매동향 조회 (TR_ID: HHPPG046600C1 기반)
 */
export async function fetchInvestorSentiment() {
  const { data } = await client.get('/funds/market/investor-sentiment');
  return data;
}

// ── 관심종목 (로그인 사용자별 DB 영속) ──
// 인증 필요 — /funds/watchlist/** 는 SecurityConfig에서 authenticated()로 보호됨.

export async function fetchWatchlist() {
  const { data } = await client.get('/funds/watchlist', { headers: authHeaders() });
  return data;
}

export async function addWatchlistItem(code) {
  await client.put(`/funds/watchlist/${code}`, null, { headers: authHeaders() });
}

export async function removeWatchlistItem(code) {
  await client.delete(`/funds/watchlist/${code}`, { headers: authHeaders() });
}