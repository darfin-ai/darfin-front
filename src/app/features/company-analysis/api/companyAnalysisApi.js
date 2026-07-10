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

/** @returns {Promise<import('../../../../mocks/companyAnalysis/types').MonitoredCompanyList>} */
export function fetchMonitoredCompanies() {
  return request('/api/v1/companies/monitored');
}

/** @returns {Promise<import('../../../../mocks/companyAnalysis/types').MonitoredCompany>} */
export function addMonitoredCompany(corpCode) {
  return request(`/api/v1/companies/monitored/${encodeURIComponent(corpCode)}`, { method: 'POST' });
}

/** @returns {Promise<void>} */
export function removeMonitoredCompany(corpCode) {
  return request(`/api/v1/companies/monitored/${encodeURIComponent(corpCode)}`, { method: 'DELETE' });
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
