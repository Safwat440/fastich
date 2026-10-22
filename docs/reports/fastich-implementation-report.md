# Fastich implementation report

Pass completed 2026-10-22. Backup of the original project:
`C:\Users\safwa\Desktop\fastich-site-backups\backup-20261022-145353` (28 entries, matches source).

## Architecture change

The header, mega menus, mobile drawer and footer used to be copied into all 25 pages. They now
live once in `partials/header.html` and `partials/footer.html`, and `tools/build.js` writes them
(plus a shared `<head>`) into every page. Page-specific content sits inside
`<main id="main">` and is never touched by the build.

```
node tools/build.js --dry-run   # report changes only
node tools/build.js             # write
node tools/serve.js 8732        # dependency-free local preview server
```

The build is idempotent (a second run reports 0 changes). On its first run it also migrated
legacy markup: `.reveal` classes → `data-reveal`, inline outline-button styles → `.btn.ghost`,
glyph arrows → icons, breadcrumbs → `<nav><ol>`, FAQ markup → accessible accordion, and the
broken BI link.

## Pages added or rebuilt

| Page | What changed |
|---|---|
| `index.html` | New flagship home: orchestrated hero with layered dashboard (live kitchen-queue demo, floating cards, drawn underline, pointer depth); module chips; **interactive product showcase** (5 ARIA tabs with autoplay progress and coded UI mock-ups); **"one order, table to report" scroll story** with progress line and synced visuals; solutions on dark; **ecosystem hub** of integration categories; illustrative testimonials; 3-step start; FAQ; CTA. Removed unverified client-logo grid. |
| 8 product pages | Product-specific intro, bullets, sample UI per product, 3 tailored capabilities, "for which role" strip, "works well with" cross-links. Replaced identical generic cards. |
| `products.html` | Grouped into Front of house / Back of house / Growth. |
| `features.html` | Each feature has its own description and links to the product it belongs to. |
| `solutions.html` | Jump chips, per-format "what matters most" + recommended products, `:target` highlight. |
| `integrations.html` | Category chips with counts, search, `?category=` / `?q=` URL state, live result count, empty state with reset, honest "categories, not confirmed integrations" notice, specific descriptions. |
| `pricing.html` | Fixed yearly maths, `aria-pressed` toggle, illustrative notice, comparison table with pinned feature column, pricing FAQ. |
| `resources.html` | Featured article, topic chips, search, reading time, category art. |
| `article-1…6.html` | Article layout: reading progress bar, on-this-page TOC with scroll-spy, share (copy link / native share), related articles. Original body text preserved word for word. |
| `stories.html` | Renamed "Customer scenarios"; scenarios clearly tagged illustrative; placeholder explaining verified stories will follow. |
| `about.html`, `faq.html`, `contact.html` | Restructured; FAQ grouped; contact form rebuilt with field-level errors and an honest "nothing was sent" state; FAQ answers about Arabic and the demo form corrected to match reality. |
| `404.html` (new) | `noindex` not-found page; served by `tools/serve.js`. |

## Shared components changed

- Header: three mega menus (Products, Solutions, Company) with icons and a featured panel,
  hover-intent close delay, ArrowDown to enter, Escape to close and return focus,
  `aria-expanded/controls`, `aria-current` on the active page.
- Mobile drawer: animated hamburger, staggered items, `inert` when closed, body scroll lock,
  Escape to close, accessible sub-menu toggles.
- Removed the language toggle (it flipped to RTL with no translated content).
- Skip link, `<main>` landmark, back-to-top button, footer with five columns.

## Motion system (assets/js/fastich.js + CSS)

- Hero entrance: CSS-only staggered rise, screen tilt-in, line/area chart draw, floating cards
  pop with spring easing — visible even if JS fails.
- Scroll reveals: one IntersectionObserver, variants `up/left/right/scale/clip`,
  auto-stagger via `data-stagger`, plus a scroll sweep so fast jumps never leave content hidden.
- Product tabs: panel copy and UI animate in; autoplay with progress bar pauses on hover,
  focus, off-screen and hidden tab, and stops permanently after user interaction.
- Journey: scroll-linked progress line and step activation (rAF-throttled).
- Hub nodes fly out from the core on first view; bars grow on reveal.
- Micro-interactions: button sheen and press, icon tilt on card hover, chip/tag hovers,
  accordion height via `grid-template-rows`, price swap, form shake on error, toast.
- Kitchen-queue demo cycles order statuses every 2.4 s only while visible.
- `prefers-reduced-motion`: all animation/transition durations zeroed, reveals shown, loops not started.

## Files

New: `partials/header.html`, `partials/footer.html`, `tools/build.js`, `tools/set-main.js`,
`tools/serve.js`, `404.html`, `.claude/launch.json`, `docs/reports/*.md`.

Modified: all 25 original pages, `assets/css/fastich.css` (rewritten as a documented token-based
system), `assets/js/fastich.js` (rewritten), `README.txt`.

No assets were deleted. Unused template files (`core_blue.css`, `core_deep-blue.css`,
`bulma.css`, `app.js`, `main.js`, icon fonts, etc.) were left in place.

## Intentionally deferred

- **Arabic / RTL version** — needs real translations; the misleading toggle was removed instead.
- **Real backend for the demo form** — the form says plainly that nothing was sent.
- **Self-hosting Font Awesome and Google Fonts** — would require downloading third-party files;
  offline, icons disappear and system fonts are used, but no content is lost.
- **Article bodies** — the six articles share one template body; new copy needs an author.
- **Verified customer stories, partner integrations, prices, contact details, legal pages** —
  not invented; placeholders say so.
- **Canonical URLs / `og:image`** — need the production domain.
- **Careers / press pages** — no verified information to publish.

---

## Update 2026-10-22 — About Us link, social icons, clients carousel

### Files changed
- `partials/header.html`: added `<a href="about.html">About Us</a>` to `<nav class="navlinks" aria-label="Main">`, renamed the mobile drawer link to "About Us", and wrapped the top-line CTA in `.topline-end` with a `<!-- @social -->` slot.
- `partials/footer.html`: added a `<!-- @social -->` slot under the brand blurb.
- `partials/social.json` (new): the single list of verified social profiles. **It is currently empty.**
- `tools/build.js`: renders `social.json` into both slots as `<ul class="social">`. Each link is icon-only and gets an `aria-label`, `target="_blank"` and `rel="noopener noreferrer"`. Only `https://` URLs are accepted, and an empty list renders nothing.
- `assets/css/fastich.css`:
  - social icon styles: 40 px targets in the footer, 28 px in the top line, hover and focus states;
  - clients carousel styles;
  - single-row nav rule for 901–1100 px (seven top-level items).
- `assets/js/fastich.js`: carousel behaviour.
  - prev/next buttons with wrap-around;
  - autoplay every 3.2 s;
  - autoplay pauses on hover, keyboard focus, touch, when off-screen and when the tab is hidden; it never starts under `prefers-reduced-motion`;
  - ←/→ keys work on the focused track.
- `index.html`: new "Our clients" section inserted immediately before the "Common questions" section.
- All 26 pages were regenerated by `node tools/build.js`.

### Missing verified content
- **Social URLs: none verified.** I searched the project (HTML, JS, JSON, docs) and the Fastich POS app, which redirects to a login page with no links. No Fastich social profiles were found, so no social icons are published. To publish them, add entries like `{"network":"linkedin","label":"LinkedIn","icon":"fa-linkedin-in","url":"https://…"}` to `partials/social.json` and run `node tools/build.js`.
- **Client logos: none verified.** `assets/images/logos/custom/cl-logo*.png` are template samples (previously labelled "Client logo example") and are not evidence of real clients. The carousel shows 8 dashed tiles clearly labelled "Placeholder", with a visible note. The steps for replacing them are in an HTML comment above the section.

### Test results
- Section order on the home page: … "Get from curious to confident" → **"Trusted by restaurant teams."** → "A few things you may be wondering" (Common questions) → final CTA. No other sections moved.
- About Us appears in the desktop nav and the mobile drawer on all pages; existing mega menu and drawer behaviour unchanged.
- Nav fits on one row at 960–1920 px. At 1024 px it first wrapped to two rows, which was fixed with the 901–1100 px rule. The hamburger takes over below about 917 px of viewport.
- Visible logos: 5.3 at desktop (1100–1920 px), 3.1–3.2 at tablet (768–1024 px), 2.1 at phone (360–430 px). Tiles keep a fixed 16:9 box, so there is no layout shift.
- Controls: Next moved one tile (≈192 px at 390 px width). Prev returned to the start. Next at the end wrapped back to the start.
- Social renderer:
  - tested in a throwaway copy with a dummy `https://example.invalid` entry — it rendered in both the top line and the footer with the correct attributes, and a `javascript:` URL was rejected;
  - the real site has 0 social links;
  - styling was checked by injecting temporary markup into the live page: 40×40 px footer targets and the Font Awesome Brands font loads.
- Horizontal overflow on the home page at 11 widths (360–1920 px): none.
- Broken local links across 26 pages: 0. The build is idempotent (0 pending changes).
- Console: no errors from the site's scripts. The only console errors came from a deliberately script-less test iframe.

### Not tested here
- **Safari, Firefox and real devices:** not available in this environment, so none of them were run. Instead I checked the code for features that are sensitive across browsers:
  - `inert` (Safari 15.5+, Firefox 112+; without it, closed-drawer links stay focusable);
  - `aspect-ratio` (Safari 15+);
  - `mask-image` (with the `-webkit-` prefix included);
  - `scroll-snap-type`;
  - `backdrop-filter` (with the `-webkit-` prefix; turned off at 900 px and below);
  - animating `grid-template-rows` for the accordion (Safari 17.4+, Firefox 66+; older browsers open it instantly);
  - `text-wrap: balance` (cosmetic only);
  - `focus({preventScroll})` and `||=` (Safari 14–15+);
  - `scrollTo({behavior:'smooth'})` (Safari 15.4+; older versions jump instantly).
- **Reduced motion:** the browser pane can't emulate `prefers-reduced-motion`, so this was reviewed in code only.
- **Autoplay timing:** smooth scrolling only advances when this pane paints a frame, so the wrap-around was confirmed by forcing frames with screenshots, not by watching it play.

---

## Update 2026-10-22 — social links and language selector (presentation only)

### Files changed
- `partials/social.json`: added Facebook (`fa-facebook-f`), X (`fa-x-twitter`), Instagram (`fa-instagram`) and LinkedIn (`fa-linkedin-in`). The URLs are the generic platform homepages, as requested; they are not Fastich accounts.
- `tools/build.js`:
  - each icon link now gets `aria-label="<Network>"`, a tooltip saying "(opens in a new tab)", `target="_blank"` and `rel="noopener noreferrer"`;
  - added the `<!-- @lang -->` slot, which renders `partials/language.html` with unique ids per slot (`lang-1` in the nav, `lang-2` in the drawer).
- `partials/language.html` (new): the one language-selector component. A globe button opens a listbox with English (default) and العربية, plus a note: "Preview only — translations coming soon".
- `partials/header.html`: added the `@lang` slot as the last item inside `<nav class="navlinks" aria-label="Main">` (after Company), and a second slot in the mobile drawer above the CTAs.
- `assets/css/fastich.css`:
  - selector styles (matches the nav button style, popup like the mega menu, 44 px option rows);
  - the "English" text is hidden between 901 and 1180 px so the nav stays on one row;
  - the selector is a full-width row in the drawer;
  - focus rings on the dark `.topline` now use the logo teal.
- `assets/js/fastich.js`: the selector logic.
  - Choosing an option only updates `aria-selected`, the button label and its `aria-label`. Both instances stay in sync.
  - It never touches `lang`, `dir`, the URL, page content or storage.
- All 26 pages were regenerated with `node tools/build.js`. No page was edited by hand.

### Test results
- **Build:** the first run changed 26 pages; the second run changed 0, so the build is idempotent. Broken local links: 0.
- **Icons:** a static check of all 26 pages found all four labels in both the `.topline` and the `<footer>`, each with `target="_blank" rel="noopener noreferrer"`.
  - The selector appears exactly twice on each page (nav and drawer), always inside the main nav, with no duplicate ids.
  - In the browser, the footer icons render with the Font Awesome Brands glyphs and have 40×40 px targets (28 px in the top bar).
  - The top bar shows the icons at 768 px and above; it is hidden below 760 px, as before.
- **Fit:** the main nav is a single row at 960, 1024, 1100, 1180, 1280 and 1920 px, with the selector last and 12–78 px clear of the CTA. The popup stays inside the viewport at every width. Below the 901 px collapse point, the selector lives in the mobile drawer.
- **Keyboard and pointer (mobile drawer and desktop):**
  - ArrowDown on the button opens the list and focuses the selected option;
  - Arrow keys move between options, and Enter selects, closes the list and returns focus to the button;
  - Escape closes only the dropdown, not the drawer, and returns focus;
  - clicking outside closes it;
  - opening it closes any open mega menu.
- **No side effects:** after choosing العربية, the URL, `<html dir="ltr">`, `lang`, the h1 text and the page instance were all unchanged, with no reload or navigation. The body direction stayed `ltr`.
- **Overflow:** 4 pages × 12 widths (360–1920 px) showed no horizontal overflow from this change.
  - `about.html` at 360–768 px reports a 10 px `scrollWidth` excess before its existing slide-in visual is revealed. This comes from the reveal animation's 26 px start offset. It is clipped by `body{overflow-x:hidden}`, the page cannot scroll sideways (scrollX stays 0), and it disappears once revealed.
  - This is pre-existing and was left unchanged.
- **Console:** no errors from the site's scripts. The only logged errors came from a deliberately script-less test iframe.

### Not tested here
- Safari, Firefox, real touch devices and screen readers were not available.
- Touch was exercised with synthetic click events only.

---

## Update 2026-10-22 — real client images, language selector after `.nav-actions`

### Files changed
- `index.html` (inside `<main>` only):
  - in `<section class="section clients">`, replaced the 8 dashed placeholder tiles with the 8 images from `assets/images/brands/` (`1.png`–`8.png`);
  - removed the placeholder note and the "Client logos will appear here…" line;
  - updated the instructions comment.
  - Each image is `<img src="assets/images/brands/N.png" alt="Restaurant client logo N" width="225" height="127" loading="lazy" decoding="async">` with a relative path. None of the filenames contain spaces.
  - The section still sits immediately before the Common questions section (`#faq-title`).
- `partials/header.html`: moved the `<!-- @lang -->` slot out of `<nav class="navlinks">` to directly after `<div class="nav-actions">`. The desktop row order is now: brand, main links, Request a demo, language. The mobile drawer slot is unchanged.
- `assets/css/fastich.css`:
  - `.logo-tile img{filter:none;opacity:1}`, so logos show in their original colours. `object-fit:contain` is kept.
  - the 901–1180 px compact-label rule now targets `.nav > .lang-menu`;
  - `.nav > .lang-menu{flex:none}`, and it is hidden at 900 px and below, where the drawer copy takes over;
  - `.nav-actions .btn{white-space:nowrap}`. This fixes the "Request a demo" text wrapping to two lines, which a screenshot at 1280 px revealed after the move.
- All 26 pages were regenerated with `node tools/build.js`. The original image files were not modified and the backup is untouched.

### Brand images
- All 8 are readable 225×127 RGB PNGs, between 6 and 22 KB.
- None carries a real brand name. They are generic restaurant logo templates: #2 reads "LOREM IPSUM", #4 "Restaurant / Sample Text", #7 "Tagline goes here", and the rest only "RESTAURANT" or "Restaurent FOOD".
- Because no company name could be established, the alt text is neutral ("Restaurant client logo N"). **They should be replaced with real, approved client logos before launch.**
- #5 has a light-grey background baked into the image. It is shown as-is, unaltered.

### Test results
- **Build:** idempotent (26 pages changed, then 0, then 0). Broken local links: 0. The backup folder `backup-20261022-145353` is intact.
- **Carousel:**
  - 0 placeholder tiles remain, and 8 of 8 images load at their natural 225×127 size at 390, 768 and 1440 px;
  - `object-fit: contain`, `filter: none`;
  - about 2.1, 3.2 and 5.3 logos visible on phone, tablet and desktop;
  - Next advances the track;
  - the carousel JS is unchanged from the version tested earlier (wrap-around, autoplay with hover/focus/off-screen pause, reduced-motion opt-out).
- **Desktop nav** (measured at viewport widths 942–1902 px):
  - the order is `brand > navlinks > nav-actions > lang-menu` with the language selector last and flush with the container edge;
  - everything is on one row, with no overlap and nothing spilling past its box;
  - the gaps are even: 12 px at 960, 22 px at 1024, 24 px from 1100 to 1440, 39 px at 1920;
  - the CTA is a single 44 px line at every width;
  - the "English" label shows from 1181 px and only the globe shows from 901 to 1180 px;
  - a visual check at 1280 px confirmed the order and alignment.
- **Dropdown at 1280, 1440 and 1920 px:**
  - ArrowDown opens it and focuses English; Enter selects العربية, closes it and syncs both instances;
  - Escape closes it and returns focus; clicking outside closes it;
  - the popup stays inside the viewport;
  - URL, `dir="ltr"`, `lang="en"` and the page instance were unchanged, with no reload.
- **Tablet and mobile:** at 900 px and below, the hamburger shows, the desktop selector is hidden, and the drawer opens with its own selector.
- **Overflow:** 4 pages × 8 widths, with transitions disabled to reach the final state, showed 0 px of overflow.
  - A 3–10 px `scrollWidth` excess appears only before slide-in reveals finish. This is the existing reveal start offset; `body{overflow-x:hidden}` clips it and `scrollX` stays 0.
- **Console:** no errors.

### Not tested
- Safari, Firefox and real devices were not available.
- Autoplay and smooth scrolling can't be watched in this pane, which only renders frames when captured.

---

## Update 2026-10-22 — final polish and artifact cleanup

Backup made before any edits: `../fastich-site-backups/backup-20261022-161744`. It was checked with `diff -rq` and was identical to the project. The earlier backup is untouched.
Baseline: 26 pages, 90 asset files, 0 broken local links.

### How the audit was done
- Text scan of every page: visible text, `alt`/`aria-label`/`placeholder`/`content` attributes, and HTML comments. Searched for lorem, placeholder, sample, example, demo, test, TODO and Foodics.
- Code scan: `console.*`, `debugger`, TODO/FIXME, local filesystem paths, test URLs.
- Sentence-level repetition check across all `<main>` contents.
- Unused-CSS check: every class in `fastich.css` against all pages, partials and JS.
- Rendered checks in the browser: 26 pages × 3 widths, in the final animation state.

### Confirmed defects fixed
| # | Defect | Evidence | Fix |
|---|---|---|---|
| 1 | **Six articles shared one body.** Articles 2–6 repeated article 1's text, which did not match their titles, e.g. "What to look for in a POS" talked about mapping shift workflows. | The same 9 sentences appeared on 6 pages. | Article 1 keeps its original body, which matches its title. Articles 2–6 got topic-specific bodies (lead + 3 sections, 122–169 words) written as general operational guidance with no product claims, statistics or customers. Tables of contents were updated; "1 min read" is still accurate. |
| 2 | Visitor-facing developer note "Editorial demo content created for the Fastich website concept." | On all 6 articles. | Removed. |
| 3 | FAQ answers written as developer notes: "This deliverable is a front-end website concept", "placeholders to demonstrate a pricing page and its monthly/yearly toggle", "presented in this concept as". | `faq.html` | Rewritten as plain visitor language with the same facts: prices are illustrative, scenarios aren't verified, screens are samples. The question "Is Fastich a live POS service?" became "Can I try Fastich on this website?". |
| 4 | Pricing page 105 px wider than the screen on phones. The visually hidden "Included / Not included" text in the comparison table (`position:absolute`) escaped its scrolling wrapper. | `scrollWidth` 465 at a 360 px viewport in a real render. | `.compare-wrap{position:relative}` → 360. |
| 5 | Ecosystem hub nodes ran past the screen edge on tablets. The radius was a fixed 210 px while the column was about 337 px wide. | Nodes reached x=824 at 768 px. | The radius now scales with the hub (`min(210px,39cqw)`, with container queries); the old value is kept as a fallback. All nodes stay in view from 360 to 1920 px. |
| 6 | Dead CSS from removed features: `.nav-login`, `.grid4`, `.card.link-card`, `.filtercard`/`.is-hiding`, `.metric*`, `.logo-tile.is-placeholder*`. | Not referenced by any page, partial or JS. | Removed (about 1.3 KB). |
| 7 | Conflicting CSS: `.logo-tile img` set greyscale and fade, then a later rule undid it. That rule also carried a `border-radius` added outside my edits, which I kept. | Two rules for one element. | Merged into a single rule: `object-fit:contain; border-radius:var(--r-lg)`, no filter. |
| 8 | The language menu closed other instances by firing synthetic `.click()` events. | `fastich.js` | Replaced with a direct close function. Behaviour is the same. |

### Reviewed and intentionally kept
- "Sample data", "Sample interface for illustration", "Illustrative testimonial · not a real customer", the illustrative pricing notice, and the top-line / footer "concept website" line. These are deliberate honesty labels for content that is not verified.
- Repeated "Make your next shift your best one." band and "Request a demo" CTA: consistent CTAs by design.
- `console.log` in `tools/build.js` and `tools/set-main.js`: build-tool output, not shipped.
- Comments in the HTML: `<!-- /prose -->` (an anchor the tooling relies on) and the instructions comment in the clients section.
- Unused template files (`core_*.css`, `bulma.css`, `app.js`, `main.js`, icon fonts): not referenced by any page. Left in place as previously documented, because deleting them was not needed for this task.
- Generic social homepage links: requested explicitly.
- Language selector: presentation only, as requested.

### Remaining placeholders and missing verified content
- **Client logos (`assets/images/brands/1–8.png`) are stock logo templates.** #2 reads "LOREM IPSUM", #4 "Sample Text", #7 "Tagline goes here". Under the brief's own criterion ("placeholder logos … that look like real endorsements") this is a defect, but these images were explicitly requested in the previous change, so they stay until real, approved client logos are supplied.
- No verified Fastich social profiles, prices, customer stories, contact details, legal pages or Arabic translations.

### Files changed
`article-1.html` … `article-6.html` (only the article body or the removed note), `faq.html` (7 answers), `assets/css/fastich.css`, `assets/js/fastich.js`.
Untouched: partials, `tools/*`, `partials/social.json`, all other pages, all images and fonts.

### Validation
- Build: 0 changes on repeated runs (idempotent). Local links: 0 broken. Asset count: 90, unchanged. `node --check` on the JS passes.
- Regression pass:
  - mega menu open and Escape;
  - About Us link in the nav and drawer;
  - language selector shows العربية while the page stays `ltr` and the URL is unchanged;
  - four social links with `target`/`rel` in both the top bar and footer;
  - carousel shows 8/8 brand images;
  - product tabs keyboard switch;
  - FAQ toggle;
  - integrations `?category=Growth` gives 4 of 12;
  - yearly prices $41.65 / $84.15 and a 13-row comparison table;
  - article TOC (3 items), progress bar, share buttons and 3 related cards;
  - contact form shows 4 required errors;
  - mobile drawer;
  - back-to-top shows and moves focus to `<main>`;
  - a missing page returns the custom 404.
- Rendered sweep of 26 pages × 360/768/1280 px (78 loads) in the final animation state: 0 broken images, scripts complete on every page, and 0 px overflow after fixes #4 and #5.
- Console: no errors from site code. The only error logged was the intentional 404 request in the test.

### Not tested
- Safari, Firefox, real devices and screen readers were not available.
- `prefers-reduced-motion` was reviewed in code only.
- Container query units (`cqw`) need Safari 16+ or Firefox 110+; older browsers use the previous fixed radius.

---

## Update 2026-10-22 — article-card photos

Backup before editing: `../fastich-site-backups/backup-20261022-164258` (checked with `diff -rq`).

### Images inspected (`assets/images/images/`, all 542×247 PNG)
| File | Content | Used for |
|---|---|---|
| 1.png | Chef plating dishes at the pass of a busy kitchen | Operations — article 1 |
| 2.png | Hand tapping a sales dashboard on a tablet | Technology — article 2 (POS) |
| 3.png | Owner reviewing a growth chart on a laptop | Growth — article 3 |
| 4.png | Kitchen display screen with new / in-progress / ready orders | Kitchen — article 4 |
| 5.png | Monthly financial report beside a calculator | Finance — article 5 |
| 6.png | Server bringing plates to guests | Customer Experience — article 6 |

### Cards
- **`resources.html`:** all 6 grid cards (`.card.article-card`) had icons and now have the photo for their topic.
  - Each image is a relative path, e.g. `assets/images/images/1.png`, with descriptive `alt` text, `width`/`height` set, and lazy loading.
  - Titles, descriptions, category tags, reading time, links and filter attributes are unchanged.
  - Each image is used once in the grid.
- **Featured card:** kept unchanged. It already had a valid image you added (`assets/images/illustrations/UI/FASTICH-Restaurant-POS-Experience.png`, 1672×941). That image has no `alt` attribute; its container is `aria-hidden`, so screen readers skip it either way. I left it as you wrote it.
- **"Related resources" on `article-1`…`article-6`:** these use the same `.card.article-card` component, so their icons were replaced with the same per-article photos for consistency (3 per page).
- **Cards that kept their icon:** none. Every topic had a suitable image.

### Files changed
- `resources.html` and `article-1.html` … `article-6.html`: only the `.articleart` element inside article cards.
- `assets/css/fastich.css`: added `.articleart.has-img` and its `img` rule — `object-fit:cover`, filling the existing 170 px box (the featured box keeps its own height), with a 1.04 zoom on card hover to match the old icon motion.
- The build also rewrote the shared head/header/footer of `resources.html`, which had been reformatted with indentation. This was verified to be formatting-only (identical once whitespace is removed); the `<main>` content was not touched.

### Validation
- Build: 1 page changed (the formatting normalisation above), then 0 on the second run. Local links: 0 broken.
- At 360, 768 and 1280 px:
  - resources shows 7/7 images loaded, article pages 3/3;
  - every card art box is 170 px tall with `object-fit: cover`;
  - cards in each row have equal heights;
  - 0 px horizontal overflow.
- Topic filter still works (Kitchen shows 1 of 6). Visual check at 1280 px: aligned three-column grid.
- Console: no errors.
- Not tested: Safari, Firefox, real devices.

---

## Update 2026-10-22 — dedicated images for the Platform and Journey interfaces

Backup of the affected files before editing: `../fastich-site-backups/backup-20261022-172931-ui-images/` (`index.html`, `assets/css/fastich.css`), verified with `cmp`.

### Inventory: 9 `.ui` elements inspected
| Section | Parent | What the HTML/CSS mockup showed |
|---|---|---|
| Platform (`#platform-title`) | `#panel-pos` tab panel | New order for Table 08: menu tiles, cart, "Send & pay" |
| Platform | `#panel-kds` | Grill station: three tickets (late / in progress / ready) |
| Platform | `#panel-online` | Storefront: Pickup/Delivery toggle, menu categories |
| Platform | `#panel-inv` | Stock levels: five ingredient bars with low-stock warnings |
| Platform | `#panel-bi` | Sales by hour: bar chart (sample data) |
| Journey (`#journey-title`) | `.jv` 1 | Order #1046 for Table 04 sent to the kitchen |
| Journey | `.jv` 2 | Grill station: ticket routed |
| Journey | `.jv` 3 | Checkout for Table 04: paid |
| Journey | `.jv` 4 | End of day: sales bars plus one stock row |

JS dependencies: tab switching uses only `[role=tab]`, `aria-controls` and the panel's `hidden` attribute. The journey uses `.jstep` and `.jv` (`is-active`). Nothing depended on the markup inside `.ui`, so no JavaScript changes were needed.

### Image source (important)
**No image-generation tool was available in this session, so no images were generated.**
The 9 images come from Fastich-branded photos that were added today to `assets/images/illustrations/` (`Untitled-1…7.png`, `platform1–6.png`, all 558×509).
- Each interface uses a different source image. There is no collage, and no image is used twice.
- `platform2/5/6.png` have a baked-in caption with a step number along the bottom (the teal circle starts at y = 420–446). Their copies were cropped to the top 400 px so the caption is removed.
- For one consistent frame, all 9 copies were cropped to 558×400 from the top with Pillow.
- The source files were not modified.

### Mapping
| Section | Parent element | Interface purpose | Image file | Source |
|---|---|---|---|---|
| Platform | `#panel-pos` | Point-of-sale order entry | `platform-pos.png` | Untitled-1 (POS terminal, current order, Send to Kitchen) |
| Platform | `#panel-kds` | Kitchen display | `platform-kitchen-display.png` | Untitled-2 (New / In Progress / Ready board) |
| Platform | `#panel-online` | Online ordering storefront | `platform-online-ordering.png` | Untitled-6 (phone menu with scan-to-order stand) |
| Platform | `#panel-inv` | Inventory / stock | `platform-inventory.png` | platform6, caption cropped (dashboard with an "Inventory Status" panel) |
| Platform | `#panel-bi` | Reports & BI | `platform-reports.png` | platform5, caption cropped (sales overview, top items, by category) |
| Journey | `.jv` 1 — "The order is taken" | Order capture | `journey-order-taken.png` | Untitled-3 (table tablet menu, Table 5) |
| Journey | `.jv` 2 — "The kitchen gets a clear ticket" | Kitchen ticket | `journey-kitchen-ticket.png` | platform2, caption cropped (chef at the kitchen display) |
| Journey | `.jv` 3 — "The guest pays without friction" | Payment | `journey-payment.png` | Untitled-4 (payment screen, $35.20, payment methods) |
| Journey | `.jv` 4 — "Stock and reports catch up" | End-of-day reporting | `journey-end-of-day.png` | Untitled-5 (printed monthly report) |

Weakest match: **Inventory**. No available image shows ingredient stock levels; the closest is a business dashboard with an inventory-status chart. A dedicated stock-levels image would fit better.
Unused candidates: `platform1/3/4.png` (they would duplicate the POS, ordering and payment subjects, and carry captions), `Untitled-7.png` (takeaway bag), and the three large `FASTiCH-*-POS-Experience` images.

### Files
- **Added (9):** `assets/images/illustrations/platform-pos.png`, `platform-kitchen-display.png`, `platform-online-ordering.png`, `platform-inventory.png`, `platform-reports.png`, `journey-order-taken.png`, `journey-kitchen-ticket.png`, `journey-payment.png`, `journey-end-of-day.png`.
- **Modified:**
  - `index.html`: each `.ui` keeps its element but gets the class `ui-photo` and an `<img>` (with `width`/`height`, lazy loading and descriptive `alt`) in place of the mock markup. `aria-hidden` was removed from the replaced `.ui` elements and from `.journey-visual`, so the alt text is announced. The `.jv` containers, tab panels, steps and section order are unchanged.
  - `assets/css/fastich.css`: `.ui.ui-photo` (no padding, `aspect-ratio:558/400`, `overflow:hidden`) and its `img` (`object-fit:cover`).
- **Left unchanged:** the mockup CSS classes (`.pos`, `.kds`, `.ticket`, `.store`, `.stock`, `.bars`), because the product pages still use them.

### Validation
- HTML `<div>`s are balanced (162 / 162). Build is idempotent (0 / 0 changes). Local links: 0 broken.
- At 375, 768, 1280 and 1920 px: 9/9 images load at 558 px natural width, all 9 sources are distinct, every image renders at a 1.40 ratio (no distortion), and there is 0 px horizontal overflow.
- Platform tabs: clicking each tab shows its own image (pos → kds → online → inv → bi). Keyboard behaviour is unchanged.
- Journey, tested in the visible tab at 1280 px: scrolling through the steps switched the active visual order-taken → kitchen-ticket → payment → end-of-day, all 4 steps became active, and the progress line reached 0.87. On phones (≤760 px) the journey visual stays hidden as before.
- Visual check on a phone-width pane: the Kitchen Display panel image is sharp and correctly framed.
- Console: no errors.
- Not tested: Safari, Firefox, real devices.

---

## Update 2026-10-22 — dedicated Inventory tab image

- **Search:** no existing asset in `assets/images/illustrations/` (including `UI/` and `drawings/`) shows stock management. The previous Inventory image was a general business dashboard.
- **Created:** `assets/images/illustrations/platform-inventory-stock.png`, 1116×800 (2× the 558×400 tab frame, same 1.395 ratio).
  - It is a rendered illustration, not a photograph: an HTML scene drawn with the site's brand tokens and the real `assets/images/fastich-logo.png`, rendered by headless Chrome.
  - It shows a tablet on a stand displaying a Fastich POS **Inventory** screen:
    - an Inventory nav item;
    - KPIs: items tracked, low stock, out of stock, pending orders;
    - a reorder alert with a "Create purchase order" action;
    - an item table with on-hand quantity, par level, level bar and an In stock / Low stock / Out of stock status.
  - All figures are illustrative.
- **Assignment:** `index.html`, line 166, inside `#panel-inv`: only the Inventory tab's `<img>` `src` and `alt` changed. The old `platform-inventory.png` is no longer referenced but was kept, not deleted. No other image, tab, layout, animation or journey code was touched.
- **Validation:**
  - Build: 0 / 0 changes (idempotent). Local links: 0 broken.
  - At 360, 390, 430, 768, 1024, 1280, 1440 and 1920 px: the image loads at 1116×800 and renders at a 1.40 ratio (270–454 px wide), the Inventory panel shows when its tab is selected, the 5 tab images stay distinct, and there is 0 px overflow.
  - Visual check in the pane. Console: no errors.

---

## Update 2026-10-22 — brand colour alignment with the POS login page

Backup before editing: `../fastich-site-backups/backup-20261022-173531` (checked with `diff -rq`). Baseline: build idempotent, 0 broken links.

### Measured reference values
Read from computed styles and stylesheet rules on `https://fastichpos.nahrdev.website/account/login`, rendered at 419 px and 1440 px.

| Name | Value | Where on the login page | Use on the website |
|---|---|---|---|
| Brand navy | `#1b3a4b` | `.auth-left` gradient end (top) and `.auth-btn` gradient end; also POS `--ink` | `--night-2`, `--ink` (unchanged) |
| Brand teal (gradient) | `#558983` | `.auth-left` `linear-gradient(359deg, #558983, #1b3a4b)`; `.auth-btn` `linear-gradient(90deg, #558983, #1b3a4b)` | `--pos-teal`, the source of `--grad-end` |
| Accent teal | `#75c0b8` | `.brand-name span` on the dark panel | Matches the existing `--logo #73c2bc` (logo colour), so that token was kept |
| Dot texture | `radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)` at 30 px | `.auth-left::before` | `--dot-grid` on the hero |
| Soft teal glow | `rgba(37,235,200,.18)`, blurred | `.auth-blob.blob-1` | Not copied; the site keeps its more restrained `#73c2bc` glows |
| Heading | `#0f1e34` | `.auth-card h2` | Not adopted; `--ink #1b3a4b` stays as the heading colour |
| Light surfaces | `#e9ecef` page, `#f1f5f9` right panel, `#ffffff` card, `#f8fafc` input, `#e2e8f0` border | Login form side | Not adopted; the site keeps the POS app's own `--surface-sunken #f4f7f6` and `--line #dce5e3` (read from the same origin's `:root`) |
| Text | `#374151` labels, `#64748b` and `#94a3b8` muted | Form | Existing `--body` and `--muted` kept |

**Measured but treated as template residue, not brand:**
- blue `#3b82f6` (input focus);
- `#2563eb` / `#1d4ed8` (links, and the button hover gradient `#1d4ed8 → #1e40af`);
- blue shadows `rgba(59,130,246,…)`;
- purple blob `rgba(139,92,246,.1)`;
- feature-icon blue, green and orange.

These come from the underlying admin template and conflict with the teal/navy identity, so they were not carried over.

### Token mapping (design decisions)
| Token | Before | After | Basis |
|---|---|---|---|
| `--night` | `#0f2a31` (green-black) | `#132f3d` | One step darker than measured navy `#1b3a4b` |
| `--night-2` | `#16363e` | `#1b3a4b` | Measured |
| `--night-deep` (new) | footer hard-coded `#0a2026` | `#0e2733` | Navy family |
| `--pos-teal` (new) | — | `#558983` | Measured |
| `--grad-end` (new) | — | `#325a61` | 40% navy→teal mix. The full `#558983` gives white text 3.97:1, muted text 2.29:1 and the primary button only 1.92:1, so it was not used behind content |
| `--grad-brand` (new) | — | `linear-gradient(120deg, night 0%, navy 45%, grad-end 100%)` | Same direction family as the POS button |
| `--grad-brand-v` (new) | — | `linear-gradient(180deg, night, navy)` | Like the POS panel's vertical gradient, staying on the navy end |
| `--dot-grid` (new) | — | 7% white dots, 30 px | Measured |
| `theme-color` meta | `#0f2a31` | `#132f3d` | Follows `--night` |

Unchanged: `--logo`, `--brand`, `--brand-deep`, `--brand-soft`, `--ink`, the light neutrals, buttons and status colours. They already match the POS tokens.

### Backgrounds changed
- `.hero`: flat `--night` → `--grad-brand-v`; the line grid → POS dot grid. Existing glows kept.
- `.pagehero` (all inner pages): `--night` → `--grad-brand-v`.
- `.cta-band`, `.bandinner` (closing CTA on every page): `--night` → `--grad-brand`, with copy on the navy side. At 760 px and below the gradient runs top→bottom so the stacked copy stays on navy.
- `.footer`: `#0a2026` → `--night-deep`.
- The dark sections (Journey, Solutions, testimonials, top line, mega-menu panel) pick up the new navy through `--night` / `--night-2`. They stay solid, so not every section has a gradient.
- **Contrast bug fixed (pre-existing):** eyebrow labels in `.cta-band` and `.mega-feature` used the light-section teal `#3f736d` on a dark background (about 2.4:1). They are now included in the dark-surface eyebrow rule and use `--logo`, measured at 6.1–6.5:1.

### Files modified
- `assets/css/fastich.css`: tokens and the section rules listed above, plus one media rule.
- `tools/build.js`: the `theme-color` value.
- All 26 HTML pages were regenerated (the `theme-color` meta only).

No images, content, links, JS, layout or animations changed.

### Checks
- **Contrast**, measured at real element positions on the gradient. CTA band at 375, 768, 1024, 1280 and 1920 px:
  - eyebrow 6.11–6.53:1;
  - heading 8.47–12.53:1;
  - paragraph 4.81–6.58:1;
  - primary button fill against the background 4.43–6.06:1;
  - ghost button text 8.24–11.72:1.
- **Site-wide scan:** 267 text elements on dark surfaces across 6 pages, each checked against the lightest background behind it. No real failures after the fix; the only flag was a step dot with its own fill.
- **Regression sweep:** 15 pages × 360/768/1280 px gave 0 px overflow, 0 broken images, scripts completing everywhere, and the new tokens active. Visual check of the hero, CTA band and footer at 1280 px. Console: no errors.
- **Build:** idempotent (26 pages changed for the meta update, then 0). Links: 0 broken.
- **Not tested:** Safari, Firefox and real devices. The login page's own hover/focus states were read from its CSS, not exercised by interaction.
