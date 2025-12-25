'use client';

import { useState } from 'react';
import type { CitationFormat, Paper } from '@/lib/types';

interface CitationProps {
  paper: Paper;
}

export default function Citation({ paper }: CitationProps) {
  const [format, setFormat] = useState<CitationFormat>('bibtex');
  const [citation, setCitation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchCitation = async (selectedFormat: CitationFormat) => {
    setIsLoading(true);
    setError('');
    setFormat(selectedFormat);

    try {
      const response = await fetch('/api/cite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id, format: selectedFormat }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate citation');
      }

      const data = await response.json();
      setCitation(data.citation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate citation');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Cite this paper
        </h3>
        <div className="flex gap-2">
          {(['bibtex', 'apa', 'mla'] as CitationFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => fetchCitation(f)}
              className={`btn text-xs ${
                format === f && citation ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-4 text-[var(--color-text-tertiary)]">
          Generating citation...
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-[var(--color-error)]">
          {error}
        </div>
      )}

      {citation && !isLoading && (
        <div className="relative">
          <pre className="bg-white border border-[var(--color-border-light)] rounded p-3 text-xs overflow-x-auto whitespace-pre-wrap font-mono">
            {citation}
          </pre>
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 btn btn-ghost text-xs"
            aria-label="Copy citation"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      )}

      {!citation && !isLoading && !error && (
        <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">
          Click a format above to generate a citation
        </p>
      )}
    </div>
  );
}
