'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Badges from '@/components/Badges';
import Citation from '@/components/Citation';
import PaperCard from '@/components/PaperCard';
import { PaperDetailSkeleton } from '@/components/Loading';
import type { PaperDetail, Paper } from '@/lib/types';
import { formatDate, formatNumber, getDoiUrl } from '@/lib/utils';

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
    <article className="container py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--color-text-tertiary)] mb-6">
        <Link href="/" className="hover:text-[var(--color-accent-primary)]">Home</Link>
        {' / '}
        <Link href="/search" className="hover:text-[var(--color-accent-primary)]">Search</Link>
        {' / '}
        <span className="text-[var(--color-text-secondary)]">Paper</span>
      </nav>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] font-serif mb-4 leading-tight">
        {paper.title}
      </h1>

      {/* Authors */}
      <p className="text-lg text-[var(--color-text-secondary)] mb-6">
        {paper.authors.map((author, i) => (
          <span key={i}>
            <Link
              href={`/search?q=${encodeURIComponent(author.name)}`}
              className="hover:text-[var(--color-accent-primary)]"
            >
              {author.name}
            </Link>
            {author.affiliation && (
              <span className="text-[var(--color-text-tertiary)]"> ({author.affiliation})</span>
            )}
            {i < paper.authors.length - 1 && ', '}
          </span>
        ))}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badges paper={paper} showAll />
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)] mb-8 pb-8 border-b border-[var(--color-border-light)]">
        <span className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatDate(paper.date)}
        </span>

        {paper.journal && (
          <span className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <em>{paper.journal}</em>
          </span>
        )}

        <span className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {formatNumber(paper.citations)} citations
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            View PDF
          </a>
        )}

        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Open Source
        </a>

        <button
          onClick={handleSave}
          className={`btn ${isSaved ? 'btn-primary' : 'btn-secondary'}`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {isSaved ? 'Saved' : 'Save Paper'}
        </button>

        {paper.externalIds.doi && (
          <a
            href={getDoiUrl(paper.externalIds.doi)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            DOI: {paper.externalIds.doi}
          </a>
        )}
      </div>

      {/* Abstract */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
          Abstract
        </h2>
        <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
          {paper.abstract || 'No abstract available.'}
        </p>
      </section>

      {/* Keywords */}
      {paper.keywords && paper.keywords.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Keywords
          </h2>
          <div className="flex flex-wrap gap-2">
            {paper.keywords.map((keyword, i) => (
              <Link
                key={i}
                href={`/search?q=${encodeURIComponent(keyword)}`}
                className="badge bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-primary)] hover:text-white transition-colors"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Citation */}
      <section className="mb-8">
        <Citation paper={paper} />
      </section>

      {/* Related Papers */}
      {paper.relatedPapers && paper.relatedPapers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Related Papers
          </h2>
          <div className="space-y-4">
            {paper.relatedPapers.map((relatedPaper) => (
              <PaperCard key={relatedPaper.id} paper={relatedPaper} />
            ))}
          </div>
        </section>
      )}

      {/* Cited By */}
      {paper.citedBy && paper.citedBy.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Cited By
          </h2>
          <div className="space-y-4">
            {paper.citedBy.map((citingPaper) => (
              <PaperCard key={citingPaper.id} paper={citingPaper} />
            ))}
          </div>
        </section>
      )}

      {/* Metadata */}
      <section className="bg-[var(--color-bg-secondary)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
          Metadata
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paper.externalIds.arxivId && (
            <div>
              <dt className="text-sm font-medium text-[var(--color-text-tertiary)]">arXiv ID</dt>
              <dd className="text-[var(--color-text-primary)]">{paper.externalIds.arxivId}</dd>
            </div>
          )}
          {paper.externalIds.pmid && (
            <div>
              <dt className="text-sm font-medium text-[var(--color-text-tertiary)]">PubMed ID</dt>
              <dd className="text-[var(--color-text-primary)]">{paper.externalIds.pmid}</dd>
            </div>
          )}
          {paper.externalIds.doi && (
            <div>
              <dt className="text-sm font-medium text-[var(--color-text-tertiary)]">DOI</dt>
              <dd className="text-[var(--color-text-primary)]">{paper.externalIds.doi}</dd>
            </div>
          )}
          {paper.externalIds.openAlexId && (
            <div>
              <dt className="text-sm font-medium text-[var(--color-text-tertiary)]">OpenAlex ID</dt>
              <dd className="text-[var(--color-text-primary)]">{paper.externalIds.openAlexId}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-tertiary)]">Source</dt>
            <dd className="text-[var(--color-text-primary)] capitalize">{paper.source}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-tertiary)]">Access Type</dt>
            <dd className="text-[var(--color-text-primary)] capitalize">{paper.accessType}</dd>
          </div>
          {paper.discipline && (
            <div>
              <dt className="text-sm font-medium text-[var(--color-text-tertiary)]">Discipline</dt>
              <dd className="text-[var(--color-text-primary)]">{paper.discipline}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-tertiary)]">Publication Date</dt>
            <dd className="text-[var(--color-text-primary)]">{formatDate(paper.date)}</dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
