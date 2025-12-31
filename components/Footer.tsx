'use client';

import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Search', href: '/search' },
    { label: 'Library', href: '/saved' },
    { label: 'System Status', href: '/api/health' },
  ],
  data: [
    { label: 'arXiv', href: 'https://arxiv.org', external: true },
    { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov', external: true },
    { label: 'CrossRef', href: 'https://www.crossref.org', external: true },
    { label: 'OpenAlex', href: 'https://openalex.org', external: true },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'License', href: 'https://github.com/yourusername/research-archive/blob/main/LICENSE', external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] mt-24">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="font-display font-semibold text-xl tracking-tight">ResearchArchive</span>
            </Link>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-sm mb-8">
              Democratizing access to scientific knowledge. A unified, semantic search interface for the world's research.
            </p>
            <div className="flex gap-4">
              <SocialLink href="https://github.com" icon="github" />
              <SocialLink href="https://twitter.com" icon="twitter" />
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <FooterColumn title="Platform" links={footerLinks.product} />
            <FooterColumn title="Data Sources" links={footerLinks.data} />
            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/search" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">Search</Link></li>
                <li><Link href="/saved" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">Saved Papers</Link></li>
                <li><Link href="/api/health" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">API Status</Link></li>
              </ul>
            </div>

            {/* Data Column */}
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Data Sources</h3>
              <ul className="space-y-3">
                <li><a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">arXiv</a></li>
                <li><a href="https://pubmed.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">PubMed</a></li>
                <li><a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">OpenAlex</a></li>
                <li><a href="https://crossref.org" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">CrossRef</a></li>
              </ul>
            </div>

            {/* Stay Updated */}
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Stay Updated</h3>
              <p className="text-sm text-[var(--text-tertiary)] mb-4">
                Join our newsletter for the latest updates.
              </p>
              <form className="flex gap-2" onSubmit={(e: React.FormEvent) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-grow px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-secondary)] transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--text-tertiary)]">
          <p>© {new Date().getFullYear()} ResearchArchive. Open source.</p>
          <p className="text-[var(--text-tertiary)] leading-relaxed">
            We&apos;re building the future of academic search. Open source, semantic, and designed for researchers.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string; external?: boolean }[] }) {
  return (
    <div>
      <h3 className="font-semibold text-[var(--text-primary)] mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1 group"
              >
                {link.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, icon }: { href: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-110 transition-all border border-[var(--border-default)]"
    >
      <span className="sr-only">{icon}</span>
      {icon === 'github' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )}
    </a>
  );
}
