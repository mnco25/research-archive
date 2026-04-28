# ResearchArchive Design System

A reference for the visual language, interaction patterns, and component conventions used across
ResearchArchive. The system is intentionally restrained: every page should feel quiet, fast, and
purposeful, so the research gets the spotlight.

## Principles

1. **Reading first.** Every layout and color decision serves legibility.
2. **Quiet motion.** Animations exist to clarify state, not to entertain. They respect
   `prefers-reduced-motion`.
3. **Theme via tokens.** Light/dark mode flips a single set of CSS variables. We do not use
   Tailwind's `dark:` modifiers.
4. **Predictable interactions.** URL is source of truth for search state. Saved library is the
   source of truth for the bookmark badge.
5. **Accessibility is non-negotiable.** Focus rings, contrast, ARIA on icon-only buttons, full
   keyboard support.

## Tokens (`app/globals.css`)

| Group | Tokens |
|---|---|
| Surfaces | `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`, `--bg-inset`, `--bg-overlay` |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-placeholder`, `--text-on-accent` |
| Borders | `--border-primary`, `--border-secondary` |
| Brand | `--accent` (HSL), `--accent-foreground` |
| Semantic | `--success`, `--warning`, `--error`, `--info` |
| Shadows | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-focus` |
| Radii | `--radius-sm` (6) → `--radius-xl` (20), `--radius-full` |
| Motion | `--duration-fast` (120ms), `--duration-normal` (200ms), `--duration-slow` (400ms) |

Dark mode is activated by `[data-theme="dark"]` on `<html>`. The bootstrap script in
`app/layout.tsx` sets it before paint to prevent flash.

## Typography

- **Font**: Inter (loaded from Google Fonts, weights 400/500/600/700)
- Hierarchy classes:
  - `.text-display` for hero headlines (`-0.035em` letter-spacing, line-height 1.05)
  - `.text-title` for section titles
  - `.text-heading` for subsection titles
  - `.text-label` for uppercase eyebrow text

## Components

### Header (`components/Header.tsx`)
Floating nav with a centered pill-style menu (md+). Becomes opaque + blurred after 8 px of
scroll. Contains the theme toggle and the mobile menu button.

### SearchBar (`components/SearchBar.tsx`)
Command-palette style input with:
- Autocomplete via `/api/suggest` (debounced 220 ms)
- `⌘K` / `/` keyboard shortcut to focus
- Arrow-key navigation through suggestions
- A clear button when there's a query
- Subtle focus state using the accent color and `--shadow-focus`

The bar **never** mutates the URL while typing — only on Enter or click — so the search page
fetches once per intent.

### PaperCard (`components/PaperCard.tsx`)
Two variants:
- `default`: full card with abstract preview, footer meta, and trailing read/PDF links.
- `compact`: dense card used in trending grids and related/citing lists.

Both share the same header (badges + share/cite/save icons), making the visual rhythm
consistent across the app.

### FilterSidebar (`components/FilterSidebar.tsx`)
Controlled (no internal state for filter values). The host page passes `filters`, `onChange`,
and `onReset`, so the URL always reflects the filter state. Has a collapsible mobile mode.

### Citation (`components/Citation.tsx`)
Inline format switcher (BibTeX, APA, MLA, RIS) computed entirely on the client via
`formatCitation()` — no extra network round-trip when the user toggles a format.

### Toast (`components/Toast.tsx`)
`useToast()` returns `{ addToast, ToastContainer }`. Toasts stack bottom-right with a
flex-column-reverse so the newest is closest to the cursor.

### Loading (`components/Loading.tsx`)
`PaperCardSkeleton`, `SearchResultsSkeleton`, `PaperDetailSkeleton`, and `Spinner`. Skeletons
share the radius of their real counterparts.

## Page Patterns

### Homepage (`app/page.tsx`)
Hero → Trending (real data via `/api/trending`) → Discipline browser → Feature trio → Source
overview → CTA. Decorative elements are limited to a single accent glow and a faint grid.

### Search (`app/search/page.tsx`)
Single source of truth: the URL. Filters, query, and page number all live in the search
parameters. `useEffect` watches them and dispatches one `AbortController`-aware fetch per
change. Partial failures are surfaced inline in the results header.

### Paper Detail (`app/paper/[id]/page.tsx`)
Reading-first layout with breadcrumb, action bar (PDF / Save / Source / Share), abstract,
keywords, an inline citation widget, and "Related" + "Cited by" grids when OpenAlex provides
them. The sidebar shows authoritative metadata (citations, journal, DOI, PMID, arXiv ID, source).

### Saved Library (`app/saved/page.tsx`)
Search/filter your own library, export in any of the four citation formats or as JSON, and
import a JSON dump back. Empty and zero-match states are handled distinctly.

## Accessibility Checklist

- All interactive elements have a visible focus ring (`:focus-visible`).
- Icon-only buttons carry `aria-label` and `title`.
- Stateful toggles use `aria-pressed` / `aria-expanded` / `aria-current`.
- Pagination is wrapped in `<nav aria-label="Pagination">`.
- Animations respect `prefers-reduced-motion`.
- Color contrast is verified at AA in both themes.

## What Changed in v2.0

This major overhaul (April 2026) focused on consistency, working APIs, and shareable URLs:

- New shared HTTP layer with retries and a polite User-Agent.
- New `/api/suggest` (autocomplete) and `/api/trending` endpoints powered by OpenAlex.
- PubMed citation counts now come from NIH ICite, and PubDate parsing is hardened.
- Discipline filter is now actually applied to the upstream query.
- Search page no longer double-fetches on filter change; URL is the source of truth.
- Cross-source deduplication merges metadata instead of overwriting it.
- Citation formatter gains RIS export. Saved library can import/export JSON, BibTeX, RIS, APA,
  MLA.
- Theme system unified into `lib/theme.ts` and a single bootstrap script in `layout.tsx`.
- Toast stacking is correct, skeletons match real card geometry, and decorative cursor/particle
  animations were removed for performance.
