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
      <section className="relative flex flex-col items-center justify-center pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden min-h-[85vh]">
        {/* Cinematic Background Layer */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Deep Fading Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(150,150,150,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(150,150,150,0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_40%,transparent_100%)]"></div>
          
          {/* Dynamic Glow Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[hsl(var(--accent)/0.15)] blur-[120px] rounded-[100%] opacity-70 mix-blend-normal transform-gpu pointer-events-none"></div>
          <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-[hsl(280,80%,65%/0.12)] blur-[120px] rounded-full opacity-60 mix-blend-normal transform-gpu pointer-events-none"></div>
        </div>

        <div className="container-app relative z-10 w-full mt-[-2rem]">
          <div className="max-w-[900px] mx-auto text-center flex flex-col items-center">
            {/* Premium Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[var(--border-primary)] shadow-sm bg-[var(--bg-elevated)]/60 backdrop-blur-xl text-[13px] font-medium text-[var(--text-secondary)] mb-10 animate-in hover:scale-105 transition-transform duration-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-60 animate-ping" style={{ animationDuration: '3s' }} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
              </span>
              Processing 250M+ Data Points
            </div>

            {/* Headline - Cinematic scale and tracking */}
            <h1 className="text-display px-2 md:px-0 text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] tracking-tighter mb-6 animate-in" style={{ animationDelay: '100ms' }}>
              <span className="text-[var(--text-primary)]">Uncover the engine of</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--text-primary)] via-[hsl(var(--accent))] to-[hsl(280,80%,65%)] bg-clip-text text-transparent drop-shadow-sm">
                scientific progress
              </span>
            </h1>

            <p className="text-[var(--text-secondary)] text-[17px] md:text-[21px] leading-relaxed max-w-2xl mx-auto mb-14 animate-in font-medium tracking-tight" style={{ animationDelay: '200ms' }}>
              Query arXiv, PubMed, CrossRef, and OpenAlex simultaneously. 
              Built for researchers, completely open source, zero paywalls.
            </p>

            {/* Premium Glassmorphic Search Container */}
            <div className="w-full max-w-3xl mx-auto animate-in group relative" style={{ animationDelay: '300ms' }}>
              {/* Outer Glow Halo effect */}
              <div className="absolute -inset-1 rounded-[1.8rem] bg-gradient-to-r from-[hsl(var(--accent)/0.2)] via-transparent to-[hsl(280,80%,65%/0.2)] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700"></div>
              
              <div className="relative rounded-[1.4rem] p-2 bg-[var(--bg-primary)]/40 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[var(--border-primary)]/80 transition-shadow duration-500 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="relative bg-[var(--bg-elevated)] rounded-[1rem] shadow-sm transform-gpu transition-all">
                  <SearchBar large autoFocus placeholder="Search papers, authors, topics, keywords..." />
                </div>
              </div>
            </div>

            {/* Minimal High-Contrast Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 mt-24 animate-in mx-auto w-full max-w-3xl" style={{ animationDelay: '400ms' }}>
              {[
                { value: '250M+', label: 'Papers Indexed' },
                { value: '4', label: 'Global Databases' },
                { value: '100%', label: 'Free Forever' },
              ].map(stat => (
                <div key={stat.label} className="text-center group flex flex-col items-center">
                  <div className="text-[32px] md:text-[42px] font-bold text-[var(--text-primary)] tracking-tighter group-hover:text-[hsl(var(--accent))] transition-colors duration-300">{stat.value}</div>
                  <div className="text-[13px] md:text-[14px] font-semibold text-[var(--text-tertiary)] mt-1.5 tracking-widest uppercase">{stat.label}</div>
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
