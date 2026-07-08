import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '../../../shared/i18n';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '../../../shared/components/ui/carousel';
import { Button } from '../../../shared/components/ui/button';
import { CompanyQuickLinks } from './CompanyQuickLinks';
import { CompanyQuickLinkTile } from './CompanyQuickLinkTile';

const PAGE_SIZE = 5;

function chunkCompanies(companies, size) {
  const pages = [];
  for (let i = 0; i < companies.length; i += size) {
    pages.push(companies.slice(i, i + size));
  }
  return pages;
}

function MarketColumn({ label, companies, emptyHint, isWatched, onToggleWatch }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          {label}
        </span>
      </div>
      {companies.length === 0 && emptyHint ? (
        <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">{emptyHint}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {companies.map((company) => (
            <CompanyQuickLinkTile
              key={company.id}
              company={company}
              compact
              isWatched={isWatched?.(company.id) ?? false}
              onToggleWatch={onToggleWatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * @param {{
 *   kospiCompanies: import('../../../../mocks/companyAnalysis/types').Company[],
 *   kosdaqCompanies: import('../../../../mocks/companyAnalysis/types').Company[],
 *   emptyMessage?: string,
 *   kospiEmptyHint?: string,
 *   kosdaqEmptyHint?: string,
 *   isWatched?: (id: string) => boolean,
 *   onToggleWatch?: (id: string) => void,
 * }} props
 */
export function FeaturedCompaniesBrowse({
  kospiCompanies,
  kosdaqCompanies,
  emptyMessage,
  kospiEmptyHint,
  kosdaqEmptyHint,
  isWatched,
  onToggleWatch,
}) {
  const { t } = useLocale();
  const [api, setApi] = useState(null);
  const [page, setPage] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const kospiPages = useMemo(() => chunkCompanies(kospiCompanies, PAGE_SIZE), [kospiCompanies]);
  const kosdaqPages = useMemo(() => chunkCompanies(kosdaqCompanies, PAGE_SIZE), [kosdaqCompanies]);
  const pageCount = Math.max(kospiPages.length, kosdaqPages.length, 1);

  const onSelect = useCallback(() => {
    if (!api) return;
    setPage(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api.off('reInit', onSelect);
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  const isEmpty = kospiCompanies.length === 0 && kosdaqCompanies.length === 0;

  return (
    <>
      <div className="lg:hidden">
        {isEmpty ? (
          <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        ) : (
          <>
            <Carousel setApi={setApi} opts={{ align: 'start', loop: false }} className="w-full">
              <CarouselContent className="-ml-2">
                {Array.from({ length: pageCount }, (_, index) => (
                  <CarouselItem key={index} className="basis-full pl-2">
                    <div className="grid grid-cols-2 gap-2">
                      <MarketColumn
                        label={t('company.grid.featuredKospi')}
                        companies={kospiPages[index] ?? []}
                        emptyHint={index === 0 ? kospiEmptyHint : undefined}
                        isWatched={isWatched}
                        onToggleWatch={onToggleWatch}
                      />
                      <MarketColumn
                        label={t('company.grid.featuredKosdaq')}
                        companies={kosdaqPages[index] ?? []}
                        emptyHint={index === 0 ? kosdaqEmptyHint : undefined}
                        isWatched={isWatched}
                        onToggleWatch={onToggleWatch}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full"
                  disabled={!canScrollPrev}
                  onClick={() => api?.scrollPrev()}
                  aria-label={t('company.grid.prevPage')}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {Array.from({ length: pageCount }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => api?.scrollTo(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        page === index ? 'w-4 bg-blue-600 dark:bg-blue-400' : 'w-1.5 bg-slate-300 dark:bg-slate-600'
                      }`}
                      aria-label={t('company.grid.pageDot', { n: index + 1 })}
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-full"
                  disabled={!canScrollNext}
                  onClick={() => api?.scrollNext()}
                  aria-label={t('company.grid.nextPage')}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="hidden space-y-10 lg:block">
        <CompanyQuickLinks
          companies={kospiCompanies}
          title={t('company.grid.featuredKospi')}
          emptyMessage={kospiEmptyHint}
          isWatched={isWatched}
          onToggleWatch={onToggleWatch}
        />
        <CompanyQuickLinks
          companies={kosdaqCompanies}
          title={t('company.grid.featuredKosdaq')}
          emptyMessage={kosdaqEmptyHint}
          isWatched={isWatched}
          onToggleWatch={onToggleWatch}
        />
      </div>
    </>
  );
}
