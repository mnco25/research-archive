'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';
import type { Paper } from '@/lib/types';

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  initialQuery = '',
  large = false,
  onSearch,
  placeholder = 'Search papers on machine learning, neuroscience, quantum physics...',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Paper[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions with debounce
  // The debounce function creates a stable memoized callback, so we intentionally
  // exclude it from dependencies to prevent re-creating on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestionsDebounced = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.papers || []);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    fetchSuggestionsDebounced(value);
    setShowSuggestions(true);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (paper: Paper) => {
    setShowSuggestions(false);
    router.push(`/paper/${encodeURIComponent(paper.id)}`);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const isExpanded = showSuggestions && (suggestions.length > 0 || isLoading);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          {/* Search Icon */}
          <div className={`absolute left-4 ${large ? 'top-1/2 -translate-y-1/2' : 'top-1/2 -translate-y-1/2'} text-[var(--color-text-tertiary)] transition-colors group-focus-within:text-[var(--color-accent-primary)]`}>
            <svg
              width={large ? '22' : '20'}
              height={large ? '22' : '20'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full bg-[var(--color-bg-primary)] border-2 border-[var(--color-border-light)] 
              text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
              focus:border-[var(--color-accent-primary)] focus:ring-4 focus:ring-[var(--color-accent-light)]
              transition-all duration-200 outline-none
              ${large 
                ? 'pl-14 pr-32 py-5 text-lg rounded-2xl shadow-lg hover:shadow-xl' 
                : 'pl-12 pr-24 py-3 text-base rounded-xl'
              }
            `}
            aria-label="Search papers"
            aria-autocomplete="list"
            aria-controls={isExpanded ? 'search-suggestions' : undefined}
            aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          />

          <button
            type="submit"
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 
              bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-medium
              hover:opacity-90 active:scale-95
              transition-all duration-200 shadow-md hover:shadow-lg
              ${large ? 'px-6 py-3 rounded-xl text-base' : 'px-4 py-2 rounded-lg text-sm'}
            `}
            aria-label="Search"
          >
            <span className="hidden sm:inline">Search</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:hidden"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div 
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in"
        >
          {isLoading ? (
            <div className="p-4 text-center text-[var(--color-text-tertiary)]">
              <div className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Searching...
              </div>
            </div>
          ) : (
            <ul>
              {suggestions.map((paper, idx) => (
                <li
                  key={paper.id}
                  id={`suggestion-${idx}`}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  className={`
                    px-4 py-3 cursor-pointer border-b border-[var(--color-border-light)] last:border-b-0
                    transition-colors duration-150
                    ${idx === selectedIndex 
                      ? 'bg-[var(--color-accent-light)]' 
                      : 'hover:bg-[var(--color-bg-tertiary)]'
                    }
                  `}
                  onClick={() => handleSuggestionClick(paper)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-tertiary)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">
                        {paper.title}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5 flex items-center gap-2">
                        <span className="truncate">
                          {paper.authors.slice(0, 2).map(a => a.name).join(', ')}
                          {paper.authors.length > 2 && ' et al.'}
                        </span>
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-[var(--color-bg-tertiary)]">
                          {paper.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
