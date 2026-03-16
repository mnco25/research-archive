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

const sourceConfig: Record<PaperSource, { label: string; dot: string }> = {
  arxiv: { label: 'arXiv', dot: '#b31b1b' },
  pubmed: { label: 'PubMed', dot: '#326898' },
  crossref: { label: 'CrossRef', dot: '#f36722' },
  openalex: { label: 'OpenAlex', dot: '#a51716' },
};

export default function FilterSidebar({
  onFilterChange,
  initialFilters = defaultFilters,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const update = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFilterChange(next);
  };

  const toggleSource = (source: PaperSource) => {
    const next = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    if (next.length > 0) update({ sources: next });
  };

  const reset = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeCount = [
    filters.sources.length < 4,
    filters.accessType !== 'any',
    filters.dateRange !== 'all',
    filters.citationMin > 0,
    filters.discipline !== '',
  ].filter(Boolean).length;

  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      {/* Mobile toggle */}
      <button
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-[var(--radius-md)] mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2 text-[14px] font-medium text-[var(--text-primary)]">
          Filters
          {activeCount > 0 && (
            <span className="text-[11px] bg-[hsl(var(--accent))] text-white w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-[var(--text-tertiary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`
        bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-[var(--radius-lg)] overflow-hidden
        lg:block transition-all duration-300
        ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'}
      `}>
        <div className="p-4 space-y-6">
          {/* Sort */}
          <Section label="Sort by">
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { value: 'relevance', label: 'Relevant' },
                { value: 'date', label: 'Newest' },
                { value: 'citations', label: 'Cited' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update({ sort: opt.value })}
                  className={`
                    px-2 py-1.5 text-[12px] font-medium rounded-[var(--radius-sm)] transition-all border
                    ${filters.sort === opt.value
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-tertiary)]'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Sources */}
          <Section label="Sources">
            <div className="space-y-1">
              {(Object.keys(sourceConfig) as PaperSource[]).map(source => (
                <label key={source} className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-[var(--radius-sm)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors group">
                  <input
                    type="checkbox"
                    checked={filters.sources.includes(source)}
                    onChange={() => toggleSource(source)}
                    className="sr-only peer"
                  />
                  <div className="w-3.5 h-3.5 border border-[var(--border-primary)] rounded flex items-center justify-center peer-checked:bg-[var(--text-primary)] peer-checked:border-[var(--text-primary)] transition-all">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--bg-primary)" strokeWidth="4" className="opacity-0 peer-checked:opacity-100">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sourceConfig[source].dot }} />
                  <span className="text-[13px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {sourceConfig[source].label}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Access */}
          <Section label="Access">
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { value: 'any', label: 'All' },
                { value: 'open', label: 'Open Access' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update({ accessType: opt.value })}
                  className={`
                    px-2 py-1.5 text-[12px] font-medium rounded-[var(--radius-sm)] transition-all border
                    ${filters.accessType === opt.value
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-tertiary)]'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Date */}
          <Section label="Date range">
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { value: 'all', label: 'All Time' },
                { value: 'week', label: 'Past Week' },
                { value: 'month', label: 'Past Month' },
                { value: 'year', label: 'Past Year' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update({ dateRange: opt.value })}
                  className={`
                    px-2 py-1.5 text-[12px] font-medium rounded-[var(--radius-sm)] transition-all border
                    ${filters.dateRange === opt.value
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-tertiary)]'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Min Citations */}
          <Section label="Minimum citations">
            <input
              type="number"
              min="0"
              value={filters.citationMin}
              onChange={(e) => update({ citationMin: parseInt(e.target.value) || 0 })}
              className="input text-[13px]"
              placeholder="0"
            />
          </Section>

          {/* Discipline */}
          <Section label="Discipline">
            <div className="relative">
              <select
                value={filters.discipline}
                onChange={(e) => update({ discipline: e.target.value })}
                className="input text-[13px] appearance-none cursor-pointer pr-8"
              >
                <option value="">All disciplines</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </Section>

          {/* Clear */}
          {activeCount > 0 && (
            <button
              onClick={reset}
              className="w-full py-2 text-[13px] font-medium text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-label block mb-2">{label}</span>
      {children}
    </div>
  );
}
