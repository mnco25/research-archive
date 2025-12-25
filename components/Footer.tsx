import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Search Papers', href: '/search' },
    { label: 'Saved Papers', href: '/saved' },
    { label: 'API Status', href: '/api/health' },
  ],
  sources: [
    { label: 'arXiv', href: 'https://arxiv.org', external: true },
    { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov', external: true },
    { label: 'CrossRef', href: 'https://www.crossref.org', external: true },
    { label: 'OpenAlex', href: 'https://openalex.org', external: true },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'GitHub', href: 'https://github.com', external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-light)] mt-auto">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-semibold text-lg text-[var(--color-text-primary)]">
                ResearchArchive
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
              Find the research you need, faster. Search across 250M+ academic papers from multiple sources.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all"
                aria-label="GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-all"
                aria-label="Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
              Data Sources
            </h3>
            <ul className="space-y-3">
              {footerLinks.sources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border-light)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              © {new Date().getFullYear()} ResearchArchive. Built for researchers, by researchers.
            </p>
            <div className="flex items-center gap-6 text-sm text-[var(--color-text-tertiary)]">
              <span>Not affiliated with any data sources</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
