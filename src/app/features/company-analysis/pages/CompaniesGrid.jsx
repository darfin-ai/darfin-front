import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCompanies } from '../api/companyAnalysisApi';
import { CompanyCard } from '../components/CompanyCard';
import { CompanySearchBar } from '../components/CompanySearchBar';
import { CompanyQuickLinks } from '../components/CompanyQuickLinks';
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
        const sorted = [...(data ?? [])].sort(
          (a, b) => mostRecentChangeMagnitude(b.scores) - mostRecentChangeMagnitude(a.scores),
        );
        setRows(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || '기업 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const searchResults = useMemo(() => rows.filter((row) => matchesQuery(row.company, query)), [rows, query]);
  const watchlistResults = useMemo(
    () => rows.filter((row) => watchedIds.includes(row.company.id) && matchesQuery(row.company, query)),
    [rows, watchedIds, query],
  );
  const allCompanies = useMemo(() => rows.map((row) => row.company), [rows]);
  const watchlistCompanies = useMemo(
    () => rows.filter((row) => watchedIds.includes(row.company.id)).map((row) => row.company),
    [rows, watchedIds],
  );

  function renderPanel(sourceRows, quickLinkSections) {
    if (query.trim()) {
      if (loading) {
        return <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">불러오는 중...</p>;
      }
      if (error) {
        return <p className="py-12 text-center text-sm text-red-500 dark:text-red-400">{error}</p>;
      }
      if (sourceRows.length === 0) {
        return (
          <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">"{query}"에 해당하는 기업을 찾을 수 없어요.</p>
        );
      }
      return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sourceRows.map(({ company, scores }, index) => (
            <CompanyCard
              key={company.id}
              company={company}
              scores={scores}
              index={index}
              isWatched={isWatched(company.id)}
              onToggleWatch={toggle}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-10">
        {quickLinkSections.map((section) => (
          <CompanyQuickLinks
            key={section.title}
            companies={section.companies}
            title={section.title}
            emptyMessage={section.emptyMessage}
            isWatched={isWatched}
            onToggleWatch={toggle}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="pt-10 pb-2">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">기업을 검색해보세요</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              기업명, 종목코드, 업종으로 검색하고 정기공시 변동을 확인하세요.
            </p>
          </div>

          <CompanySearchBar value={query} onChange={setQuery} inputRef={inputRef} />

          <TabsList className="mx-auto mt-4 w-fit gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1">
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100 dark:text-slate-400"
            >
              기업 검색
            </TabsTrigger>
            <TabsTrigger
              value="watchlist"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100 dark:text-slate-400"
            >관심 기업{watchedIds.length > 0 ? ` (${watchedIds.length})` : ''}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="search">
          <div className="pt-8">
            {renderPanel(searchResults, [
              {
                title: '전체 기업',
                companies: allCompanies,
                emptyMessage: loading ? '불러오는 중...' : '등록된 기업이 없어요.',
              },
            ])}
          </div>
        </TabsContent>

        <TabsContent value="watchlist">
          <div className="pt-8">
            {renderPanel(watchlistResults, [
              {
                title: '관심 기업',
                companies: watchlistCompanies,
                emptyMessage: '아직 관심 기업이 없어요. 별 아이콘을 눌러 추가해보세요.',
              },
            ])}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
