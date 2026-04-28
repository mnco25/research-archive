'use client';

import { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import FilterSidebar, { FilterState, defaultFilters } from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { SearchResultsSkeleton } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import { toggleSavedPaper, useSavedIds } from '@/lib/saved-papers';
import type { Paper, PaperSource, SearchResult } from '@/lib/types';

function getDateRange(range: FilterState['dateRange']): { from: string; to: string } | undefined {
  if (range === 'all') return undefined;
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let fromMs: number;
  switch (range) {
    case 'week': fromMs = now.getTime() - 7 * 86400000; break;
    case 'month': fromMs = now.getTime() - 30 * 86400000; break;
    case 'year': fromMs = now.getTime() - 365 * 86400000; break;
    default: return undefined;
  }
  return { from: new Date(fromMs).toISOString().split('T')[0], to };
}

function paramsToFilters(sp: URLSearchParams): FilterState {
  const sources = sp.get('sources')?.split(',').filter(Boolean) as PaperSource[] | undefined;
  return {
    sources: sources?.length ? sources : defaultFilters.sources,
    accessType: (sp.get('access') as 'open' | 'any') || defaultFilters.accessType,
    dateRange: (sp.get('range') as FilterState['dateRange']) || defaultFilters.dateRange,
    citationMin: parseInt(sp.get('citationMin') || '0', 10) || 0,
    discipline: sp.get('discipline') || '',
    sort: (sp.get('sort') as FilterState['sort']) || defaultFilters.sort,
  };
}

function filtersToParams(query: string, page: number, filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('q', query);
  if (page > 1) params.set('page', String(page));
  if (filters.sort !== defaultFilters.sort) params.set('sort', filters.sort);
  if (filters.accessType !== defaultFilters.accessType) params.set('access', filters.accessType);
  if (filters.dateRange !== defaultFilters.dateRange) params.set('range', filters.dateRange);
  if (filters.citationMin > 0) params.set('citationMin', String(filters.citationMin));
  if (filters.discipline) params.set('discipline', filters.discipline);
  if (filters.sources.length < defaultFilters.sources.length) {
    params.set('sources', filters.sources.join(','));
  }
  return params;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addToast, ToastContainer } = useToast();

  const query = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastQuery, setLastQuery] = useState(query);
  const savedIds = useSavedIds();

  if (query !== lastQuery) {
    setLastQuery(query);
    if (!query.trim()) {
      setResults(null);
      setError('');
    }
  }

  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    const controller = new AbortController();

    // Defer the synchronous state-update to a microtask so React can batch with the fetch
    Promise.resolve().then(() => {
      if (cancelled) return;
      setIsLoading(true);
      setError('');
    });

    const body = {
      query,
      page,
      limit: 20,
      sources: filters.sources,
      accessType: filters.accessType,
      sort: filters.sort,
      citationMin: filters.citationMin > 0 ? filters.citationMin : undefined,
      discipline: filters.discipline || undefined,
      dateRange: getDateRange(filters.dateRange),
    };

    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Search failed');
        }
        return res.json() as Promise<SearchResult>;
      })
      .then(data => {
        if (!cancelled) setResults(data);
      })
      .catch(err => {
        if (cancelled || (err instanceof Error && err.name === 'AbortError')) return;
        setError(err instanceof Error ? err.message : 'An error occurred');
        setResults(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query, page, filters]);

  const updateUrl = useCallback(
    (nextQuery: string, nextPage: number, nextFilters: FilterState, options: { scrollTop?: boolean } = {}) => {
      const params = filtersToParams(nextQuery, nextPage, nextFilters);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      if (options.scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, pathname]
  );

  const handleSearch = (q: string) => updateUrl(q, 1, filters);
  const handleFilterChange = (next: FilterState) => updateUrl(query, 1, next);
  const handleResetFilters = () => updateUrl(query, 1, defaultFilters);
  const handlePageChange = (nextPage: number) => updateUrl(query, nextPage, filters, { scrollTop: true });

  const handleSave = (paper: Paper) => {
    const { saved } = toggleSavedPaper(paper);
    addToast(saved ? 'Added to your library' : 'Removed from library', saved ? 'success' : 'info');
  };

  const showInitialSkeleton = isLoading && !results;

  return (
    <div className="container-app pt-24 pb-16">
      <div className="max-w-3xl mx-auto mb-10">
        <SearchBar initialQuery={query} onSearch={handleSearch} large placeholder="Search papers, authors, or topics…" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <FilterSidebar filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />

        <div className="flex-1 min-w-0">
          {results && !showInitialSkeleton && (
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-[var(--border-secondary)]">
              <div>
                <p className="text-[13px] text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">{results.total.toLocaleString()}</span>
                  {' '}results for{' '}
                  <span className="font-semibold text-[var(--text-primary)]">&ldquo;{query}&rdquo;</span>
                  <span className="text-[var(--text-tertiary)]"> · {results.searchTimeMs} ms</span>
                </p>
                {results.errors && results.errors.length > 0 && (
                  <p className="text-[12px] text-[var(--warning)] mt-1">
                    Partial results: {results.errors.map(e => e.source).join(', ')} unavailable
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 mb-4 rounded-[var(--radius-md)] border border-[var(--error)]/30 bg-[var(--error)]/5">
              <p className="text-[13px] text-[var(--error)] font-medium">{error}</p>
            </div>
          )}

          <div className={`relative transition-opacity duration-200 ${isLoading && results ? 'opacity-60' : 'opacity-100'}`}>
            {isLoading && results && (
              <div className="absolute -top-1 left-0 right-0 h-0.5 overflow-hidden">
                <div className="h-full bg-[hsl(var(--accent))] animate-loading-bar" />
              </div>
            )}

            {showInitialSkeleton && <SearchResultsSkeleton count={5} />}

            {!showInitialSkeleton && results && results.papers.length > 0 && (
              <div className="space-y-4">
                {results.papers.map(paper => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onSave={handleSave}
                    isSaved={savedIds.has(paper.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {!showInitialSkeleton && results && results.papers.length === 0 && (
            <div className="text-center py-20">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="text-heading text-[16px] mb-1">No results found</h3>
              <p className="text-[13.5px] text-[var(--text-tertiary)] max-w-sm mx-auto">
                Try broader keywords, fewer filters, or check spelling. The full-text isn&apos;t indexed,
                so describe what the paper is about, not its title.
              </p>
            </div>
          )}

          {!query && !isLoading && (
            <div className="text-center py-24">
              <h3 className="text-heading text-[18px] mb-2">Begin your discovery</h3>
              <p className="text-[14px] text-[var(--text-tertiary)]">
                Type a query above or pick a discipline from the homepage.
              </p>
            </div>
          )}

          {results && results.pages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={Math.min(results.pages, 50)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-app pt-24 pb-16"><SearchResultsSkeleton count={5} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
