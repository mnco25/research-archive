import type { Paper, CitationFormat } from '@/lib/types';
import { extractYear } from '@/lib/utils';

/**
 * Format author name for citations
 */
function formatAuthorName(name: string, format: 'bibtex' | 'apa' | 'mla'): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0];
  }

  const lastName = parts[parts.length - 1];
  const firstNames = parts.slice(0, -1);

  switch (format) {
    case 'bibtex':
      return `${lastName}, ${firstNames.join(' ')}`;
    case 'apa':
      // Last, F. M.
      const initials = firstNames.map(n => n[0] + '.').join(' ');
      return `${lastName}, ${initials}`;
    case 'mla':
      // Last, First Middle
      return `${lastName}, ${firstNames.join(' ')}`;
    default:
      return name;
  }
}

/**
 * Format multiple authors for citations
 */
function formatAuthors(authors: { name: string }[], format: CitationFormat): string {
  if (authors.length === 0) {
    return 'Unknown Author';
  }

  const formatted = authors.map(a => formatAuthorName(a.name, format));

  switch (format) {
    case 'bibtex':
      return formatted.join(' and ');

    case 'apa':
      if (formatted.length === 1) {
        return formatted[0];
      } else if (formatted.length === 2) {
        return `${formatted[0]} & ${formatted[1]}`;
      } else if (formatted.length <= 7) {
        const allButLast = formatted.slice(0, -1).join(', ');
        return `${allButLast}, & ${formatted[formatted.length - 1]}`;
      } else {
        // More than 7 authors: first 6, ..., last
        const first6 = formatted.slice(0, 6).join(', ');
        return `${first6}, ... ${formatted[formatted.length - 1]}`;
      }

    case 'mla':
      if (formatted.length === 1) {
        return formatted[0];
      } else if (formatted.length === 2) {
        return `${formatted[0]}, and ${formatted[1]}`;
      } else {
        return `${formatted[0]}, et al.`;
      }

    default:
      return formatted.join(', ');
  }
}

/**
 * Generate a citation key for BibTeX
 */
function generateCiteKey(paper: Paper): string {
  const firstAuthor = paper.authors[0]?.name || 'unknown';
  const lastName = firstAuthor.split(/\s+/).pop()?.toLowerCase() || 'unknown';
  const year = extractYear(paper.date) || 'nd';

  // Get first significant word from title
  const titleWords = paper.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['the', 'and', 'for', 'with'].includes(w));

  const titleWord = titleWords[0] || 'paper';

  return `${lastName}${year}${titleWord}`;
}

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Format paper as BibTeX
 */
function formatBibtex(paper: Paper): string {
  const citeKey = generateCiteKey(paper);
  const authors = formatAuthors(paper.authors, 'bibtex');
  const year = extractYear(paper.date) || '';
  const title = escapeLatex(paper.title);
  const abstract = paper.abstract ? escapeLatex(paper.abstract) : '';

  let entryType = 'article';
  const fields: string[] = [];

  fields.push(`  author = {${authors}}`);
  fields.push(`  title = {${title}}`);
  fields.push(`  year = {${year}}`);

  if (paper.journal) {
    fields.push(`  journal = {${escapeLatex(paper.journal)}}`);
  } else if (paper.source === 'arxiv') {
    entryType = 'misc';
    fields.push(`  howpublished = {arXiv}`);
    if (paper.externalIds.arxivId) {
      fields.push(`  eprint = {${paper.externalIds.arxivId}}`);
      fields.push(`  archiveprefix = {arXiv}`);
    }
  }

  if (paper.externalIds.doi) {
    fields.push(`  doi = {${paper.externalIds.doi}}`);
  }

  if (paper.url) {
    fields.push(`  url = {${paper.url}}`);
  }

  if (abstract) {
    fields.push(`  abstract = {${abstract}}`);
  }

  if (paper.keywords?.length) {
    fields.push(`  keywords = {${paper.keywords.join(', ')}}`);
  }

  return `@${entryType}{${citeKey},\n${fields.join(',\n')}\n}`;
}

/**
 * Format paper as APA (7th edition)
 */
function formatApa(paper: Paper): string {
  const authors = formatAuthors(paper.authors, 'apa');
  const year = extractYear(paper.date) || 'n.d.';
  const title = paper.title;

  let citation = `${authors} (${year}). ${title}`;

  if (paper.journal) {
    citation += `. *${paper.journal}*`;
  } else if (paper.source === 'arxiv' && paper.externalIds.arxivId) {
    citation += `. *arXiv*. https://arxiv.org/abs/${paper.externalIds.arxivId}`;
    return citation;
  }

  if (paper.externalIds.doi) {
    citation += `. https://doi.org/${paper.externalIds.doi}`;
  } else if (paper.url) {
    citation += `. ${paper.url}`;
  }

  return citation;
}

/**
 * Format paper as MLA (9th edition)
 */
function formatMla(paper: Paper): string {
  const authors = formatAuthors(paper.authors, 'mla');
  const title = `"${paper.title}."`;
  const year = extractYear(paper.date) || 'n.d.';

  let citation = `${authors}. ${title}`;

  if (paper.journal) {
    citation += ` *${paper.journal}*,`;
  } else if (paper.source === 'arxiv') {
    citation += ` *arXiv*,`;
  }

  citation += ` ${year}`;

  if (paper.externalIds.doi) {
    citation += `, https://doi.org/${paper.externalIds.doi}`;
  } else if (paper.url) {
    citation += `, ${paper.url}`;
  }

  citation += '.';

  return citation;
}

/**
 * Format a paper citation in the specified format
 */
export function formatCitation(paper: Paper, format: CitationFormat): string {
  switch (format) {
    case 'bibtex':
      return formatBibtex(paper);
    case 'apa':
      return formatApa(paper);
    case 'mla':
      return formatMla(paper);
    default:
      return formatApa(paper);
  }
}

/**
 * Format multiple papers as citations
 */
export function formatCitations(papers: Paper[], format: CitationFormat): string {
  return papers.map(p => formatCitation(p, format)).join('\n\n');
}
