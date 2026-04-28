'use client';

import { useMemo, useState } from 'react';
import type { CitationFormat, Paper } from '@/lib/types';
import { formatCitation } from '@/lib/citation-formatter';

interface CitationProps {
  paper: Paper;
}

const FORMATS: { id: CitationFormat; label: string }[] = [
  { id: 'bibtex', label: 'BibTeX' },
  { id: 'apa', label: 'APA' },
  { id: 'mla', label: 'MLA' },
  { id: 'ris', label: 'RIS' },
];

export default function Citation({ paper }: CitationProps) {
  const [format, setFormat] = useState<CitationFormat>('apa');
  const [copied, setCopied] = useState(false);

  const citation = useMemo(() => formatCitation(paper, format), [paper, format]);

  const handleSetFormat = (next: CitationFormat) => {
    setFormat(next);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3">
      <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
        <span className="text-[12px] font-semibold text-[var(--text-primary)]">Cite this paper</span>
        <div className="flex gap-0.5 bg-[var(--bg-elevated)] rounded-[var(--radius-sm)] p-0.5 border border-[var(--border-primary)]">
          {FORMATS.map(f => (
            <button
              key={f.id}
              onClick={() => handleSetFormat(f.id)}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-[4px] transition-colors ${
                format === f.id
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <pre className="bg-[var(--bg-inset)] border border-[var(--border-secondary)] rounded-[var(--radius-sm)] p-2.5 pr-14 text-[11.5px] text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-48">
          {citation}
        </pre>
        <button
          onClick={copy}
          className="absolute top-1.5 right-1.5 px-2 py-1 rounded-[4px] text-[11px] font-semibold bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors"
          aria-label="Copy citation"
          type="button"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
