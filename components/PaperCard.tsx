'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Paper } from '@/lib/types';
import { formatNumber, formatAuthors, truncateText } from '@/lib/utils';
import Badges from './Badges';
import Citation from './Citation';

interface PaperCardProps {
  paper: Paper;
  onSave?: (paper: Paper) => void;
  isSaved?: boolean;
  variant?: 'default' | 'compact';
}

export default function PaperCard({ paper, onSave, isSaved = false, variant = 'default' }: PaperCardProps) {
  const [showCitation, setShowCitation] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isCompact = variant === 'compact';

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSave = (e: React.MouseEvent) => {
    stop(e);
    onSave?.(paper);
  };

  const handleShare = async (e: React.MouseEvent) => {
    stop(e);
    const url = `${window.location.origin}/paper/${encodeURIComponent(paper.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    } catch { /* ignore */ }
  };

  const toggleCitation = (e: React.MouseEvent) => {
    stop(e);
    setShowCitation(v => !v);
  };

  const year = paper.date ? new Date(paper.date).getFullYear() : null;
  const authorLabel = formatAuthors(paper.authors, isCompact ? 1 : 3);
  const remainingAuthors = Math.max(0, paper.authors.length - (isCompact ? 1 : 3));

  return (
    <article className={`group relative flex flex-col h-full min-w-0 rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] border border-[var(--border-primary)] hover:border-[var(--text-tertiary)] transition-colors duration-200 overflow-hidden ${
      isCompact ? 'p-4' : 'p-5 md:p-6'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <Badges paper={paper} />
        </div>
        <div className="flex items-center -mr-1.5 -mt-1.5 shrink-0">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label={isCopied ? 'Link copied' : 'Copy link'}
            title={isCopied ? 'Copied' : 'Copy link'}
            type="button"
          >
            {isCopied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </button>
          <button
            onClick={toggleCitation}
            className={`p-1.5 rounded-full transition-colors ${
              showCitation
                ? 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
            }`}
            aria-label={showCitation ? 'Hide citation' : 'Show citation'}
            aria-expanded={showCitation}
            title="Cite"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path d="M9 10h.01M15 10h.01" />
            </svg>
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-full transition-colors ${
                isSaved
                  ? 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
              aria-label={isSaved ? 'Remove from library' : 'Save to library'}
              aria-pressed={isSaved}
              title={isSaved ? 'Saved' : 'Save'}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <Link
        href={`/paper/${encodeURIComponent(paper.id)}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] rounded-md"
      >
        <h3 className={`font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-[hsl(var(--accent))] transition-colors leading-snug line-clamp-3 ${
          isCompact ? 'text-[15px] mb-2' : 'text-[17px] mb-2.5'
        }`}>
          {paper.title}
        </h3>
      </Link>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
        <p className="text-[13px] font-medium text-[var(--text-secondary)] truncate max-w-full">{authorLabel}</p>
        {remainingAuthors > 0 && (
          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] font-medium">
            +{remainingAuthors}
          </span>
        )}
      </div>

      {!showCitation && paper.abstract && !isCompact && (
        <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-4">
          {truncateText(paper.abstract, 360)}
        </p>
      )}

      {showCitation && (
        <div className="mb-4 animate-fade">
          <Citation paper={paper} />
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center justify-between gap-3 mt-2 pt-3 border-t border-[var(--border-secondary)]">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--text-tertiary)] min-w-0 overflow-hidden">
          {year && (
            <span className="inline-flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {year}
            </span>
          )}
          {paper.citations > 0 && (
            <span className="inline-flex items-center gap-1 text-[hsl(var(--accent))]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              </svg>
              {formatNumber(paper.citations)}
            </span>
          )}
          {paper.journal && !isCompact && (
            <span className="truncate text-[var(--text-tertiary)]">· {paper.journal}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 transition-colors"
            >
              PDF
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          )}
          <Link
            href={`/paper/${encodeURIComponent(paper.id)}`}
            className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 transition-colors"
          >
            Read
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
