/**
 * 시가총액 상위 15개 KOSPI/KOSDAQ 종목코드 순서.
 * darfin-company-analysis/scripts/seed_companies.py 와 동일한 커버리지 목록.
 */
const KOSPI_TICKER_ORDER = [
  '005930', '000660', '402340', '009150', '005380', '373220', '032830', '028260',
  '207940', '000270', '105560', '329180', '012450', '055550', '034020',
];

const KOSDAQ_TICKER_ORDER = [
  '196170', '247540', '086520', '277810', '036930', '950160', '028300', '058470',
  '240810', '298380', '141080', '319660', '000250', '039030', '222800',
];

function sortByTickerOrder(companies, order) {
  const rank = new Map(order.map((ticker, index) => [ticker, index]));
  return [...companies].sort(
    (a, b) => (rank.get(a.ticker) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.ticker) ?? Number.MAX_SAFE_INTEGER),
  );
}

const KOSPI_TICKERS = new Set(KOSPI_TICKER_ORDER);
const KOSDAQ_TICKERS = new Set(KOSDAQ_TICKER_ORDER);

function marketOf(company) {
  if (company.market === 'KOSPI' || company.market === 'KOSDAQ') return company.market;
  if (KOSPI_TICKERS.has(company.ticker)) return 'KOSPI';
  if (KOSDAQ_TICKERS.has(company.ticker)) return 'KOSDAQ';
  return null;
}

/** @param {import('../../../../mocks/companyAnalysis/types').Company[]} companies */
export function groupCompaniesByMarket(companies, { preserveOrder = false } = {}) {
  const kospi = companies.filter((c) => marketOf(c) === 'KOSPI');
  const kosdaq = companies.filter((c) => marketOf(c) === 'KOSDAQ');
  if (preserveOrder) return { kospi, kosdaq };
  return {
    kospi: sortByTickerOrder(kospi, KOSPI_TICKER_ORDER),
    kosdaq: sortByTickerOrder(kosdaq, KOSDAQ_TICKER_ORDER),
  };
}

/** @param {import('../../../../mocks/companyAnalysis/types').Company[]} companies */
export function groupFeaturedCompanies(companies) {
  return groupCompaniesByMarket(companies);
}
