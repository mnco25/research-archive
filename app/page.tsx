'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/Loading';
import type { Paper } from '@/lib/types';
import disciplines from '@/data/disciplines.json';

const stats = [
  { value: '250M+', label: 'Papers', color: 'from-violet-500 to-purple-500' },
  { value: '4', label: 'Sources', color: 'from-blue-500 to-cyan-500' },
  { value: 'Free', label: 'Forever', color: 'from-emerald-500 to-teal-500' },
];

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Unified Search',
    description: 'Search multiple databases at once. No more switching between arXiv, PubMed, and Google Scholar.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Instant Citations',
    description: 'Generate BibTeX, APA, and MLA citations with one click. Copy and paste directly into your manuscript.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Save & Organize',
    description: 'Save papers for later. Build your reading list without creating an account.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Open Access First',
    description: 'Filter for open access papers instantly. Find research you can actually read.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'Export Anywhere',
    description: 'Export your saved papers and citations to Zotero, Mendeley, or any reference manager.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Privacy First',
    description: 'No tracking, no accounts required. Your search history stays on your device.',
  },
];

const sources = [
  { name: 'arXiv', count: '2.5M+', color: '#b31b1b', description: 'Physics, Math, CS' },
  { name: 'PubMed', count: '35M+', color: '#326898', description: 'Biomedical, Life Sciences' },
  { name: 'CrossRef', count: '140M+', color: '#f36722', description: 'Multidisciplinary' },
  { name: 'OpenAlex', count: '250M+', color: '#a51716', description: 'Most Comprehensive' },
];

export default function Home() {
  const [featuredPapers, setFeaturedPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedPapers() {
      try {
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
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-bg-primary)]">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-primary)] text-sm font-medium mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-primary)]"></span>
              </span>
              Searching 250M+ papers across 4 sources
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight tracking-tight animate-slide-in-up" style={{ fontFamily: "'Inter', sans-serif" }}>
              Find the research
              <br />
              you need. <span className="gradient-text">Faster.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-in-up" style={{ animationDelay: '100ms' }}>
              The free, unified search engine for academic papers. 
              Search arXiv, PubMed, CrossRef, and OpenAlex in one place.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
              <SearchBar large autoFocus />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-slide-in-up" style={{ animationDelay: '300ms' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--color-text-tertiary)] mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Powered by Leading Academic Databases
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Search across multiple trusted sources simultaneously for comprehensive research coverage.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {sources.map((source, index) => (
              <div 
                key={source.name} 
                className="group p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] hover:border-[var(--color-accent-primary)] hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${source.color}15` }}
                >
                  <span className="text-2xl font-bold" style={{ color: source.color }}>
                    {source.name[0]}
                  </span>
                </div>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                  {source.name}
                </h3>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
                  {source.count}
                </p>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  {source.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines Section */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Explore by Discipline
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Browse papers across all major academic fields and specializations.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {disciplines.map((discipline, index) => (
              <Link
                key={discipline.id}
                href={`/search?q=${encodeURIComponent(discipline.name)}`}
                className="group flex flex-col items-center gap-3 p-4 md:p-6 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl hover:border-[var(--color-accent-primary)] hover:shadow-md transition-all duration-300 text-center"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-2xl md:text-3xl transition-transform group-hover:scale-125 group-hover:-translate-y-1">
                  {discipline.icon}
                </span>
                <span className="text-xs md:text-sm font-medium text-[var(--color-text-primary)] leading-tight">
                  {discipline.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-primary)]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Built for Researchers
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Everything you need to find, save, and cite academic papers efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="group p-6 md:p-8 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] hover:border-[var(--color-accent-primary)] hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-light)] text-[var(--color-accent-primary)] flex items-center justify-center mb-5 transition-all group-hover:bg-[var(--color-accent-primary)] group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Papers Section */}
      <section className="py-16 md:py-24 bg-[var(--color-bg-secondary)]">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                Trending Research
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Highly cited papers in machine learning
              </p>
            </div>
            <Link
              href="/search?q=machine+learning"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent-primary)] hover:underline"
            >
              View all
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PaperCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredPapers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 stagger-children">
              {featuredPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[var(--color-text-tertiary)]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>No featured papers available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]" />
        </div>
        
        <div className="container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to accelerate your research?
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start searching now. No account needed. Completely free, forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white text-[var(--color-accent-primary)] font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
            >
              Start Searching
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link
              href="/saved"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              View Saved Papers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
