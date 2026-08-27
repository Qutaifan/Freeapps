#!/usr/bin/env node
/**
 * insert_pillar_ads.js
 *
 * The rich pillar pages at the repo root carry no manual ad units -- the units
 * lived in the thin duplicate directories that were removed. This inserts
 * in-content units at safe positions.
 *
 * Placement rules (from the execution plan, section 6.2):
 *   - never before the first content section
 *   - top unit ~22% through the copy, mid unit ~62%
 *   - at least 400 words between units
 *   - pages under 1200 words get one unit only
 *   - never inside CTA / "you might also like" / related-links blocks
 *
 * Insertion is always immediately before a <section> tag, so the new <div> is a
 * sibling of existing sections and cannot break nesting.
 *
 * Dry-run by default (prints chosen positions); --apply to write.
 */

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const CLIENT = 'ca-pub-9640734919758311';

const SLOT_TOP = '5215765247'; // qutaifan-pillar-top
const SLOT_MID = '2070727152'; // qutaifan-pillar-mid

const PAGES = [
  'best-free-ai-tools-2026.html',
  'best-open-source-software-alternatives-2026.html',
  'best-free-ai-writing-tools-2026.html',
  'best-free-password-managers-2026.html',
  'best-free-video-editing-software-2026.html',
  'best-free-games-2026.html',
  'best-linux-distros-beginners-2026.html',
  'best-free-graphic-design-tools-2026.html',
  'free-alternative-to-photoshop.html',
  'free-password-generator.html',
  'index.html',
];

// Trailing related-links / CTA blocks. Phrase alone is not enough --
// "Stop paying for the operating system you do not need" is a real content
// heading mid-article, and "Start with the" substring-matches "Start with
// these three free picks". So a section only counts as tail when it ALSO sits
// in the last quarter of the page's sections.
const TAIL_PHRASE = /(you might also like|more free tools we reviewed|more free-first qutaifan|more independent qutaifan|do not buy a new|stop paying for capacity|start with the free ai stack|start with the lowest-risk|try one before you cancel)/i;
const TAIL_ZONE = 0.75; // only sections past this fraction of the list qualify

const TOP_PCT = 0.22;
const MID_PCT = 0.62;
const MIN_GAP_WORDS = 400;
const SINGLE_UNIT_BELOW = 1200;

const adBlock = (slot) =>
`<div class="ad-slot-container">
          <span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-muted);display:block;margin-bottom:0.5rem;">SPONSORED ADVERTISEMENT</span>
          <ins class="adsbygoogle"
               style="display:block; min-height: 250px;"
               data-ad-client="${CLIENT}"
               data-ad-slot="${slot}"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>
        `;

const strip = (h) =>
  h.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]*>/g, ' ');
const wc = (h) => strip(h).split(/\s+/).filter(Boolean).length;

let totalInserted = 0;

for (const file of PAGES) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) { console.log(`  SKIP (missing): ${file}`); continue; }

  const src = fs.readFileSync(p, 'utf8');

  if (src.includes('<ins class="adsbygoogle"')) {
    console.log(`  SKIP (already has units): ${file}`);
    continue;
  }

  const bodyStart = src.indexOf('<body');
  const starts = [...src.matchAll(/<section\b[^>]*>/g)]
    .map((m) => m.index)
    .filter((i) => i > bodyStart);

  if (starts.length < 3) { console.log(`  SKIP (too few sections): ${file}`); continue; }

  // Candidate = every section boundary, with cumulative words before it.
  const candidates = starts.map((pos, i) => {
    const end = starts[i + 1] ?? src.length;
    const seg = src.slice(pos, end);
    const h2 = seg.match(/<h2[^>]*>([\s\S]{0,90}?)<\/h2>/);
    const title = h2 ? strip(h2[1]).trim() : '';
    return {
      pos,
      cum: wc(src.slice(bodyStart, pos)),
      title,
      tail: TAIL_PHRASE.test(title) && i >= starts.length * TAIL_ZONE,
    };
  });

  // Content length excludes the trailing CTA run.
  const firstTail = candidates.findIndex((c) => c.tail);
  const contentEnd =
    firstTail > 0 ? candidates[firstTail].cum : wc(src.slice(bodyStart));

  // Eligible: not the first content section, not a tail block, inside content.
  // Prefer boundaries that open a titled section -- an untitled <section> is
  // usually a layout wrapper, and an ad reads as misplaced there.
  const all = candidates.filter((c, i) => i >= 2 && !c.tail && c.cum < contentEnd);
  const titled = all.filter((c) => c.title);
  const eligible = titled.length ? titled : all;
  if (!eligible.length) { console.log(`  SKIP (no eligible boundary): ${file}`); continue; }

  const nearest = (pct) =>
    eligible.reduce((best, c) =>
      Math.abs(c.cum - contentEnd * pct) < Math.abs(best.cum - contentEnd * pct) ? c : best
    );

  const picks = [];
  const top = nearest(TOP_PCT);
  picks.push({ ...top, slot: SLOT_TOP, label: 'top' });

  if (contentEnd >= SINGLE_UNIT_BELOW) {
    const mid = nearest(MID_PCT);
    if (mid.pos !== top.pos && Math.abs(mid.cum - top.cum) >= MIN_GAP_WORDS) {
      picks.push({ ...mid, slot: SLOT_MID, label: 'mid' });
    }
  }

  console.log(`\n  ${file}  (${contentEnd}w content)`);
  picks.forEach((k) =>
    console.log(
      `     ${k.label}: @${k.pos} — ${Math.round((k.cum / contentEnd) * 100)}% — before "${k.title || '(no h2)'}"`
    )
  );

  if (APPLY) {
    let out = src;
    // Insert back-to-front so earlier offsets stay valid.
    for (const k of [...picks].sort((a, b) => b.pos - a.pos)) {
      out = out.slice(0, k.pos) + adBlock(k.slot) + out.slice(k.pos);
    }
    fs.writeFileSync(p, out, 'utf8');
  }
  totalInserted += picks.length;
}

console.log(
  `\n${APPLY ? 'INSERTED' : 'WOULD INSERT'} ${totalInserted} ad units across pillar pages.`
);
if (!APPLY) console.log('Pass --apply to write.');
