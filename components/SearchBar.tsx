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
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions
  const fetchSuggestions = useCallback(
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
    fetchSuggestions(value);
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

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder={placeholder}
            className={`input pr-12 ${large ? 'py-4 text-lg' : ''}`}
            aria-label="Search papers"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />
          <button
            type="submit"
            className={`absolute right-2 ${large ? 'top-3' : 'top-2'} btn btn-primary ${large ? 'px-4 py-2' : 'px-3 py-1.5'}`}
            aria-label="Search"
          >
            <svg
              width="20"
              height="20"
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
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--color-border-medium)] rounded-lg shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-[var(--color-text-tertiary)]">
              Searching...
            </div>
          ) : (
            <ul role="listbox">
              {suggestions.map((paper, index) => (
                <li
                  key={paper.id}
                  role="option"
                  className="px-4 py-3 hover:bg-[var(--color-bg-tertiary)] cursor-pointer border-b border-[var(--color-border-light)] last:border-b-0"
                  onClick={() => handleSuggestionClick(paper)}
                >
                  <div className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">
                    {paper.title}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    {paper.authors.slice(0, 2).map(a => a.name).join(', ')}
                    {paper.authors.length > 2 && ' et al.'} • {paper.source}
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
