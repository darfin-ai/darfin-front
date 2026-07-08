import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '../../../shared/i18n';
import { fetchCompanies } from '../api/companyAnalysisApi';
import { CompanySearchBar } from '../components/CompanySearchBar';
import { CompanyQuickLinks } from '../components/CompanyQuickLinks';
import { FeaturedCompaniesBrowse } from '../components/FeaturedCompaniesBrowse';
import { groupCompaniesByMarket } from '../lib/featuredCompanies';
import { mostRecentChangeMagnitude } from '../lib/scoring';
import { useWatchlist } from '../lib/useWatchlist';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui/tabs';

function matchesQuery(company, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    company.name.toLowerCase().includes(q) ||
    company.ticker.toLowerCase().includes(q) ||
    (company.sector ?? '').toLowerCase().includes(q)
  );
}

export function CompaniesGrid() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const { ids: watchedIds, isWatched, toggle } = useWatchlist();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCompanies()
      .then((data) => {
        if (cancelled) return;
        setRows(data ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || t('company.grid.loadFail'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const searchResults = useMemo(
    () =>
      rows
        .filter((row) => matchesQuery(row.company, query))
        .sort((a, b) => mostRecentChangeMagnitude(b.scores) - mostRecentChangeMagnitude(a.scores)),
    [rows, query],
  );
  const watchlistResults = useMemo(
    () =>
      rows
        .filter((row) => watchedIds.includes(row.company.id) && matchesQuery(row.company, query))
        .sort((a, b) => mostRecentChangeMagnitude(b.scores) - mostRecentChangeMagnitude(a.scores)),
    [rows, watchedIds, query],
  );

  const featuredByMarket = useMemo(
    () => groupCompaniesByMarket(rows.map((row) => row.company)),
    [rows],
  );

  const watchlistCompanies = useMemo(() => {
    const byId = new Map(rows.map((row) => [row.company.id, row.company]));
    return watchedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [rows, watchedIds]);

  const watchlistByMarket = useMemo(
    () => groupCompaniesByMarket(watchlistCompanies, { preserveOrder: true }),
    [watchlistCompanies],
  );

  function renderPanel(sourceRows, browseProps) {
    if (query.trim()) {
      if (loading) {
        return <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">{t('common.loading')}</p>;
      }
      if (error) {
        return <p className="py-12 text-center text-sm text-red-500 dark:text-red-400">{error}</p>;
      }
      return (
        <CompanyQuickLinks
          companies={sourceRows.map((row) => row.company)}
          title={t('company.grid.searchResults')}
          emptyMessage={t('company.grid.noMatch', { query })}
          isWatched={isWatched}
          onToggleWatch={toggle}
        />
      );
    }
    return (
      <FeaturedCompaniesBrowse
        isWatched={isWatched}
        onToggleWatch={toggle}
        {...browseProps}
      />
    );
  }

  const hasWatchlist = watchlistCompanies.length > 0;

  return (
    <div className="container pb-16">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="pt-10 pb-2">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('company.grid.title')}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t('company.grid.subtitle')}
            </p>
          </div>

          <CompanySearchBar value={query} onChange={setQuery} inputRef={inputRef} />

          <TabsList className="mx-auto mt-4 w-fit gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1">
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100 dark:text-slate-400"
            >
              {t('company.grid.tabSearch')}
            </TabsTrigger>
            <TabsTrigger
              value="watchlist"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100 dark:text-slate-400"
            >
              {t('company.grid.tabWatchlist')}{watchedIds.length > 0 ? ` (${watchedIds.length})` : ''}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="search">
          <div className="pt-8">
            {renderPanel(searchResults, {
              kospiCompanies: featuredByMarket.kospi,
              kosdaqCompanies: featuredByMarket.kosdaq,
              emptyMessage: loading ? t('common.loading') : t('company.grid.noCompanies'),
            })}
          </div>
        </TabsContent>

        <TabsContent value="watchlist">
          <div className="pt-8">
            {renderPanel(watchlistResults, {
              kospiCompanies: watchlistByMarket.kospi,
              kosdaqCompanies: watchlistByMarket.kosdaq,
              emptyMessage: t('company.grid.noWatchlist'),
              kospiEmptyHint: hasWatchlist && watchlistByMarket.kospi.length === 0 ? t('company.grid.kospiWatchlistEmpty') : undefined,
              kosdaqEmptyHint: hasWatchlist && watchlistByMarket.kosdaq.length === 0 ? t('company.grid.kosdaqWatchlistEmpty') : undefined,
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
