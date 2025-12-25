import { z } from 'zod';

// Paper source types
export type PaperSource = 'arxiv' | 'pubmed' | 'crossref' | 'openalex';
export type AccessType = 'open' | 'restricted';
export type CitationFormat = 'bibtex' | 'apa' | 'mla';

// Author schema and type
export const AuthorSchema = z.object({
  name: z.string(),
  affiliation: z.string().optional(),
  orcid: z.string().optional(),
});

export type Author = z.infer<typeof AuthorSchema>;

// External IDs schema
export const ExternalIdsSchema = z.object({
  doi: z.string().optional(),
  pmid: z.string().optional(),
  arxivId: z.string().optional(),
  openAlexId: z.string().optional(),
});

export type ExternalIds = z.infer<typeof ExternalIdsSchema>;

// Paper schema and type
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

// Search request schema
export const SearchRequestSchema = z.object({
  query: z.string().min(1),
  discipline: z.string().optional(),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
  accessType: z.enum(['open', 'any']).optional(),
  citationMin: z.number().optional(),
  sources: z.array(z.enum(['arxiv', 'pubmed', 'crossref', 'openalex'])).optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
  sort: z.enum(['relevance', 'date', 'citations']).optional().default('relevance'),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// Search result schema
export const SearchResultSchema = z.object({
  papers: z.array(PaperSchema),
  total: z.number(),
  page: z.number(),
  pages: z.number(),
  searchTimeMs: z.number(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// Paper detail response
export const PaperDetailSchema = PaperSchema.extend({
  fullText: z.string().optional(),
  relatedPapers: z.array(PaperSchema).optional(),
  citedBy: z.array(PaperSchema).optional(),
  references: z.array(PaperSchema).optional(),
});

export type PaperDetail = z.infer<typeof PaperDetailSchema>;

// Citation request
export const CiteRequestSchema = z.object({
  paperId: z.string(),
  format: z.enum(['bibtex', 'apa', 'mla']),
});

export type CiteRequest = z.infer<typeof CiteRequestSchema>;

// Citation response
export const CiteResponseSchema = z.object({
  citation: z.string(),
  format: z.enum(['bibtex', 'apa', 'mla']),
});

export type CiteResponse = z.infer<typeof CiteResponseSchema>;

// Discipline type
export interface Discipline {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

// API health check response
export const HealthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  sources: z.record(z.string(), z.object({
    status: z.enum(['up', 'down', 'slow']),
    latencyMs: z.number().optional(),
    lastCheck: z.string(),
  })),
  timestamp: z.string(),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Saved papers (localStorage)
export interface SavedPaper {
  paper: Paper;
  savedAt: string;
  notes?: string;
  tags?: string[];
}

// API Error response
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}
