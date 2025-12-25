'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/Loading';
import type { Paper } from '@/lib/types';
import disciplines from '@/data/disciplines.json';

export default function Home() {
  const [featuredPapers, setFeaturedPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedPapers() {
      try {
        // Fetch some trending papers
        const response = await fetch('/api/search?q=machine+learning&limit=6&sort=citations');
        if (response.ok) {
          const data = await response.json();
          setFeaturedPapers(data.papers || []);
        }
      } catch (error) {
        console.error('Failed to load featured papers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFeaturedPapers();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[var(--color-bg-secondary)] to-white py-20 md:py-32">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] mb-6 font-serif">
            Find the research you need.
            <br />
            <span className="text-[var(--color-accent-primary)]">Faster.</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
            Search across arXiv, PubMed, CrossRef, and OpenAlex.
            <br className="hidden md:block" />
            250M+ papers, all free, in one place.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar large autoFocus />
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--color-text-tertiary)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              2.5M+ arXiv papers
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              35M+ PubMed articles
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              140M+ CrossRef works
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              250M+ OpenAlex papers
            </span>
          </div>
        </div>
      </section>

      {/* Disciplines Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-8 text-center">
            Explore by Discipline
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {disciplines.map((discipline) => (
              <Link
                key={discipline.id}
                href={`/search?q=${encodeURIComponent(discipline.name)}`}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-[var(--color-border-light)] rounded-lg hover:border-[var(--color-accent-primary)] hover:shadow-md transition-all text-center"
              >
                <span className="text-3xl">{discipline.icon}</span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {discipline.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Papers Section */}
      <section className="py-16 bg-[var(--color-bg-secondary)]">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Trending Research
            </h2>
            <Link
              href="/search"
              className="text-sm font-medium text-[var(--color-accent-primary)] hover:underline"
            >
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredPapers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4 stagger-children">
              {featuredPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <p className="text-center text-[var(--color-text-tertiary)] py-8">
              No featured papers available at the moment.
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-12 text-center">
            Built for Researchers
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Unified Search
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Search multiple databases at once. No more switching between arXiv, PubMed, and Google Scholar.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Instant Citations
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Generate BibTeX, APA, and MLA citations with one click. Copy and paste directly into your manuscript.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-bg-tertiary)] rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Save & Organize
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Save papers for later. Build your reading list without creating an account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--color-accent-primary)]">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to accelerate your research?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Start searching now. No account needed. Completely free.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-white text-[var(--color-accent-primary)] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Searching
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
