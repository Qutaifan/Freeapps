#!/usr/bin/env node
/**
 * fix_compliance.js
 *
 * Clears the two failures reported by .github/scripts/compliance.py:
 *
 *  1. adsense_loader (149) -- <meta name="google-adsense-account"> is present
 *     on only 15 of 163 pages. It is the account-verification tag, not an ad
 *     unit, so it belongs in the <head> of every page AdSense may serve on.
 *     Inserted directly after the charset meta, matching the placement on the
 *     pages that already have it.
 *
 *  2. conflicting_indexability_directives (1) -- 404.html carries both
 *     <meta name="robots" content="noindex"> (correct for a not-found page)
 *     and <meta name="robots" content="index, follow"> inherited from the
 *     Next.js root layout. The permissive one is removed; noindex stays.
 *
 * Dry-run by default; --apply to write.
 */

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();

const PUB_ID = 'ca-pub-9640734919758311';
const META = `<meta name="google-adsense-account" content="${PUB_ID}">`;

/* ---------- collect pages ---------- */

const files = [];
(function walk(rel) {
  for (const e of fs.readdirSync(path.join(ROOT, rel) || ROOT, { withFileTypes: true })) {
    const sub = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (/^(_next|node_modules|\.git|\.vs|\.github|\.bolt|fonts|freeapps-components)$/.test(e.name)) continue;
      walk(sub);
    } else if (e.name.endsWith('.html')) {
      files.push(sub);
    }
  }
})('');

/* ---------- 1. adsense account meta ---------- */

let added = 0, skipped = 0;
const noHead = [];

for (const f of files) {
  const p = path.join(ROOT, f);
  let src = fs.readFileSync(p, 'utf8');

  if (/name=["']google-adsense-account["']/i.test(src)) { skipped++; continue; }

  // Prefer just after the charset meta; fall back to just after <head>.
  const charset = src.match(/<meta[^>]*charset=[^>]*>/i);
  let out;
  if (charset) {
    const at = charset.index + charset[0].length;
    out = src.slice(0, at) + `\n  ${META}` + src.slice(at);
  } else {
    const head = src.match(/<head[^>]*>/i);
    if (!head) { noHead.push(f); continue; }
    const at = head.index + head[0].length;
    out = src.slice(0, at) + `\n  ${META}` + src.slice(at);
  }

  if (APPLY) fs.writeFileSync(p, out, 'utf8');
  added++;
}

/* ---------- 2. conflicting robots directives ---------- */

let robotsFixed = 0;
for (const f of files) {
  const p = path.join(ROOT, f);
  const src = fs.readFileSync(p, 'utf8');

  const tags = [...src.matchAll(/<meta[^>]*name=["']robots["'][^>]*>/gi)];
  if (tags.length < 2) continue;

  const hasNoindex = tags.some((t) => /noindex/i.test(t[0]));
  if (!hasNoindex) {
    console.log(`  ${f}: ${tags.length} robots tags but none noindex -- left alone, needs a human`);
    continue;
  }

  // Drop every permissive tag; keep the restrictive one.
  let out = src;
  for (const t of tags) {
    if (/noindex/i.test(t[0])) continue;
    out = out.replace(t[0], '');
    robotsFixed++;
  }
  if (APPLY) fs.writeFileSync(p, out, 'utf8');
  console.log(`  ${f}: removed permissive robots tag, kept noindex`);
}

/* ---------- output ---------- */

console.log(APPLY ? '=== APPLIED ===' : '=== DRY RUN (pass --apply to write) ===');
console.log(`  adsense meta added : ${added} pages (${skipped} already had it)`);
console.log(`  robots tags removed: ${robotsFixed}`);
if (noHead.length) console.log(`  no <head> found in : ${noHead.join(', ')}`);
if (!APPLY) console.log('\nNothing written. Pass --apply.');
