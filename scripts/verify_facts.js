#!/usr/bin/env node
/**
 * verify_facts.js — gate for docs/facts/*.json
 *
 * Five consecutive agent runs answered their own checklist correctly while shipping:
 *   run 1  a fabricated metric (per_page cap read as a 90-day count)
 *   run 2  five citations to pages never fetched
 *   run 3  an invented price ($14.99 that appears nowhere)
 *   run 4  a watermark claim sourced to an Apache-2.0 licence file
 *   run 5  Windsurf documented entirely from Devin's docs, and a Twitter meta tag
 *          (content="@StackBlitz") cited as evidence for pricing, tiers and status
 *
 * Each check below exists because of one of those. The script is mechanical.
 * It cannot be reasoned around, and it must never be edited to make a batch pass.
 *
 *   node scripts/verify_facts.js
 *   node scripts/verify_facts.js --verbose
 *
 * Exit 0 = clean. Exit 1 = at least one FAIL.
 */

const fs = require('fs');
const path = require('path');

const FACTS_DIR = path.join(__dirname, '..', 'docs', 'facts');
const VERBOSE = process.argv.includes('--verbose');

const FORBIDDEN_KEYS = ['description', 'summary', 'intro', 'verdict', 'pros', 'cons', 'blurb', 'review'];
const BANNED_WORDS = [
  'powerful', 'seamless', 'intuitive', 'best-in-class', 'cutting-edge', 'robust',
  'game-changing', 'revolutionary', 'user-friendly', 'feature-rich', 'blazing',
  'effortless', 'stunning', 'elegant', 'must-have',
];
const REQUIRED_TOP = ['slug', 'name', 'verified_at', 'official_url', 'fetch_log', 'license', 'activity'];
const MAX_WORDS_PER_VALUE = 22;
const MIN_EVIDENCE_CHARS = 12;
const LOW_ACTIVITY_THRESHOLD = 20;
const MAX_EVIDENCE_REUSE = 2;

// An OSI licence file governs redistribution, not price or quotas - citing one for
// pricing was a real defect ("zero watermarks or export caps" sourced to Apache-2.0).
// But a COMMERCIAL licence is different: for open-core projects the proprietary
// licence text IS where the limit lives ("production use requires an active paid
// subscription", Stirling-PDF app/proprietary/LICENSE). Exempt those paths only.
const LEGAL_TEXT_PATTERN = /\/(LICENSE|COPYING)(\.txt|\.md)?$/i;
const COMMERCIAL_LICENCE_PATTERN = /(proprietary|commercial|enterprise|eula)/i;
const CLAIM_PATHS_NEEDING_PRODUCT_SOURCE = /^(tiers|free_tier_limits|pricing_model|account_required|platforms)/;

/** Evidence that is markup, boilerplate, or the query itself — not page content. */
const JUNK_EVIDENCE = [
  { re: /content\s*=\s*["']/i, why: 'HTML meta-tag attribute, not page content' },
  { re: /href\s*=\s*["']/i, why: 'HTML link attribute, not page content' },
  { re: /class\s*=\s*["']?[a-z0-9_\-]/i, why: 'HTML class attribute markup, not page content' },
  { re: /^\s*https?:\/\/[^\s"']+\s*$/i, why: 'bare URL — does not establish facts about a tool' },
  { re: /^\s*(api_key\s*=|const\s+|let\s+|var\s+|import\s+|export\s+|def\s+|class\s+|function\s+|curl\s+-\w|\w+\s*=\s*os\.environ|\w+\s*=\s*process\.env)|\bos\.environ\b|\bprocess\.env\b/i, why: 'code snippet, not editorial or factual prose' },
  { re: /^\s*GET\s+\//i, why: 'the API query itself — circular, not page content' },
  { re: /^\s*<[a-z]/i, why: 'raw HTML tag' },
  { re: /^[\w.\- ]+\s[-|]\s[\w.\- ]+$/i, why: 'looks like a page <title>, which supports no specific claim' },
];

/** Other products that must not appear in a tool's evidence. Extend as needed. */
const KNOWN_OTHER_PRODUCTS = [
  'Devin', 'Firecrawl', 'Codeium Extensions', 'MotherDuck', 'Elevenreader',
];

let failures = 0;
let warnings = 0;
const fail = (slug, msg) => { console.log(`  FAIL  [${slug}] ${msg}`); failures++; };
const warn = (slug, msg) => { console.log(`  WARN  [${slug}] ${msg}`); warnings++; };

function* walkStrings(node, trail = '') {
  if (typeof node === 'string') { yield [trail, node]; return; }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* walkStrings(node[i], `${trail}[${i}]`);
    return;
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) yield* walkStrings(node[k], trail ? `${trail}.${k}` : k);
  }
}

function collectSourceBearers(node, trail = '', out = []) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectSourceBearers(v, `${trail}[${i}]`, out));
    return out;
  }
  if (node && typeof node === 'object') {
    if (typeof node.source === 'string') out.push([trail, node]);
    for (const k of Object.keys(node)) {
      if (k === 'source') continue;
      collectSourceBearers(node[k], trail ? `${trail}.${k}` : k, out);
    }
  }
  return out;
}

function findForbiddenKeys(node, trail = '', out = []) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => findForbiddenKeys(v, `${trail}[${i}]`, out));
    return out;
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      const p = trail ? `${trail}.${k}` : k;
      if (FORBIDDEN_KEYS.includes(k.toLowerCase())) out.push(p);
      findForbiddenKeys(node[k], p, out);
    }
  }
  return out;
}

/** Numbers and currency amounts appearing in a claimed value. */
function significantNumbers(val) {
  if (typeof val !== 'string') return [];
  const out = [];
  for (const m of val.matchAll(/\d[\d,.]*/g)) {
    const n = m[0].replace(/[,.]$/, '');
    // '0' is excluded: a $0 price is legitimately evidenced by the word 'Free'.
    if (n.replace(/\D/g, '').length >= 1 && !/^(0|1|2|3)$/.test(n)) out.push(n);
  }
  return [...new Set(out)];
}

function checkFile(file) {
  const slug = path.basename(file, '.json');
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { fail(slug, `unparseable JSON — ${e.message}`); return null; }

  for (const k of REQUIRED_TOP) if (!(k in data)) fail(slug, `missing required field "${k}"`);

  const log = Array.isArray(data.fetch_log) ? data.fetch_log : [];
  if (!log.length) fail(slug, 'fetch_log is empty or missing');
  if (log.length === 1) {
    fail(slug, 'only ONE source fetched for the entire tool — a single page cannot establish licence, pricing, platforms and status');
  }
  const ok200 = new Set();
  log.forEach((e, i) => {
    if (!e || typeof e.url !== 'string') { fail(slug, `fetch_log[${i}] has no url`); return; }
    if (typeof e.status !== 'number') fail(slug, `fetch_log[${i}] (${e.url}) has no numeric status`);
    if (typeof e.bytes !== 'number') fail(slug, `fetch_log[${i}] (${e.url}) has no byte count`);
    else if (e.bytes < 50 && e.status === 200) warn(slug, `fetch_log entry ${e.url} returned only ${e.bytes} bytes — likely an empty response`);
    if (e.status === 200) ok200.add(e.url.replace(/\/+$/, ''));
  });

  const bearers = collectSourceBearers(data);
  let unbacked = 0, noEvidence = 0, junk = 0;
  const evidenceUse = new Map();

  for (const [p, obj] of bearers) {
    const url = obj.source;
    const norm = url.replace(/\/+$/, '');

    if (!ok200.has(norm)) { fail(slug, `citation not backed by a logged 200 — ${p} -> ${url}`); unbacked++; }
    else if (VERBOSE) console.log(`  ok    [${slug}] ${p} -> ${url}`);

    const ev = typeof obj.evidence === 'string' ? obj.evidence.trim() : '';
    if (ev.length < MIN_EVIDENCE_CHARS) {
      fail(slug, `missing or too-short "evidence" at ${p} (need the supporting substring from ${url})`);
      noEvidence++;
    } else {
      // junk evidence: markup, titles, the query itself
      for (const j of JUNK_EVIDENCE) {
        if (j.re.test(ev)) { fail(slug, `evidence at ${p} is ${j.why} — "${ev.slice(0, 50)}"`); junk++; break; }
      }
      // cross-product contamination
      for (const other of KNOWN_OTHER_PRODUCTS) {
        if (new RegExp(`\\b${other}\\b`, 'i').test(ev) && !new RegExp(`\\b${other}\\b`, 'i').test(data.name || '')) {
          fail(slug, `evidence at ${p} describes a DIFFERENT product ("${other}") — wrong source page`);
        }
      }
      // the claimed number must appear in its own evidence
      const vals = [obj.value, obj.price, obj.limit].filter((v) => typeof v === 'string');
      for (const v of vals) {
        for (const n of significantNumbers(v)) {
          if (!ev.includes(n)) {
            // WARN, not FAIL. As a hard failure this rule can be satisfied by
            // deleting the number from the claim - which is exactly what happened:
            // "capped at 7 messages per day" became "capped at a daily message
            // threshold" and the finding was lost. Surface it; never force the fix.
            warn(slug, `value at ${p} claims "${n}" but its evidence does not contain it - re-source it, do NOT delete the number - "${ev.slice(0, 50)}"`);
          }
        }
      }
      evidenceUse.set(ev, (evidenceUse.get(ev) || 0) + 1);
    }

    if (CLAIM_PATHS_NEEDING_PRODUCT_SOURCE.test(p) && LEGAL_TEXT_PATTERN.test(norm) && !COMMERCIAL_LICENCE_PATTERN.test(norm)) {
      fail(slug, `${p} cites a licence file — licence text cannot establish pricing, limits, accounts or platforms`);
    }
  }

  for (const [ev, n] of evidenceUse) {
    if (n > MAX_EVIDENCE_REUSE) {
      fail(slug, `same evidence reused for ${n} unrelated fields — one substring cannot support them all: "${ev.slice(0, 50)}"`);
    }
  }

  for (const p of findForbiddenKeys(data)) fail(slug, `forbidden key present: ${p}`);

  for (const [p, v] of walkStrings(data)) {
    if (p.startsWith('fetch_log') || /evidence/.test(p)) continue;
    const lower = v.toLowerCase();
    for (const w of BANNED_WORDS) if (new RegExp(`\\b${w}\\b`).test(lower)) fail(slug, `banned adjective "${w}" in ${p}`);
    const words = v.trim().split(/\s+/).length;
    if (words > MAX_WORDS_PER_VALUE && !p.startsWith('license') && !/^https?:/.test(v)) {
      warn(slug, `value reads like prose (${words} words) at ${p}`);
    }
  }

  // A free_tier_limit with no number and no concrete restriction word is the
  // residue of a stripped finding: "capped at daily message threshold" in place
  // of "capped at 7 messages per day". Flag it so the vagueness stays visible.
  // Only flag limits that are BOTH short AND carry no number. That is the shape
  // a stripped finding leaves behind ("capped at daily message threshold"). Long
  // qualitative limits ("SSO and RBAC restricted to Enterprise tier") are fine.
  for (const lim of (Array.isArray(data.free_tier_limits) ? data.free_tier_limits : [])) {
    const words = typeof lim?.limit === "string" ? lim.limit.trim().split(/\s+/).length : 99;
    if (typeof lim?.limit === "string" && words <= 7 && !/\d/.test(lim.limit)) {
      warn(slug, `free_tier_limit is non-specific - "${lim.limit.slice(0, 60)}"`);
    }
  }

  const act = data.activity;
  let commits = null;
  if (act && typeof act === 'object') {
    if (!act.query) fail(slug, 'activity.query missing (spec 2.4)');
    if (typeof act.capped !== 'boolean') fail(slug, 'activity.capped missing or not boolean');
    if (act.capped === true && typeof act.commits_last_90d === 'number') {
      fail(slug, 'activity is capped but reports an exact count');
    }
    if (typeof act.commits_last_90d === 'number') commits = act.commits_last_90d;
  }

  const statusVal = data.status && typeof data.status.value === 'string' ? data.status.value.toLowerCase() : null;
  if (statusVal === 'active' && commits !== null && commits < LOW_ACTIVITY_THRESHOLD) {
    const notes = Array.isArray(data.notes_for_writer) ? data.notes_for_writer.join(' ').toLowerCase() : '';
    if (!/commit|slow|stall|quiet|dormant|inactive|pace|velocity|activity/.test(notes)) {
      fail(slug, `status="active" but only ${commits} commits in 90d, unremarked in notes_for_writer`);
    } else {
      warn(slug, `status="active" with ${commits} commits in 90d — acknowledged, confirm it is right`);
    }
  }

  // a release older than two years deserves a note regardless of status
  if (data.last_release && typeof data.last_release.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.last_release.date)) {
    const ageDays = (Date.now() - Date.parse(data.last_release.date)) / 86400000;
    if (ageDays > 730) {
      const notes = Array.isArray(data.notes_for_writer) ? data.notes_for_writer.join(' ').toLowerCase() : '';
      if (!/release|version|stale|old|maintain/.test(notes)) {
        fail(slug, `last_release is ${Math.round(ageDays / 365)}y old (${data.last_release.date}) and notes_for_writer never mentions it`);
      }
    }
  }

  const unknowns = [...walkStrings(data)].filter(([, v]) => v === 'UNKNOWN').length;
  return { slug, citations: bearers.length, logged: ok200.size, unbacked, noEvidence, junk, unknowns, commits };
}

// ---------------------------------------------------------------- main
if (!fs.existsSync(FACTS_DIR)) { console.error(`No such directory: ${FACTS_DIR}`); process.exit(1); }
const files = fs.readdirSync(FACTS_DIR).filter((f) => f.endsWith('.json')).sort();
if (!files.length) { console.error(`No .json files in ${FACTS_DIR}`); process.exit(1); }

console.log(`verify_facts — ${files.length} file(s) in docs/facts/\n`);
const rows = files.map((f) => checkFile(path.join(FACTS_DIR, f))).filter(Boolean);

const counts = rows.map((r) => r.commits).filter((n) => n !== null);
const dupes = counts.filter((n, i) => counts.indexOf(n) !== i);
if (dupes.length) fail('cross-file', `identical commits_last_90d across unrelated repos: ${[...new Set(dupes)].join(', ')} — the per_page cap signature`);
if (rows.length >= 3 && rows.every((r) => r.unknowns === 0)) warn('cross-file', 'every tool resolved with zero UNKNOWN — verify this is extraction, not memory');

console.log('\n' + '-'.repeat(92));
console.log('slug'.padEnd(18) + 'cites'.padEnd(8) + 'logged'.padEnd(9) + 'unbacked'.padEnd(11) + 'no-evid'.padEnd(10) + 'junk-ev'.padEnd(10) + 'unknown'.padEnd(9) + '90d');
for (const r of rows) {
  console.log(r.slug.padEnd(18) + String(r.citations).padEnd(8) + String(r.logged).padEnd(9) +
    String(r.unbacked).padEnd(11) + String(r.noEvidence).padEnd(10) + String(r.junk).padEnd(10) +
    String(r.unknowns).padEnd(9) + String(r.commits ?? '-'));
}
console.log('-'.repeat(92));
console.log(`citations not backed by a logged 200 : ${rows.reduce((a, r) => a + r.unbacked, 0)}`);
console.log(`citations missing evidence           : ${rows.reduce((a, r) => a + r.noEvidence, 0)}`);
console.log(`citations with junk evidence         : ${rows.reduce((a, r) => a + r.junk, 0)}`);
console.log(`FAIL: ${failures}    WARN: ${warnings}`);

if (failures > 0) { console.log('\nGATE FAILED — do not submit this batch.'); process.exit(1); }
console.log('\nGATE PASSED.');
process.exit(0);
