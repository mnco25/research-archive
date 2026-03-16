'use client';

import Link from 'next/link';

export default function Footer() {
  const links = {
    product: [
      { label: 'Search', href: '/search' },
      { label: 'Library', href: '/saved' },
      { label: 'API Status', href: '/api/health' },
    ],
    sources: [
      { label: 'arXiv', href: 'https://arxiv.org', ext: true },
      { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov', ext: true },
      { label: 'CrossRef', href: 'https://www.crossref.org', ext: true },
      { label: 'OpenAlex', href: 'https://openalex.org', ext: true },
    ],
    legal: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-[var(--border-secondary)] mt-auto">
      <div className="container-app py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-[14px] font-semibold text-[var(--text-primary)]">
              ResearchArchive
            </span>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-2 leading-relaxed max-w-[240px]">
              Open-source unified search for 250M+ academic papers.
            </p>
          </div>

          <FooterCol title="Product" items={links.product} />
          <FooterCol title="Sources" items={links.sources} />
          <FooterCol title="Legal" items={links.legal} />
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-secondary)] text-[12px] text-[var(--text-tertiary)]">
          © {new Date().getFullYear()} ResearchArchive
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string; ext?: boolean }[] }) {
  return (
    <div>
      <h3 className="text-label mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.label}>
            {item.ext ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
