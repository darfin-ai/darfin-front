import { request } from '../../../shared/api/apiClient';

/** @returns {Promise<{ company: import('../../../../mocks/companyAnalysis/types').Company, scores: import('../../../../mocks/companyAnalysis/types').ScoreComponent[] }[]>} */
export function fetchCompanies() {
  return request('/api/v1/companies');
}

/** @returns {Promise<{ corpCode: string, name: string, ticker: string, market?: string | null, analyzed: boolean }[]>} */
export function searchCompanies(keyword) {
  const query = encodeURIComponent(keyword.trim());
  return request(`/api/v1/companies/search?keyword=${query}`);
}

/** @returns {Promise<import('../../../../mocks/companyAnalysis/types').StarredCompanyList>} */
export function fetchStarredCompanies() {
  return request('/api/v1/companies/starred');
}

/** @returns {Promise<import('../../../../mocks/companyAnalysis/types').StarredCompany>} */
export function addStarredCompany(corpCode) {
  return request(`/api/v1/companies/starred/${encodeURIComponent(corpCode)}`, { method: 'POST' });
}

/** @returns {Promise<void>} */
export function removeStarredCompany(corpCode) {
  return request(`/api/v1/companies/starred/${encodeURIComponent(corpCode)}`, { method: 'DELETE' });
}

/**
 * AI 분석 열람권 구매 — 2000토큰 차감(1회), 관심 기업 자동 등록.
 * 잔액 부족 시 request()가 { status: 402 }를 던진다.
 * @returns {Promise<import('../../../../mocks/companyAnalysis/types').AiUnlockResult>}
 */
export function unlockAiAnalysis(corpCode) {
  return request(`/api/v1/companies/${encodeURIComponent(corpCode)}/ai-analysis/unlock`, { method: 'POST' });
}

/**
 * AI분석 탭 데이터 (리스크 상태머신 궤적 — on-demand 계산이라 콜드 기업은 수 초 걸릴 수 있음).
 * 열람권 미보유 시 status='locked' 게이트 응답이 온다.
 * @returns {Promise<import('../../../../mocks/companyAnalysis/types').AiAnalysis>}
 */
export function fetchAiAnalysis(corpCode) {
  return request(`/api/v1/companies/${encodeURIComponent(corpCode)}/ai-analysis`);
}

/** Explicitly retry a failed AI narrative job. */
export function retryAiAnalysis(corpCode) {
  return request(`/api/v1/companies/${encodeURIComponent(corpCode)}/ai-analysis/retry`, { method: 'POST' });
}

/**
 * corp_code가 존재하지 않으면 apiClient의 request()가 { status: 404 }를 던진다.
 * @returns {Promise<import('../../../../mocks/companyAnalysis/types').CompanyDetail>}
 */
export async function fetchCompanyDetail(corpCode) {
  try {
    return await request(`/api/v1/companies/${encodeURIComponent(corpCode)}`);
  } catch (err) {
    // DEV 한정: 픽스처 corpCode는 백엔드 없이도 UI 확인 가능
    if (import.meta.env.DEV) {
      const [{ mockDevCompanyDetailFor }, { mockDevFinancialDetailFor }] = await Promise.all([
        import('../../../../mocks/companyAnalysis/dartOverview'),
        import('../../../../mocks/companyAnalysis/financialTrends'),
      ]);
      const mock = (await mockDevFinancialDetailFor(corpCode)) ?? mockDevCompanyDetailFor(corpCode);
      if (mock) return mock;
    }
    throw err;
  }
}
