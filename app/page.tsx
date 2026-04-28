'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import PaperCard from '@/components/PaperCard';
import { PaperCardSkeleton } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import { toggleSavedPaper, useSavedIds } from '@/lib/saved-papers';
import disciplines from '@/data/disciplines.json';
import sourcesConfig from '@/data/sources-config.json';
import type { Paper } from '@/lib/types';

const FEATURES = [
  {
    title: 'Unified Search',
    desc: 'Query arXiv, PubMed, CrossRef, and OpenAlex in one go. Results are deduplicated and ranked across all four sources.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: 'Private Library',
    desc: 'Save what you read directly in your browser. No account, no tracking, no cloud—your reading list stays yours.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Instant Citations',
    desc: 'BibTeX, APA, MLA, and RIS at one click. Export your whole library to LaTeX or your reference manager.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
];

const POPULAR_QUERIES = [
  'Large Language Models',
  'Quantum Error Correction',
  'CRISPR Gene Editing',
  'Climate Tipping Points',
  'Battery Materials',
  'Protein Folding',
  'Reinforcement Learning',
  'Mental Health Outcomes',
  'Renewable Energy',
];

export default function Home() {
  const [trending, setTrending] = useState<Paper[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const savedIds = useSavedIds();
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/trending?days=180&limit=8');
        if (!res.ok) throw new Error('Failed to load trending');
        const data = await res.json();
        if (!cancelled) setTrending(data.papers || []);
      } catch (err) {
        console.error('trending', err);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = (paper: Paper) => {
    const { saved } = toggleSavedPaper(paper);
    addToast(saved ? 'Added to your library' : 'Removed from library', saved ? 'success' : 'info');
  };

  return (
    <>
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-secondary)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-secondary)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_30%,transparent_100%)]" />
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[hsl(var(--accent)/0.12)] blur-[120px] rounded-full" />
        </div>

        <div className="container-app relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-elevated)]/60 backdrop-blur text-[12px] font-semibold text-[var(--text-secondary)] mb-7 animate-in">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--success)]" />
              </span>
              260M+ papers · live across 4 sources
            </div>

            <h1 className="text-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.05] tracking-tight mb-5 animate-in" style={{ animationDelay: '80ms' }}>
              <span className="text-[var(--text-primary)]">Find research that</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--text-primary)] via-[hsl(var(--accent))] to-[hsl(280,80%,72%)] bg-clip-text text-transparent">
                actually moves you forward.
              </span>
            </h1>

            <p className="text-[var(--text-secondary)] text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto mb-10 animate-in" style={{ animationDelay: '160ms' }}>
              One unified search across arXiv, PubMed, CrossRef, and OpenAlex. Free for students,
              built for researchers. No paywalls, no accounts.
            </p>

            <div className="w-full max-w-2xl mx-auto animate-in" style={{ animationDelay: '240ms' }}>
              <SearchBar large autoFocus placeholder="Search topics, authors, or DOIs…" />
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                <span className="text-[12px] text-[var(--text-tertiary)] mr-1">Try:</span>
                {POPULAR_QUERIES.slice(0, 5).map(q => (
                  <Link
                    key={q}
                    href={`/search?q=${encodeURIComponent(q)}`}
                    className="px-2.5 py-1 rounded-full text-[12px] font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-primary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {q}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t border-[var(--border-secondary)]">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-title text-[24px] md:text-[32px] mb-1.5">Trending now</h2>
              <p className="text-[14px] text-[var(--text-secondary)]">
                The most cited papers published in the last six months, across every discipline.
              </p>
            </div>
            <Link
              href="/search?q=2026&sort=citations"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)] hover:text-[hsl(var(--accent))] transition-colors"
            >
              Browse all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <PaperCardSkeleton key={i} />)}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trending.slice(0, 4).map(paper => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onSave={handleSave}
                  isSaved={savedIds.has(paper.id)}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[var(--text-tertiary)]">Trending feed is temporarily unavailable.</p>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]/50">
        <div className="container-app">
          <h2 className="text-title text-[24px] md:text-[32px] mb-1.5">Browse by discipline</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mb-8">
            Jump straight into the literature for any major field.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(disciplines as { id: string; name: string; icon: string }[]).map(d => (
              <Link
                key={d.id}
                href={`/search?q=${encodeURIComponent(d.name)}&discipline=${d.id}`}
                className="group flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-primary)] hover:border-[var(--text-tertiary)] transition-colors"
              >
                <span className="text-xl" aria-hidden="true">{d.icon}</span>
                <span className="text-[13.5px] font-semibold text-[var(--text-primary)] group-hover:text-[hsl(var(--accent))] transition-colors">
                  {d.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t border-[var(--border-secondary)]">
        <div className="container-app">
          <div className="max-w-2xl mb-10">
            <h2 className="text-title text-[24px] md:text-[32px] mb-2">Built to share with your peers.</h2>
            <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-relaxed">
              Whether you&apos;re writing a thesis, prepping a journal club, or pointing a friend at
              the right reading—ResearchArchive gives you a clean, fast, paywall-free starting point.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="p-6 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-primary)] hover:border-[var(--text-tertiary)] transition-colors"
              >
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-heading text-[16px] mb-1.5 tracking-tight">{feature.title}</h3>
                <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]/50">
        <div className="container-app">
          <h2 className="text-title text-[22px] md:text-[26px] mb-1.5">Where the data comes from</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mb-8 max-w-xl">
            Four of the world&apos;s largest scholarly catalogs, queried in parallel and merged on
            DOI. Every paper links back to its source.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(sourcesConfig.sources).map(([key, source]) => (
              <a
                key={key}
                href={source.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-primary)] hover:border-[var(--text-tertiary)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: source.color }} />
                  <span className="text-[14px] font-semibold text-[var(--text-primary)]">{source.name}</span>
                </div>
                <p className="text-[12.5px] text-[var(--text-secondary)] mb-2 leading-relaxed">{source.description}</p>
                <span className="text-[11.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  {source.paperCount}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 border-t border-[var(--border-secondary)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[hsl(var(--accent)/0.08)] blur-[120px] rounded-full" />
        </div>
        <div className="container-app relative z-10 text-center">
          <h2 className="text-display text-[32px] md:text-[44px] tracking-tight leading-[1.1] mb-4 max-w-2xl mx-auto">
            Stop fighting paywalls. Start finding answers.
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
            ResearchArchive is free, open, and made for everyone who reads research.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/search" className="btn btn-lg btn-primary">
              Start searching
            </Link>
            <Link href="/saved" className="btn btn-lg btn-secondary">
              View your library
            </Link>
          </div>
        </div>
      </section>

      <ToastContainer />
    </>
  );
}
