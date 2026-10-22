#!/usr/bin/env node
/* Replace the <main> content of a page with the contents of another file.
   usage: node tools/set-main.js <page.html> <content.html> */
const fs = require('fs');
const [page, content] = process.argv.slice(2);
const html = fs.readFileSync(page, 'utf8');
const body = fs.readFileSync(content, 'utf8').trim();
const re = /(<main id="main"[^>]*>)[\s\S]*?(<\/main>)/;
if (!re.test(html)) throw new Error('No <main id="main"> in ' + page + ' — run tools/build.js first');
fs.writeFileSync(page, html.replace(re, (_, a, b) => `${a}\n${body}\n${b}`));
console.log('main replaced in ' + page);
