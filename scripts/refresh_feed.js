#!/usr/bin/env node
/**
 * Refresh feed.xml against the current sitemap.
 *
 * The sitemap is the source of truth for which URLs are indexable (after the
 * lifecycle sync, scripts/fix_lifecycle_exposure.py keeps it in lock-step with
 * each review's computed content-quality lifecycle). This script makes the RSS
 * feed match: every /reviews/<slug> URL present in the sitemap gets a feed
 * item, using the review page's own <title> and the canonical tools.json
 * blurb as the description. Existing hand-written items are left untouched.
 *
 * Conventions (AGENTS.md/CLAUDE.md):
 *   * dry-run by default, writes only with --apply
 *   * prints exactly what changed, per item
 *   * idempotent - a second run is a no-op
 *   * verifies at the end and reports numbers that can be non-zero
 *
 * Usage:
 *     node scripts/refresh_feed.js
 *     node scripts/refresh_feed.js --apply
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function decodeEntities(s) {
  // Page <title> content arrives with HTML entities (&amp;, &#8212;, ...).
  // Decode them once so escapeXml can re-encode them as XML text.
  return String(s)
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026');
}

function main() {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');

  const lastmodFor = {};
  for (const m of sitemap.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g)) {
    lastmodFor[m[1]] = m[2];
  }

  const reviewLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => /\/reviews\/[^/]+$/.test(u));

  const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools.json'), 'utf8'));
  const blurbBySlug = new Map(tools.map((t) => [t.slug, t.blurb]));

  const feedPath = path.join(ROOT, 'feed.xml');
  const feed = fs.readFileSync(feedPath, 'utf8');
  const knownLinks = new Set([...feed.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]));

  const missing = [];
  for (const loc of reviewLocs) {
    if (knownLinks.has(loc)) continue;
    const slug = loc.split('/').pop();
    const page = path.join(ROOT, 'reviews', `${slug}.html`);
    if (!fs.existsSync(page)) {
      console.log(`SKIP ${loc}: no page file (reviews/${slug}.html)`);
      continue;
    }
    const html = fs.readFileSync(page, 'utf8');
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (!titleMatch) {
      console.log(`SKIP ${loc}: page has no <title>`);
      continue;
    }
    missing.push({
      title: decodeEntities(titleMatch[1].trim()),
      loc,
      pubDate: lastmodFor[loc] || new Date().toISOString().slice(0, 10),
      description: blurbBySlug.get(slug) || 'Independent review of a free and open-source tool.',
    });
  }

  if (missing.length === 0) {
    console.log('feed.xml already contains every sitemap review URL. Nothing to do.');
    return 0;
  }

  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'}: ${missing.length} sitemap review URL(s) missing from feed.xml`);
  for (const item of missing) {
    console.log(`  + ${item.loc} (${item.pubDate}) ${item.title.slice(0, 70)}`);
  }

  if (!APPLY) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const itemsXml = missing
    .map(
      (i) =>
        `    <item>\n` +
        `      <title>${escapeXml(i.title)}</title>\n` +
        `      <link>${escapeXml(i.loc)}</link>\n` +
        `      <guid>${escapeXml(i.loc)}</guid>\n` +
        `      <pubDate>${i.pubDate}</pubDate>\n` +
        `      <description>${escapeXml(i.description)}</description>\n` +
        `    </item>`
    )
    .join('\n');

  let updated = feed.replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/, `<lastBuildDate>${today}</lastBuildDate>`);
  updated = updated.replace('  </channel>', itemsXml + '\n  </channel>');
  fs.writeFileSync(feedPath, updated, 'utf8');

  const after = fs.readFileSync(feedPath, 'utf8');
  const itemCount = (after.match(/<item>/g) || []).length;
  const closeCount = (after.match(/<\/item>/g) || []).length;
  const linkCount = (after.match(/<link>https:\/\/www\.qutaifan\.com/g) || []).length;
  console.log(`\nVERIFICATION: ${itemCount} items, ${closeCount} </item> tags, ${linkCount} links, balanced=${itemCount === closeCount}.`);
  if (itemCount !== closeCount) {
    console.log('FAIL: item tags are not balanced.');
    return 1;
  }
  console.log('Second run of this script is now a no-op (idempotent).');
  return 0;
}

process.exit(main());
