import axios from 'axios';
import type { Paper } from '@/lib/types';
import { cleanHtml, generatePaperId } from '@/lib/utils';

const OPENALEX_API_BASE = 'https://api.openalex.org/works';

interface OpenAlexAuthor {
  author: {
    id: string;
    display_name: string;
    orcid?: string;
  };
  institutions?: {
    id: string;
    display_name: string;
  }[];
  author_position?: string;
}

interface OpenAlexWork {
  id: string;
  doi?: string;
  title?: string;
  display_name?: string;
  publication_date?: string;
  authorships?: OpenAlexAuthor[];
  abstract_inverted_index?: Record<string, number[]>;
  cited_by_count?: number;
  is_oa?: boolean;
  open_access?: {
    is_oa: boolean;
    oa_status: string;
    oa_url?: string;
  };
  primary_location?: {
    source?: {
      display_name: string;
      type: string;
    };
    landing_page_url?: string;
    pdf_url?: string;
  };
  concepts?: {
    id: string;
    display_name: string;
    level: number;
    score: number;
  }[];
  ids?: {
    openalex: string;
    doi?: string;
    pmid?: string;
  };
  type?: string;
}

interface OpenAlexResponse {
  meta: {
    count: number;
    db_response_time_ms: number;
    page: number;
    per_page: number;
  };
  results: OpenAlexWork[];
}

/**
 * Reconstruct abstract from inverted index
 */
function reconstructAbstract(invertedIndex: Record<string, number[]> | undefined): string {
  if (!invertedIndex) return '';

  const words: { word: string; position: number }[] = [];

  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const position of positions) {
      words.push({ word, position });
    }
  }

  words.sort((a, b) => a.position - b.position);
  return words.map(w => w.word).join(' ');
}

/**
 * Extract OpenAlex ID from full URL
 */
function extractOpenAlexId(url: string): string {
  const match = url.match(/W\d+/);
  return match ? match[0] : url;
}

/**
 * Convert OpenAlex work to Paper format
 */
function workToPaper(work: OpenAlexWork): Paper {
  const openAlexId = extractOpenAlexId(work.id);

  const authors = (work.authorships || []).map(a => ({
    name: a.author.display_name,
    affiliation: a.institutions?.[0]?.display_name,
    orcid: a.author.orcid,
  }));

  const abstract = reconstructAbstract(work.abstract_inverted_index);

  // Get DOI (clean it)
  let doi: string | undefined;
  if (work.doi) {
    doi = work.doi.replace('https://doi.org/', '');
  } else if (work.ids?.doi) {
    doi = work.ids.doi.replace('https://doi.org/', '');
  }

  // Get keywords from concepts (top level)
  const keywords = (work.concepts || [])
    .filter(c => c.level <= 1 && c.score > 0.3)
    .slice(0, 5)
    .map(c => c.display_name);

  // Determine discipline from top concept
  const topConcept = work.concepts?.find(c => c.level === 0);
  const discipline = topConcept?.display_name;

  return {
    id: generatePaperId('openalex', openAlexId),
    title: cleanHtml(work.title || work.display_name || 'Untitled'),
    authors,
    abstract: cleanHtml(abstract),
    date: work.publication_date || '',
    source: 'openalex',
    externalIds: {
      openAlexId,
      doi,
      pmid: work.ids?.pmid?.replace('https://pubmed.ncbi.nlm.nih.gov/', ''),
    },
    citations: work.cited_by_count || 0,
    accessType: work.is_oa || work.open_access?.is_oa ? 'open' : 'restricted',
    url: work.primary_location?.landing_page_url || (doi ? `https://doi.org/${doi}` : work.id),
    pdfUrl: work.open_access?.oa_url || work.primary_location?.pdf_url,
    journal: work.primary_location?.source?.display_name,
    keywords,
    discipline,
  };
}

/**
 * Search OpenAlex for papers
 */
export async function searchOpenAlex(
  query: string,
  options: {
    page?: number;
    perPage?: number;
    sort?: 'relevance_score' | 'cited_by_count' | 'publication_date';
    order?: 'asc' | 'desc';
    filter?: {
      fromDate?: string;
      toDate?: string;
      isOa?: boolean;
      citedByCountMin?: number;
    };
  } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const {
    page = 1,
    perPage = 20,
    sort = 'relevance_score',
    order = 'desc',
    filter,
  } = options;

  const params = new URLSearchParams({
    search: query,
    page: page.toString(),
    per_page: perPage.toString(),
    sort: `${sort}:${order}`,
  });

  // Build filter string
  const filters: string[] = [];
  if (filter?.fromDate) {
    filters.push(`from_publication_date:${filter.fromDate}`);
  }
  if (filter?.toDate) {
    filters.push(`to_publication_date:${filter.toDate}`);
  }
  if (filter?.isOa !== undefined) {
    filters.push(`is_oa:${filter.isOa}`);
  }
  if (filter?.citedByCountMin !== undefined) {
    filters.push(`cited_by_count:>${filter.citedByCountMin}`);
  }
  if (filters.length > 0) {
    params.set('filter', filters.join(','));
  }

  try {
    const response = await axios.get(`${OPENALEX_API_BASE}?${params}`, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine; mailto:research@example.com)',
      },
      timeout: 30000,
    });

    const result: OpenAlexResponse = response.data;

    if (!result.results || result.results.length === 0) {
      return { papers: [], total: 0 };
    }

    const papers = result.results.map(workToPaper);
    const total = result.meta.count;

    return { papers, total };
  } catch (error) {
    console.error('OpenAlex API error:', error);
    throw new Error('Failed to search OpenAlex');
  }
}

/**
 * Get a specific paper from OpenAlex by ID
 */
export async function getOpenAlexPaper(openAlexId: string): Promise<Paper | null> {
  try {
    // Support both full URLs and just IDs
    const id = openAlexId.startsWith('https://') ? openAlexId : `https://openalex.org/${openAlexId}`;

    const response = await axios.get(id, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine; mailto:research@example.com)',
      },
      timeout: 30000,
    });

    const work: OpenAlexWork = response.data;

    if (!work.id) {
      return null;
    }

    return workToPaper(work);
  } catch (error) {
    console.error('OpenAlex API error:', error);
    return null;
  }
}

/**
 * Get related papers for a given OpenAlex work
 */
export async function getRelatedPapers(openAlexId: string, limit: number = 5): Promise<Paper[]> {
  try {
    const params = new URLSearchParams({
      filter: `related_to:${openAlexId}`,
      per_page: limit.toString(),
      sort: 'cited_by_count:desc',
    });

    const response = await axios.get(`${OPENALEX_API_BASE}?${params}`, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine; mailto:research@example.com)',
      },
      timeout: 30000,
    });

    const result: OpenAlexResponse = response.data;
    return result.results.map(workToPaper);
  } catch (error) {
    console.error('OpenAlex related papers error:', error);
    return [];
  }
}

/**
 * Get papers citing a given work
 */
export async function getCitingPapers(openAlexId: string, limit: number = 5): Promise<Paper[]> {
  try {
    const params = new URLSearchParams({
      filter: `cites:${openAlexId}`,
      per_page: limit.toString(),
      sort: 'cited_by_count:desc',
    });

    const response = await axios.get(`${OPENALEX_API_BASE}?${params}`, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine; mailto:research@example.com)',
      },
      timeout: 30000,
    });

    const result: OpenAlexResponse = response.data;
    return result.results.map(workToPaper);
  } catch (error) {
    console.error('OpenAlex citing papers error:', error);
    return [];
  }
}

/**
 * Get trending papers (most cited in recent time)
 */
export async function getTrendingPapers(
  days: number = 30,
  limit: number = 10
): Promise<Paper[]> {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split('T')[0];

  try {
    const params = new URLSearchParams({
      filter: `from_publication_date:${fromDateStr}`,
      per_page: limit.toString(),
      sort: 'cited_by_count:desc',
    });

    const response = await axios.get(`${OPENALEX_API_BASE}?${params}`, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine; mailto:research@example.com)',
      },
      timeout: 30000,
    });

    const result: OpenAlexResponse = response.data;
    return result.results.map(workToPaper);
  } catch (error) {
    console.error('OpenAlex trending papers error:', error);
    return [];
  }
}
