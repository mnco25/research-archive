'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { SearchResultsSkeleton } from '@/components/Loading';
import type { Paper, SearchResult } from '@/lib/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [savedPapers, setSavedPapers] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<FilterState>({
    sources: ['arxiv', 'pubmed', 'crossref', 'openalex'],
    accessType: 'any',
    dateRange: 'all',
    citationMin: 0,
    discipline: '',
    sort: 'relevance',
  });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Load saved papers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPapers');
    if (saved) {
      try {
        const papers = JSON.parse(saved);
        setSavedPapers(new Set(papers.map((p: { paper: Paper }) => p.paper.id)));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string, page: number, currentFilters: FilterState) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          page,
          limit: 20,
          sources: currentFilters.sources,
          accessType: currentFilters.accessType,
          sort: currentFilters.sort,
          citationMin: currentFilters.citationMin > 0 ? currentFilters.citationMin : undefined,
          dateRange: getDateRange(currentFilters.dateRange),
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search when params change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) {
      performSearch(q, currentPage, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentPage]);

  // Handle search
  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    params.set('q', newQuery);
    router.push(`/search?${params.toString()}`);
  };

  // Handle filter change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (query) {
      performSearch(query, 1, newFilters);
      // Update URL
      const params = new URLSearchParams();
      params.set('q', query);
      router.push(`/search?${params.toString()}`);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle save paper
  const handleSavePaper = (paper: Paper) => {
    const saved = localStorage.getItem('savedPapers');
    let papers: { paper: Paper; savedAt: string }[] = [];

    try {
      papers = saved ? JSON.parse(saved) : [];
    } catch {
      papers = [];
    }

    const isAlreadySaved = papers.some(p => p.paper.id === paper.id);

    if (isAlreadySaved) {
      papers = papers.filter(p => p.paper.id !== paper.id);
      setSavedPapers(prev => {
        const next = new Set(prev);
        next.delete(paper.id);
        return next;
      });
    } else {
      papers.push({ paper, savedAt: new Date().toISOString() });
      setSavedPapers(prev => new Set([...prev, paper.id]));
    }

    localStorage.setItem('savedPapers', JSON.stringify(papers));
  };

  return (
    <div className="container-custom py-12">
      {/* Search bar */}
      <div className="max-w-3xl mx-auto mb-12">
        <SearchBar initialQuery={query} onSearch={handleSearch} large />
      </div>

      {/* Results section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <FilterSidebar onFilterChange={handleFilterChange} initialFilters={filters} />
        </aside>

        {/* Results */}
        <div className="flex-grow min-w-0">
          {/* Results header */}
          {results && !isLoading && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
              <p className="text-sm text-[var(--text-secondary)]">
                Found <strong className="text-[var(--text-primary)]">{results.total.toLocaleString()}</strong> results
                {results.searchTimeMs && <span className="text-[var(--text-tertiary)] ml-1">({results.searchTimeMs}ms)</span>}
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
              <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-6">
              <SearchResultsSkeleton count={5} />
            </div>
          )}

          {/* Results list */}
          {!isLoading && results && results.papers.length > 0 && (
            <div className="space-y-6 stagger-children animate-enter">
              {results.papers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onSave={handleSavePaper}
                  isSaved={savedPapers.has(paper.id)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && results && results.papers.length === 0 && (
            <div className="text-center py-24 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <div className="w-16 h-16 mx-auto mb-4 text-[var(--text-tertiary)] bg-[var(--bg-page)] rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                No results found
              </h3>
              <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
                We couldn&apos;t find any papers matching your search. Try different keywords or filters.
              </p>
            </div>
          )}

          {/* No query state */}
          {!isLoading && !results && !query && (
            <div className="text-center py-32">
              <div className="w-20 h-20 mx-auto mb-6 text-[var(--brand-primary)] opacity-20">
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold text-[var(--text-primary)] mb-3">
                Begin your discovery
              </h3>
              <p className="text-[var(--text-secondary)]">
                Search 200M+ papers across physics, computer science, medicine, and more.
              </p>
            </div>
          )}

          {/* Pagination */}
          {results && results.pages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.min(results.pages, 50)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-8"><SearchResultsSkeleton count={5} /></div>}>
      <SearchContent />
    </Suspense>
  );
}

// Helper to convert filter date range to actual dates
function getDateRange(range: string): { from: string; to: string } | undefined {
  if (range === 'all') return undefined;

  const now = new Date();
  const to = now.toISOString().split('T')[0];

  let from: Date;
  switch (range) {
    case 'week':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      return undefined;
  }

  return { from: from.toISOString().split('T')[0], to };
}
