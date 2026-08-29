#!/usr/bin/env node
/**
 * unify_favicon_links.js
 *
 * Makes every page declare the same tab icon.
 *
 * Before this ran, the icon depended on which page you landed on:
 *   146 pages  <link rel="icon" type="image/jpeg" href="/logo.jpg">
 *    34 pages  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
 * and those same 146 also carried a SECOND apple-touch-icon pointing at the
 * JPEG, conflicting with the real /apple-touch-icon.png every page declares.
 *
 * After: one SVG icon everywhere, with the existing .ico kept as the fallback
 * for browsers that do not take SVG favicons, and a single apple-touch-icon.
 *
 * What this does NOT touch: og:image and twitter:image, which legitimately
 * point at /logo.jpg — social cards need a raster. Only the ICON links change.
 *
 * Contract (AGENTS.md "Writing scripts"):
 *   - dry-run by default; writes only with --apply
 *   - prints exactly what changed, per file
 *   - idempotent: a second run is a no-op
 *   - ends with a verification that reports a number capable of being non-zero
 *
 * Usage:
 *   node scripts/unify_favicon_links.js            # preview
 *   node scripts/unify_favicon_links.js --apply    # write
 */

'use strict';

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', '_next', 'freeapps-components', 'node_modules', '.github', 'docs']);

const SVG_LINK = '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />';

/* The JPEG icon, and the duplicate apple-touch-icon that shadowed the PNG.
 *
 * Each pattern consumes its own line and NOTHING beyond it. An earlier version
 * ended in `\s*\n?`, which swallowed the newline and then the NEXT line's
 * indentation — de-indenting whatever followed, and making the script
 * non-idempotent because every run nibbled a little more whitespace. Match
 * horizontal space and at most one line ending: `[ \t]*` … `[ \t]*\r?\n?`.
 */
const DROP = [
  /[ \t]*<link\s+rel="icon"\s+type="image\/jpeg"\s+href="\/logo\.jpg"\s*\/?>[ \t]*\r?\n?/gi,
  /[ \t]*<link\s+rel="apple-touch-icon"\s+href="\/logo\.jpg"\s*\/?>[ \t]*\r?\n?/gi,
];

/* Any existing SVG icon declaration, in the three spellings found in the repo. */
const EXISTING_SVG = /[ \t]*<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\/favicon\.svg"\s*\/?>[ \t]*\r?\n?/gi;

/* Anchor: the .ico fallback is present on every page, so the SVG goes before it. */
const ICO = /([ \t]*)<link\s+rel="alternate icon"\s+href="\/favicon\.ico"\s*\/?>/i;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), out);
    } else if (entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function textOf(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const files = walk(ROOT).sort();

let changed = 0;
let droppedJpeg = 0;
let addedSvg = 0;
const noAnchor = [];
const textMismatch = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;
  const notes = [];

  for (const re of DROP) {
    const before = updated;
    updated = updated.replace(re, '');
    if (updated !== before) { droppedJpeg++; notes.push('dropped logo.jpg icon link'); }
  }

  /* Normalise to exactly one canonical SVG link, placed before the .ico. */
  const hadSvg = EXISTING_SVG.test(updated);
  EXISTING_SVG.lastIndex = 0;
  updated = updated.replace(EXISTING_SVG, '');

  const m = updated.match(ICO);
  if (!m) {
    if (updated !== original) noAnchor.push(rel);
    continue;
  }
  /* Insert with the file's OWN line ending. index.html is CRLF while the rest
     of the repo is LF; hardcoding "\n" rewrote that one line to LF on every
     run, which flipped the ending back and forth and made this script
     non-idempotent. */
  const eol = /\r\n/.test(original) ? '\r\n' : '\n';
  updated = updated.replace(ICO, (full, indent) => `${indent}${SVG_LINK}${eol}${full}`);
  if (!hadSvg) { addedSvg++; notes.push('added SVG icon link'); }
  else notes.push('normalised SVG icon link');

  if (updated === original) continue;

  if (textOf(original) !== textOf(updated)) { textMismatch.push(rel); continue; }

  console.log(`${APPLY ? 'wrote  ' : 'would  '} ${rel}  —  ${notes.join(', ')}`);
  if (APPLY) fs.writeFileSync(file, updated, 'utf8');
  changed++;
}

console.log('');
console.log(`HTML files scanned .................. ${files.length}`);
console.log(`${APPLY ? 'Files changed' : 'Files that would change'} ............. ${changed}`);
console.log(`logo.jpg icon links removed ......... ${droppedJpeg}`);
console.log(`SVG icon links added ................ ${addedSvg}`);
if (noAnchor.length) {
  console.log(`No .ico anchor, skipped ............. ${noAnchor.length}`);
  noAnchor.forEach((f) => console.log(`  ${f}`));
}

if (textMismatch.length) {
  console.error('');
  console.error(`FAIL: ${textMismatch.length} file(s) would have lost or gained visible text:`);
  textMismatch.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}

// Verification: every page must declare exactly one SVG icon and no JPEG icon.
if (APPLY) {
  let wrong = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const s = fs.readFileSync(file, 'utf8');
    if (!ICO.test(s)) continue;   // pages without the .ico anchor are out of scope
    const svgCount = (s.match(/rel="icon"\s+type="image\/svg\+xml"/gi) || []).length;
    const jpegCount = (s.match(/rel="icon"\s+type="image\/jpeg"/gi) || []).length;
    const appleCount = (s.match(/rel="apple-touch-icon"/gi) || []).length;
    if (svgCount !== 1 || jpegCount !== 0 || appleCount !== 1) {
      wrong++;
      console.error(`  ${rel}: svg=${svgCount} jpeg=${jpegCount} apple=${appleCount}`);
    }
  }
  console.log(`Pages with wrong icon set ........... ${wrong}`);
  if (wrong !== 0) {
    console.error('FAIL: icon declarations are not uniform.');
    process.exit(1);
  }
}
