// AI 분석 계산은 FastAPI Python 백엔드(app/services/calculator.py)에서 수행한다.
export const DISCLAIMER = '이 리포트는 모의투자 학습을 목적으로 제공되며, 특정 종목의 매수·매도를 권유하지 않아요.';

const INVESTMENT_API_BASE_URL = import.meta.env.VITE_INVESTMENT_API_BASE_URL || 'http://127.0.0.1:8001';

export function getDarfinUser() {
  try {
    return JSON.parse(localStorage.getItem('darfin_user') || 'null');
  } catch {
    return null;
  }
}

export function getDarfinUserId() {
  const user = getDarfinUser();
  const id = user?.id ?? user?.userId ?? null;
  return id != null && String(id).trim() ? String(id) : null;
}

function stockSnapshotFor(code, getStock, fallback = {}) {
  const stock = getStock(code) || {};
  const name = stock.name || stock.stockName || fallback.name || fallback.short || code;
  return {
    ...fallback,
    ...stock,
    code,
    name,
    stockName: name,
    short: stock.short || fallback.short || name,
    sector: stock.sector || fallback.sector || '미분류',
    price: Number(stock.price ?? fallback.currentPrice ?? fallback.price ?? fallback.avgPrice ?? 0) || 0,
  };
}

export function buildPortfolioAnalysisPayload(state, getStock) {
  const codes = new Set([
    ...(state.holdings || []).map(item => item.code),
    ...(state.trades || []).map(item => item.code),
    ...(state.watchlist || []),
  ].filter(Boolean));
  const stocks = {};
  codes.forEach(code => {
    const fallback = (state.holdings || []).find(item => item.code === code)
      || (state.trades || []).find(item => item.code === code)
      || {};
    stocks[code] = stockSnapshotFor(code, getStock, fallback);
  });

  return {
    funds: state.funds,
    holdings: state.holdings || [],
    trades: state.trades || [],
    watchlist: state.watchlist || [],
    fundHistory: state.fundHistory || [],
    stocks,
  };
}

export async function fetchStoredPortfolioReports(limit = 20) {
  const userId = getDarfinUserId();
  if (!userId) return [];

  const response = await fetch(`${INVESTMENT_API_BASE_URL}/analysis/portfolio/reports/${encodeURIComponent(userId)}?limit=${limit}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.detail || data?.message || `저장된 리포트 조회 실패 (HTTP ${response.status})`;
    throw new Error(message);
  }

  return Array.isArray(data?.reports) ? data.reports : [];
}

export async function generatePythonPortfolioAnalysis(state, getStock) {
  const user = getDarfinUser();
  const userId = getDarfinUserId();
  const payload = buildPortfolioAnalysisPayload(state, getStock);
  const response = await fetch(`${INVESTMENT_API_BASE_URL}/analysis/portfolio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId ? String(userId) : null,
      nickname: user?.nickname || user?.name || user?.email || '회원',
      state: {
        funds: payload.funds,
        holdings: payload.holdings,
        trades: payload.trades,
        watchlist: payload.watchlist,
        fundHistory: payload.fundHistory,
      },
      stocks: payload.stocks,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.detail)
      ? data.detail.map(item => item.msg).join(', ')
      : data?.detail || data?.message || `Python 투자분석 요청 실패 (HTTP ${response.status})`;
    throw new Error(message);
  }

  return {
    metrics: data?.metrics || null,
    report: data?.report || null,
    analysis: data?.analysis || null,
    reportId: data?.report_id || null,
    dbError: data?.db_error || null,
  };
}
