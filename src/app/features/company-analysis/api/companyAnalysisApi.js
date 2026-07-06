import { request } from '../../../shared/api/apiClient';

/** @returns {Promise<{ company: import('../../../../mocks/companyAnalysis/types').Company, scores: import('../../../../mocks/companyAnalysis/types').ScoreComponent[] }[]>} */
export function fetchCompanies() {
  return request('/api/v1/companies');
}

/**
 * corp_code가 존재하지 않으면 apiClient의 request()가 { status: 404 }를 던진다.
 * @returns {Promise<import('../../../../mocks/companyAnalysis/types').CompanyDetail>}
 */
export function fetchCompanyDetail(corpCode) {
  return request(`/api/v1/companies/${encodeURIComponent(corpCode)}`);
}
