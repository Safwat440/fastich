FASTICH MULTI-PAGE WEBSITE CONCEPT

Static HTML/CSS/JS site. No framework, no npm install, no backend.

PREVIEW
  node tools/serve.js 8732      then open http://localhost:8732
  (Opening index.html directly from disk also works.)

PAGES (26)
  Home, Products + 8 product pages, Solutions, Features, Integrations, Pricing,
  Customer scenarios, Resources + 6 articles, About, Contact / Request a demo, FAQ, 404.

HOW THE SITE IS PUT TOGETHER
  partials/header.html   shared skip link, top line, header, mega menus, mobile drawer
  partials/footer.html   shared footer, back-to-top button, script tag
  tools/build.js         writes the shared <head>, header and footer into every page.
                         Page content inside <main id="main"> is never changed.
                           node tools/build.js --dry-run   (preview)
                           node tools/build.js             (write)
  tools/set-main.js      replace one page's <main> content from a file
  assets/css/fastich.css design tokens, components, motion system (documented inline)
  assets/js/fastich.js   all interactions; progressive enhancement, respects reduced motion

  To change navigation or the footer: edit partials/*, then run node tools/build.js.
  To add a page: create it with a <title>, optional <meta name="description"> and a
  <main id="main" tabindex="-1">…</main>, then run the build.

REPORTS
  docs/reports/reference-website-audit.md
  docs/reports/fastich-design-audit.md        (palette, contrast, design-system decisions)
  docs/reports/fastich-implementation-report.md
  docs/reports/fastich-qa-report.md

IMPORTANT
  Prices, dashboard numbers, testimonials and customer scenarios are illustrative
  placeholders and are labelled as such on the site. Integrations are categories, not
  confirmed partners. The demo form validates locally and tells the visitor that nothing
  was sent — no backend, CRM, payments or live POS is connected.
  Font Awesome icons and Google Fonts load from CDNs; offline, icons are hidden and system
  fonts are used.
  Unused files from the original template library (assets/css/core_*.css, bulma.css,
  assets/js/app.js, main.js, etc.) are kept but not referenced by any page.
