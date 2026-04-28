import type { Paper, CitationFormat } from '@/lib/types';
import { extractYear } from '@/lib/utils';

function formatAuthorName(name: string, format: 'bibtex' | 'apa' | 'mla'): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const lastName = parts[parts.length - 1];
  const firstNames = parts.slice(0, -1);

  switch (format) {
    case 'bibtex':
      return `${lastName}, ${firstNames.join(' ')}`;
    case 'apa': {
      const initials = firstNames.map(n => n[0] + '.').join(' ');
      return `${lastName}, ${initials}`;
    }
    case 'mla':
      return `${lastName}, ${firstNames.join(' ')}`;
    default:
      return name;
  }
}

function formatAuthors(authors: { name: string }[], format: CitationFormat): string {
  if (authors.length === 0) return 'Unknown Author';
  if (format === 'ris') return authors.map(a => a.name).join('\nAU  - ');
  const formatted = authors.map(a => formatAuthorName(a.name, format as 'bibtex' | 'apa' | 'mla'));

  switch (format) {
    case 'bibtex':
      return formatted.join(' and ');
    case 'apa':
      if (formatted.length === 1) return formatted[0];
      if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;
      if (formatted.length <= 20) {
        const allButLast = formatted.slice(0, -1).join(', ');
        return `${allButLast}, & ${formatted[formatted.length - 1]}`;
      }
      return `${formatted.slice(0, 19).join(', ')}, ... ${formatted[formatted.length - 1]}`;
    case 'mla':
      if (formatted.length === 1) return formatted[0];
      if (formatted.length === 2) return `${formatted[0]}, and ${formatted[1]}`;
      return `${formatted[0]}, et al.`;
    default:
      return formatted.join(', ');
  }
}

function generateCiteKey(paper: Paper): string {
  const firstAuthor = paper.authors[0]?.name || 'unknown';
  const lastName = firstAuthor.split(/\s+/).pop()?.toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
  const year = extractYear(paper.date) || 'nd';
  const titleWord =
    paper.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['the', 'and', 'for', 'with', 'from', 'into'].includes(w))[0] || 'paper';
  return `${lastName}${year}${titleWord}`;
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function formatBibtex(paper: Paper): string {
  const citeKey = generateCiteKey(paper);
  const authors = formatAuthors(paper.authors, 'bibtex');
  const year = extractYear(paper.date) || '';
  const title = escapeLatex(paper.title);

  let entryType = 'article';
  const fields: string[] = [
    `  author = {${authors}}`,
    `  title = {${title}}`,
    `  year = {${year}}`,
  ];

  if (paper.journal) {
    fields.push(`  journal = {${escapeLatex(paper.journal)}}`);
  } else if (paper.source === 'arxiv') {
    entryType = 'misc';
    fields.push(`  howpublished = {arXiv preprint}`);
    if (paper.externalIds.arxivId) {
      fields.push(`  eprint = {${paper.externalIds.arxivId}}`);
      fields.push(`  archiveprefix = {arXiv}`);
    }
  }

  if (paper.externalIds.doi) fields.push(`  doi = {${paper.externalIds.doi}}`);
  if (paper.url) fields.push(`  url = {${paper.url}}`);
  if (paper.abstract) fields.push(`  abstract = {${escapeLatex(paper.abstract)}}`);
  if (paper.keywords?.length) fields.push(`  keywords = {${paper.keywords.join(', ')}}`);

  return `@${entryType}{${citeKey},\n${fields.join(',\n')}\n}`;
}

function formatApa(paper: Paper): string {
  const authors = formatAuthors(paper.authors, 'apa');
  const year = extractYear(paper.date) || 'n.d.';
  let citation = `${authors} (${year}). ${paper.title}`;

  if (paper.journal) {
    citation += `. *${paper.journal}*`;
  } else if (paper.source === 'arxiv' && paper.externalIds.arxivId) {
    return `${citation}. *arXiv*. https://arxiv.org/abs/${paper.externalIds.arxivId}`;
  }

  if (paper.externalIds.doi) {
    citation += `. https://doi.org/${paper.externalIds.doi}`;
  } else if (paper.url) {
    citation += `. ${paper.url}`;
  }
  return citation;
}

function formatMla(paper: Paper): string {
  const authors = formatAuthors(paper.authors, 'mla');
  const year = extractYear(paper.date) || 'n.d.';
  let citation = `${authors}. "${paper.title}."`;

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
  return citation + '.';
}

function formatRis(paper: Paper): string {
  const year = extractYear(paper.date);
  const lines: string[] = [];
  lines.push(paper.journal ? 'TY  - JOUR' : 'TY  - GEN');
  for (const author of paper.authors) lines.push(`AU  - ${author.name}`);
  lines.push(`TI  - ${paper.title}`);
  if (year) lines.push(`PY  - ${year}`);
  if (paper.date) lines.push(`DA  - ${paper.date}`);
  if (paper.journal) lines.push(`JO  - ${paper.journal}`);
  if (paper.abstract) lines.push(`AB  - ${paper.abstract}`);
  if (paper.externalIds.doi) lines.push(`DO  - ${paper.externalIds.doi}`);
  if (paper.url) lines.push(`UR  - ${paper.url}`);
  if (paper.keywords?.length) {
    for (const kw of paper.keywords) lines.push(`KW  - ${kw}`);
  }
  lines.push('ER  - ');
  return lines.join('\n');
}

export function formatCitation(paper: Paper, format: CitationFormat): string {
  switch (format) {
    case 'bibtex':
      return formatBibtex(paper);
    case 'apa':
      return formatApa(paper);
    case 'mla':
      return formatMla(paper);
    case 'ris':
      return formatRis(paper);
    default:
      return formatApa(paper);
  }
}

export function formatCitations(papers: Paper[], format: CitationFormat): string {
  const sep = format === 'bibtex' ? '\n\n' : format === 'ris' ? '\n\n' : '\n\n';
  return papers.map(p => formatCitation(p, format)).join(sep);
}
