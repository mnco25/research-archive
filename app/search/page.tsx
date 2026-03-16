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
  const [error, setError] = useState('');
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

  useEffect(() => {
    const saved = localStorage.getItem('savedPapers');
    if (saved) {
      try {
        const papers = JSON.parse(saved);
        setSavedPapers(new Set(papers.map((p: { paper: Paper }) => p.paper.id)));
      } catch { /* ignore */ }
    }
  }, []);

  const performSearch = useCallback(async (q: string, page: number, f: FilterState) => {
    if (!q.trim()) { setResults(null); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q, page, limit: 20,
          sources: f.sources, accessType: f.accessType,
          sort: f.sort,
          citationMin: f.citationMin > 0 ? f.citationMin : undefined,
          dateRange: getDateRange(f.dateRange),
        }),
      });
      if (!res.ok) throw new Error('Search failed');
      setResults(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) performSearch(q, currentPage, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentPage]);

  const handleSearch = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleFilterChange = (f: FilterState) => {
    setFilters(f);
    if (query) {
      performSearch(query, 1, f);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = (paper: Paper) => {
    const saved = localStorage.getItem('savedPapers');
    let papers: { paper: Paper; savedAt: string }[] = [];
    try { papers = saved ? JSON.parse(saved) : []; } catch { papers = []; }

    const exists = papers.some(p => p.paper.id === paper.id);
    if (exists) {
      papers = papers.filter(p => p.paper.id !== paper.id);
      setSavedPapers(prev => { const n = new Set(prev); n.delete(paper.id); return n; });
    } else {
      papers.push({ paper, savedAt: new Date().toISOString() });
      setSavedPapers(prev => new Set([...prev, paper.id]));
    }
    localStorage.setItem('savedPapers', JSON.stringify(papers));
  };

  return (
    <div className="container-app pt-24 pb-16">
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <SearchBar initialQuery={query} onSearch={handleSearch} large />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <FilterSidebar onFilterChange={handleFilterChange} initialFilters={filters} />

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Results count */}
          {results && !isLoading && (
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--border-secondary)]">
              <p className="text-[13px] text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">{results.total.toLocaleString()}</strong> results
                {results.searchTimeMs && <span className="text-[var(--text-tertiary)] ml-1">({results.searchTimeMs}ms)</span>}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="card p-4 mb-6 border-[var(--error)]/20 bg-[var(--error)]/5">
              <p className="text-[13px] text-[var(--error)] font-medium">{error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && <SearchResultsSkeleton count={5} />}

          {/* Results list */}
          {!isLoading && results && results.papers.length > 0 && (
            <div className="space-y-4">
              {results.papers.map(paper => (
                <PaperCard key={paper.id} paper={paper} onSave={handleSave} isSaved={savedPapers.has(paper.id)} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && results && results.papers.length === 0 && (
            <div className="text-center py-20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              </div>
              <h3 className="text-heading text-[16px] mb-1">No results found</h3>
              <p className="text-[13px] text-[var(--text-tertiary)]">Try different keywords or broaden your filters.</p>
            </div>
          )}

          {/* No query */}
          {!isLoading && !results && !query && (
            <div className="text-center py-24">
              <h3 className="text-heading text-[18px] mb-2">Begin your discovery</h3>
              <p className="text-[14px] text-[var(--text-tertiary)]">Search 250M+ papers across multiple disciplines.</p>
            </div>
          )}

          {/* Pagination */}
          {results && results.pages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination currentPage={currentPage} totalPages={Math.min(results.pages, 50)} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
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

function getDateRange(range: string): { from: string; to: string } | undefined {
  if (range === 'all') return undefined;
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from: Date;
  switch (range) {
    case 'week': from = new Date(now.getTime() - 7 * 86400000); break;
    case 'month': from = new Date(now.getTime() - 30 * 86400000); break;
    case 'year': from = new Date(now.getTime() - 365 * 86400000); break;
    default: return undefined;
  }
  return { from: from.toISOString().split('T')[0], to };
}
