'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/Loading';
import type { Paper } from '@/lib/types';

const stats = [
  { value: '250M+', label: 'Papers Indexed' },
  { value: '4', label: 'Databases' },
  { value: '0ms', label: 'Cost' },
];

export default function Home() {
  const [featuredPapers, setFeaturedPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedPapers() {
      try {
        const response = await fetch('/api/search?q=machine+learning&limit=4&sort=citations');
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
      {/* Hero Section - Gradient Mesh Background */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] mix-blend-screen animate-float" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] mix-blend-screen animate-float delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen" />
        </div>

        <div className="container-custom relative z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm font-medium mb-8 animate-enter shadow-sm hover:scale-105 transition-transform cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[var(--text-secondary)]">Live indexing 250M+ papers</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-semibold text-[3.5rem] md:text-[5rem] leading-[0.95] tracking-tight mb-8 animate-enter delay-100">
              The search engine for <br />
              <span className="text-gradient">scientific progress.</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto leading-relaxed">
              Access 250M+ papers from ArXiv, PubMed, CrossRef, and OpenAlex.
              One unified search engine. Zero paywalls blocked.
            </p>

            {/* Search Component */}
            <div className="max-w-2xl mx-auto mb-16 animate-enter delay-300 transform transition-all hover:scale-[1.01]">
              <SearchBar large autoFocus />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-[var(--border-subtle)] pt-8 animate-enter delay-300">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-display font-semibold text-3xl text-[var(--text-primary)] mb-1">{stat.value}</div>
                  <div className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features - "Linear Style" */}
      <section className="py-32 bg-[var(--bg-page)]">
        <div className="container-custom">
          <div className="mb-20">
            <h2 className="font-display text-4xl mb-4">Everything you need. <span className="text-[var(--text-tertiary)]">Nothing you don&apos;t.</span></h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-xl">
              Built by researchers who were tired of paywalls, fragmented databases, and bad UX.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
            {/* Feature 1: Large Card */}
            <div className="md:col-span-2 glass-card rounded-[2rem] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent dark:from-blue-900/20 pointer-events-none" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  </div>
                  <h3 className="text-3xl font-semibold mb-4">Unified Search</h3>
                  <p className="text-[var(--text-secondary)] text-lg max-w-md">Query arXiv, PubMed, CrossRef, and OpenAlex simultaneously with smart deduplication.</p>
                </div>
                {/* Visual Representation */}
                <div className="w-full h-48 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-sm p-4 flex flex-col gap-3 opacity-90 group-hover:translate-y-[-10px] transition-transform duration-500">
                  <div className="flex gap-2">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="w-10 h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
                  </div>
                  <div className="h-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg w-full" />
                </div>
              </div>
            </div>

            {/* Feature 2: Tall Card */}
            <div className="md:row-span-2 glass-card rounded-[2rem] p-10 relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                </div>
                <h3 className="text-3xl font-semibold mb-4">Local Library</h3>
                <p className="text-[var(--text-secondary)] text-lg mb-8">Save papers to your browser&apos;s local storage. No login required. Privacy first.</p>

                <div className="flex-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden relative">
                  <div className="absolute inset-x-4 top-4 bottom-0 space-y-3">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] transform translate-y-0 group-hover:translate-x-2 transition-transform duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                        <div className="space-y-1.5 w-full">
                          <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-2 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Card */}
            <div className="group p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative overflow-hidden transition-all hover:border-[var(--brand-primary)]/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-[var(--brand-primary)]/10" />
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">One-Click Citations</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Export BibTeX, RIS, or APA citations instantly. We&apos;ve optimized the workflow so you can focus on writing, not formatting references.
              </p>
            </div>

            {/* Feature 4: Card */}
            <div className="group p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative overflow-hidden transition-all hover:border-[var(--brand-primary)]/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-secondary)]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-[var(--brand-secondary)]/10" />
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-secondary)]/10 flex items-center justify-center text-[var(--brand-secondary)] mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Open Access First</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We prioritize unlocking knowledge. Our engine highlights direct PDF links and open-access versions of papers whenever available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-4xl mb-2">Trending Research</h2>
              <p className="text-[var(--text-secondary)]">Top cited papers in machine learning this week</p>
            </div>
            <Link href="/search?q=machine+learning" className="hidden md:flex items-center gap-2 text-[var(--brand-primary)] font-medium hover:gap-3 transition-all">
              View All <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <PaperCardSkeleton key={i} />)}
            </div>
          ) : featuredPapers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : null}

          <Link href="/search?q=machine+learning" className="md:hidden mt-8 flex items-center justify-center gap-2 text-[var(--brand-primary)] font-medium w-full py-4 bg-[var(--bg-page)] rounded-xl border border-[var(--border-subtle)]">
            View All <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 bg-[var(--bg-page)] relative overflow-hidden">
        <div className="container-custom relative z-10 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-8">Ready to accelerate your research?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/search" className="px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-page)] rounded-full font-semibold hover:scale-105 transition-transform shadow-xl">
              Start Searching
            </Link>
            <a href="https://github.com/yourusername" className="px-8 py-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-full font-medium hover:bg-[var(--bg-surface-hover)] transition-colors">
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
