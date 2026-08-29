#!/usr/bin/env node
/**
 * add_motion_layer.js
 *
 * Wires /css/motion.css and /js/motion.js into every page that already links
 * the shared stylesheet, plus the one-line inline script that marks the
 * document as scripted.
 *
 * Why the inline line matters: motion.css hides revealed content only under
 * `html.js`. Setting that class from the deferred bundle would let content
 * paint, then hide, then animate. Setting it inline in <head> means the class
 * is present before first paint, and a page whose JS never loads simply shows
 * everything — which is the correct fallback.
 *
 * Contract (AGENTS.md "Writing scripts"):
 *   - dry-run by default; writes only with --apply
 *   - prints exactly what changed, per file
 *   - idempotent: a second run is a no-op
 *   - ends with a verification reporting a number capable of being non-zero
 *
 * Usage:
 *   node scripts/add_motion_layer.js            # preview
 *   node scripts/add_motion_layer.js --apply    # write
 */

'use strict';

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', '_next', 'freeapps-components', 'node_modules', '.github', 'docs']);

/** 404.html is deliberately minimal — no ad loader, no enhancement. */
const EXCLUDE = new Set(['404.html']);

const SITE_LINK_RE = /([ \t]*)<link rel="stylesheet" href="\/css\/site\.css"[^>]*>/i;

const BLOCK = (indent) => [
  `${indent}<link rel="stylesheet" href="/css/motion.css" />`,
  `${indent}<script>document.documentElement.className += ' js';</script>`,
  `${indent}<script src="/js/motion.js" defer></script>`,
].join('\n');

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
let skippedNoSite = 0;
const textMismatch = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (EXCLUDE.has(rel)) continue;

  const original = fs.readFileSync(file, 'utf8');

  if (original.includes('/js/motion.js')) continue;       // idempotent
  const m = original.match(SITE_LINK_RE);
  if (!m) { skippedNoSite++; continue; }

  const updated = original.replace(SITE_LINK_RE, (full) => `${full}\n${BLOCK(m[1])}`);

  if (textOf(original) !== textOf(updated)) { textMismatch.push(rel); continue; }

  console.log(`${APPLY ? 'wrote  ' : 'would  '} ${rel}`);
  if (APPLY) fs.writeFileSync(file, updated, 'utf8');
  changed++;
}

console.log('');
console.log(`HTML files scanned .................. ${files.length}`);
console.log(`${APPLY ? 'Files wired' : 'Files that would be wired'} ........... ${changed}`);
console.log(`Skipped, no site.css link ........... ${skippedNoSite}`);

if (textMismatch.length) {
  console.error('');
  console.error(`FAIL: ${textMismatch.length} file(s) would have lost or gained visible text:`);
  textMismatch.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}

// Verification: every page linking site.css must now also load the motion layer.
if (APPLY) {
  let missing = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (EXCLUDE.has(rel)) continue;
    const s = fs.readFileSync(file, 'utf8');
    if (!s.includes('/css/site.css')) continue;
    const ok = s.includes('/css/motion.css') && s.includes('/js/motion.js') && s.includes("className += ' js'");
    if (!ok) { missing++; console.error(`  incomplete: ${rel}`); }
  }
  console.log(`Pages missing the motion layer ...... ${missing}`);
  if (missing !== 0) {
    console.error('FAIL: motion layer not wired everywhere.');
    process.exit(1);
  }
}
