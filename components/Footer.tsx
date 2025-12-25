export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-light)] mt-16">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[var(--color-accent-primary)]"
            >
              <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 12H22M10 16H22M10 20H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-medium">ResearchArchive</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--color-text-secondary)]">
            <a
              href="https://arxiv.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              arXiv
            </a>
            <a
              href="https://pubmed.ncbi.nlm.nih.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              PubMed
            </a>
            <a
              href="https://www.crossref.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              CrossRef
            </a>
            <a
              href="https://openalex.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              OpenAlex
            </a>
          </nav>

          <p className="text-sm text-[var(--color-text-tertiary)]">
            Built for researchers, by researchers
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--color-border-light)] text-center text-xs text-[var(--color-text-tertiary)]">
          <p>
            Data sourced from arXiv, PubMed, CrossRef, and OpenAlex APIs.
            Not affiliated with any of these services.
          </p>
        </div>
      </div>
    </footer>
  );
}
