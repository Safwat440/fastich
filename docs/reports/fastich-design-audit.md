# Fastich design audit

Audit of the project as received (backup: `../fastich-site-backups/backup-20261022-145353`) and
the design-system decisions applied in this pass.

## Baseline (before changes)

- 25 HTML pages at the project root, 82 asset files, 1 broken local link
  (`index.html → business-intelligence.html`; the real file is `Business Intelligence.html`).
- Header, mega menus, mobile drawer and footer copied verbatim into all 25 pages.
- Styles: `assets/css/fastich.css` (one minified file). Several large unused template files
  (`core_blue.css`, `core_deep-blue.css`, `bulma.css`, `app.js`, icon fonts) are present but
  not referenced by any page.
- Note: the brief mentions `HTML/English/portfolio.html`, `blog.html`, `blog-details.html`,
  195 articles and 94 app pages. **Those files do not exist in this project.** The real
  equivalents are `integrations.html` (portfolio/integrations), `resources.html` (blog) and
  `article-1…6.html` (article pages). This audit covers the project as it actually is.

## Strengths kept

- A clear, calm brand voice ("Good service starts with great systems") and honest labelling of
  illustrative prices, quotes and stories.
- Sensible page inventory: home, products + 8 product pages, solutions, features,
  integrations, pricing, stories, resources + articles, about, contact, FAQ.
- Teal logo colour and dark-green hero, already close to the POS app.

## Weaknesses found (priority-ranked)

| # | Issue | Priority |
|---|---|---|
| 1 | Broken link to Business Intelligence page from home | P0 |
| 2 | Content hidden (`opacity:0`) until JS ran — blank page without JS | P0 |
| 3 | Mobile drawer: `backdrop-filter` on the header collapsed the fixed drawer (found during QA) | P0 |
| 4 | Language toggle switched the page to RTL with no Arabic content | P1 |
| 5 | All 8 product pages shared identical, generic capability cards ("A practical workflow…") | P1 |
| 6 | Features, integrations and solutions used one generic sentence for every item | P1 |
| 7 | Yearly price showed `$84.14999999999999` | P1 |
| 8 | Home showed template client logos labelled "Client logo example" — implies customers that are not verified | P1 |
| 9 | No plan comparison, no featured/related content, no breadcrumbs semantics, no 404 | P1 |
| 10 | Unique meta descriptions missing on 17 pages; no Open Graph tags | P2 |
| 11 | Small status text and "Most popular" badge below 4.5:1 contrast | P2 |
| 12 | Repeated `✦` glyph as every card icon; `↗` glyph arrows | P2 |
| 13 | Header/footer duplicated 25× — any nav change needs 25 edits | P2 |
| 14 | Font Awesome and Google Fonts load from CDNs; offline they fall back (icons disappear, system fonts) | P2 (documented, not changed) |
| 15 | The six articles share the same body text | P2 (content, documented — not rewritten) |

## Brand palette

Sources: the Fastich logo (`assets/images/fastich-logo.png`, teal ≈ `#73c2bc`) and the CSS
custom properties served by the Fastich POS app at
`https://fastichpos.nahrdev.website/app/home` (read from its `:root` rules on 2026-10-22):
`--brand #5c938d`, `--brand-deep #3f736d`, `--brand-soft #e4eeec`, `--ink #1b3a4b`,
`--ink-muted #5f7a82`, `--line #dce5e3`, `--surface-sunken #f4f7f6`, status colours
`#47775a / #96682b / #a63d4e`.

**Discrepancy:** the logo teal (`#73c2bc`) is lighter than the POS brand (`#5c938d`). Resolution:
the logo teal is the *accent on dark* and the primary button fill (with dark text); the POS
`brand-deep` is used for links and text on light surfaces; POS `ink` drives headings. The dark
hero colour moved from green-black `#102b2b` to `#0f2a31`, a darker step of the POS ink, so
website and app read as one family.

| Token | Value | Use |
|---|---|---|
| `--logo` | `#73c2bc` | Primary button fill, accents on dark |
| `--brand` | `#5c938d` | Decorative fills, focus ring, active states |
| `--brand-deep` | `#3f736d` | Links, eyebrow text, badges |
| `--brand-soft` | `#e4eeec` | Icon tiles, tags, hover backgrounds |
| `--ink` | `#1b3a4b` | Headings, dark buttons |
| `--body` / `--muted` | `#2f4b57` / `#546e76` | Body / secondary text |
| `--paper` / `--line` | `#f4f7f6` / `#dce5e3` | Page background / borders |
| `--night` / `--night-2` | `#0f2a31` / `#16363e` | Dark sections |
| `--success` / `--warning` / `--danger` | `#3b6649` / `#7e5622` / `#a63d4e` | Status (darkened from POS for AA) |

### Measured contrast (WCAG 2.x formula, computed in Node)

| Pair | Ratio | Result |
|---|---|---|
| ink on white | 11.98 | AA/AAA |
| body on white | 9.27 | AA/AAA |
| muted on white / on paper | 5.43 / 5.04 | AA |
| brand-deep on white / on brand-soft | 5.41 / 4.57 | AA |
| button text `#0b2328` on logo teal | 7.91 | AA |
| on-night-muted on night / night-2 | 8.69 / 7.44 | AA |
| logo teal on night | 7.29 | AA |
| white on brand-deep (badge, fixed) | 5.41 | AA (was 3.49 on `--brand`) |
| warning / success text on tint (fixed) | 5.63 / 5.60 | AA (was 4.23 / 4.40) |
| faint `#8ba0a5` on white | 2.74 | Used only for decorative/strikethrough mock text and icons that also carry screen-reader text |

## Design-system decisions

- **Type:** Manrope (headings, 800, tight tracking) + DM Sans (body), fluid `clamp()` scale
  (`--fs-display`, `--fs-h1`, `--fs-h2`, `--fs-lead`); `text-wrap: balance` on headings.
- **Layout:** 1200 px container (1280 px ≥ 1600 px), fluid gutter 16–32 px, section rhythm
  `clamp(72px, 8vw, 120px)`. Breakpoints: 1180 / 1024 / 900 (nav collapses) / 760 / 400.
- **Shape:** radii 8 / 14 / 22 / 30; pill buttons; three shadow levels.
- **Components:** buttons (`primary`, `dark`, `outline`, `ghost`), cards, icon tiles, tags,
  pills, mega menu with featured panel, mobile drawer, breadcrumbs, product UI mock-ups,
  accordion, chips + search, comparison table, testimonial slider, CTA band, footer.
- **Motion tokens:** `--ease-out cubic-bezier(.2,.75,.2,1)`, `--ease-spring`, durations
  `.18s / .32s / .7s`, reveal distance 26 px, stagger 80 ms (capped at 6 steps).
  Rules: transform/opacity only; content only hidden once JS has added `.js-motion`;
  looping effects pause off-screen and in hidden tabs; everything is disabled under
  `prefers-reduced-motion`.
