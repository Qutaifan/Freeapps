#!/usr/bin/env node
/**
 * unify_bespoke_pages.js
 *
 * Brings the pages that carry their own bespoke <style> block onto the unified
 * palette without touching their layout.
 *
 * These pages — the pillar guides, the tool pages, about/contact and the legal
 * set — each define a private component system (chip filter rows, gradient
 * headlines, category colour coding) that no shared stylesheet reproduces.
 * Deleting their CSS the way apply_shared_stylesheet.js does for the templated
 * pages would break them. So this script does two narrower things instead:
 *
 *   1. Links /css/site.css ahead of the page's own block, so the shared base,
 *      brand lockup and component defaults apply and the page block still wins
 *      on anything it defines itself.
 *   2. Retunes the colour *values* in the page's block from the old purple
 *      system to the unified cyan one. Structure, spacing and layout are
 *      untouched — only colours change.
 *
 * Category coding colours (amber, green, red, pink) are deliberately NOT
 * mapped: they carry meaning on the pillar pages and are not brand colour.
 *
 * Contract (AGENTS.md "Writing scripts"):
 *   - dry-run by default; writes only with --apply
 *   - prints exactly what changed, per file
 *   - idempotent: a second run is a no-op
 *   - ends with a verification reporting a number capable of being non-zero
 *
 * Usage:
 *   node scripts/unify_bespoke_pages.js            # preview
 *   node scripts/unify_bespoke_pages.js --apply    # write
 */

'use strict';

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(__dirname, '..');
const LINK = '<link rel="stylesheet" href="/css/site.css" />';
const SKIP_DIRS = new Set(['.git', '_next', 'freeapps-components', 'node_modules', '.github', 'docs']);

/**
 * 404.html is excluded on purpose. It carries the Next.js error-page styling,
 * has no AdSense loader and no ad units, and the compliance gate exempts it
 * for exactly that reason (AGENTS.md §5). Leave it alone.
 */
const EXCLUDE = new Set(['404.html']);

/** Old surface / text / brand hexes → unified cyan system. */
const HEX = new Map([
  // surfaces
  ['#121216', '#0A0A0B'], ['#0e0e12', '#0A0A0B'], ['#09090b', '#0A0A0B'], ['#08080a', '#0A0A0B'],
  ['#1a1a20', '#111113'], ['#1f1f27', '#1F1F23'], ['#22222a', '#18181B'],
  // text
  ['#e7e7ec', '#F4F4F5'], ['#a8a8b5', '#A1A1AA'], ['#9e9ea9', '#A1A1AA'],
  ['#a0a0ab', '#A1A1AA'], ['#85858f', '#71717A'],
  // brand — purple became the secondary cyan so two-stop gradients survive
  ['#8a72e8', '#38BDF8'], ['#7c5cf6', '#38BDF8'], ['#6c4ce6', '#0EA5E9'],
  ['#a78bfa', '#67E8F9'], ['#c4b5fd', '#A5F3FC'],
  // second wave: violets found by hue audit rather than by known value —
  // gradient headlines, primary buttons, links, eyebrows and table headers,
  // all of which read as brand rather than as meaning
  ['#9333ea', '#0EA5E9'], ['#c084fc', '#67E8F9'],
  ['#a999ff', '#22D3EE'], ['#d8d2ff', '#67E8F9'],
  ['#c8bdff', '#67E8F9'], ['#d8d0ff', '#A5F3FC'],
  // the muddier cyan the pillar pages used, promoted to the brand cyan
  ['#29b8d6', '#22D3EE'],
]);

/**
 * Category coding colours are deliberately absent from the map above.
 * Green, amber, orange and pink mark free / limited / caution / new on the
 * pillar pages — they carry meaning, not brand, and flattening them to cyan
 * would delete information from the page.
 */

/** Same substitutions for rgba() triples. */
const RGBA = new Map([
  ['138,114,232', '56,189,248'],  // purple
  ['124,92,246', '56,189,248'],
  ['41,184,214', '34,211,238'],   // old cyan
  ['147,51,234', '56,189,248'],   // the violet wash behind .badge-local
  ['18,18,22', '10,10,11'],       // old page background
  ['8,8,10', '10,10,11'],
  ['9,9,11', '10,10,11'],
]);

const HEX_RE = /#[0-9a-fA-F]{6}\b/g;

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
let linksAdded = 0;
let coloursRetuned = 0;
const textMismatch = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (EXCLUDE.has(rel)) continue;

  const original = fs.readFileSync(file, 'utf8');

  let updated = original;
  let addedLink = false;
  let n = 0;

  // Pages already fully on the shared sheet have no <style> block left to sit
  // in front of, but they can still carry legacy colours in style="" attributes
  // — the cookie banner is inlined that way — so they go through the retune.
  if (!updated.includes('/css/site.css') && /<style[^>]*>/i.test(updated)) {
    updated = updated.replace(/(\n[ \t]*)(<style)/i, `$1${LINK}$1$2`);
    addedLink = updated !== original;
  }

  updated = updated.replace(HEX_RE, (m) => {
    const to = HEX.get(m.toLowerCase());
    if (!to) return m;
    n++;
    return to;
  });

  for (const [from, to] of RGBA) {
    const re = new RegExp(`rgba\\(\\s*${from.replace(/,/g, '\\s*,\\s*')}\\s*,`, 'g');
    const before = updated;
    updated = updated.replace(re, `rgba(${to},`);
    if (updated !== before) n += (before.match(re) || []).length;
  }

  if (updated === original) continue;

  if (textOf(original) !== textOf(updated)) {
    textMismatch.push(rel);
    continue;
  }

  const bits = [];
  if (addedLink) bits.push('linked site.css');
  if (n) bits.push(`${n} colour value(s) retuned`);
  console.log(`${APPLY ? 'wrote  ' : 'would  '} ${rel}  —  ${bits.join(', ')}`);
  if (APPLY) fs.writeFileSync(file, updated, 'utf8');
  changed++;
  if (addedLink) linksAdded++;
  coloursRetuned += n;
}

console.log('');
console.log(`HTML files scanned .................. ${files.length}`);
console.log(`${APPLY ? 'Files changed' : 'Files that would change'} ............. ${changed}`);
console.log(`site.css links added ................ ${linksAdded}`);
console.log(`Colour values retuned ............... ${coloursRetuned}`);

if (textMismatch.length) {
  console.error('');
  console.error(`FAIL: ${textMismatch.length} file(s) would have lost or gained visible text:`);
  textMismatch.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}

// Verification: every page bar the excluded ones must link the shared sheet,
// and no mapped legacy colour may survive anywhere.
if (APPLY) {
  let unlinked = 0;
  let legacy = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (EXCLUDE.has(rel)) continue;
    const s = fs.readFileSync(file, 'utf8');
    if (!s.includes('/css/site.css')) { unlinked++; console.error(`  unlinked: ${rel}`); }
    legacy += (s.match(HEX_RE) || []).filter((h) => HEX.has(h.toLowerCase())).length;
  }
  console.log(`Pages not linking site.css .......... ${unlinked}`);
  console.log(`Legacy colour values left ........... ${legacy}`);
  if (unlinked !== 0 || legacy !== 0) {
    console.error('FAIL: unification incomplete.');
    process.exit(1);
  }
}
