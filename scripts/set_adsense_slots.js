#!/usr/bin/env node
/**
 * set_adsense_slots.js
 *
 * Replaces every placeholder AdSense slot ID with the real unit IDs, and
 * adds a min-height guard to any <ins> that lacks one.
 *
 * Slot assignment:
 *   reviews/<slug>.html   -> review-in-article  (one unit per page)
 *   every other page      -> 1st unit = pillar-top, 2nd unit = pillar-mid
 *
 * Only edits existing <ins class="adsbygoogle"> elements. It does not insert
 * new ad units and does not touch anything inside an HTML comment.
 *
 * Dry-run by default; pass --apply to write.
 */

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();

const SLOTS = {
  reviewInArticle: '7794395344',
  pillarTop:       '5215765247',
  pillarMid:       '2070727152',
};

// Every fake value seen in the repo.
const PLACEHOLDERS = new Set(['1234567890', '0987654321', 'auto', 'YOUR_REAL_SLOT_ID']);

const MIN_HEIGHT = 'min-height:250px';

/* ---------- collect html files ---------- */

const files = [];
(function walk(rel) {
  for (const e of fs.readdirSync(path.join(ROOT, rel) || ROOT, { withFileTypes: true })) {
    const sub = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (/^(_next|node_modules|\.git|\.vs|\.github|\.bolt|fonts|freeapps-components|temp_orig)$/.test(e.name)) continue;
      walk(sub);
    } else if (e.name.endsWith('.html')) {
      files.push(sub);
    }
  }
})('');

/* ---------- helpers ---------- */

// Ranges covered by HTML comments, so we can leave commented-out markup alone.
function commentRanges(src) {
  const out = [];
  const re = /<!--[\s\S]*?-->/g;
  let m;
  while ((m = re.exec(src))) out.push([m.index, m.index + m[0].length]);
  return out;
}
const inside = (ranges, i) => ranges.some(([a, b]) => i >= a && i < b);

function slotsFor(file) {
  const isReview = file.startsWith('reviews/') && path.basename(file) !== 'index.html';
  return isReview
    ? [SLOTS.reviewInArticle]
    : [SLOTS.pillarTop, SLOTS.pillarMid];
}

/* ---------- rewrite ---------- */

let filesChanged = 0, slotsSet = 0, guardsAdded = 0, skippedComment = 0;
const report = [];

for (const file of files) {
  const p = path.join(ROOT, file);
  const src = fs.readFileSync(p, 'utf8');
  if (!src.includes('<ins class="adsbygoogle"')) continue;

  const ranges = commentRanges(src);
  const plan = slotsFor(file);
  let unitIndex = 0, changed = false;
  const detail = [];

  const out = src.replace(/<ins class="adsbygoogle"[\s\S]*?<\/ins>/g, (block, offset) => {
    if (inside(ranges, offset)) { skippedComment++; return block; }

    // Pages with more units than planned slots reuse the last one.
    const target = plan[Math.min(unitIndex, plan.length - 1)];
    unitIndex++;

    let next = block;

    const slotMatch = block.match(/data-ad-slot="([^"]*)"/);
    if (slotMatch) {
      const current = slotMatch[1];
      if (current !== target) {
        if (!PLACEHOLDERS.has(current) && /^\d{6,}$/.test(current)) {
          detail.push(`kept real slot ${current} (not a placeholder)`);
          return block;
        }
        next = next.replace(/data-ad-slot="[^"]*"/, `data-ad-slot="${target}"`);
        slotsSet++;
        changed = true;
        detail.push(`${current} -> ${target}`);
      }
    }

    // CLS guard: reserve height on the <ins> itself.
    if (!/min-height/.test(next)) {
      if (/style="[^"]*"/.test(next)) {
        next = next.replace(/style="([^"]*)"/, (s, css) => {
          const sep = css.trim().endsWith(';') || css.trim() === '' ? '' : ';';
          return `style="${css}${sep}${MIN_HEIGHT}"`;
        });
      } else {
        next = next.replace('<ins class="adsbygoogle"', `<ins class="adsbygoogle" style="display:block;${MIN_HEIGHT}"`);
      }
      guardsAdded++;
      changed = true;
      detail.push('+min-height');
    }

    return next;
  });

  if (changed) {
    if (APPLY) fs.writeFileSync(p, out, 'utf8');
    filesChanged++;
    if (!file.startsWith('reviews/') || path.basename(file) === 'index.html') {
      report.push(`  ${file}: ${detail.join(', ')}`);
    }
  }
}

/* ---------- output ---------- */

console.log(APPLY ? '=== APPLYING ===' : '=== DRY RUN (pass --apply to write) ===');
console.log(`files changed : ${filesChanged}`);
console.log(`slots set     : ${slotsSet}`);
console.log(`CLS guards    : ${guardsAdded}`);
console.log(`left in comments (untouched): ${skippedComment}`);
if (report.length) {
  console.log('\nnon-review pages:');
  report.forEach(r => console.log(r));
}

/* ---------- verification ---------- */

let remaining = 0;
for (const file of files) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const live = src.replace(/<!--[\s\S]*?-->/g, '');
  for (const m of live.matchAll(/data-ad-slot="([^"]*)"/g)) {
    if (PLACEHOLDERS.has(m[1])) { remaining++; console.log(`  STILL PLACEHOLDER: ${file} -> ${m[1]}`); }
  }
}
console.log(`\nplaceholder slots remaining in live markup: ${remaining}`);
