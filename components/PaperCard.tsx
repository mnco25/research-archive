'use client';

import Link from 'next/link';
import type { Paper } from '@/lib/types';
import { formatDate, formatNumber, formatAuthors } from '@/lib/utils';
import Badges from './Badges';
import Citation from './Citation';
import { useState } from 'react';

interface PaperCardProps {
  paper: Paper;
  onSave?: (paper: Paper) => void;
  isSaved?: boolean;
}

export default function PaperCard({ paper, onSave, isSaved = false }: PaperCardProps) {
  const [showCitation, setShowCitation] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(paper);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/paper/${paper.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleCitation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCitation(!showCitation);
  };

  return (
    <article className="group relative flex flex-col h-full min-w-0 p-6 md:p-8 rounded-[2.5rem] bg-[var(--bg-elevated)]/30 backdrop-blur-xl border border-[var(--border-primary)]/40 hover:border-[hsl(var(--accent)/0.5)] shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-all duration-700 overflow-hidden active:scale-[0.99] transform-gpu">
      {/* Cinematic Ambient Glow - More dynamic on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent)/0.08)] via-transparent to-[hsl(280,80%,65%/0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
      
      {/* Animated corner accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[hsl(var(--accent)/0.15)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full"></div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Top row: badges + save */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Badges paper={paper} />
          </div>
          {onSave && (
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-[var(--text-placeholder)] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.1)] transition-all duration-300"
                title="Copy Link"
              >
                {isCopied ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                )}
              </button>
              <button
                onClick={toggleCitation}
                className={`p-2 rounded-full transition-all duration-300 ${showCitation ? 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)]' : 'text-[var(--text-placeholder)] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.1)]'}`}
                title="Cite Paper"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10h.01" /><path d="M15 10h.01" /></svg>
              </button>
              <button
                onClick={handleSave}
                className={`
                  p-2 rounded-full transition-all duration-300
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
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/paper/${encodeURIComponent(paper.id)}`} className="block mb-2.5">
          <h3 className="text-display text-[17px] md:text-[19px] leading-[1.3] tracking-tight text-[var(--text-primary)] line-clamp-3 group-hover:text-[hsl(var(--accent))] transition-colors duration-300">
            {paper.title}
          </h3>
        </Link>

        {/* Authors - Interactive style */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
          <p className="text-[14px] font-semibold text-[var(--text-secondary)] truncate">
            {formatAuthors(paper.authors, 2)}
          </p>
          {paper.authors.length > 2 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
              +{paper.authors.length - 2} more
            </span>
          )}
        </div>

        {/* Abstract */}
        {paper.abstract && (
          <p className={`text-[14px] text-[var(--text-tertiary)] leading-relaxed line-clamp-3 mb-6 font-medium group-hover:text-[var(--text-secondary)] transition-colors duration-500 ${showCitation ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
            {paper.abstract}
          </p>
        )}

        {/* In-card Citation tools */}
        {showCitation && (
          <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300">
            <Citation paper={paper} />
          </div>
        )}

        <div className="flex-1" />

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-[var(--border-secondary)]/30 group-hover:border-[var(--border-secondary)] transition-colors duration-500">
          <div className="flex items-center gap-4 text-[12px] font-bold tracking-tight text-[var(--text-tertiary)] uppercase whitespace-nowrap overflow-hidden">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-tertiary)]/50 group-hover:bg-[var(--bg-tertiary)] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {new Date(paper.date).getFullYear()}
            </span>
            {paper.citations > 0 && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[hsl(var(--accent)/0.05)] text-[hsl(var(--accent))] transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                {formatNumber(paper.citations)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="h-9 px-4 rounded-[1.2rem] border border-[var(--border-primary)] text-[11px] font-extrabold tracking-widest uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/40 flex items-center gap-2 transition-all duration-300 active:scale-95 group/pdf"
              >
                PDF
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover/pdf:translate-x-0.5 group-hover/pdf:-translate-y-0.5 transition-transform duration-300"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
