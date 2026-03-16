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
    <footer className="border-t border-[var(--border-secondary)] bg-[var(--bg-primary)] mt-auto pt-20 pb-10">
      <div className="container-app">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8 mb-16">
          {/* Brand */}
          <div className="md:w-1/3">
            <Link href="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-[var(--text-primary)] to-[var(--text-secondary)] flex items-center justify-center text-[var(--bg-primary)] shadow-sm group-hover:shadow-md transition-all duration-300">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <span className="text-[17px] font-bold tracking-tight text-[var(--text-primary)] drop-shadow-sm">
                ResearchArchive
              </span>
            </Link>
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-[280px] font-medium tracking-tight">
              An open-source, beautifully designed global academic search engine processing over 250M+ papers.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:w-2/3 md:ml-auto">
            <FooterCol title="Product" items={links.product} />
            <FooterCol title="Sources" items={links.sources} />
            <FooterCol title="Legal" items={links.legal} />
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border-secondary)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[13px] font-medium text-[var(--text-tertiary)] tracking-tight">
            © {new Date().getFullYear()} ResearchArchive. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            {/* Social / Github Placeholder Icons */}
            <a href="#" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="#" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string; ext?: boolean }[] }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4 tracking-tight">{title}</h3>
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.label}>
            {item.ext ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 group"
              >
                {item.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
              </a>
            ) : (
              <Link
                href={item.href}
                className="text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
