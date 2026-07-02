import { samsungElectronics } from './samsungElectronics';
import { lgEnergySolution } from './lgEnergySolution';
import { topKospiCompanies } from './topKospi';
import { topKosdaqCompanies } from './topKosdaq';

/** @typedef {import('./types').Company} Company */
/** @typedef {import('./types').CompanyDetail} CompanyDetail */

/** @type {CompanyDetail[]} */
const ALL_DETAILS = [samsungElectronics, lgEnergySolution];

/** @type {Record<string, CompanyDetail>} */
const DETAILS_BY_ID = Object.fromEntries(ALL_DETAILS.map((d) => [d.company.id, d]));

/**
 * Every known company, whether or not it has a full CompanyDetail behind it
 * (see topKospi.js / topKosdaq.js — most of the top-15 quicklinks are
 * lightweight entries with no deep filing analysis yet).
 * @type {Company[]}
 */
const ALL_COMPANIES = [...ALL_DETAILS.map((d) => d.company), ...topKospiCompanies, ...topKosdaqCompanies];

/** @returns {Company[]} */
export function getCompanies() {
  return ALL_COMPANIES;
}

/**
 * @param {string} id
 * @returns {CompanyDetail | undefined}
 */
export function getCompanyDetail(id) {
  return DETAILS_BY_ID[id];
}

/** Top 15 KOSPI companies by (illustrative) market cap, for the search hero's quicklinks. */
export function getTopKospiCompanies() {
  return ALL_COMPANIES.filter((c) => typeof c.marketCapRank === 'number')
    .sort((a, b) => a.marketCapRank - b.marketCapRank)
    .slice(0, 15);
}

/** Top 15 KOSDAQ companies by (illustrative) market cap, for the search hero's quicklinks. */
export function getTopKosdaqCompanies() {
  return ALL_COMPANIES.filter((c) => typeof c.kosdaqRank === 'number')
    .sort((a, b) => a.kosdaqRank - b.kosdaqRank)
    .slice(0, 15);
}

export * from './types';
