# Fastich QA report

Tested 2026-10-22 against `node tools/serve.js 8732` in the Claude desktop built-in browser
(Chromium). Automated checks ran inside the page via same-origin iframes at fixed widths.

## Links and assets

| Check | Before | After |
|---|---|---|
| Broken local links / missing anchors (static scan of every `href`/`src`, incl. `#anchor` targets) | 1 (`business-intelligence.html`) | **0** across 26 pages |
| Missing CSS `url()` assets | 0 | 0 |
| Broken images at runtime (176 page×width loads) | not measured | **0** |
| New assets added | — | none (UI visuals are coded HTML/CSS) |

## Console / runtime

- `read_console_messages` on the home page: no errors.
- Exception canary: the last statement in `fastich.js` writes the footer year. It ran on
  **all 26 pages**, so no script error aborted initialisation.

## Responsive tests performed

Automated: 22 representative pages × 8 widths (360, 390, 430, 768, 1024, 1280, 1440, 1920) —
`documentElement.scrollWidth` never exceeded the viewport (0/176 overflows; run twice, the
second time after the final CSS changes). Intentional horizontal scrollers (tab list on
≤1024 px, comparison table on phones) are contained.

Visual (screenshots at the pane's ~420 px width): home hero, modules, product tabs, journey
steps, ecosystem hub, testimonials, mobile drawer + sub-menu, product page hero, pricing cards
and comparison table, article page.

Desktop (1280 px): verified by measured geometry, not by eye — two-column hero (copy 554 px /
stage 582 px), 320 px tab rail + 829 px panel, sticky journey column, 5 equal solution cards,
5-column footer, hamburger hidden and nav visible. The pane scales emulated desktop widths
down too far for useful visual review.

### Defects found by testing and fixed

1. Mobile drawer collapsed to header height — `backdrop-filter` on the sticky header made it the
   containing block for the fixed drawer. Disabled the filter ≤900 px.
2. Reveal `clip-path` on every revealed element clipped the "Most popular" badge and card
   shadows. Scoped to the `clip` variant only.
3. Elements skipped by a fast scroll never revealed. Added a scroll sweep alongside the
   IntersectionObserver.
4. Without JS, four of five product tab panels were hidden. Panels are now hidden by JS only;
   a no-JS fallback stacks them.
5. Select fields said "Please enter a business type" → "Please choose…".
6. Comparison table on phones showed one plan at a time with the feature names scrolled away →
   pinned feature column and group labels.
7. Articles still had the generic meta description; two page titles were redundant.

## Accessibility checks performed

- Per page (26): exactly one `<h1>`; every `<img>` has `alt`; no duplicate `id`s; no link or
  button without an accessible name.
- Landmarks: skip link → `<main id="main">`, labelled `<nav>`s (Main, Mobile, Breadcrumb).
- Keyboard (scripted key events): mega menu opens with ArrowDown and moves focus into it,
  Escape closes and returns focus to the trigger; product tabs follow the ARIA tabs pattern
  (Arrow keys, Home/End, roving `tabindex`); mobile drawer closes on Escape and returns focus;
  closed drawer is `inert`.
- Accordion: `aria-expanded`, `aria-controls`, `role=region` + `aria-labelledby`; panel height
  0 → 128 px on open.
- Form: errors are text (not colour-only), linked by `aria-describedby`, `aria-invalid` set,
  focus moves to the first invalid field; success/status notice is `role=status` and focused.
- Contrast: measured for every token pair (see design audit). Two failures fixed.
- No-JS: rendered in a script-less sandboxed iframe — 0 of 14 reveal elements hidden, FAQ
  answers open, all product panels visible.

## Form and interaction results

| Control | Result |
|---|---|
| Demo form, empty submit | 4 required-field errors, focus on first; no notice |
| Demo form, bad email | Email error only, `aria-invalid="true"` |
| Demo form, valid (test values) | Notice: "Your details look good — but nothing was sent…"; values kept. No network request is made. |
| Integrations `?category=Finance` | Opens pre-filtered (4 of 12), chip pressed |
| Search "zzz" | 0 results, empty state shown, URL updated |
| Clear filters | 12 results, URL cleared, focus to search |
| Search "api" + Growth chip | Combined filtering correct (0) |
| Pricing yearly / monthly | $41.65 / $84.15 billed yearly ↔ $49 / $99; `aria-pressed` updates |
| FAQ accordion | Opens/closes with correct ARIA |
| Mobile menu + sub-menu | Opens, expands, locks scroll, Escape closes |
| Mega menu | Hover intent + keyboard as above |
| Product tabs | Click and keyboard switch panels |

No real emails, leads, accounts or external transactions were created.

## Known remaining issues

- Font Awesome and Google Fonts are CDN-hosted: offline, icons vanish and fonts fall back.
- `404.html` uses relative asset paths, so it renders correctly for missing pages at the site
  root only (e.g. `/missing.html`), not for nested paths.
- The six articles share identical body copy (pre-existing content issue).
- No production domain → no canonical URLs or `og:image`.
- Arabic/RTL version not available (toggle removed rather than left misleading).

## Tests that could not be performed

- **`prefers-reduced-motion` in a real browser setting** — the pane cannot emulate it. The
  behaviour is implemented in both CSS (durations zeroed, reveals forced visible) and JS (loops
  and autoplay never start) and reviewed in code only.
- **Watching animations play** — the pane renders frames only when captured, so CSS animations
  and smooth scrolling appear frozen mid-way in screenshots. Final states were verified via
  computed styles.
- **Pixel-level desktop review** at 1280–1920 px (see above; geometry verified instead).
- **Real touch devices, Safari/Firefox, screen readers** — not available in this environment.
- **Lighthouse / performance profiling** — not available; no new images or dependencies were
  added, and the shared CSS + JS total ≈ 80 KB uncompressed.
