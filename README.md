# ResearchArchive

**Find the research you need. Faster.**

ResearchArchive is a unified, free academic paper search engine that aggregates arXiv, PubMed, CrossRef, and OpenAlex with semantic search, paper summarization, and discovery features. Think "Google for research papers with researcher-first UX."

![ResearchArchive Homepage](https://github.com/user-attachments/assets/e926fbf7-6625-4ac2-aa0d-9c6f5c6a1b33)

## Features

- **Unified Search**: Search 250M+ papers across multiple databases simultaneously
- **Multiple Sources**: arXiv, PubMed, CrossRef, and OpenAlex integration
- **Citation Formatting**: Generate BibTeX, APA, and MLA citations with one click
- **Save Papers**: Build your reading list using browser localStorage (no account needed)
- **Advanced Filters**: Filter by source, access type, date range, citations, and discipline
- **Dark Mode**: Beautiful dark theme for comfortable reading in any lighting
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Keyboard Navigation**: Full keyboard support for power users
- **Privacy First**: No tracking, no accounts required

### Dark Mode Support

Toggle between light and dark themes with a single click. Your preference is saved automatically.

![Dark Mode](https://github.com/user-attachments/assets/886ca74b-8ae1-454e-90ca-a0fa518bccaa)

### Mobile-Friendly Design

Fully responsive design optimized for mobile devices with touch-friendly controls.

![Mobile View](https://github.com/user-attachments/assets/1f9f9517-e3c7-4ee8-9cc0-3f2fb5ddaf81)

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with CSS custom properties
- **Validation**: Zod schemas
- **HTTP Client**: Axios
- **XML Parsing**: fast-xml-parser (for arXiv)
- **Deployment**: Vercel-ready

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/research-archive.git
cd research-archive

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Search Endpoint

**POST /api/search**

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

**GET /api/search?q=machine+learning&limit=20&sort=relevance**

### Paper Details

**GET /api/papers/{id}**

Returns full paper details including related papers and citations.

### Citation Generation

**POST /api/cite**

```json
{
  "paperId": "arxiv:2301.12345",
  "format": "bibtex"
}
```

Supported formats: `bibtex`, `apa`, `mla`

### Health Check

**GET /api/health**

Returns status of all API sources.

## Data Sources

| Source | Coverage | Rate Limit | Notes |
|--------|----------|------------|-------|
| arXiv | 2.5M+ papers | 1 req/3s | Physics, Math, CS, more |
| PubMed | 35M+ articles | 10 req/s | Biomedical, life sciences |
| CrossRef | 140M+ works | 50 req/s | Multidisciplinary, DOI registry |
| OpenAlex | 250M+ papers | Unlimited | Most comprehensive, citation networks |

## Project Structure

```
research-archive/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── paper/[id]/        # Paper detail page
│   ├── saved/             # Saved papers page
│   └── search/            # Search results page
├── components/            # React components
├── lib/                   # Utilities and API clients
│   ├── api/              # Source-specific API clients
│   ├── cache.ts          # In-memory caching
│   ├── citation-formatter.ts
│   ├── search.ts         # Unified search logic
│   ├── types.ts          # TypeScript types + Zod schemas
│   └── utils.ts          # Helper functions
└── data/                  # Static data (disciplines, config)
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_APP_URL | No | Application URL for metadata |
| CLAUDE_API_KEY | No | For AI summaries (coming soon) |

## API Rate Limits

The application respects rate limits for each source:

- **arXiv**: Built-in 3-second delay between requests
- **PubMed**: 10 requests/second (generous)
- **CrossRef**: 50 requests/second (very generous)
- **OpenAlex**: Unlimited (fair use policy)

Results are cached in memory to minimize API calls.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [x] Dark mode
- [ ] Full-text search integration
- [ ] Author profiles and pages
- [ ] Reading lists with tags
- [ ] AI-powered paper summaries
- [ ] Export to reference managers (Zotero, Mendeley)
- [ ] Browser extension

## Limitations

- Citation counts may vary between sources
- Not all papers have abstracts available
- PDF access depends on open access availability
- Some papers may appear in multiple sources (deduplicated by DOI)

## License

MIT License - feel free to use this for your own research tools!

## Acknowledgments

Data provided by:
- [arXiv](https://arxiv.org) - Cornell University
- [PubMed](https://pubmed.ncbi.nlm.nih.gov) - National Library of Medicine
- [CrossRef](https://www.crossref.org) - DOI Foundation
- [OpenAlex](https://openalex.org) - OurResearch

---

Built with love for researchers, by researchers.
