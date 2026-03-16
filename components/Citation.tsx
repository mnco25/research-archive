'use client';

import { useState } from 'react';
import type { CitationFormat, Paper } from '@/lib/types';

interface CitationProps {
  paper: Paper;
}

export default function Citation({ paper }: CitationProps) {
  const [format, setFormat] = useState<CitationFormat>('bibtex');
  const [citation, setCitation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchCitation = async (f: CitationFormat) => {
    setIsLoading(true);
    setError('');
    setFormat(f);
    try {
      const res = await fetch('/api/cite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id, format: f }),
      });
      if (!res.ok) throw new Error('Failed to generate citation');
      const data = await res.json();
      setCitation(data.citation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate citation');
    } finally {
      setIsLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">Cite this paper</span>
        <div className="flex gap-1">
          {(['bibtex', 'apa', 'mla'] as CitationFormat[]).map(f => (
            <button
              key={f}
              onClick={() => fetchCitation(f)}
              className={`
                px-2.5 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-all
                ${format === f && citation
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }
              `}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">Generating...</div>
      )}

      {error && (
        <div className="py-4 text-center text-[13px] text-[var(--error)]">{error}</div>
      )}

      {citation && !isLoading && (
        <div className="relative">
          <pre className="bg-[var(--bg-inset)] border border-[var(--border-secondary)] rounded-[var(--radius-md)] p-3 text-[12px] text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {citation}
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 btn-sm btn-ghost text-[11px]"
            aria-label="Copy citation"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}

      {!citation && !isLoading && !error && (
        <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">
          Select a format to generate a citation
        </p>
      )}
    </div>
  );
}
