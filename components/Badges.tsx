import type { Paper, PaperSource } from '@/lib/types';

interface BadgesProps {
  paper: Paper;
  showAll?: boolean;
}

const sourceClass: Record<PaperSource, string> = {
  arxiv: 'badge-arxiv',
  pubmed: 'badge-pubmed',
  crossref: 'badge-crossref',
  openalex: 'badge-openalex',
};

const sourceLabel: Record<PaperSource, string> = {
  arxiv: 'arXiv',
  pubmed: 'PubMed',
  crossref: 'CrossRef',
  openalex: 'OpenAlex',
};

export default function Badges({ paper, showAll = false }: BadgesProps) {
  return (
    <>
      <span className={`badge ${sourceClass[paper.source]}`}>
        {sourceLabel[paper.source]}
      </span>

      <span className={`badge ${paper.accessType === 'open' ? 'badge-open' : 'badge-restricted'}`}>
        {paper.accessType === 'open' ? 'Open Access' : 'Restricted'}
      </span>

      {paper.citations >= 100 && (
        <span className="badge badge-cited">Highly Cited</span>
      )}

      {showAll && (
        <>
          {paper.externalIds.doi && (
            <span className="badge badge-neutral">DOI</span>
          )}
          {paper.discipline && (
            <span className="badge badge-neutral">{paper.discipline}</span>
          )}
        </>
      )}
    </>
  );
}

export function SourceBadge({ source }: { source: PaperSource }) {
  return (
    <span className={`badge ${sourceClass[source]}`}>
      {sourceLabel[source]}
    </span>
  );
}

export function AccessBadge({ accessType }: { accessType: 'open' | 'restricted' }) {
  return (
    <span className={`badge ${accessType === 'open' ? 'badge-open' : 'badge-restricted'}`}>
      {accessType === 'open' ? 'Open Access' : 'Restricted'}
    </span>
  );
}
