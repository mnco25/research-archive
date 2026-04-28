# ResearchArchive

**Find research that actually moves you forward.**

ResearchArchive is a unified, free, privacy-first academic search engine. It queries
**arXiv, PubMed, CrossRef, and OpenAlex** in parallel, deduplicates the results, and presents
them through a fast, beautiful, accessible interface — built for students, researchers, and
anyone curious about peer-reviewed work.

- 🔎 **One search across 260M+ papers** — not just arXiv, not just PubMed.
- 📥 **Local library** — bookmark papers; no account, no cloud, no tracking.
- 📑 **Instant citations** in BibTeX, APA, MLA, and RIS.
- ⚡ **Autocomplete + trending** powered by OpenAlex.
- 🌙 **Dark mode**, keyboard shortcuts (`⌘K`, `/`, `↵`, arrows), and a polished UI.

## Features

- **Unified search** across four scholarly databases with cross-source deduplication by DOI and
  normalized title.
- **Smart relevance ranking** that blends upstream ordering with a freshness boost and a
  logarithmic citation boost.
- **Filters** for source, access type (open vs. restricted), date range, citation count, and
  discipline — every filter is reflected in the URL so results are shareable.
- **Paper detail pages** with abstracts, related papers, and "cited by" listings.
- **Local library** with import/export (BibTeX, RIS, APA, MLA, JSON).
- **Privacy by design** — no accounts, no analytics that follow you, your library stays in your
  browser.
- **Fully responsive** with dark mode and `prefers-reduced-motion` support.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 4 + CSS custom properties
- **Validation**: Zod 4
- **HTTP**: Axios with retry/backoff and a polite User-Agent
- **XML**: fast-xml-parser (arXiv Atom & PubMed XML)
- **Deployment**: Vercel-ready

## Quick Start

```bash
git clone https://github.com/mnco25/research-archive.git
cd research-archive
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No | Used in metadata. Default `http://localhost:3000`. |
| `RESEARCH_CONTACT_EMAIL` | Recommended | Used in the User-Agent for OpenAlex/CrossRef polite pools. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Fallback for the above. |
| `PUBMED_API_KEY` | No | Lifts PubMed rate limit from 3 → 10 req/s. |

## API Reference

### `POST /api/search`

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

Returns `{ papers, total, page, pages, searchTimeMs, sourcesQueried, errors? }`.

### `GET /api/search?q=…`

Same as POST, with all filters as query parameters.

### `GET /api/suggest?q=…&limit=6`

Autocomplete (OpenAlex). Returns `{ suggestions: [{ id, title, hint, citations }] }`.

### `GET /api/trending?days=180&limit=8`

Most-cited papers from the lookback window. Cached 30 minutes.

### `GET /api/papers/{id}`

Full paper detail including related and citing papers.

### `POST /api/cite`

```json
{ "paperId": "openalex:W2741809807", "format": "bibtex" }
```

Formats: `bibtex`, `apa`, `mla`, `ris`.

### `GET /api/health`

Live status of all four upstream APIs.

## Data Sources

| Source | Coverage | Rate Limit | Notes |
|---|---|---|---|
| arXiv | 2.5M+ | 1 req / 3 s | Physics, math, CS, more |
| PubMed | 38M+ | 10 req/s with key | Biomedical, life sciences |
| CrossRef | 170M+ | 50 req/s polite pool | Multidisciplinary, DOI registry |
| OpenAlex | 260M+ | Unlimited polite | Most comprehensive; powers trending + autocomplete |

## Project Structure

See [`CLAUDE.md`](./CLAUDE.md) for a full developer guide.

```
app/
├── api/{search,suggest,trending,papers,cite,health}/route.ts
├── search/page.tsx
├── paper/[id]/page.tsx
├── saved/page.tsx
├── layout.tsx
└── page.tsx
components/
lib/{api,http,search,cache,citation-formatter,saved-papers,theme,types,utils}.ts
data/{disciplines,sources-config}.json
```

## Scripts

```bash
npm run dev      # Dev server with HMR
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Contributing

1. Fork the repo and create your branch (`git checkout -b feat/amazing-feature`).
2. Make your changes, then run `npm run lint && npm run build`.
3. Open a pull request describing what changed and why.

## Roadmap

- [x] Unified search & dedup
- [x] Citations: BibTeX, APA, MLA, RIS
- [x] Library import/export
- [x] Dark mode
- [x] Discipline browsing
- [x] Autocomplete + trending endpoints
- [ ] Author profiles & follow lists
- [ ] AI-powered abstract summaries
- [ ] Browser extension
- [ ] Personalized recommendations (still privacy-first)

## License

MIT

## Acknowledgments

Data via [arXiv](https://arxiv.org), [PubMed](https://pubmed.ncbi.nlm.nih.gov),
[CrossRef](https://www.crossref.org), and [OpenAlex](https://openalex.org). Thank you to the
open-science community keeping research accessible.

---

Built with care for everyone who reads research.
