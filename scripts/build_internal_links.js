#!/usr/bin/env node
/**
 * build_internal_links.js
 *
 * Fixes the orphan-page problem: 114 of 138 review pages currently have zero
 * inbound internal links, so no authority reaches them from the pillars.
 *
 * Part A -- rebuild /reviews/ as a full categorised index (8 cards -> 138),
 *           grouped by tools.json category.
 * Part B -- add a "Read our full X review" link under every pillar heading
 *           that already names a tool with a review page.
 *
 * Part B only ever inserts immediately after a heading's closing tag, so it
 * never edits prose, never touches attributes, and cannot break nesting.
 * Links are deduped per page, and a page is skipped for a slug it already
 * links to.
 *
 * Dry-run by default; --apply to write.
 */

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();

const LINK_COLOR = '#29b8d6'; // matches --cyan on the pillars that define it
const MARKER = 'qh-review-link';

// Display names and running order for the hub. Order is editorial, not by size.
const CATEGORIES = [
  ['chatbots',   'AI Chatbots & Assistants'],
  ['models',     'AI Models & Local Runtimes'],
  ['writing',    'Writing & Editing'],
  ['image',      'Image, Photo & Design'],
  ['video',      'Video Editing'],
  ['audio',      'Audio & Music'],
  ['code',       'Coding Assistants'],
  ['dev',        'Developer Tools'],
  ['security',   'Passwords & Security'],
  ['opensource', 'Open Source Alternatives'],
  ['linux',      'Linux Distributions'],
  ['research',   'Research Tools'],
  ['gaming',     'Free Games'],
];

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Word boundary that tolerates names ending in punctuation ("0 A.D.", "Pop!_OS").
const nameRe = (n) =>
  new RegExp(`(?<![A-Za-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9])`, 'i');

/* ---------- data ---------- */

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools.json'), 'utf8'));
const reviewSlugs = new Set(
  fs.readdirSync(path.join(ROOT, 'reviews'))
    .filter((f) => f.endsWith('.html') && f !== 'index.html')
    .map((f) => f.slice(0, -5))
);
const live = tools.filter((t) => reviewSlugs.has(t.slug));

/* ---------- Part A: rebuild the hub ---------- */

function buildHub() {
  const p = path.join(ROOT, 'reviews', 'index.html');
  let src = fs.readFileSync(p, 'utf8');

  const start = src.indexOf('<div class="reviews-grid"');
  const end = src.indexOf('</main>', start);
  if (start === -1 || end === -1) {
    console.log('  Part A SKIPPED: could not locate the grid block');
    return 0;
  }
  // Trim back to just past the grid's own closing </div>.
  const gridEnd = src.lastIndexOf('</div>', end);

  const byCat = new Map();
  for (const t of live) {
    if (!byCat.has(t.category)) byCat.set(t.category, []);
    byCat.get(t.category).push(t);
  }

  const known = new Set(CATEGORIES.map(([k]) => k));
  const extras = [...byCat.keys()].filter((k) => !known.has(k)).sort();
  const order = [...CATEGORIES, ...extras.map((k) => [k, k])];

  let html = '';
  let cards = 0;
  for (const [key, label] of order) {
    const items = (byCat.get(key) || []).sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) continue;
    html +=
      `\n      <section class="review-category">\n` +
      `        <h2 id="${esc(key)}">${esc(label)} <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-secondary);font-weight:600;">${items.length}</span></h2>\n` +
      `        <div class="reviews-grid">\n`;
    for (const t of items) {
      html +=
        `          <a href="/reviews/${esc(t.slug)}" class="review-card">\n` +
        `            <div class="review-title">${esc(t.name)}</div>\n` +
        `            <div class="review-desc">${esc(t.blurb || '')}</div>\n` +
        `          </a>\n`;
      cards++;
    }
    html += `        </div>\n      </section>\n`;
  }

  src = src.slice(0, start) + html.trim() + '\n    ' + src.slice(gridEnd + 6);

  // The page claims "150+" reviews and describes them as audits. Neither is
  // accurate: there are 138, and the audit wording is the same overstatement
  // that was already removed from the review pages themselves.
  const before = src;
  src = src
    .replace(/150\+ AUDITED REVIEWS/g, `${cards} PUBLISHED REVIEWS`)
    .replace(/150\+/g, String(cards))
    .replace(/audits conducted by the Qutaifan Editorial Board/g,
             'research by the Qutaifan Editorial Board')
    .replace(/hands-on software reviews and security audits/g,
             'hands-on software reviews')
    .replace(/Every tool is audited for licensing, local RAM execution, and zero credit card traps\./g,
             'Every listing records licensing, what the free tier actually covers, and where the limits are.');
  const copyFixed = src !== before;

  if (APPLY) fs.writeFileSync(p, src, 'utf8');
  console.log(`  Part A: hub rebuilt -> ${cards} cards across ${order.filter(([k]) => (byCat.get(k) || []).length).length} categories${copyFixed ? ' (+ count/audit wording corrected)' : ''}`);
  return cards;
}

/* ---------- Part B: pillar heading links ---------- */

const CSS = `
    /* internal review links */
    a.${MARKER}{color:inherit;text-decoration:none;border-bottom:1px dotted rgba(41,184,214,.55);}
    a.${MARKER}:hover{color:${LINK_COLOR};border-bottom-color:${LINK_COLOR};}
    p.${MARKER}-line{margin:.35rem 0 1rem;font-size:.85rem;line-height:1.4;}
    p.${MARKER}-line a{color:${LINK_COLOR};text-decoration:none;border-bottom:1px solid rgba(41,184,214,.35);}
`;

/**
 * Two placement strategies, chosen per heading:
 *
 *  1. Heading text is plain -- wrap the tool name itself in the link. The
 *     anchor text becomes the exact product name, which is the strongest
 *     signal available, and no new block element is introduced, so no card
 *     or grid layout can break.
 *  2. Heading already contains an <a> (six headings link out to vendor sites)
 *     -- nesting anchors is invalid, so fall back to a link line after the
 *     heading. Those six sit in prose sections followed by <p>, not in cards.
 */
function linkPillars() {
  const pages = fs.readdirSync(ROOT)
    .filter((f) => f.endsWith('.html') && f !== '404.html');

  // Longest names first, so "Counter-Strike 2" beats a shorter partial match.
  const ordered = [...live].sort((a, b) => b.name.length - a.name.length);
  let totalLinks = 0;
  let wrapped = 0, appended = 0;
  const summary = [];

  for (const file of pages) {
    const p = path.join(ROOT, file);
    let src = fs.readFileSync(p, 'utf8');
    if (src.includes(MARKER)) { console.log(`     skip (already linked): ${file}`); continue; }

    const already = new Set([...src.matchAll(/href="\/reviews\/([a-z0-9-]+)"/g)].map((m) => m[1]));
    const used = new Set();
    const edits = [];

    for (const m of src.matchAll(/<(h2|h3)([^>]*)>([\s\S]{0,140}?)<\/\1>/g)) {
      const inner = m[3];
      const text = inner.replace(/<[^>]*>/g, '').trim();
      for (const t of ordered) {
        if (used.has(t.slug) || already.has(t.slug)) continue;
        if (!nameRe(t.name).test(text)) continue;
        used.add(t.slug);

        if (!inner.includes('<')) {
          // Strategy 1: wrap the name inside the heading.
          const re = nameRe(t.name);
          const hit = inner.match(re);
          const linked = inner.replace(
            re,
            `<a href="/reviews/${t.slug}" class="${MARKER}">${hit[0]}</a>`
          );
          edits.push({
            start: m.index,
            end: m.index + m[0].length,
            html: `<${m[1]}${m[2]}>${linked}</${m[1]}>`,
          });
          wrapped++;
        } else {
          // Strategy 2: link line after the heading.
          edits.push({
            start: m.index + m[0].length,
            end: m.index + m[0].length,
            html: `\n        <p class="${MARKER}-line"><a href="/reviews/${t.slug}">Read our full ${esc(t.name)} review →</a></p>`,
          });
          appended++;
        }
        break;
      }
    }

    if (!edits.length) continue;

    // Apply back-to-front so earlier offsets stay valid.
    for (const e of edits.sort((a, b) => b.start - a.start)) {
      src = src.slice(0, e.start) + e.html + src.slice(e.end);
    }
    const inserts = edits;

    // Append the style rule to the page's last <style> block.
    const lastStyle = src.lastIndexOf('</style>');
    if (lastStyle !== -1) {
      src = src.slice(0, lastStyle) + CSS + src.slice(lastStyle);
    } else {
      src = src.replace('</head>', `  <style>${CSS}</style>\n</head>`);
    }

    if (APPLY) fs.writeFileSync(p, src, 'utf8');
    totalLinks += inserts.length;
    summary.push(`     ${file}: +${inserts.length}`);
  }

  console.log(`  Part B: ${totalLinks} pillar -> review links across ${summary.length} pages  (${wrapped} name-wrapped, ${appended} link-line)`);
  summary.sort((a, b) => parseInt(b.split('+')[1]) - parseInt(a.split('+')[1])).forEach((s) => console.log(s));
  return totalLinks;
}

/* ---------- run ---------- */

console.log(APPLY ? '=== APPLYING ===' : '=== DRY RUN (pass --apply to write) ===');
buildHub();
linkPillars();
if (!APPLY) console.log('\nNothing written. Pass --apply.');
