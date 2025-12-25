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
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl mb-4 transition-all hover:border-[var(--color-accent-primary)]"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="filter-panel"
      >
        <span className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-medium text-[var(--color-text-primary)]">Filters</div>
            <div className="text-xs text-[var(--color-text-tertiary)]">
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
          className={`text-[var(--color-text-tertiary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div 
        id="filter-panel"
        className={`
          bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl overflow-hidden
          lg:block transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}
        `}
      >
        <div className="p-5 space-y-6">
          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
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
                    px-3 py-2 text-xs font-medium rounded-lg transition-all
                    ${filters.sort === option.value 
                      ? 'bg-[var(--color-accent-primary)] text-white' 
                      : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)]'
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
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              Sources
            </label>
            <div className="space-y-2">
              {(['arxiv', 'pubmed', 'crossref', 'openalex'] as PaperSource[]).map((source) => (
                <label 
                  key={source} 
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.sources.includes(source)}
                    onChange={() => toggleSource(source)}
                    className="w-4 h-4"
                  />
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sourceInfo[source].color }}
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    {sourceInfo[source].label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Access Type */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              Access
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateFilters({ accessType: 'any' })}
                className={`
                  px-3 py-2 text-xs font-medium rounded-lg transition-all
                  ${filters.accessType === 'any' 
                    ? 'bg-[var(--color-accent-primary)] text-white' 
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)]'
                  }
                `}
              >
                All Papers
              </button>
              <button
                onClick={() => updateFilters({ accessType: 'open' })}
                className={`
                  px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1
                  ${filters.accessType === 'open' 
                    ? 'bg-[var(--color-success)] text-white' 
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-green-50 hover:text-green-600'
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
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
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
                    px-3 py-2 text-xs font-medium rounded-lg transition-all
                    ${filters.dateRange === option.value 
                      ? 'bg-[var(--color-accent-primary)] text-white' 
                      : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)]'
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
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              Minimum Citations
            </label>
            <input
              type="number"
              min="0"
              value={filters.citationMin}
              onChange={(e) => updateFilters({ citationMin: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-light)] outline-none transition-all"
              placeholder="0"
            />
          </div>

          {/* Discipline */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              Discipline
            </label>
            <select
              value={filters.discipline}
              onChange={(e) => updateFilters({ discipline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-lg focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-light)] outline-none transition-all cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23707070' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
              }}
            >
              <option value="">All disciplines</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.icon} {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-error)] hover:text-white transition-all flex items-center justify-center gap-2"
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
