import type { Paper } from '@/lib/types';
import { cleanHtml, generatePaperId } from '@/lib/utils';
import { httpGet } from '@/lib/http';

const OPENALEX_API_BASE = 'https://api.openalex.org/works';
const OPENALEX_AUTOCOMPLETE_BASE = 'https://api.openalex.org/autocomplete/works';

interface OpenAlexAuthor {
  author: { id: string; display_name: string; orcid?: string };
  institutions?: { id: string; display_name: string }[];
}

interface OpenAlexTopic {
  id: string;
  display_name: string;
  field?: { display_name: string };
  subfield?: { display_name: string };
}

interface OpenAlexConcept {
  id: string;
  display_name: string;
  level: number;
  score: number;
}

interface OpenAlexWork {
  id: string;
  doi?: string;
  title?: string;
  display_name?: string;
  publication_date?: string;
  publication_year?: number;
  authorships?: OpenAlexAuthor[];
  abstract_inverted_index?: Record<string, number[]>;
  cited_by_count?: number;
  fwci?: number;
  is_oa?: boolean;
  open_access?: { is_oa: boolean; oa_status: string; oa_url?: string };
  primary_location?: {
    source?: { display_name: string; type: string; issn_l?: string };
    landing_page_url?: string;
    pdf_url?: string;
  };
  best_oa_location?: { pdf_url?: string; landing_page_url?: string };
  topics?: OpenAlexTopic[];
  primary_topic?: OpenAlexTopic;
  concepts?: OpenAlexConcept[];
  ids?: { openalex: string; doi?: string; pmid?: string; mag?: string };
  type?: string;
}

interface OpenAlexResponse {
  meta: { count: number; db_response_time_ms: number; page?: number; per_page?: number };
  results: OpenAlexWork[];
}

interface OpenAlexAutocompleteResponse {
  results: { id: string; display_name: string; hint?: string; cited_by_count?: number }[];
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string {
  if (!invertedIndex) return '';
  const positions: { word: string; pos: number }[] = [];
  for (const [word, posList] of Object.entries(invertedIndex)) {
    for (const pos of posList) positions.push({ word, pos });
  }
  positions.sort((a, b) => a.pos - b.pos);
  return positions.map(p => p.word).join(' ');
}

function extractOpenAlexId(url: string): string {
  const match = url.match(/W\d+/);
  return match ? match[0] : url;
}

function workToPaper(work: OpenAlexWork): Paper {
  const openAlexId = extractOpenAlexId(work.id);
  const authors = (work.authorships || []).map(a => ({
    name: a.author.display_name,
    affiliation: a.institutions?.[0]?.display_name,
    orcid: a.author.orcid?.replace(/^https?:\/\/orcid\.org\//, ''),
  }));

  const doi = (work.doi || work.ids?.doi)?.replace('https://doi.org/', '');
  const pmid = work.ids?.pmid?.replace('https://pubmed.ncbi.nlm.nih.gov/', '');

  const topic = work.primary_topic || work.topics?.[0];
  const discipline = topic?.field?.display_name || topic?.display_name;

  const topicNames = (work.topics || []).map(t => t.display_name).slice(0, 3);
  const conceptNames = (work.concepts || [])
    .filter(c => c.level <= 1 && c.score > 0.3)
    .slice(0, 5)
    .map(c => c.display_name);
  const keywords = [...new Set([...topicNames, ...conceptNames])].slice(0, 6);

  return {
    id: generatePaperId('openalex', openAlexId),
    title: cleanHtml(work.title || work.display_name || 'Untitled'),
    authors,
    abstract: cleanHtml(reconstructAbstract(work.abstract_inverted_index)),
    date: work.publication_date || (work.publication_year ? `${work.publication_year}-01-01` : ''),
    source: 'openalex',
    externalIds: { openAlexId, doi, pmid },
    citations: work.cited_by_count || 0,
    accessType: work.open_access?.is_oa || work.is_oa ? 'open' : 'restricted',
    url: work.primary_location?.landing_page_url || (doi ? `https://doi.org/${doi}` : `https://openalex.org/${openAlexId}`),
    pdfUrl: work.best_oa_location?.pdf_url || work.open_access?.oa_url || work.primary_location?.pdf_url,
    journal: work.primary_location?.source?.display_name,
    keywords,
    discipline,
  };
}

const SELECT_FIELDS = [
  'id', 'doi', 'title', 'display_name', 'publication_date', 'publication_year',
  'authorships', 'abstract_inverted_index', 'cited_by_count', 'fwci',
  'is_oa', 'open_access', 'primary_location', 'best_oa_location',
  'topics', 'primary_topic', 'concepts', 'ids', 'type',
].join(',');

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
      conceptId?: string;
    };
  } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const { page = 1, perPage = 20, sort = 'relevance_score', order = 'desc', filter } = options;

  const params = new URLSearchParams({
    search: query,
    page: String(page),
    per_page: String(Math.min(perPage, 200)),
    sort: `${sort}:${order}`,
    select: SELECT_FIELDS,
  });

  const filters: string[] = [];
  if (filter?.fromDate) filters.push(`from_publication_date:${filter.fromDate}`);
  if (filter?.toDate) filters.push(`to_publication_date:${filter.toDate}`);
  if (filter?.isOa !== undefined) filters.push(`is_oa:${filter.isOa}`);
  if (filter?.citedByCountMin !== undefined) filters.push(`cited_by_count:>${filter.citedByCountMin}`);
  if (filter?.conceptId) filters.push(`concepts.id:${filter.conceptId}`);
  if (filters.length) params.set('filter', filters.join(','));

  const response = await httpGet<OpenAlexResponse>(`${OPENALEX_API_BASE}?${params}`);
  return {
    papers: (response.data.results || []).map(workToPaper),
    total: response.data.meta?.count || 0,
  };
}

export async function getOpenAlexPaper(openAlexId: string): Promise<Paper | null> {
  try {
    const id = openAlexId.startsWith('http') ? openAlexId : `https://api.openalex.org/works/${openAlexId}`;
    const response = await httpGet<OpenAlexWork>(`${id}?select=${SELECT_FIELDS}`);
    if (!response.data.id) return null;
    return workToPaper(response.data);
  } catch (error) {
    console.error('OpenAlex getPaper error:', error);
    return null;
  }
}

export async function getRelatedPapers(openAlexId: string, limit: number = 5): Promise<Paper[]> {
  try {
    const params = new URLSearchParams({
      filter: `related_to:${openAlexId}`,
      per_page: String(limit),
      sort: 'cited_by_count:desc',
      select: SELECT_FIELDS,
    });
    const response = await httpGet<OpenAlexResponse>(`${OPENALEX_API_BASE}?${params}`);
    return (response.data.results || []).map(workToPaper);
  } catch {
    return [];
  }
}

export async function getCitingPapers(openAlexId: string, limit: number = 5): Promise<Paper[]> {
  try {
    const params = new URLSearchParams({
      filter: `cites:${openAlexId}`,
      per_page: String(limit),
      sort: 'cited_by_count:desc',
      select: SELECT_FIELDS,
    });
    const response = await httpGet<OpenAlexResponse>(`${OPENALEX_API_BASE}?${params}`);
    return (response.data.results || []).map(workToPaper);
  } catch {
    return [];
  }
}

export async function getTrendingPapers(days: number = 90, limit: number = 10): Promise<Paper[]> {
  const fromDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  try {
    const params = new URLSearchParams({
      filter: `from_publication_date:${fromDate},is_paratext:false,type:article`,
      per_page: String(limit),
      sort: 'cited_by_count:desc',
      select: SELECT_FIELDS,
    });
    const response = await httpGet<OpenAlexResponse>(`${OPENALEX_API_BASE}?${params}`);
    return (response.data.results || []).map(workToPaper);
  } catch {
    return [];
  }
}

export interface OpenAlexSuggestion {
  id: string;
  title: string;
  hint: string;
  citations: number;
}

export async function autocompleteOpenAlex(query: string, limit: number = 6): Promise<OpenAlexSuggestion[]> {
  if (!query.trim()) return [];
  try {
    const params = new URLSearchParams({ q: query, per_page: String(limit) });
    const response = await httpGet<OpenAlexAutocompleteResponse>(
      `${OPENALEX_AUTOCOMPLETE_BASE}?${params}`,
      { timeout: 6000, retries: 1 }
    );
    return (response.data.results || []).map(r => ({
      id: generatePaperId('openalex', extractOpenAlexId(r.id)),
      title: cleanHtml(r.display_name),
      hint: r.hint || '',
      citations: r.cited_by_count || 0,
    }));
  } catch {
    return [];
  }
}
