# Fastich — `.ui` mockup → image replacement report

Date: 2026-10-22
Backup before this pass: `../fastich-site-backups/backup-20261022-174043`, verified identical with `diff -rq`.
Earlier homepage work, with its own backup `backup-20261022-172931-ui-images`, was preserved unchanged.

## 1. Pages inspected
All 26 HTML pages in the project root were scanned for `class="ui"` and `class="ui …"`:
`404`, `about`, `article-1` … `article-6`, `Business Intelligence`, `contact`, `Customer Loyalty`, `faq`, `features`, `index`, `integrations`, `Inventory`, `Kitchen Display`, `Online Ordering`, `Payments`, `Point of Sale`, `pricing`, `products`, `resources`, `solutions`, `stories`, `Waiter App`.

`.ui` elements appear only on `index.html` (9, already images from the previous pass) and the 8 product pages (1 each). The other 17 pages have none.

## 2. Mockups replaced in this pass
Each product page had one mockup inside `.visual` (`data-reveal="right" data-observe`). No JavaScript referenced anything inside these `.ui` elements; only the reveal attribute is used, and it is kept.

| Page | Original mockup (purpose) | Image | Why it matches |
|---|---|---|---|
| `Point of Sale.html` | "New order · Table 08": item tiles, cart, "Send & pay" | `assets/images/illustrations/FASTiCH-Restaurant-POS-Experience-3.png` (1672×941) | POS terminal with menu categories, a current order with totals and Send to Kitchen. It is the order-entry interface itself, and it is not used on the homepage. |
| `Kitchen Display.html` | "Grill station": three tickets (late / in progress / ready) | `…/platform-kitchen-display.png` | Kitchen display with New / In Progress / Ready columns. |
| `Online Ordering.html` | "Your storefront": pickup/delivery toggle, menu categories | `…/platform-online-ordering.png` | Guest ordering from the Fastich menu on a phone at a scan-to-order stand. |
| `Payments.html` | "Checkout · Table 12": split 2 ways, card/cash, close table | `…/journey-payment.png` | Payment screen with the total and payment methods while a card is presented. |
| `Inventory.html` | "Stock levels": ingredient bars and low-stock warnings | `…/platform-inventory-stock.png` | Inventory screen with on-hand quantity, par levels, low / out-of-stock status and a reorder alert. |
| `Business Intelligence.html` | "Sales by hour": bar chart | `…/platform-reports.png` | Sales overview dashboard with a trend, top items and sales by category. |
| `Waiter App.html` | "Floor · Section B": table status grid | `…/waiter-app-tableside.png` (new crop, see §4) | Server taking an order on a Fastich tablet at a guest table, which is the waiter app's purpose: tableside ordering. |

Reuse: KDS, online ordering, payment, inventory and reports images also appear on the homepage. Each one is the same interface on both pages (the homepage tab or step and its dedicated product page), not an unrelated subject. Within any single page, no image is repeated.

Markup and CSS:
- Each mockup is replaced by `<div class="ui ui-photo[ ui-photo-wide]"><img … width height loading="lazy" decoding="async" alt="…"></div>`.
- The POS photo uses the new `.ui-photo-wide` modifier (`aspect-ratio:1672/941`), so its 16:9 framing is not cropped.
- The "Sample interface for illustration" note, which was absolutely positioned in the corner, overlapped the photos. On these 7 pages it is now a `.visual-note` stacked under the image and reads "Sample image for illustration". The panel gets the `visual-photo` class (column layout).
- Obsolete mockup CSS was removed only after checking that no page or JS uses it: 40 selectors (`.pos*`, `.kds`, `.ticket*`, `.store*`, `.seg*`, `.bars*`, `.legend`, `.bar i.low`, plus the matching responsive rules), about 3.1 KB.
- `.ui`, `.ui-head`, `.stock*`, `.bar`, `.kpi*` were kept: the Loyalty mockup and the homepage hero still use them.

## 3. Remaining mockups
| Page | Mockup | Why it was left unchanged |
|---|---|---|
| `Customer Loyalty.html` | "Guest profile": avatar, visits, points, next reward, reward progress | No image in `assets/images/illustrations` shows a customer profile, loyalty points or rewards. The candidates (POS terminals, KDS, payments, reports, phone menu, takeaway bag) would misrepresent the feature, so the original mockup stays. |

The homepage hero dashboard (`.screen`, with its live kitchen queue) is a separate, animated component, not a `.ui` mockup, and was intentionally not changed.

## 4. Images needed or adjusted
- **Needed:** a Fastich loyalty / CRM image, e.g. a guest profile with visit history, points balance and a reward-progress indicator, ideally at 558×400 or a 1.4:1 ratio. Add it to `assets/images/illustrations/` and swap it into `Customer Loyalty.html`.
- **Adjusted:** `waiter-app-tableside.png` is a 558×400 crop of the existing `platform3.png`. The source has a baked-in "3 Order Taking" caption starting at y = 446, removed by cropping to the top 400 px. This is the same method used for the homepage images. No new imagery was generated or downloaded, and `platform3.png` itself is unchanged.
- **Unused but available:** `FASTICH-Restaurant-POS-experience.png` and `FASTiCH-Café POS-Experience-1.png` (more POS terminals; the second filename contains a space and "é"), `platform1/4/5/6.png` (captioned), `Untitled-7.png` (takeaway bag), `platform-inventory.png` (superseded).

## 5. Verification
### Automated (scripts run against the local server)
- Final project scan: 1 `.ui` mockup remains (Customer Loyalty), and there are 16 `.ui-photo` images (9 on the homepage, 7 on product pages). Every illustrations `src` resolves.
- Build: `node tools/build.js` reported 0 changes on each run (idempotent).
- Link check: 26 pages, 0 broken local links or missing assets.
- HTML: `<div>`s balanced on every edited page (checked by the replacement script). CSS braces balanced (642/642) after pruning.
- Each product page plus the homepage at 375, 768, 1280 and 1920 px, in hidden test frames (36 loads):
  - every image loads at its natural size;
  - displayed ratio equals natural ratio (1.40, or 1.78 for POS), so no stretching;
  - each image sits inside its panel, with 0 px horizontal overflow;
  - page scripts complete;
  - the homepage still has 9/9 photos and the hero dashboard.
- After the note fix, a 28-combination re-check (7 pages × 4 widths) found the note below the image, inside the panel, with no overlap.

### Manual, in the built-in browser pane
- Screenshots of `Point of Sale.html` and `Waiter App.html` at the pane's phone width: photos framed correctly in the panel.
- Console: no errors.

### Not tested
- Safari, Firefox and physical devices.
- Pixel-level visual review at 1280/1920 px; those widths were checked by measured geometry, not by eye.

---

## Update — Customer Loyalty image supplied (2026-10-22)
- **Image:** `assets/images/illustrations/dashboard.png`, supplied as `Dashboard.png` and renamed to lowercase. It is 1536×1024 (1.5:1) and shows the guest profile for Sara A.: Gold tier, 14 visits, 320 points, next reward 80, reward progress 80%, plus visit history and loyalty insights. It matches the original mockup's content exactly.
- **Replaced:** the last remaining `.ui` mockup in `Customer Loyalty.html`. The page now uses `<div class="ui ui-photo ui-photo-fit"><img src="assets/images/illustrations/dashboard.png" …></div>` inside the existing `.visual` panel (`visual visual-photo`), with descriptive alt text and `width`/`height` attributes to reserve space.
- **CSS added:** `.ui.ui-photo.ui-photo-fit{aspect-ratio:auto}` and `… img{width:100%;height:auto;object-fit:contain}`, so the image is shown whole at its own proportions. No CSS was removed. The Loyalty-only mockup rules (`.ui-head`, `.stock*`, `.bar`, `.kpi*`) were kept because the homepage hero still uses `.kpi*`; the others are now unused and can be pruned later if wanted.
- **Backup:** `../fastich-site-backups/backup-20261022-175028-loyalty/` (the page and CSS before the edit).
- **Project scan:** **0 `.ui` mockups remain**; all 17 `.ui` elements across the site are images.
- **Checks:**
  - At 360, 375, 768, 1024, 1280 and 1920 px: the image loads at 1536×1024, renders at exactly 1.500 (306–597 px wide), sits inside the panel uncropped, and there is 0 px overflow. The sizing is identical to the other product pages (e.g. `Inventory.html`).
  - Screenshots at phone width and at 1280 px. Console: no errors.
  - Build: 0 changes on two runs. Links: 0 broken.
- **Note:** the current stylesheet sets `p.illustrative{display:none}` (an edit made outside this task). The "Sample image for illustration" note is therefore hidden on all product pages, as are the other `.illustrative` labels across the site, such as "Illustrative · USD" on pricing. This was left as is.
