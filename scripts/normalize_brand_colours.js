#!/usr/bin/env node
/**
 * normalize_brand_colours.js
 *
 * Rewrites leftover purple brand hex values to the unified cyan palette.
 *
 * The purple came from a second design system that used to govern the pillar,
 * alternative, about and contact pages. css/site.css now defines the palette
 * for the whole site, but a handful of hex values are hardcoded directly in
 * markup — chiefly the cookie banner's link and button — where no stylesheet
 * can reach them.
 *
 * Scope: only files that already link /css/site.css. Pages still carrying
 * their own bespoke <style> block are left alone, because their purple may be
 * load-bearing for a layout this script cannot see. As those pages are
 * converted, re-running this picks them up.
 *
 * Contract (AGENTS.md "Writing scripts"):
 *   - dry-run by default; writes only with --apply
 *   - prints exactly what changed, per file
 *   - idempotent: a second run is a no-op
 *   - ends with a verification reporting a number capable of being non-zero
 *
 * Usage:
 *   node scripts/normalize_brand_colours.js            # preview
 *   node scripts/normalize_brand_colours.js --apply    # write
 */

'use strict';

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', '_next', 'freeapps-components', 'node_modules', '.github', 'docs']);

/** Old purple → unified cyan. Keys are lowercase; matching is case-insensitive. */
const COLOUR_MAP = new Map([
  ['#8a72e8', '#22D3EE'], // accent
  ['#7c5cf6', '#22D3EE'], // accent, free-password-generator variant
  ['#6c4ce6', '#38BDF8'], // accent hover
  ['#a78bfa', '#67E8F9'], // accent light
]);

/** Purple button backgrounds took white text; cyan needs black for contrast. */
const CONTRAST_FIX = [
  [/(#cookie-banner button\s*\{[^}]*?)color:\s*#fff\b/gi, '$1color:#000'],
];

const PURPLE_RE = new RegExp(`(${[...COLOUR_MAP.keys()].join('|')})\\b`, 'gi');

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

let changedFiles = 0;
let changedValues = 0;
let skippedBespoke = 0;
const textMismatch = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const original = fs.readFileSync(file, 'utf8');

  if (!original.includes('/css/site.css')) {
    if (PURPLE_RE.test(original)) skippedBespoke++;
    PURPLE_RE.lastIndex = 0;
    continue;
  }

  const counts = new Map();
  let updated = original.replace(PURPLE_RE, (match) => {
    const to = COLOUR_MAP.get(match.toLowerCase());
    counts.set(match.toLowerCase(), (counts.get(match.toLowerCase()) || 0) + 1);
    return to;
  });
  for (const [re, to] of CONTRAST_FIX) updated = updated.replace(re, to);

  if (updated === original) continue;

  if (textOf(original) !== textOf(updated)) {
    textMismatch.push(rel);
    continue;
  }

  const n = [...counts.values()].reduce((a, b) => a + b, 0);
  const detail = [...counts.entries()].map(([k, v]) => `${k}→${COLOUR_MAP.get(k)} x${v}`).join(', ');
  console.log(`${APPLY ? 'wrote  ' : 'would  '} ${rel}  —  ${detail}`);
  if (APPLY) fs.writeFileSync(file, updated, 'utf8');
  changedFiles++;
  changedValues += n;
}

console.log('');
console.log(`HTML files scanned .................. ${files.length}`);
console.log(`${APPLY ? 'Files changed' : 'Files that would change'} ............. ${changedFiles}`);
console.log(`Hex values rewritten ................ ${changedValues}`);
console.log(`Skipped, still bespoke .............. ${skippedBespoke}`);

if (textMismatch.length) {
  console.error('');
  console.error(`FAIL: ${textMismatch.length} file(s) would have lost or gained visible text:`);
  textMismatch.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}

// Verification: no page on the shared stylesheet may still contain purple.
if (APPLY) {
  let leftover = 0;
  for (const file of files) {
    const s = fs.readFileSync(file, 'utf8');
    if (!s.includes('/css/site.css')) continue;
    leftover += (s.match(PURPLE_RE) || []).length;
  }
  console.log(`Purple left on converted pages ...... ${leftover}`);
  if (leftover !== 0) {
    console.error('FAIL: purple survived the rewrite on a converted page.');
    process.exit(1);
  }
}
