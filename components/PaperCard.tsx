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
    <article className="group relative flex flex-col h-full min-w-0 p-6 md:p-7 rounded-[1.8rem] bg-[var(--bg-elevated)]/40 backdrop-blur-xl border border-[var(--border-primary)]/60 hover:border-[var(--text-primary)]/30 shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden">
      {/* Cinematic Ambient Glow positioned absolutely behind the content */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--accent)/0.04)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Top row: badges + save */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Badges paper={paper} />
          </div>
          {onSave && (
            <button
              onClick={handleSave}
              className={`
                p-2 rounded-full transition-all duration-300 ml-2 flex-shrink-0
                ${isSaved
                  ? 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)]'
                  : 'text-[var(--text-placeholder)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }
              `}
              aria-label={isSaved ? 'Remove from saved' : 'Save paper'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Title */}
        <Link href={`/paper/${encodeURIComponent(paper.id)}`} className="block mb-2.5">
          <h3 className="text-display text-[17px] md:text-[19px] leading-[1.3] tracking-tight text-[var(--text-primary)] line-clamp-3 group-hover:text-[hsl(var(--accent))] transition-colors duration-300">
            {paper.title}
          </h3>
        </Link>

        {/* Authors */}
        <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-4 truncate w-full">
          {formatAuthors(paper.authors, 3)}
        </p>

        {/* Abstract */}
        {paper.abstract && (
          <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed line-clamp-3 mb-6 font-medium">
            {paper.abstract}
          </p>
        )}

        <div className="flex-1" />

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-secondary)]/50">
          <div className="flex items-center gap-4 text-[13px] font-semibold tracking-tight text-[var(--text-tertiary)] uppercase whitespace-nowrap overflow-hidden">
            <span className="truncate">{formatDate(paper.date)}</span>
            {paper.citations > 0 && (
              <span className="flex items-center gap-1.5 flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                {formatNumber(paper.citations)} cited
              </span>
            )}
          </div>
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] font-bold tracking-widest uppercase text-[var(--text-tertiary)] hover:text-[hsl(var(--accent))] flex items-center gap-1.5 transition-colors flex-shrink-0 ml-3"
            >
              PDF
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="translate-x-0 group-hover:translate-x-0.5 transition-transform"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
