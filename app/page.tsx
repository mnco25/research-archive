'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/Loading';
import type { Paper } from '@/lib/types';

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/search?q=machine+learning&limit=4&sort=citations');
        if (res.ok) {
          const data = await res.json();
          setPapers(data.papers || []);
        }
      } catch (err) {
        console.error('Failed to load papers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      {/* ======== HERO ======== */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        {/* Ambient gradient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-[hsl(var(--accent)/0.06)] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[hsl(280_80%_70%/0.05)] blur-[100px]" />
        </div>

        <div className="container-app relative">
          <div className="max-w-2xl mx-auto text-center">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-elevated)] text-[12px] text-[var(--text-secondary)] mb-8 animate-in">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75 pulse-dot" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--success)]" />
              </span>
              Live · 250M+ papers indexed
            </div>

            {/* Headline */}
            <h1 className="text-display px-2 md:px-0 text-[clamp(2rem,8vw,4rem)] mb-5 animate-in" style={{ animationDelay: '80ms' }}>
              Search engine for
              <br />
              <span className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(280,80%,65%)] bg-clip-text text-transparent">
                scientific progress
              </span>
            </h1>

            <p className="text-[var(--text-secondary)] text-[16px] md:text-[17px] leading-relaxed max-w-lg mx-auto mb-10 animate-in" style={{ animationDelay: '160ms' }}>
              Search 250M+ papers from ArXiv, PubMed, CrossRef, and OpenAlex in one place. No paywalls. No accounts.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto animate-in" style={{ animationDelay: '240ms' }}>
              <SearchBar large autoFocus />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-12 mt-14 animate-in" style={{ animationDelay: '320ms' }}>
              {[
                { value: '250M+', label: 'Papers' },
                { value: '4', label: 'Databases' },
                { value: 'Free', label: 'Forever' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</div>
                  <div className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section className="py-20 border-t border-[var(--border-secondary)]">
        <div className="container-app">
          <div className="mb-14">
            <h2 className="text-title text-[28px] md:text-[32px] mb-3">
              Built for researchers
            </h2>
            <p className="text-[var(--text-secondary)] text-[15px] max-w-md">
              Everything you need to discover, save, and cite academic papers — nothing more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                ),
                title: 'Unified Search',
                desc: 'Query arXiv, PubMed, CrossRef, and OpenAlex simultaneously with automatic deduplication.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                ),
                title: 'Local Library',
                desc: 'Save papers to your browser. No account needed. Your data stays private, always.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                ),
                title: 'One-Click Citations',
                desc: 'Generate BibTeX, APA, or MLA citations instantly. Copy to clipboard in one click.',
              },
            ].map(feature => (
              <div
                key={feature.title}
                className="card p-6 group hover:border-[hsl(var(--accent)/0.3)]"
              >
                <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] mb-4 group-hover:bg-[hsl(var(--accent)/0.1)] group-hover:text-[hsl(var(--accent))] transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-heading text-[15px] mb-2">{feature.title}</h3>
                <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TRENDING ======== */}
      <section className="py-20 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
        <div className="container-app">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-title text-[28px] md:text-[32px] mb-2">Trending Research</h2>
              <p className="text-[var(--text-secondary)] text-[14px]">
                Top cited papers in machine learning
              </p>
            </div>
            <Link
              href="/search?q=machine+learning"
              className="hidden md:flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              View all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {Array.from({ length: 4 }).map((_, i) => <PaperCardSkeleton key={i} />)}
            </div>
          ) : papers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {papers.map(paper => <PaperCard key={paper.id} paper={paper} />)}
            </div>
          ) : null}

          <Link
            href="/search?q=machine+learning"
            className="md:hidden mt-6 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-[var(--radius-md)]"
          >
            View all papers
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="py-24 border-t border-[var(--border-secondary)]">
        <div className="container-app text-center">
          <h2 className="text-title text-[28px] md:text-[36px] mb-6">
            Ready to search?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/search" className="btn btn-md btn-primary">
              Start searching
            </Link>
            <Link href="/saved" className="btn btn-md btn-secondary">
              View your library
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
