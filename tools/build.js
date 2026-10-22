#!/usr/bin/env node
/* Syncs the shared <head>, header and footer into every page.
   Page-specific content between <main> markers is preserved.
     node tools/build.js            write changes
     node tools/build.js --dry-run  report what would change, write nothing
   The first run also migrates the legacy markup (reveal classes, inline button
   styles, breadcrumbs, FAQ markup) — those transforms are idempotent. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');
// Social icons come only from partials/social.json (verified URLs). An empty list renders nothing.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const social = JSON.parse(fs.readFileSync(path.join(ROOT, 'partials/social.json'), 'utf8')).links
  .filter(l => /^https:\/\//.test(l.url || ''));
const socialHtml = social.length
  ? `<ul class="social" aria-label="Social media">${social.map(l =>
      `<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(l.label)}" title="${esc(l.label)} (opens in a new tab)"><i class="fa-brands ${esc(l.icon)}" aria-hidden="true"></i></a></li>`).join('')}</ul>`
  : '';
// Language selector (presentation only): one partial, rendered into each <!-- @lang --> slot with unique ids.
const langTpl = fs.readFileSync(path.join(ROOT, 'partials/language.html'), 'utf8').trim();
let langN = 0;
const withSocial = (html) => html.replace(/<!-- @social -->/g, socialHtml)
  .replace(/<!-- @lang -->/g, () => langTpl.replace(/\{\{id\}\}/g, 'lang-' + (++langN)));
const header = withSocial(fs.readFileSync(path.join(ROOT, 'partials/header.html'), 'utf8').trim());
const footer = withSocial(fs.readFileSync(path.join(ROOT, 'partials/footer.html'), 'utf8').trim());

// Unique descriptions for pages that shared the generic default.
const DESCRIPTIONS = {
  'index.html': 'Fastich connects point of sale, kitchen, online ordering, inventory and reporting so restaurant teams can run every shift from one platform.',
  'products.html': 'Explore the Fastich platform: point of sale, kitchen display, online ordering, payments, inventory, loyalty, reporting and a waiter app.',
  'solutions.html': 'Fastich workflows for cafes, quick service, full service restaurants, cloud kitchens and multi-branch restaurant groups.',
  'features.html': 'The Fastich features behind smoother service: menus and modifiers, split bills, live order status, inventory, roles, reports and more.',
  'integrations.html': 'Browse the integration categories Fastich is designed to connect with, from accounting and delivery channels to analytics and custom APIs.',
  'pricing.html': 'Compare illustrative Fastich plans for single restaurants, growing teams and multi-location operations, and talk to sales for a quote.',
  'stories.html': 'Illustrative scenarios showing how different restaurant formats could use Fastich to simplify service and reporting.',
  'resources.html': 'Practical guides on restaurant operations, technology, kitchen workflows, finance, growth and guest experience.',
  'about.html': 'Fastich builds restaurant technology that keeps hospitality human: clear tools, connected workflows and practical design.',
  'contact.html': 'Request a Fastich demo or contact the team to discuss your restaurant format, locations and the workflows you want to improve.',
  'faq.html': 'Answers to common questions about Fastich, demos, multi-location support, pricing and getting started.',
};

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let changed = 0;

for (const file of pages) {
  const full = path.join(ROOT, file);
  const src = fs.readFileSync(full, 'utf8');

  const title = (src.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || 'Fastich';
  const oldDesc = (src.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const generic = /^Fastich brings restaurant teams, orders and insights together/.test(oldDesc);
  // Pages without a hand-written description fall back to their hero lead.
  const heroLead = (src.match(/<section class="pagehero">[\s\S]*?<\/h1><p>([^<]*)<\/p>/) || [])[1];
  const desc = DESCRIPTIONS[file] && (generic || file === 'index.html') ? DESCRIPTIONS[file] : generic && heroLead ? heroLead : oldDesc;
  const robots = (src.match(/<meta name="robots" content="([^"]*)"/) || [])[1];
  const extraHead = (src.match(/<!-- @head-extra -->([\s\S]*?)<!-- \/@head-extra -->/) || [])[1] || '';

  // Main content: from markers if already built, else legacy slice.
  let main;
  const m = src.match(/<main id="main"[^>]*>([\s\S]*?)<\/main>/);
  if (m) main = m[1];
  else main = src.slice(src.indexOf('</header>') + 9, src.indexOf('<footer'));
  main = migrate(main.trim(), file);

  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}">`,
    robots ? `<meta name="robots" content="${robots}">` : '',
    '<meta name="theme-color" content="#132f3d">',
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Fastich">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${desc}">`,
    '<link rel="icon" type="image/png" href="assets/images/favicon.png">',
    '<script>document.documentElement.className="js"+(matchMedia("(prefers-reduced-motion: reduce)").matches?" no-motion":" js-motion")</script>',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" referrerpolicy="no-referrer">',
    '<link rel="stylesheet" href="assets/css/fastich.css">',
    extraHead ? `<!-- @head-extra -->${extraHead}<!-- /@head-extra -->` : '',
  ].filter(Boolean).join('\n');

  const out = `<!doctype html>
<html lang="en" dir="ltr" class="no-js">
<head>
${head}
</head>
<body>
${markCurrent(header, file)}
<main id="main" tabindex="-1">
${main}
</main>
${footer}
</body>
</html>
`;

  if (out !== src) {
    changed++;
    console.log((DRY ? 'would update ' : 'updated ') + file + `  (${src.length} -> ${out.length} bytes)`);
    if (!DRY) fs.writeFileSync(full, out);
  }
}
console.log(`${pages.length} pages scanned, ${changed} ${DRY ? 'would change' : 'changed'}.`);

function markCurrent(html, file) {
  return html.replace(/<a href="([^"#]+)">/g, (all, href) =>
    href === file && !['index.html'].includes(href) ? `<a href="${href}" aria-current="page">` : all);
}

function migrate(html, file) {
  return html
    // legacy reveal classes -> data-reveal
    .replace(/class="([^"]*)\breveal\b([^"]*)"/g, (all, a, b) => {
      const cls = (a + b).replace(/\b(visible|delay\d)\b/g, '').replace(/\s+/g, ' ').trim();
      return (cls ? `class="${cls}" ` : '') + 'data-reveal="up"';
    })
    // inline-styled outline buttons on dark heroes -> .btn.ghost
    .replace(/class="btn outline" style="color:white;border-color:#[0-9a-f]{6}"/g, 'class="btn ghost"')
    // glyph arrows -> icon
    .replace(/\s?↗\s?<\/a>/g, ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>')
    // breadcrumb -> nav/ol
    .replace(/<div class="crumb"><a href="index.html">Home<\/a> \/ ([^<]*)<\/div>/g,
      (all, cur) => `<nav class="crumb" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li aria-current="page">${cur}</li></ol></nav>`)
    // FAQ markup
    .replace(/<button class="faqbtn">([^<]*)<span>[^<]*<\/span><\/button>/g,
      '<button class="faqbtn" type="button" aria-expanded="false">$1<span class="fq-icon" aria-hidden="true"></span></button>')
    .replace(/<div class="faqanswer">(?!<div>)([\s\S]*?)<\/div>/g, '<div class="faqanswer"><div><p>$1</p></div></div>')
    // known broken link
    .replace(/href="business-intelligence.html"/g, 'href="Business Intelligence.html"');
}
