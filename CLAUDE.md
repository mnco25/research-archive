# CLAUDE.md - ResearchArchive Developer Guide

This document provides AI assistants and developers with comprehensive guidance on working with the ResearchArchive codebase. It covers architecture, conventions, workflows, and best practices.

## Project Overview

**ResearchArchive** is a unified academic paper search engine that aggregates 250M+ papers from arXiv, PubMed, CrossRef, and OpenAlex with semantic search, paper summarization, and discovery features.

**Key Stats:**
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **Data Sources**: 4 major research databases with 250M+ papers
- **Privacy**: No tracking, no accounts required

**Repository**: `mnco25/research-archive`
**Current Branch**: `claude/add-claude-documentation-EzdxV`

## Repository Structure

```
research-archive/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage with bento grid
│   ├── not-found.tsx            # 404 page
│   ├── api/                     # Backend API routes
│   │   ├── search/route.ts      # Unified search endpoint
│   │   ├── cite/route.ts        # Citation formatter endpoint
│   │   ├── health/route.ts      # Health check endpoint
│   │   └── papers/[id]/route.ts # Paper details endpoint
│   ├── search/page.tsx          # Search results page (split-pane layout)
│   ├── paper/[id]/page.tsx      # Individual paper detail page
│   └── saved/page.tsx           # Saved papers page (localStorage)
├── components/                   # Reusable React components
│   ├── Header.tsx               # Floating island navigation
│   ├── SearchBar.tsx            # Command-palette style search input
│   ├── PaperCard.tsx            # Individual paper card with badges
│   ├── FilterSidebar.tsx        # Advanced filters sidebar
│   ├── Footer.tsx               # Multi-column footer with signup
│   ├── Citation.tsx             # Citation display component
│   ├── Badges.tsx               # Paper metadata badges
│   ├── Toast.tsx                # Notification toast component
│   ├── Pagination.tsx           # Search results pagination
│   └── Loading.tsx              # Loading skeleton states
├── lib/                          # Utilities and core logic
│   ├── api/                     # Source-specific API clients
│   │   ├── arxiv.ts            # arXiv API client with XML parsing
│   │   ├── pubmed.ts           # PubMed API client
│   │   ├── crossref.ts         # CrossRef DOI client
│   │   └── openalex.ts         # OpenAlex client (most comprehensive)
│   ├── types.ts                # TypeScript types + Zod schemas
│   ├── search.ts               # Unified search logic & aggregation
│   ├── cache.ts                # In-memory caching layer
│   ├── citation-formatter.ts   # Citation format conversion (BibTeX, APA, MLA)
│   └── utils.ts                # Helper functions & utilities
├── data/                        # Static configuration
│   └── disciplines.ts          # Academic discipline categories
├── public/                      # Static assets
├── package.json                # Dependencies (Next.js, React, Zod, Axios, Tailwind)
├── tsconfig.json               # TypeScript configuration (strict mode)
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs           # Tailwind PostCSS config
├── eslint.config.mjs            # ESLint rules (Next.js standards)
├── CLAUDE.md                   # This file
├── DESIGN_WALKTHROUGH.md       # Design system documentation
└── README.md                   # User-facing documentation
```

## Technology Stack

### Core
- **Next.js 16.1.1**: React meta-framework with App Router
- **React 19.2.3**: UI library
- **TypeScript 5**: Type-safe language
- **Tailwind CSS 4**: Utility-first styling with CSS custom properties
- **Zod 4.2.1**: Schema validation and type inference

### HTTP & Data
- **Axios 1.13.2**: HTTP client for API requests
- **fast-xml-parser 5.3.3**: XML parsing for arXiv feeds

### Development
- **ESLint 9**: Code quality (all errors resolved)
- **Tailwind CSS PostCSS**: Styling pipeline
- **Node.js 20**: Runtime environment

## Architecture Patterns

### 1. API Abstraction Layer
Each data source has a dedicated API client (`lib/api/*.ts`) that:
- Handles rate limiting (built-in delays for arXiv: 3s between requests)
- Parses source-specific response formats
- Maps to unified `Paper` type
- Includes error handling and fallbacks

**Rate Limits:**
- arXiv: 1 request per 3 seconds (built-in delay)
- PubMed: 10 requests/second
- CrossRef: 50 requests/second
- OpenAlex: Unlimited (fair use)

### 2. Unified Search Pipeline (`lib/search.ts`)
The search function:
1. Validates input with `SearchRequestSchema` (Zod)
2. Calls 1-4 source APIs in parallel
3. Aggregates and deduplicates results (by DOI)
4. Applies filters (access type, citations, date)
5. Sorts results (relevance, date, citations)
6. Returns paginated results with metadata

### 3. Caching Strategy (`lib/cache.ts`)
- In-memory LRU cache for search results
- Respects source rate limits
- Configurable TTL per cache entry
- No persistence (development-only)

### 4. Type Safety with Zod
All external data validated with Zod schemas:
```typescript
// Schemas define both runtime validation and TypeScript types
export const PaperSchema = z.object({
  id: z.string(),
  title: z.string(),
  // ... more fields
});

export type Paper = z.infer<typeof PaperSchema>;
```

Patterns:
- Request/response schemas are in `lib/types.ts`
- API routes validate input: `SearchRequestSchema.parse(req.body)`
- Response data is validated before sending

## Development Workflow

### Setting Up
```bash
# Clone and install
git clone https://github.com/mnco25/research-archive.git
cd research-archive
npm install

# Start development server
npm run dev
# Visit http://localhost:3000
```

### Key Commands
```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint (no errors currently)
```

### Branch Strategy
- **Main branch**: `main` (production-ready)
- **Development**: `master` (staging)
- **Feature branches**: `claude/add-claude-documentation-EzdxV`

**Git Push Requirements:**
- Must use `-u origin <branch-name>` when pushing new branches
- Branch names must start with `claude/` and end with session ID
- Retry policy: 4 attempts with exponential backoff (2s, 4s, 8s, 16s) for network failures

### Environment Variables
```bash
# Copy from example
cp .env.example .env.local

# Variables (all optional in development):
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For metadata
CLAUDE_API_KEY=sk-...                      # For future AI summaries
```

## Core Concepts

### Paper Type System
The `Paper` type (from `lib/types.ts`) is the central data model:

```typescript
type Paper = {
  id: string;              // Unique identifier (source:id format)
  title: string;
  authors: Author[];       // With name, affiliation, ORCID
  abstract: string;
  date: string;            // ISO 8601 date
  source: 'arxiv' | 'pubmed' | 'crossref' | 'openalex';
  externalIds: {          // Cross-reference identifiers
    doi?: string;
    pmid?: string;
    arxivId?: string;
    openAlexId?: string;
  };
  citations: number;       // Citation count
  accessType: 'open' | 'restricted';
  url: string;            // Link to paper
  pdfUrl?: string;        // Direct PDF link if available
  journal?: string;
  keywords?: string[];
  discipline?: string;    // Academic field
};
```

### API Routes

#### POST /api/search
Unified search across all sources with filters.

**Request:**
```json
{
  "query": "machine learning",
  "page": 1,
  "limit": 20,
  "sources": ["arxiv", "pubmed", "crossref", "openalex"],
  "accessType": "open",
  "sort": "relevance",
  "citationMin": 10
}
```

**Response:**
```json
{
  "papers": [...],
  "total": 1234567,
  "page": 1,
  "pages": 61728,
  "searchTimeMs": 2345
}
```

#### GET /api/search?q=...
Query string version of search (for GET requests).

#### GET /api/papers/[id]
Paper details endpoint.

**Response:**
```json
{
  ...paperData,
  "fullText": "...",
  "relatedPapers": [...],
  "citedBy": [...],
  "references": [...]
}
```

#### POST /api/cite
Citation format conversion.

**Request:**
```json
{
  "paperId": "arxiv:2301.12345",
  "format": "bibtex|apa|mla"
}
```

**Response:**
```json
{
  "citation": "formatted citation string",
  "format": "bibtex"
}
```

#### GET /api/health
Health check for all data sources.

**Response:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "sources": {
    "arxiv": {
      "status": "up|down|slow",
      "latencyMs": 1234,
      "lastCheck": "2024-03-16T..."
    },
    ...
  },
  "timestamp": "2024-03-16T..."
}
```

## Component Guidelines

### Layout & Pages
1. **Homepage** (`app/page.tsx`):
   - Bento grid layout for features
   - Animated gradient background
   - Stats section with counters
   - Call-to-action search bar

2. **Search Page** (`app/search/page.tsx`):
   - Split-pane layout (filters + results)
   - Responsive alignment
   - Empty and loading states
   - Pagination controls

3. **Paper Detail** (`app/paper/[id]/page.tsx`):
   - Focused reading experience
   - Distinct action buttons (PDF, Save)
   - Metadata and abstract display
   - Related papers section

### Component Standards

**Header** (`components/Header.tsx`):
- Floating island navigation with blur effects
- Smooth active states
- Keyboard focus states
- Dark mode support via CSS variables

**SearchBar** (`components/SearchBar.tsx`):
- Command-palette style input
- Keyboard focus states
- Autocomplete hints
- Mobile-responsive

**PaperCard** (`components/PaperCard.tsx`):
- Clean card-based layout
- Hover effects
- Distinct badges (source, access type)
- Improved metadata legibility
- Citation counts
- Save button

**FilterSidebar** (`components/FilterSidebar.tsx`):
- Custom checkboxes
- Pill-shaped toggles
- Expandable sections
- Dark mode support

**Common Patterns:**
- Use `className={clsx(...)}` for conditional classes
- Import Tailwind classes inline
- Use CSS custom properties for colors (`var(--text-primary)`)
- Always include dark mode classes (prefixed with `dark:`)

## Design System

### CSS Architecture (`app/globals.css`)

**Token System:**
- Colors: `--bg-page`, `--bg-surface`, `--text-primary`, `--text-secondary`, `--border`, etc.
- Spacing: Standard Tailwind scale
- Typography: Clash Display (headers), Inter (body)
- Effects: `glass-card` for glassmorphism

**Dark Mode:**
- Uses CSS custom properties with `@media (prefers-color-scheme: dark)`
- All components automatically support dark mode
- Rich semantic colors for dark theme

**Utilities:**
- Glassmorphism: `.glass-card` class for translucent elements
- Animations: Smooth transitions and hover effects
- Responsive: Mobile-first design approach

### Color Palette
- Primary: Interactive blues and purples
- Semantic: Success (green), Warning (yellow), Error (red)
- Neutral: Dark/light grays for text and backgrounds
- Dark Mode: High contrast for readability

## Type Definitions

All types are defined in `lib/types.ts` using Zod:

```typescript
// Enums
export type PaperSource = 'arxiv' | 'pubmed' | 'crossref' | 'openalex';
export type AccessType = 'open' | 'restricted';
export type CitationFormat = 'bibtex' | 'apa' | 'mla';

// Main schemas with validation
export const PaperSchema = z.object({...});
export const SearchRequestSchema = z.object({...});
export const SearchResultSchema = z.object({...});
export const CiteRequestSchema = z.object({...});
export const HealthCheckSchema = z.object({...});

// Client-only types
export interface SavedPaper { paper: Paper; savedAt: string; notes?: string; tags?: string[]; }
export interface ApiError { error: string; message: string; details?: Record<string, unknown>; }
```

## Error Handling

### API Routes
```typescript
// Validation
try {
  const data = SearchRequestSchema.parse(req.body);
} catch (error) {
  return Response.json({ error: 'INVALID_REQUEST', message: '...' }, { status: 400 });
}

// Source failures
const results = await Promise.allSettled([...sourceCalls]);
// Continue with successful sources, handle failures gracefully
```

### Client Components
- Use try/catch for fetch calls
- Toast notifications for user feedback
- Graceful degradation when sources fail
- Fallback empty states

## Quality Standards

### TypeScript
- **Strict Mode**: All TypeScript files use strict mode
- **No `any`**: Forbidden except in exceptional cases (document with `// @ts-ignore`)
- **Nullable Safety**: Proper optional chaining and nullish coalescing
- **Type Inference**: Use Zod schemas to infer types from schemas

### Code Style
- **ESLint**: All errors resolved, no warnings
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Imports**: Use path aliases (`@/lib/...`)
- **Comments**: Only for non-obvious logic

### Performance
- **Image Optimization**: Next.js Image component for responsive images
- **Code Splitting**: Automatic with App Router
- **Caching**: In-memory cache with configurable TTL
- **API Optimization**: Parallel source calls with Promise.all/Promise.allSettled

### Accessibility
- **Semantic HTML**: Proper heading hierarchy, ARIA labels
- **Keyboard Navigation**: Full keyboard support
- **Dark Mode**: High contrast ratios maintained
- **Images**: Descriptive alt text

## Testing Strategy

Currently no automated tests are in place. When adding tests:

1. **Unit Tests**: For utility functions (`lib/utils.ts`, citation formatters)
2. **Integration Tests**: For API routes with mock source APIs
3. **E2E Tests**: Critical user flows (search, save paper, citation)
4. **Snapshot Tests**: Component visual regression

Tools to consider:
- Jest or Vitest for unit/integration tests
- Playwright or Cypress for E2E
- Mock axios responses for API testing

## Common Tasks for AI Assistants

### Adding a New API Source
1. Create `lib/api/[source].ts` with similar structure to existing sources
2. Implement async function that parses source format to `Paper[]`
3. Update `lib/search.ts` to include new source in search logic
4. Add health check in `app/api/health/route.ts`
5. Update README.md with new source info
6. Test with sample queries

### Fixing a Bug
1. Locate issue with Grep/Glob tools
2. Create minimal reproduction
3. Fix in isolation (don't refactor surrounding code)
4. Verify no type errors: `npm run build`
5. Test in browser: `npm run dev`
6. Commit with clear message

### Adding UI Component
1. Create component in `components/[Name].tsx`
2. Use Tailwind classes + CSS variables for styling
3. Support dark mode (add `dark:` prefixed classes)
4. Export from component file
5. Import and use in page/layout
6. Test in browser across breakpoints

### Updating API Route
1. Modify `app/api/[route]/route.ts`
2. Validate input with Zod schema
3. Update response type if needed (in `lib/types.ts`)
4. Test with curl or Postman
5. Update API documentation in README.md

### Deploying to Production
1. Ensure all tests pass: `npm run lint && npm run build`
2. Commit changes on feature branch
3. Create pull request to `main`
4. Merge after review
5. Vercel auto-deploys from `main` branch

## Deployment

### Environment: Vercel
- **Auto-deployment**: Triggered on push to `main`
- **Environment Variables**: Set in Vercel dashboard
- **Build Command**: `next build` (automatic)
- **Start Command**: `next start` (automatic)

### Build Checklist
```bash
npm run lint    # No errors allowed
npm run build   # Must complete without errors
npm run dev     # Manual testing in browser
```

### Environment Variables (Production)
Set in Vercel dashboard:
- `CLAUDE_API_KEY`: Optional, for future AI features
- `NEXT_PUBLIC_APP_URL`: Application URL for meta tags

## Git Commit Convention

**Format:** `[type]: description`

**Types:**
- `feat`: New feature (e.g., "feat: add paper tags")
- `fix`: Bug fix (e.g., "fix: handle null abstracts")
- `refactor`: Code restructuring (e.g., "refactor: extract cache logic")
- `style`: Formatting changes (e.g., "style: fix ESLint errors")
- `docs`: Documentation (e.g., "docs: update API docs")
- `chore`: Dependencies, config (e.g., "chore: upgrade Next.js")

**Examples:**
```
feat: add OpenAlex paper discovery
fix: prevent duplicate search results across sources
refactor: extract citation formatter utilities
docs: add deployment guide
```

## Debugging Tips

### Search Not Working
1. Check API routes in `app/api/search/route.ts`
2. Verify source API clients return correct format
3. Check `lib/search.ts` aggregation logic
4. Look for rate limit errors (may be silent)
5. Check browser network tab for API responses

### Type Errors
1. Run `npx tsc --noEmit` to catch type issues
2. Check Zod schema matches actual data
3. Verify import paths use `@/` alias
4. Look for optional chaining issues (`?.`)

### Performance Issues
1. Check React DevTools Profiler for slow components
2. Look for unnecessary re-renders (use `memo()`)
3. Verify API cache is working
4. Check bundle size: `npm run build` output

### Styling Issues
1. Check if Tailwind classes are applied
2. Verify CSS variables are set in `app/globals.css`
3. Test dark mode: toggle in browser DevTools
4. Check specificity conflicts (unlikely with Tailwind)

## Known Limitations

- **Deduplication**: Based on DOI, some papers may appear across sources
- **Abstracts**: Not all papers have abstracts available
- **PDF Access**: Limited to open access availability
- **Citation Counts**: Vary between sources
- **Full Text**: Only available for some arXiv papers
- **Rate Limiting**: arXiv has 3-second delay (built-in)

## Future Roadmap

- [ ] Full-text search integration
- [ ] Author profiles and pages
- [ ] Reading lists with tags and organization
- [ ] AI-powered paper summaries (with Claude API)
- [ ] Export to reference managers (Zotero, Mendeley)
- [ ] Browser extension
- [ ] User accounts and sync (optional)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)
- [arXiv API](https://arxiv.org/help/api)
- [PubMed API](https://www.ncbi.nlm.nih.gov/home/develop/api)
- [CrossRef API](https://github.com/CrossRef/rest-api-doc)
- [OpenAlex API](https://docs.openalex.org)

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review DESIGN_WALKTHROUGH.md for design details
3. Review README.md for user-facing features
4. Check API route implementations for behavior
5. Ask in project discussions

---

**Last Updated**: March 16, 2026
**Current Branch**: `claude/add-claude-documentation-EzdxV`
**Status**: Production-ready, all ESLint errors resolved
