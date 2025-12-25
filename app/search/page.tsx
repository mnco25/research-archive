'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { SearchResultsSkeleton } from '@/components/Loading';
import type { Paper, SearchResult, PaperSource } from '@/lib/types';

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
  }, [searchParams, currentPage, performSearch]);

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
    <div className="container py-8">
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar initialQuery={query} onSearch={handleSearch} />
      </div>

      {/* Results section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <FilterSidebar onFilterChange={handleFilterChange} initialFilters={filters} />

        {/* Results */}
        <div className="flex-grow">
          {/* Results header */}
          {results && !isLoading && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Found <strong>{results.total.toLocaleString()}</strong> papers
                {results.searchTimeMs && ` in ${results.searchTimeMs}ms`}
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && <SearchResultsSkeleton count={5} />}

          {/* Results list */}
          {!isLoading && results && results.papers.length > 0 && (
            <div className="space-y-4 stagger-children">
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
            <div className="text-center py-16">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-tertiary)"
                strokeWidth="1.5"
                className="mx-auto mb-4"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                No papers found
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* No query state */}
          {!isLoading && !results && !query && (
            <div className="text-center py-16">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-tertiary)"
                strokeWidth="1.5"
                className="mx-auto mb-4"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                Search for papers
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Enter a search term above to find academic papers
              </p>
            </div>
          )}

          {/* Pagination */}
          {results && results.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.min(results.pages, 50)} // Limit to 50 pages
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
