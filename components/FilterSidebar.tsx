'use client';

import { useState } from 'react';
import type { PaperSource } from '@/lib/types';
import disciplines from '@/data/disciplines.json';

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  sources: PaperSource[];
  accessType: 'open' | 'any';
  dateRange: 'all' | 'year' | 'month' | 'week';
  citationMin: number;
  discipline: string;
  sort: 'relevance' | 'date' | 'citations';
}

const defaultFilters: FilterState = {
  sources: ['arxiv', 'pubmed', 'crossref', 'openalex'],
  accessType: 'any',
  dateRange: 'all',
  citationMin: 0,
  discipline: '',
  sort: 'relevance',
};

const sourceInfo = {
  arxiv: { label: 'arXiv', color: '#b31b1b' },
  pubmed: { label: 'PubMed', color: '#326898' },
  crossref: { label: 'CrossRef', color: '#f36722' },
  openalex: { label: 'OpenAlex', color: '#a51716' },
};

export default function FilterSidebar({
  onFilterChange,
  initialFilters = defaultFilters,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSource = (source: PaperSource) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];

    // Ensure at least one source is selected
    if (newSources.length > 0) {
      updateFilters({ sources: newSources });
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.sources.length < 4 ||
    filters.accessType !== 'any' ||
    filters.dateRange !== 'all' ||
    filters.citationMin > 0 ||
    filters.discipline !== '';

  const activeFilterCount = [
    filters.sources.length < 4,
    filters.accessType !== 'any',
    filters.dateRange !== 'all',
    filters.citationMin > 0,
    filters.discipline !== '',
  ].filter(Boolean).length;

  return (
    <aside className="w-full lg:w-72 shrink-0">
      {/* Mobile toggle */}
      <button
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl mb-4 transition-all hover:border-[var(--brand-primary)]"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="filter-panel"
      >
        <span className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-medium text-[var(--text-primary)]">Filters</div>
            <div className="text-xs text-[var(--text-tertiary)]">
              {activeFilterCount > 0 ? `${activeFilterCount} active` : 'None active'}
            </div>
          </div>
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-[var(--text-tertiary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        id="filter-panel"
        className={`
          bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden
          lg:block transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[2000px] opacit-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}
        `}
      >
        <div className="p-5 space-y-8">
          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Sort By
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'date', label: 'Newest' },
                { value: 'citations', label: 'Citations' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ sort: option.value as FilterState['sort'] })}
                  className={`
                    px-2 py-2 text-xs font-medium rounded-lg transition-all border
                    ${filters.sort === option.value
                      ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]'
                      : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Sources
            </label>
            <div className="space-y-2">
              {(['arxiv', 'pubmed', 'crossref', 'openalex'] as PaperSource[]).map((source) => (
                <label
                  key={source}
                  className="group flex items-center gap-3 p-2 -mx-2 rounded-lg cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={() => toggleSource(source)}
                      className="peer w-4 h-4 appearance-none rounded border border-[var(--border-default)] checked:bg-[var(--brand-primary)] checked:border-[var(--brand-primary)] transition-all cursor-pointer"
                    />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>

                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sourceInfo[source].color }}
                  />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors font-medium">
                    {sourceInfo[source].label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Access Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Access
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateFilters({ accessType: 'any' })}
                className={`
                  px-3 py-2 text-xs font-medium rounded-lg transition-all border
                  ${filters.accessType === 'any'
                    ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] border-[var(--brand-primary)]'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--brand-primary)]'
                  }
                `}
              >
                All Papers
              </button>
              <button
                onClick={() => updateFilters({ accessType: 'open' })}
                className={`
                  px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 border
                  ${filters.accessType === 'open'
                    ? 'bg-green-500/10 text-green-600 border-green-500'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-green-500 hover:text-green-600'
                  }
                `}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                Open Access
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'week', label: 'Past Week' },
                { value: 'month', label: 'Past Month' },
                { value: 'year', label: 'Past Year' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ dateRange: option.value as FilterState['dateRange'] })}
                  className={`
                    px-3 py-2 text-xs font-medium rounded-lg transition-all border
                    ${filters.dateRange === option.value
                      ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]'
                      : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Citations */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Minimum Citations
            </label>
            <input
              type="number"
              min="0"
              value={filters.citationMin}
              onChange={(e) => updateFilters({ citationMin: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-lg focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all text-[var(--text-primary)]"
              placeholder="0"
            />
          </div>

          {/* Discipline */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Discipline
            </label>
            <div className="relative">
              <select
                value={filters.discipline}
                onChange={(e) => updateFilters({ discipline: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-lg focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all cursor-pointer appearance-none text-[var(--text-primary)]"
              >
                <option value="">All disciplines</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
