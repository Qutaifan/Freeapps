# CLAUDE.md

Instructions for Claude Code working on **qutaifan.com** (repo: `Qutaifan/Freeapps`).

**Read `AGENTS.md` — it is the canonical and fuller version of this file.** The hard rules are repeated here so they are never missed.

Full project context lives in the Obsidian vault at `MY-NOTES/THEHUB/PROJECT-BRIEF.md`, with current work in `MY-NOTES/THEHUB/TODO.md`. The vault is not committed to this repository.

---

## Hard rules

1. **Never push to `main`.** Protected: PR required, admin bypass disabled. Branch → PR → checks → merge.
2. **Never claim success you have not verified.** Verify against a fresh clone of the pushed branch, not your working copy. State the number you measured.
3. **Your verification must be able to fail.** A check confirming a generator wrote a string it was told to write is not a check.
4. **Never delete editorial content.** Compare rendered word counts before and after any bulk edit. If the total drops, stop and report.
5. **Never fabricate editorial claims** — no invented audits, testing, ratings, or review counts.
6. **Never auto-generate review pages.** Written by a human or not at all.
7. **Structured data must match visible content.** No `FAQPage` markup for questions not rendered on the page.
8. **Scraped vendor copy is research only** — never reproduced verbatim.
9. **Ask before destructive or irreversible actions** — force push, branch deletion, bulk deletion, Cloudflare config changes.

---

## The three things most likely to trip you up

**1. The repository root *is* the website.** `wrangler pages deploy .` — no build step, no output directory. Anything you commit anywhere becomes a public URL. Cloudflare Pages also does not delete files that disappear from a deploy, so removing a file does not immediately remove it from production.

**2. URL forms are inverted between the two layouts:**

| On disk | Returns 200 at | 308-redirects |
|---|---|---|
| `x.html` | `/x` | `/x/` and `/x.html` |
| `x/index.html` | `/x/` *(trailing slash)* | `/x` |

Canonicals, `og:url`, sitemap entries, and internal links must point at the 200 form. Verify with `curl -I` against production; do not assume.

**3. `freeapps-components/` is never deployed.** It is a Vite scaffold not linked from any live page. Work there has no effect on the site.

---

## Commands

```bash
# Quality gates — run before and after content work
python .github/scripts/compliance.py .        # currently passes — keep it passing
python .github/scripts/content_quality.py .   # currently fails — do not weaken it

# Tool data (tools.json is generated, never hand-edited)
node scripts/sync_tools_from_obsidian.js --check
node scripts/sync_tools_from_obsidian.js --apply
```

**Use `python`, not `python3`** — the latter hits a Microsoft Store shim on this Windows machine. CI runs Ubuntu where `python3` is correct; do not change the workflows to match local.

---

## Writing scripts

Every script in `scripts/` follows this contract, and new ones must too:

- **Dry-run by default**; write only with `--apply`
- Print exactly what changed, per file
- **Idempotent** — a second run is a no-op
- End with a verification that reports a number capable of being non-zero

Prefer a real HTML parser (`html5lib` or equivalent) over regex when validating structural changes. When inserting markup, insert at element boundaries so nesting cannot break.

---

## Standard workflow

```bash
git checkout -b fix/short-description
node scripts/your_script.js            # preview
node scripts/your_script.js --apply
git add -A && git commit -m "..."
git push -u origin fix/short-description
# open the PR, let the checks run, read the diff, merge
```

---

## Content constraint

The content-quality gate does not currently pass. It is correct to fail, and it is authoritative.

- Do not weaken, bypass, or work around it to get a green check.
- **Do not add new review pages until it passes.** Adding templated pages to a corpus already flagged for template repetition makes the problem worse.
- The fix is editorial — reviews whose sections are not interchangeable — not technical.
