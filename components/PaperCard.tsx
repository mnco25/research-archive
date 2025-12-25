'use client';

import Link from 'next/link';
import type { Paper } from '@/lib/types';
import { formatDate, formatNumber, formatAuthors } from '@/lib/utils';
import Badges from './Badges';

interface PaperCardProps {
  paper: Paper;
  onSave?: (paper: Paper) => void;
  isSaved?: boolean;
}

export default function PaperCard({ paper, onSave, isSaved = false }: PaperCardProps) {
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(paper);
  };

  return (
    <article className="p-5 bg-white border border-[var(--color-border-light)] rounded-lg card-hover">
      <div className="flex flex-col gap-3">
        {/* Title */}
        <Link href={`/paper/${encodeURIComponent(paper.id)}`}>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] font-serif leading-snug hover:text-[var(--color-accent-primary)] transition-colors">
            {paper.title}
          </h3>
        </Link>

        {/* Authors */}
        <p className="text-sm text-[var(--color-text-secondary)]">
          {formatAuthors(paper.authors, 3)}
        </p>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
          <span>{formatDate(paper.date)}</span>
          {paper.journal && (
            <>
              <span>•</span>
              <span className="italic">{paper.journal}</span>
            </>
          )}
          {paper.citations > 0 && (
            <>
              <span>•</span>
              <span>{formatNumber(paper.citations)} citations</span>
            </>
          )}
        </div>

        {/* Abstract */}
        {paper.abstract && (
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
            {paper.abstract}
          </p>
        )}

        {/* Badges and actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-2">
            <Badges paper={paper} />
          </div>

          <div className="flex items-center gap-2">
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                PDF
              </a>
            )}

            <button
              onClick={handleSave}
              className={`btn text-xs ${isSaved ? 'btn-primary' : 'btn-ghost'}`}
              aria-label={isSaved ? 'Remove from saved' : 'Save paper'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
