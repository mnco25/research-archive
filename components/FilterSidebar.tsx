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

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Mobile toggle */}
      <button
        className="lg:hidden w-full btn btn-secondary mb-4 justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-[var(--color-accent-primary)] text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Sort */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Sort By
          </h3>
          <select
            value={filters.sort}
            onChange={(e) => updateFilters({ sort: e.target.value as FilterState['sort'] })}
            className="select w-full"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date (Newest)</option>
            <option value="citations">Citations</option>
          </select>
        </div>

        {/* Sources */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Sources
          </h3>
          <div className="space-y-2">
            {(['arxiv', 'pubmed', 'crossref', 'openalex'] as PaperSource[]).map((source) => (
              <label key={source} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sources.includes(source)}
                  onChange={() => toggleSource(source)}
                  className="w-4 h-4 rounded border-[var(--color-border-medium)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {source === 'arxiv' ? 'arXiv' : source === 'pubmed' ? 'PubMed' : source === 'crossref' ? 'CrossRef' : 'OpenAlex'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Access Type */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Access
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="accessType"
                checked={filters.accessType === 'any'}
                onChange={() => updateFilters({ accessType: 'any' })}
                className="w-4 h-4 border-[var(--color-border-medium)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">All papers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="accessType"
                checked={filters.accessType === 'open'}
                onChange={() => updateFilters({ accessType: 'open' })}
                className="w-4 h-4 border-[var(--color-border-medium)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">Open Access only</span>
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Date Range
          </h3>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilters({ dateRange: e.target.value as FilterState['dateRange'] })}
            className="select w-full"
          >
            <option value="all">All time</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
            <option value="year">Past year</option>
          </select>
        </div>

        {/* Minimum Citations */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Minimum Citations
          </h3>
          <input
            type="number"
            min="0"
            value={filters.citationMin}
            onChange={(e) => updateFilters({ citationMin: parseInt(e.target.value) || 0 })}
            className="input"
            placeholder="0"
          />
        </div>

        {/* Discipline */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Discipline
          </h3>
          <select
            value={filters.discipline}
            onChange={(e) => updateFilters({ discipline: e.target.value })}
            className="select w-full"
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
            className="btn btn-ghost w-full text-[var(--color-text-tertiary)]"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
