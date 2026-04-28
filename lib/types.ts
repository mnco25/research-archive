import { z } from 'zod';

export type PaperSource = 'arxiv' | 'pubmed' | 'crossref' | 'openalex';
export type AccessType = 'open' | 'restricted';
export type CitationFormat = 'bibtex' | 'apa' | 'mla' | 'ris';
export type SortOption = 'relevance' | 'date' | 'citations';

export const PAPER_SOURCES: PaperSource[] = ['arxiv', 'pubmed', 'crossref', 'openalex'];

export const AuthorSchema = z.object({
  name: z.string(),
  affiliation: z.string().optional(),
  orcid: z.string().optional(),
});
export type Author = z.infer<typeof AuthorSchema>;

export const ExternalIdsSchema = z.object({
  doi: z.string().optional(),
  pmid: z.string().optional(),
  arxivId: z.string().optional(),
  openAlexId: z.string().optional(),
});
export type ExternalIds = z.infer<typeof ExternalIdsSchema>;

export const PaperSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(AuthorSchema),
  abstract: z.string(),
  date: z.string(),
  source: z.enum(['arxiv', 'pubmed', 'crossref', 'openalex']),
  externalIds: ExternalIdsSchema,
  citations: z.number(),
  accessType: z.enum(['open', 'restricted']),
  url: z.string(),
  pdfUrl: z.string().optional(),
  journal: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  discipline: z.string().optional(),
});
export type Paper = z.infer<typeof PaperSchema>;

export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  discipline: z.string().optional(),
  dateRange: z
    .object({ from: z.string(), to: z.string() })
    .optional(),
  accessType: z.enum(['open', 'any']).optional(),
  citationMin: z.number().min(0).optional(),
  sources: z.array(z.enum(['arxiv', 'pubmed', 'crossref', 'openalex'])).optional(),
  page: z.number().min(1).max(100).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
  sort: z.enum(['relevance', 'date', 'citations']).optional().default('relevance'),
});
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export const SourceErrorSchema = z.object({
  source: z.enum(['arxiv', 'pubmed', 'crossref', 'openalex']),
  message: z.string(),
});
export type SourceError = z.infer<typeof SourceErrorSchema>;

export const SearchResultSchema = z.object({
  papers: z.array(PaperSchema),
  total: z.number(),
  page: z.number(),
  pages: z.number(),
  searchTimeMs: z.number(),
  sourcesQueried: z.array(z.enum(['arxiv', 'pubmed', 'crossref', 'openalex'])),
  errors: z.array(SourceErrorSchema).optional(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const PaperDetailSchema = PaperSchema.extend({
  fullText: z.string().optional(),
  relatedPapers: z.array(PaperSchema).optional(),
  citedBy: z.array(PaperSchema).optional(),
  references: z.array(PaperSchema).optional(),
});
export type PaperDetail = z.infer<typeof PaperDetailSchema>;

export const CiteRequestSchema = z.object({
  paperId: z.string(),
  format: z.enum(['bibtex', 'apa', 'mla', 'ris']),
});
export type CiteRequest = z.infer<typeof CiteRequestSchema>;

export const CiteResponseSchema = z.object({
  citation: z.string(),
  format: z.enum(['bibtex', 'apa', 'mla', 'ris']),
});
export type CiteResponse = z.infer<typeof CiteResponseSchema>;

export interface Discipline {
  id: string;
  name: string;
  icon: string;
  query: string;
  subcategories?: string[];
}

export interface Suggestion {
  id: string;
  title: string;
  hint: string;
  citations: number;
}

export const HealthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  sources: z.record(
    z.string(),
    z.object({
      status: z.enum(['up', 'down', 'slow']),
      latencyMs: z.number().optional(),
      lastCheck: z.string(),
    })
  ),
  timestamp: z.string(),
  version: z.string(),
});
export type HealthCheck = z.infer<typeof HealthCheckSchema>;

export interface SavedPaper {
  paper: Paper;
  savedAt: string;
  notes?: string;
  tags?: string[];
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}
