import Link from 'next/link';

const PRODUCT_LINKS = [
  { label: 'Search', href: '/search' },
  { label: 'Library', href: '/saved' },
  { label: 'API Status', href: '/api/health' },
];

const SOURCE_LINKS = [
  { label: 'arXiv', href: 'https://arxiv.org' },
  { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov' },
  { label: 'CrossRef', href: 'https://www.crossref.org' },
  { label: 'OpenAlex', href: 'https://openalex.org' },
];

const RESOURCE_LINKS = [
  { label: 'Open Access', href: 'https://en.wikipedia.org/wiki/Open_access' },
  { label: 'DOI System', href: 'https://www.doi.org' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-secondary)] bg-[var(--bg-primary)] mt-auto">
      <div className="container-app py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-[8px] bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                ResearchArchive
              </span>
            </Link>
            <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed max-w-sm">
              An open, fast, privacy-first search across 260M+ academic papers. Built for students,
              researchers, and curious minds—free forever, with no accounts and no tracking.
            </p>
          </div>

          <FooterCol title="Product" items={PRODUCT_LINKS} />
          <FooterCol title="Sources" items={SOURCE_LINKS} external />
        </div>

        <div className="pt-6 border-t border-[var(--border-secondary)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-[12.5px] text-[var(--text-tertiary)]">
            © {year} ResearchArchive · Data via {SOURCE_LINKS.map(s => s.label).join(', ')}
          </div>
          <div className="flex items-center gap-4">
            {RESOURCE_LINKS.map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
  external = false,
}: {
  title: string;
  items: { label: string; href: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <h3 className="text-[12.5px] font-semibold text-[var(--text-primary)] mb-3 tracking-tight uppercase letter-spacing-wide">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.label}>
            {external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1"
              >
                {item.label}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </a>
            ) : (
              <Link
                href={item.href}
                className="text-[13.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
