'use client';

import { useState } from 'react';
import type { PaperSource, SortOption } from '@/lib/types';
import disciplines from '@/data/disciplines.json';

export interface FilterState {
  sources: PaperSource[];
  accessType: 'open' | 'any';
  dateRange: 'all' | 'year' | 'month' | 'week';
  citationMin: number;
  discipline: string;
  sort: SortOption;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

const sourceConfig: Record<PaperSource, { label: string; dot: string }> = {
  arxiv: { label: 'arXiv', dot: '#b31b1b' },
  pubmed: { label: 'PubMed', dot: '#326898' },
  crossref: { label: 'CrossRef', dot: '#ef8b2c' },
  openalex: { label: 'OpenAlex', dot: '#2563eb' },
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Newest' },
  { value: 'citations', label: 'Cited' },
];

const DATE_OPTIONS: { value: FilterState['dateRange']; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'year', label: 'Past Year' },
  { value: 'month', label: 'Past Month' },
  { value: 'week', label: 'Past Week' },
];

export const defaultFilters: FilterState = {
  sources: ['arxiv', 'pubmed', 'crossref', 'openalex'],
  accessType: 'any',
  dateRange: 'all',
  citationMin: 0,
  discipline: '',
  sort: 'relevance',
};

export default function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const toggleSource = (source: PaperSource) => {
    const next = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    if (next.length > 0) update({ sources: next });
  };

  const activeCount =
    (filters.sources.length < 4 ? 1 : 0) +
    (filters.accessType !== 'any' ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.citationMin > 0 ? 1 : 0) +
    (filters.discipline !== '' ? 1 : 0) +
    (filters.sort !== 'relevance' ? 1 : 0);

  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      <button
        className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-[var(--radius-md)] mb-3"
        onClick={() => setIsExpanded(v => !v)}
        aria-expanded={isExpanded}
        type="button"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-primary)]">
          Filters
          {activeCount > 0 && (
            <span className="text-[10px] bg-[hsl(var(--accent))] text-white min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
              {activeCount}
            </span>
          )}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-[var(--text-tertiary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-[var(--radius-lg)] overflow-hidden lg:block transition-all duration-300 ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
      }`}>
        <div className="p-4 space-y-5">
          <Section label="Sort">
            <div className="grid grid-cols-3 gap-1">
              {SORT_OPTIONS.map(opt => (
                <Pill key={opt.value} active={filters.sort === opt.value} onClick={() => update({ sort: opt.value })}>
                  {opt.label}
                </Pill>
              ))}
            </div>
          </Section>

          <Section label="Sources">
            <div className="space-y-0.5">
              {(Object.keys(sourceConfig) as PaperSource[]).map(source => {
                const checked = filters.sources.includes(source);
                return (
                  <label
                    key={source}
                    className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-[var(--radius-sm)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSource(source)}
                      className="sr-only"
                    />
                    <span className={`w-3.5 h-3.5 border rounded-[3px] flex items-center justify-center transition-colors ${
                      checked ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'border-[var(--border-primary)] bg-[var(--bg-primary)]'
                    }`}>
                      {checked && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--bg-primary)" strokeWidth="4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sourceConfig[source].dot }} />
                    <span className="text-[13px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      {sourceConfig[source].label}
                    </span>
                  </label>
                );
              })}
            </div>
          </Section>

          <Section label="Access">
            <div className="grid grid-cols-2 gap-1">
              <Pill active={filters.accessType === 'any'} onClick={() => update({ accessType: 'any' })}>All</Pill>
              <Pill active={filters.accessType === 'open'} onClick={() => update({ accessType: 'open' })}>Open Access</Pill>
            </div>
          </Section>

          <Section label="Date Range">
            <div className="grid grid-cols-2 gap-1">
              {DATE_OPTIONS.map(opt => (
                <Pill key={opt.value} active={filters.dateRange === opt.value} onClick={() => update({ dateRange: opt.value })}>
                  {opt.label}
                </Pill>
              ))}
            </div>
          </Section>

          <Section label="Min. Citations">
            <input
              type="number"
              min="0"
              step="10"
              value={filters.citationMin || ''}
              onChange={e => update({ citationMin: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              className="input text-[13px] h-9"
              placeholder="0"
            />
          </Section>

          <Section label="Discipline">
            <div className="relative">
              <select
                value={filters.discipline}
                onChange={e => update({ discipline: e.target.value })}
                className="input text-[13px] appearance-none cursor-pointer pr-8 h-9"
              >
                <option value="">All disciplines</option>
                {(disciplines as { id: string; name: string }[]).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </Section>

          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="w-full py-2 text-[12.5px] font-medium text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors"
              type="button"
            >
              Reset all filters
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

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1.5 text-[12px] font-semibold rounded-[var(--radius-sm)] transition-colors border ${
        active
          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
          : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}
