import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
});

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

// ── 국내 시장 지표 및 동향 API 추가 ──

/**
 * 코스피/코스닥/환율 등 지수 조회 (TR_ID: FHPUP02100000 기반)
 */
export async function fetchMarketIndices() {
  const { data } = await client.get('/funds/market/indices');
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