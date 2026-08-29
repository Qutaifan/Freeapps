#!/usr/bin/env node
/**
 * apply_shared_stylesheet.js
 *
 * Replaces the duplicated inline <style> blocks that were pasted into every
 * page with a single <link> to /css/site.css.
 *
 * Only blocks whose content is *fully* reproduced by css/site.css are removed.
 * Those blocks are identified by an exact hash of the block text, not by a
 * pattern match, so a page whose CSS has drifted is left alone rather than
 * silently stripped. Pages carrying bespoke CSS are not touched at all and are
 * reported at the end as still needing conversion.
 *
 * Contract (AGENTS.md "Writing scripts"):
 *   - dry-run by default; writes only with --apply
 *   - prints exactly what changed, per file
 *   - idempotent: a second run is a no-op
 *   - ends with a verification reporting a number capable of being non-zero
 *
 * Usage:
 *   node scripts/apply_shared_stylesheet.js            # preview
 *   node scripts/apply_shared_stylesheet.js --apply    # write
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(__dirname, '..');
const LINK = '<link rel="stylesheet" href="/css/site.css" />';
const SKIP_DIRS = new Set(['.git', '_next', 'freeapps-components', 'node_modules', '.github', 'docs']);

/**
 * Style blocks that css/site.css reproduces in full. Hashes are the first 8
 * hex chars of the md5 of the entire <style>…</style> element.
 *
 *   4282f5b9  review template            125 pages
 *   b1362908  review template + .pill     12 pages
 *   a3c44ee1  review template (reindented) 1 page  (reviews/inkscape.html)
 *   f8cc5285  free-alternative template    18 pages
 */
const REPLACEABLE = new Map([
  ['4282f5b9', 'review template'],
  ['b1362908', 'review template (+.pill)'],
  ['a3c44ee1', 'review template (reindented)'],
  ['f8cc5285', 'free-alternative template'],
]);

const STYLE_RE = /[ \t]*<style[^>]*>[\s\S]*?<\/style>[ \t]*\n?/gi;

const hash = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);

/** Visible text of a document, with all CSS, JS and tags removed. */
function textOf(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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

const files = walk(ROOT).sort();

let converted = 0;
let alreadyDone = 0;
let removedBlocks = 0;
const bespoke = [];
const textMismatch = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const original = fs.readFileSync(file, 'utf8');

  const hasLink = original.includes('/css/site.css');
  const blocks = original.match(STYLE_RE) || [];
  const hits = blocks.filter((b) => REPLACEABLE.has(hash(b.trim())));

  if (hits.length === 0) {
    if (hasLink) alreadyDone++;
    else if (blocks.length) bespoke.push(rel);
    continue;
  }

  // Drop every replaceable block; put the link where the first one stood.
  let first = true;
  const updated = original.replace(STYLE_RE, (match) => {
    if (!REPLACEABLE.has(hash(match.trim()))) return match;
    removedBlocks++;
    if (first) {
      first = false;
      return hasLink ? '' : `  ${LINK}\n`;
    }
    return '';
  });

  // Verification per file: the swap is CSS-only, so visible text must be
  // byte-identical afterwards. AGENTS.md hard rule 4.
  if (textOf(original) !== textOf(updated)) {
    textMismatch.push(rel);
    continue;
  }

  const label = hits.map((b) => REPLACEABLE.get(hash(b.trim()))).join(', ');
  console.log(`${APPLY ? 'wrote  ' : 'would  '} ${rel}  —  removed ${hits.length} block(s): ${label}`);
  if (APPLY) fs.writeFileSync(file, updated, 'utf8');
  converted++;
}

console.log('');
console.log(`HTML files scanned .................. ${files.length}`);
console.log(`${APPLY ? 'Converted' : 'Would convert'} ...................... ${converted}`);
console.log(`Inline blocks removed ............... ${removedBlocks}`);
console.log(`Already linking site.css ............ ${alreadyDone}`);
console.log(`Still carrying bespoke CSS .......... ${bespoke.length}`);

if (textMismatch.length) {
  console.error('');
  console.error(`FAIL: ${textMismatch.length} file(s) would have lost or gained visible text:`);
  textMismatch.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}

// Verification: after --apply, no replaceable block may remain anywhere.
if (APPLY) {
  let leftover = 0;
  for (const file of files) {
    const blocks = fs.readFileSync(file, 'utf8').match(STYLE_RE) || [];
    leftover += blocks.filter((b) => REPLACEABLE.has(hash(b.trim()))).length;
  }
  console.log(`Replaceable blocks left on disk ..... ${leftover}`);
  if (leftover !== 0) {
    console.error('FAIL: replaceable blocks survived the rewrite.');
    process.exit(1);
  }
}

if (bespoke.length) {
  console.log('');
  console.log('Bespoke pages, still to convert by hand:');
  bespoke.forEach((f) => console.log(`  ${f}`));
}
