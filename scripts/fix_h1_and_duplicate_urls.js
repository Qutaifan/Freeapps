#!/usr/bin/env node
/**
 * fix_h1_and_duplicate_urls.js
 *
 * Four scoped repairs. Dry-run by default; pass --apply to write.
 *
 *  A. Collapse the duplicate <h1> on every /reviews/*.html page.
 *     Each page carries two <h1>s: a short title, then a longer descriptive one.
 *     Keeps the descriptive text, promotes it into the first <h1>'s position,
 *     removes the second. Result: exactly one <h1> per page.
 *
 *  B. Delete the thin trailing-slash duplicates (about/index.html etc.).
 *     Cloudflare serves /x from the rich x.html and /x/ from the thin stub,
 *     both 200, each self-canonicalling to itself. Removing the stub leaves
 *     one indexable URL per page. Sitemap + canonicals already point at /x.
 *
 *  C. Delete 404/index.html, which makes /404 return 200 (a soft 404).
 *     Cloudflare's own 404 handling uses root 404.html and is unaffected.
 *
 *  D. Add the orphaned-but-linked root pages to sitemap.xml.
 */

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();
const ORIGIN = 'https://www.qutaifan.com';

const log = [];
const note = (s) => { log.push(s); console.log(s); };

/* ---------- A. collapse duplicate <h1> on review pages ---------- */

function collapseH1() {
  const dir = path.join(ROOT, 'reviews');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
  let fixed = 0, already = 0, skipped = [];

  for (const f of files) {
    const p = path.join(dir, f);
    const src = fs.readFileSync(p, 'utf8');
    const h1s = [...src.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];

    if (h1s.length <= 1) { already++; continue; }
    if (h1s.length > 2) { skipped.push(`${f} (${h1s.length} h1 tags)`); continue; }

    const [first, second] = h1s;
    const keepText = second[1].trim();

    // Replace second <h1>...</h1> with nothing, first with the descriptive text.
    // Work back-to-front so the first match's index stays valid.
    let out = src.slice(0, second.index) + src.slice(second.index + second[0].length);
    out = out.slice(0, first.index) + `<h1>${keepText}</h1>` + out.slice(first.index + first[0].length);

    // Tidy the blank line the removed <h1> leaves behind.
    out = out.replace(/\n[ \t]*\n[ \t]*\n/g, '\n\n');

    if (APPLY) fs.writeFileSync(p, out, 'utf8');
    fixed++;
  }

  note(`A. h1 collapse       : ${fixed} fixed, ${already} already single-h1, ${skipped.length} skipped`);
  skipped.forEach(s => note(`     SKIPPED (manual): ${s}`));
}

/* ---------- B + C. remove duplicate-URL stubs ---------- */

function removeStubs() {
  const roots = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  const removed = [];

  for (const f of roots) {
    const base = f.slice(0, -5);
    const stub = path.join(ROOT, base, 'index.html');
    if (!fs.existsSync(stub)) continue;

    const richSize = fs.statSync(path.join(ROOT, f)).size;
    const stubSize = fs.statSync(stub).size;

    // 404/index.html is byte-identical to 404.html, so the size guard below
    // won't fire -- but it must go: it makes /404 return 200, a soft 404.
    // Cloudflare's 404 handling reads root 404.html and is unaffected.
    if (base === '404') {
      if (APPLY) fs.rmSync(path.join(ROOT, base), { recursive: true, force: true });
      removed.push(`404/  (soft-404 at /404; root 404.html retained)`);
      continue;
    }

    // Guard: never delete the larger of the pair. If the directory version is
    // the richer one, the assumption behind this script is wrong for that page.
    if (stubSize >= richSize) {
      note(`     KEPT (stub >= root, needs review): ${base}/index.html ${stubSize}B vs ${f} ${richSize}B`);
      continue;
    }

    if (APPLY) {
      fs.rmSync(path.join(ROOT, base), { recursive: true, force: true });
    }
    removed.push(`${base}/  (${stubSize}B stub vs ${richSize}B page)`);
  }

  note(`B+C. stub removal    : ${removed.length} directories`);
  removed.forEach(r => note(`     - ${r}`));
}

/* ---------- fix trailing-slash internal links ---------- */

function fixTrailingSlashLinks(basenames) {
  const targets = ['404.html'];
  let touched = 0;
  for (const t of targets) {
    const p = path.join(ROOT, t);
    if (!fs.existsSync(p)) continue;
    let src = fs.readFileSync(p, 'utf8');
    const before = src;
    for (const b of basenames) {
      src = src.split(`href="/${b}/"`).join(`href="/${b}"`);
    }
    if (src !== before) {
      if (APPLY) fs.writeFileSync(p, src, 'utf8');
      touched++;
    }
  }
  note(`     trailing-slash links rewritten in ${touched} file(s)`);
}

/* ---------- D. sitemap ---------- */

function syncSitemap() {
  const p = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(p, 'utf8');
  const present = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));

  // Root pages that are internally linked and canonical to themselves but
  // absent from the sitemap. Deliberately excludes
  // best-free-graphic-design-tools-2026 (0 inbound links, near-duplicate of
  // best-free-photo-graphic-design-tools-2026) -- that needs a human decision.
  const candidates = [
    'best-free-games-2026',
    'best-linux-distros-beginners-2026',
    'terms-of-service',
    'free-alternative-to-photoshop',
    'free-password-generator',
  ];

  const today = new Date().toISOString().slice(0, 10);
  const added = [];

  for (const slug of candidates) {
    if (!fs.existsSync(path.join(ROOT, `${slug}.html`))) continue;
    const loc = `${ORIGIN}/${slug}`;
    if (present.has(loc)) continue;
    added.push(
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );
  }

  if (added.length) {
    xml = xml.replace(/<\/urlset>/, added.join('\n') + '\n</urlset>');
    if (APPLY) fs.writeFileSync(p, xml, 'utf8');
  }

  const total = [...xml.matchAll(/<loc>/g)].length;
  note(`D. sitemap           : +${added.length} URLs (total ${total})`);
}

/* ---------- E. normalise directory-page URLs to trailing slash ---------- */

/**
 * Cloudflare Pages resolves the two storage layouts to opposite canonical forms:
 *   x.html          -> /x   is 200, /x/  and /x.html 308 to it
 *   x/index.html    -> /x/  is 200, /x   308s to it
 * Every directory-only page here was emitting a no-slash canonical and sitemap
 * entry, i.e. pointing search engines at a 308. Normalise to the 200 form.
 */
function normaliseDirUrls() {
  const dirPages = [];
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(ROOT, rel) || ROOT, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (/^(_next|node_modules|\.git|\.vs|\.github|\.bolt|fonts|docs|scripts|freeapps-components|reviews)$/.test(e.name)) continue;
      const sub = rel ? `${rel}/${e.name}` : e.name;
      if (fs.existsSync(path.join(ROOT, sub, 'index.html'))) dirPages.push(sub);
      else walk(sub);
    }
  };
  walk('');

  // reviews/index.html is a directory page too, but sits under the skipped dir.
  if (fs.existsSync(path.join(ROOT, 'reviews', 'index.html'))) dirPages.push('reviews');

  let metaFixed = 0;
  for (const slug of dirPages) {
    const p = path.join(ROOT, slug, 'index.html');
    let src = fs.readFileSync(p, 'utf8');
    const before = src;
    const bad = `${ORIGIN}/${slug}"`;
    const good = `${ORIGIN}/${slug}/"`;
    src = src.split(`href="${bad}`).join(`href="${good}`);      // canonical
    src = src.split(`content="${bad}`).join(`content="${good}`); // og:url / twitter
    if (src !== before) {
      if (APPLY) fs.writeFileSync(p, src, 'utf8');
      metaFixed++;
    }
  }

  // Sitemap: point at the 200 form.
  const smPath = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(smPath, 'utf8');
  let smFixed = 0;
  for (const slug of dirPages) {
    const bad = `<loc>${ORIGIN}/${slug}</loc>`;
    if (xml.includes(bad)) {
      xml = xml.split(bad).join(`<loc>${ORIGIN}/${slug}/</loc>`);
      smFixed++;
    }
  }
  if (smFixed && APPLY) fs.writeFileSync(smPath, xml, 'utf8');

  // Internal links: a no-slash href to a directory page costs a 308 hop.
  const htmlFiles = [];
  const collect = (rel) => {
    for (const e of fs.readdirSync(path.join(ROOT, rel) || ROOT, { withFileTypes: true })) {
      const sub = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (/^(_next|node_modules|\.git|\.vs|\.github|\.bolt|fonts|freeapps-components)$/.test(e.name)) continue;
        collect(sub);
      } else if (e.name.endsWith('.html')) htmlFiles.push(sub);
    }
  };
  collect('');

  let linkFiles = 0;
  for (const f of htmlFiles) {
    const p = path.join(ROOT, f);
    let src = fs.readFileSync(p, 'utf8');
    const before = src;
    for (const slug of dirPages) {
      src = src.split(`href="/${slug}"`).join(`href="/${slug}/"`);
    }
    if (src !== before) {
      if (APPLY) fs.writeFileSync(p, src, 'utf8');
      linkFiles++;
    }
  }

  note(`E. dir-page URLs     : ${dirPages.length} pages | ${metaFixed} canonical/og fixed | ${smFixed} sitemap entries | ${linkFiles} files relinked`);
  dirPages.forEach(d => note(`     /${d}/`));
}

/* ---------- run ---------- */

note(APPLY ? '=== APPLYING CHANGES ===' : '=== DRY RUN (pass --apply to write) ===');

const stubBases = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html'))
  .map(f => f.slice(0, -5))
  .filter(b => fs.existsSync(path.join(ROOT, b, 'index.html')));

collapseH1();
removeStubs();
fixTrailingSlashLinks(stubBases);
syncSitemap();
normaliseDirUrls();

note('\nDone. Re-run without --apply on a clean clone to preview.');
