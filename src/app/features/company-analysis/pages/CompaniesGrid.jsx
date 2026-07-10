import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLocale } from '../../../shared/i18n';
import { useAuth } from '../../auth';
import { fetchCompanies, searchCompanies } from '../api/companyAnalysisApi';
import { CompanySearchBar } from '../components/CompanySearchBar';
import { CompanySearchResults } from '../components/CompanySearchResults';
import { MyAnalysisSection } from '../components/MyAnalysisSection';
import { getPlanLabelKey } from '../lib/monitoringPlan';
import { useMonitoredCompanies } from '../lib/useMonitoredCompanies';
import { usePageMeta } from '../../../shared/hooks/usePageMeta';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

export function CompaniesGrid() {
  const { t } = useLocale();

  usePageMeta({
    title: t("seo.company.title"),
    description: t("seo.company.description"),
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [analysisRows, setAnalysisRows] = useState([]);
  const [stockResults, setStockResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const { items, limit, count, canAddMore, isMonitored, loading: monitoredLoading } = useMonitoredCompanies();

  const trimmedQuery = query.trim();
  const isStockSearch = trimmedQuery.length >= MIN_SEARCH_LENGTH;

  const planLabel = t(getPlanLabelKey(user?.subscriptionLevel));

  useEffect(() => {
    let cancelled = false;
    fetchCompanies()
      .then((data) => {
        if (!cancelled) setAnalysisRows(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setAnalysisRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStockSearch) {
      setStockResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setSearchLoading(true);
      setSearchError(null);
      searchCompanies(trimmedQuery)
        .then((data) => {
          if (!cancelled) setStockResults(data ?? []);
        })
        .catch((err) => {
          if (!cancelled) setSearchError(err.message || t('company.grid.searchFail'));
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery, isStockSearch, t]);

  const filingDatesByCorp = useMemo(() => {
    const map = {};
    for (const row of analysisRows) {
      map[row.company.id] = row.company.latestFilingDate ?? null;
    }
    return map;
  }, [analysisRows]);

  const handleSearchSelect = useCallback(
    (result) => {
      setSearchError(null);
      navigate(`/company/${result.corpCode}`);
    },
    [navigate],
  );

  return (
    <div className="container pb-16">
      <header className="pt-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('company.monitoring.pageTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('company.monitoring.pageSubtitle')}
        </p>
      </header>

      <div className="mx-auto mt-8 w-full max-w-2xl">
        <CompanySearchBar value={query} onChange={setQuery} inputRef={inputRef} />
      </div>

      <div className="mx-auto mt-12 w-full max-w-2xl">
        {isStockSearch ? (
          <>
            {searchError && (
              <p className="mb-4 text-center text-sm text-red-500 dark:text-red-400">{searchError}</p>
            )}
            <CompanySearchResults
              results={stockResults}
              loading={searchLoading}
              isMonitored={isMonitored}
              onSelect={handleSearchSelect}
              emptyMessage={t('company.grid.noMatch', { query: trimmedQuery })}
            />
          </>
        ) : monitoredLoading ? (
          <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">{t('common.loading')}</p>
        ) : (
          <MyAnalysisSection
            items={items}
            count={count}
            limit={limit}
            planLabel={planLabel}
            filingDatesByCorp={filingDatesByCorp}
            atLimit={!canAddMore}
          />
        )}
      </div>
    </div>
  );
}
