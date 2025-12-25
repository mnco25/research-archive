import type { Paper, PaperSource } from '@/lib/types';

interface BadgesProps {
  paper: Paper;
  showAll?: boolean;
}

const sourceColors: Record<PaperSource, string> = {
  arxiv: 'badge-arxiv',
  pubmed: 'badge-pubmed',
  crossref: 'badge-crossref',
  openalex: 'badge-openalex',
};

const sourceLabels: Record<PaperSource, string> = {
  arxiv: 'arXiv',
  pubmed: 'PubMed',
  crossref: 'CrossRef',
  openalex: 'OpenAlex',
};

export default function Badges({ paper, showAll = false }: BadgesProps) {
  return (
    <>
      {/* Source badge */}
      <span className={`badge ${sourceColors[paper.source]}`}>
        {sourceLabels[paper.source]}
      </span>

      {/* Access type badge */}
      <span
        className={`badge ${
          paper.accessType === 'open' ? 'badge-open-access' : 'badge-restricted'
        }`}
      >
        {paper.accessType === 'open' ? 'Open Access' : 'Restricted'}
      </span>

      {/* High citation badge */}
      {paper.citations >= 100 && (
        <span className="badge bg-yellow-100 text-yellow-800">
          Highly Cited
        </span>
      )}

      {/* Additional badges */}
      {showAll && (
        <>
          {/* DOI badge */}
          {paper.externalIds.doi && (
            <span className="badge bg-gray-100 text-gray-600">
              DOI
            </span>
          )}

          {/* Discipline badge */}
          {paper.discipline && (
            <span className="badge bg-purple-100 text-purple-700">
              {paper.discipline}
            </span>
          )}
        </>
      )}
    </>
  );
}

interface SourceBadgeProps {
  source: PaperSource;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span className={`badge ${sourceColors[source]}`}>
      {sourceLabels[source]}
    </span>
  );
}

interface AccessBadgeProps {
  accessType: 'open' | 'restricted';
}

export function AccessBadge({ accessType }: AccessBadgeProps) {
  return (
    <span
      className={`badge ${
        accessType === 'open' ? 'badge-open-access' : 'badge-restricted'
      }`}
    >
      {accessType === 'open' ? 'Open Access' : 'Restricted'}
    </span>
  );
}
