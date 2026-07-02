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

/**
 * Other companies in the same sector, for the detail page's "similar companies" panel.
 * @param {string} id
 * @param {number} [limit]
 * @returns {Company[]}
 */
export function getSimilarCompanies(id, limit = 4) {
  const target = DETAILS_BY_ID[id]?.company ?? ALL_COMPANIES.find((c) => c.id === id);
  if (!target) return [];
  return ALL_COMPANIES.filter((c) => c.id !== id && c.sector === target.sector).slice(0, limit);
}

export * from './types';
