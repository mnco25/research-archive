# CLAUDE.md — ResearchArchive Developer Guide

This document gives AI assistants and human contributors a single source of truth for working in
this repository. It explains the architecture, conventions, and the practical "what to do when…"
for the most common tasks.

## Project Overview

**ResearchArchive** is a unified, free, privacy-first academic search engine. It aggregates 260M+
papers from arXiv, PubMed, CrossRef, and OpenAlex behind one search box, with cross-source
deduplication, instant citations (BibTeX, APA, MLA, RIS), and a local-only saved-papers library.

**Highlights:**
- **Framework**: Next.js 16 (App Router) on React 19
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 with CSS custom properties (light + dark themes)
- **Validation**: Zod schemas for every external surface
- **Privacy**: No accounts. No tracking. Library lives in `localStorage`.

**Repository**: `mnco25/research-archive`
**Active branch**: `claude/system-overhaul-modernize-8hGTT`

## Repository Structure

```
research-archive/
├── app/                         # Next.js App Router
│   ├── layout.tsx              # Root layout, metadata, theme bootstrap
│   ├── page.tsx                # Homepage (hero, trending, disciplines)
│   ├── not-found.tsx           # 404
│   ├── api/
│   │   ├── search/route.ts     # POST + GET unified search
│   │   ├── suggest/route.ts    # GET autocomplete (OpenAlex)
│   │   ├── trending/route.ts   # GET trending papers
│   │   ├── papers/[id]/route.ts# GET paper details + related/citing
│   │   ├── cite/route.ts       # POST citation formatter
│   │   └── health/route.ts     # GET source health snapshot
│   ├── search/page.tsx         # Search results (URL-synced filters)
│   ├── paper/[id]/page.tsx     # Paper detail (abstract, related, citations)
│   └── saved/page.tsx          # Local library with import/export
├── components/
│   ├── Header.tsx              # Floating, scroll-aware header w/ theme toggle
│   ├── SearchBar.tsx           # Command-palette search w/ /api/suggest
│   ├── PaperCard.tsx           # Card variant: default | compact
│   ├── FilterSidebar.tsx       # URL-driven controlled filter sidebar
│   ├── Pagination.tsx          # Pagination control
│   ├── Citation.tsx            # Inline BibTeX/APA/MLA/RIS formatter
│   ├── Badges.tsx              # Source/access/highly-cited badges
│   ├── Loading.tsx             # Skeletons + spinner
│   ├── Toast.tsx               # useToast hook + ToastContainer
│   └── Footer.tsx              # Site footer
├── lib/
│   ├── api/                    # One file per data source
│   │   ├── arxiv.ts
│   │   ├── pubmed.ts           # ESearch+EFetch+ICite for citation counts
│   │   ├── crossref.ts
│   │   └── openalex.ts         # Search, related, citing, trending, autocomplete
│   ├── http.ts                 # Shared axios wrapper with retries + UA
│   ├── search.ts               # Unified search, dedup, ranking
│   ├── cache.ts                # In-memory LRU/TTL cache
│   ├── citation-formatter.ts   # BibTeX, APA 7, MLA 9, RIS
│   ├── saved-papers.ts         # localStorage helpers
│   ├── theme.ts                # useTheme() hook
│   ├── types.ts                # Zod schemas + types (single source of truth)
│   └── utils.ts                # Formatting + small helpers
├── data/
│   ├── disciplines.json        # Discipline catalog with `query` mapping
│   └── sources-config.json     # Source metadata used by UI + docs
├── public/                     # Static SVGs
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.example                # Environment variable template
└── README.md
```

## Technology Stack

- **Next.js 16** with the App Router (server-side route handlers, no Pages Router)
- **React 19** for UI
- **TypeScript 5** with `strict: true`
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **Zod 4** for runtime validation of all API surface
- **Axios 1** for HTTP, wrapped by `lib/http.ts` (single User-Agent + retry policy)
- **fast-xml-parser** for arXiv (Atom) and PubMed (XML)

## Architecture Patterns

### 1. Shared HTTP Layer (`lib/http.ts`)

Every API client uses `httpGet`. It:

- Sets a consistent `User-Agent` (`ResearchArchive/2.0 (+mailto:<contact>)`)
- Reads contact email from `RESEARCH_CONTACT_EMAIL` (or `NEXT_PUBLIC_CONTACT_EMAIL`)
- Retries idempotent failures up to 2 times with exponential backoff
- Times out at 25 s by default (overridable per call)

Polite-pool sources (CrossRef, OpenAlex) reward including a real contact email — set it in
production to avoid throttling.

### 2. API Clients (`lib/api/*.ts`)

Each client maps its source's response to the canonical `Paper` shape and exposes:

- `searchX(query, options)` → `{ papers, total }`
- `getXPaper(externalId)` → `Paper | null`

Source-specific notes:
- **arXiv** uses a serialized 3 s rate limiter (chained promise queue) to comply with their guidance.
- **PubMed** does ESearch → EFetch in two calls, then enriches citation counts via NIH ICite. It
  also reads `PUBMED_API_KEY` to lift the rate limit.
- **CrossRef** uses `select=` to keep payloads small.
- **OpenAlex** is the most comprehensive source and powers `/api/suggest`, `/api/trending`,
  related papers, and citing papers.

### 3. Unified Search Pipeline (`lib/search.ts`)

`unifiedSearch(request)` is the single entry point used by `/api/search`:

1. Validates input via `SearchRequestSchema`
2. Resolves the discipline filter via `data/disciplines.json` (each entry has a `query` string)
3. Computes a per-source result count (with floor/cap)
4. Calls each enabled source in parallel
5. Deduplicates by DOI first, then by normalized title for non-DOI cases
6. Filters (access, citation min, date range)
7. Sorts (relevance — with freshness/citation boost, date, or citations)
8. Returns paginated results plus per-source error info (partial-failure aware)

Cache TTLs:
- search results: 15 minutes
- paper detail: 60 minutes
- suggestions: 5 minutes
- trending: 30 minutes

### 4. Type Safety with Zod

All request/response shapes live in `lib/types.ts`. API routes call `Schema.safeParse` and return
HTTP 400 with `details: error.flatten()` on validation failure.

### 5. Theme System (`lib/theme.ts` + `app/layout.tsx`)

A small inline script in `<head>` applies `data-theme="light|dark"` before paint to prevent flash.
The `useTheme()` hook syncs `localStorage`, the `data-theme` attribute, and `colorScheme`.

### 6. Saved Library (`lib/saved-papers.ts`)

Pure-client helpers for `localStorage`. They emit a `saved-papers:change` `CustomEvent` on every
write so the UI can stay in sync across pages.

## Development Workflow

```bash
# Setup
git clone https://github.com/mnco25/research-archive.git
cd research-archive
npm install
cp .env.example .env.local

# Run
npm run dev      # http://localhost:3000
npm run lint
npm run build
npm run start
```

### Branch Strategy

- `main`: production
- `claude/<task>-<id>`: feature branches (always developed on, then PR'd to `main`)

Always push with `-u origin <branch>`. Retry network failures up to 4 times with 2/4/8/16-second
backoff.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No | App URL used in `metadataBase` and OG tags. Default `http://localhost:3000`. |
| `RESEARCH_CONTACT_EMAIL` | Recommended | Sent in the User-Agent for polite pools (OpenAlex, CrossRef). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Fallback for the above. |
| `PUBMED_API_KEY` | No | NCBI API key — raises PubMed rate limit from 3 → 10 req/s. |

## API Reference

### POST /api/search

Unified search across all configured sources.

```json
{
  "query": "large language models",
  "page": 1,
  "limit": 20,
  "sources": ["arxiv", "pubmed", "crossref", "openalex"],
  "accessType": "open",
  "sort": "relevance",
  "citationMin": 10,
  "discipline": "ai",
  "dateRange": { "from": "2025-01-01", "to": "2026-12-31" }
}
```

Response:

```json
{
  "papers": [...],
  "total": 1234567,
  "page": 1,
  "pages": 61728,
  "searchTimeMs": 845,
  "sourcesQueried": ["arxiv", "pubmed", "crossref", "openalex"],
  "errors": [{ "source": "pubmed", "message": "timeout" }]
}
```

### GET /api/search

Mirrors POST. Accepts `q`, `page`, `limit`, `sort`, `access`, `citationMin`, `discipline`,
`sources` (comma-separated), `from`, `to`.

### GET /api/suggest?q=…&limit=6

Fast autocomplete from OpenAlex. Returns up to 10 suggestions in the shape
`{ suggestions: [{ id, title, hint, citations }] }`.

### GET /api/trending?days=180&limit=8

Most-cited papers within the lookback window (7–365 days, default 180). Cached for 30 minutes.

### GET /api/papers/[id]

Returns the full `PaperDetail` (paper + related + citing). Best for client-side hydration.

### POST /api/cite

```json
{ "paperId": "openalex:W2741809807", "format": "bibtex" }
```

Supported formats: `bibtex`, `apa`, `mla`, `ris`.

### GET /api/health

Health probe for all four upstream APIs. Aggregates to `healthy | degraded | unhealthy`.

## Component Guidelines

**Conventions across the codebase:**

- Default to `'use client'` only when a component genuinely needs interactivity.
- Use CSS custom properties (`var(--bg-elevated)`, `var(--text-secondary)`) for theming —
  **do not** use Tailwind's `dark:` modifiers anywhere. Light/dark switches happen at the
  variable layer.
- Use `clsx`/`cn` for conditional classes.
- Always include `aria-label` (or `aria-current`, `aria-expanded`) on icon-only and stateful
  controls.
- Prefer `<Link>` for internal navigation; use `<a>` only for external links with
  `rel="noopener noreferrer"`.

## Design System

`app/globals.css` defines the entire token set:

- **Surfaces**: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`, `--bg-inset`
- **Text**: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-placeholder`
- **Borders**: `--border-primary`, `--border-secondary`
- **Brand**: `--accent` (HSL), `--accent-foreground`
- **Semantic**: `--success`, `--warning`, `--error`, `--info`

Dark mode is driven by `[data-theme="dark"]` on `<html>`. The bootstrap script in `layout.tsx`
sets it before paint.

Typography:
- `.text-display` (heroes), `.text-title` (section headlines), `.text-heading` (subsections),
  `.text-label` (uppercase eyebrows)
- Body uses Inter via Google Fonts.

Reusable component classes: `.btn` (`btn-sm | btn-md | btn-lg`, `btn-primary | btn-secondary |
btn-ghost | btn-accent`), `.badge` family, `.card`, `.input`, `.skeleton`.

## Quality Standards

- **No `any`**: prefer `unknown` and narrow with a type guard or Zod.
- **Strict null safety**: use `?.` and `??`.
- **No silent catch blocks** in API clients — log and return `null` / `[]` for graceful
  degradation, but never swallow errors at the API route layer.
- **One responsibility per module** — keep API clients pure and free of UI imports.

## Common Tasks

### Add a new data source

1. Create `lib/api/<source>.ts` exporting `searchX` and `getXPaper`.
2. Add the source key to the `PaperSource` union and to `PAPER_SOURCES` in `lib/types.ts`.
3. Wire it into the `searchSource` switch in `lib/search.ts`.
4. Add it to `data/sources-config.json` (color, paper count, homepage).
5. Add a health check probe in `app/api/health/route.ts`.
6. Add a badge style in `app/globals.css`.

### Add a new citation format

1. Implement `formatX(paper)` in `lib/citation-formatter.ts`.
2. Extend the `CitationFormat` enum and the Zod schema in `lib/types.ts`.
3. Add the format button in `components/Citation.tsx`.
4. Add the export option in `app/saved/page.tsx`.

### Tweak ranking

The `relevance` sort lives in `sortPapers` inside `lib/search.ts`. It combines the raw upstream
ordering with a freshness boost and a logarithmic citation boost — adjust the constants there.

## Deployment

- Auto-deploys to Vercel from `main`.
- Set `RESEARCH_CONTACT_EMAIL` and `PUBMED_API_KEY` in the Vercel project settings.
- Run `npm run lint && npm run build` before merging.

## Git Commit Convention

`type: short description in present tense`

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `perf`, `test`.

---

**Last updated**: April 27, 2026
**Active branch**: `claude/system-overhaul-modernize-8hGTT`
**Status**: Production-ready · ESLint clean · Type-checked
