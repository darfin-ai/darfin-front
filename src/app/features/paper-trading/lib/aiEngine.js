import { request } from '../../../shared/api/apiClient.js';
import { normalizeUserObject, normalizeUserText, userDisplayName } from '../../../shared/lib/userText.js';

// AI 분석 요청은 Spring Boot API가 받고, 서버에서 Python 분석 서버 호출/DB 저장을 담당한다.
export const DISCLAIMER = '이 리포트는 모의투자 학습을 목적으로 제공되며, 특정 종목의 매수·매도를 권유하지 않아요.';

const PORTFOLIO_ANALYSIS_PATH = '/api/analysis/portfolio';

function parseJsonish(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function unwrapApiData(data) {
  return data?.data ?? data?.result ?? data;
}

function timestampOf(value) {
  if (!value) return undefined;
  if (typeof value === 'number') return value;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}

function normalizePortfolioReportEnvelope(item) {
  const source = parseJsonish(item);
  if (!source || typeof source !== 'object') return source;

  const nestedReport = parseJsonish(source.report || source.analysisReport || source.portfolioReport);
  const report = nestedReport && typeof nestedReport === 'object'
    ? (nestedReport.report && typeof nestedReport.report === 'object' ? nestedReport.report : nestedReport)
    : source;

  return {
    ...report,
    id: report.id || source.id || source.reportId || source.report_id || source.remoteReportId,
    ts: report.ts || source.ts || timestampOf(source.createdAt || source.created_at || source.generatedAt || source.generated_at),
    nickname: normalizeUserText(report.nickname || source.nickname),
    geminiAnalysis: report.geminiAnalysis || source.geminiAnalysis || source.analysis,
    remoteReportId: report.remoteReportId || source.remoteReportId || source.reportId || source.report_id || source.id,
    dbError: report.dbError || source.dbError || source.db_error,
  };
}

function extractReportList(data) {
  const body = unwrapApiData(data);
  const reports = Array.isArray(body)
    ? body
    : body?.reports || body?.content || body?.items || body?.data?.reports || [];

  return Array.isArray(reports) ? reports.map(normalizePortfolioReportEnvelope) : [];
}

export function getDarfinUser() {
  try {
    const user = normalizeUserObject(JSON.parse(sessionStorage.getItem('darfin_user') || 'null'));
    if (user) sessionStorage.setItem('darfin_user', JSON.stringify(user));
    return user;
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
  const data = await request(`${PORTFOLIO_ANALYSIS_PATH}/reports?limit=${encodeURIComponent(limit)}`, {
    method: 'GET',
  });

  return extractReportList(data);
}

export async function generatePortfolioAnalysis(state, getStock) {
  const user = getDarfinUser();
  const payload = buildPortfolioAnalysisPayload(state, getStock);
  const data = await request(PORTFOLIO_ANALYSIS_PATH, {
    method: 'POST',
    body: JSON.stringify({
      nickname: userDisplayName(user),
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

  const body = unwrapApiData(data);
  const report = normalizePortfolioReportEnvelope(body?.report || body?.analysisReport || body);

  return {
    metrics: body?.metrics || null,
    report: report?.health ? report : body?.report || null,
    analysis: body?.analysis || body?.geminiAnalysis || null,
    reportId: body?.reportId || body?.report_id || body?.id || null,
    dbError: body?.dbError || body?.db_error || null,
  };
}
