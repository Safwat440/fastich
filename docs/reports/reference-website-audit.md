# Reference website audit — foodics.com

Inspected 2026-10-22 in the built-in browser (narrow ~420 px pane) plus same-origin
`fetch` + DOM parsing of linked pages. Purpose: understand information architecture,
page types and conversion patterns. No Foodics branding, copy, imagery or assets were
reused in Fastich.

## What was actually inspected

| Reference URL | Page type | Key sections & functionality observed | Fastich equivalent | Gap → action | Priority |
|---|---|---|---|---|---|
| https://www.foodics.com/ | Home | Country phone strip; header with Products mega menu, Enterprise, App Marketplace, Business Types, Become a Partner, Resources, Pricing; "Talk to sales" + "Try in action" CTAs; product imagery grid; partner/customer logos; "Success begins with the right POS"; "Stay in control"; operations; customer/CRM; App Marketplace; digital payments; final social-proof CTA | `index.html` | Fastich home was a static list of cards with no product demonstration. → Rebuilt with interactive product tabs, order-journey scroll story, ecosystem hub, honest proof section | P1 |
| /point-of-sale-restaurant-management-system/ | Product detail | Hero, feature trio (setup, real-time reporting, cloud), front/back-of-house/back-office split, compliance band, add-on products (KDS, call center, notifier), demo request | 8 product pages | Fastich product pages had identical placeholder cards. → Product-specific capabilities, sample UI, roles, "works well with" cross-links | P1 |
| /business-types/ | Industry solutions | One hero, tabbed business types (cloud kitchen, QSR, kiosks/food trucks, dine-in), demo CTA | `solutions.html` | Existing page had generic text. → Per-format "what matters most" + recommended products, jump chips, anchor targets | P1 |
| /foodics-pricing-egypt/ | Pricing | Two bundles, plan comparison, subscribe CTA | `pricing.html` | No comparison table; float bug in yearly price. → Comparison table, fixed pricing math, illustrative notice, pricing FAQ | P1 |
| /marketplace/ | Integrations marketplace | Search form, category filtering, ~20+ named partner app cards | `integrations.html` | Fastich has categories only (no verified partners). → Kept as categories, added chips + search + URL state + honest notice. Did **not** invent partner names | P1 |
| /blog/ | Blog listing | Featured reads + card list with titles | `resources.html` | → Featured article, category chips, search, reading time | P2 |
| /request-a-demo/ | Lead generation | Single-purpose demo page, "no obligations" message | `contact.html#demo` | → Kept on contact page with field-level validation and an honest "not sent" state | P1 |
| /careers/ | Company | Culture sections, mission, life at company | — | Not created: no verified Fastich hiring information | — |
| /contact-us/ | Company/contact | Office locations by country | `contact.html` | Fastich has no verified addresses → placeholders removed rather than invented | P2 |

## Main design & UX observations

- **Navigation depth:** Products is a mega menu; company/resources items grouped under secondary menus. The footer repeats products, company and legal links. → Fastich now has Products / Solutions / Company mega menus with icons and a featured panel, plus a 5-column footer.
- **Conversion:** Two persistent CTAs (sales + demo) in the header and at the end of nearly every page; every product page ends in a demo request. → Fastich uses one primary CTA ("Request a demo") in the header, every page hero and every closing band.
- **Product storytelling:** Real device photography and many short sections. Fastich has no product photography, so it uses lightweight coded UI mock-ups (POS, KDS, storefront, stock, reports) that are clearly labelled as samples.
- **Social proof:** Heavy use of customer counts and partner logos. Fastich has no verified numbers or customers, so those claims were **not** reproduced; testimonials are labelled illustrative and a placeholder explains that verified stories will follow.
- **Mobile:** Header collapses to a hamburger; CTAs stack full width; image grids reflow to 2-up.

## Inspection limitations

- Viewed at the pane's narrow width only; desktop layout and hover animations on foodics.com were not visually inspected.
- Sub-pages were inspected through fetched HTML (headings, forms, tab/accordion counts), not rendered, so their interaction and motion details were not observed.
- Interactive journeys (demo form submission, sign-up, login) were not exercised — no data was submitted.
- Regional variants (Saudi, UAE, etc.) and the Arabic site were not reviewed.
