'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Badges from '@/components/Badges';
import Citation from '@/components/Citation';
import PaperCard from '@/components/PaperCard';
import { PaperDetailSkeleton } from '@/components/Loading';
import type { PaperDetail, Paper } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';

export default function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadPaper() {
      try {
        const response = await fetch(`/api/papers/${encodeURIComponent(resolvedParams.id)}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Paper not found');
          }
          throw new Error('Failed to load paper');
        }

        const data = await response.json();
        setPaper(data);

        // Check if saved
        const saved = localStorage.getItem('savedPapers');
        if (saved) {
          const papers = JSON.parse(saved);
          setIsSaved(papers.some((p: { paper: Paper }) => p.paper.id === data.id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    loadPaper();
  }, [resolvedParams.id]);

  const handleSave = () => {
    if (!paper) return;

    const saved = localStorage.getItem('savedPapers');
    let papers: { paper: Paper; savedAt: string }[] = [];

    try {
      papers = saved ? JSON.parse(saved) : [];
    } catch {
      papers = [];
    }

    if (isSaved) {
      papers = papers.filter(p => p.paper.id !== paper.id);
      setIsSaved(false);
    } else {
      papers.push({ paper, savedAt: new Date().toISOString() });
      setIsSaved(true);
    }

    localStorage.setItem('savedPapers', JSON.stringify(papers));
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <PaperDetailSkeleton />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="container py-16 text-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-tertiary)"
          strokeWidth="1.5"
          className="mx-auto mb-4"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
          {error || 'Paper not found'}
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-4">
          The paper you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
        </p>
        <Link href="/search" className="btn btn-primary">
          Back to Search
        </Link>
      </div>
    );
  }

  return (
    <article className="container-custom py-12 max-w-5xl animate-enter">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--text-tertiary)] mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[var(--brand-primary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-[var(--brand-primary)] transition-colors">Search</Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)] font-medium">Paper Details</span>
      </nav>

      {/* Header Section */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-6">
          <Badges paper={paper} showAll />
        </div>

        <h1 className="font-display font-bold text-3xl md:text-5xl text-[var(--text-primary)] leading-tight mb-6">
          {paper.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--text-secondary)]">
          <div className="flex flex-wrap gap-1">
            {paper.authors.map((author, i) => (
              <span key={i}>
                <Link
                  href={`/search?q=${encodeURIComponent(author.name)}`}
                  className="font-medium hover:text-[var(--brand-primary)] transition-colors underline decoration-transparent hover:decoration-[var(--brand-primary)]"
                >
                  {author.name}
                </Link>
                {i < paper.authors.length - 1 && ', '}
              </span>
            ))}
          </div>
          {paper.date && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {formatDate(paper.date)}
            </div>
          )}
        </div>
      </header>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 mb-12 p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            Read PDF
          </a>
        )}

        <button
          onClick={handleSave}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all border
            ${isSaved
              ? 'bg-[var(--bg-surface-active)] text-[var(--brand-primary)] border-[var(--brand-primary)]'
              : 'bg-transparent text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)]'
            }
          `}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          {isSaved ? 'Saved to Library' : 'Save to Library'}
        </button>

        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-2.5 bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)] rounded-xl font-medium hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          View Source
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-12">

          {/* Abstract */}
          <section>
            <h2 className="font-display font-semibold text-2xl mb-4 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--brand-secondary)]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="14 2 14 8 20 8" /></svg>
              Abstract
            </h2>
            <div className="prose prose-lg dark:prose-invert text-[var(--text-secondary)] leading-relaxed">
              {paper.abstract || <p className="italic text-[var(--text-tertiary)]">No abstract available for this paper.</p>}
            </div>
          </section>

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <section>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((keyword, i) => (
                  <Link
                    key={i}
                    href={`/search?q=${encodeURIComponent(keyword)}`}
                    className="px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
                  >
                    {keyword}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Citation Component */}
          <section>
            <h2 className="font-display font-semibold text-2xl mb-4">Cite this Paper</h2>
            <Citation paper={paper} />
          </section>

        </div>

        {/* Sidebar Column */}
        <aside className="space-y-8">
          {/* Metadata Card */}
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-subtle)]">Paper Info</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[var(--text-tertiary)] mb-1">Citations</dt>
                <dd className="font-medium text-[var(--text-primary)] text-lg">{formatNumber(paper.citations)}</dd>
              </div>
              {paper.journal && (
                <div>
                  <dt className="text-[var(--text-tertiary)] mb-1">Journal</dt>
                  <dd className="font-medium text-[var(--text-primary)]">{paper.journal}</dd>
                </div>
              )}
              {paper.externalIds.doi && (
                <div>
                  <dt className="text-[var(--text-tertiary)] mb-1">DOI</dt>
                  <dd className="font-medium text-[var(--text-primary)] break-all">{paper.externalIds.doi}</dd>
                </div>
              )}
              <div>
                <dt className="text-[var(--text-tertiary)] mb-1">Source Database</dt>
                <dd className="font-medium text-[var(--text-primary)] capitalize">{paper.source}</dd>
              </div>
            </dl>
          </div>

          {/* Related Papers */}
          {paper.relatedPapers && paper.relatedPapers.length > 0 && (
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Related Research</h3>
              <div className="space-y-4">
                {paper.relatedPapers.map(p => (
                  <PaperCard key={p.id} paper={p} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
