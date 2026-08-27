# THEHUB — Master Remediation Spec v2 (A→Z)

Supersedes `ANTIGRAVITY-CLI-MASTER-PROMPT.md`. That file is now **stale in three places**
and must not be followed. Paste this entire file as the opening prompt.

```
cd Q:\world\Projects\thehub
agy
```

---

## 0. ENVIRONMENT

| | |
|---|---|
| Repo root | `Q:\world\Projects\thehub` |
| Remote | `https://github.com/Qutaifan/Freeapps.git` |
| `origin/main` | `6c3ae49` — **re-verify, do not trust this SHA blindly** |
| Shell | Windows PowerShell |
| Toolchain | Node v24.19.0, npm 11.17.0, git 2.55.0, `gh` (authenticated as `Qutaifan`) |
| CI gates | `python .github/scripts/compliance.py .` and `python .github/scripts/content_quality.py .` |
| Branch protection | `main`, `enforce_admins: true`, required checks `deploy` + `compliance`. **No bypass exists, including for the owner.** |

---

## 1. PRIME DIRECTIVE — EVIDENCE BEFORE ASSERTION

This repo has been damaged by agents that reported success using tests that could not
fail. Every rule below traces to a specific incident.

### 1.1 Print evidence before claiming a fact
Never state a file contains, lacks, or does something without printing the bytes.
"I checked and it's fine" is a violation.

### 1.2 NEGATIVE-CONTROL RULE — the most important one
**Before reporting something is ABSENT, prove your test detects it when PRESENT.**

Real failure from this repo: an agent tested async loading with
`<script[^>]*adsbygoogle\.js[^>]*async` and reported "async: NO — blocking render."
False. The markup is `<script async src="...adsbygoogle.js...">` — `async` precedes
`src`, so the pattern could never match. The test was incapable of a positive result.

An unfalsified zero is not a finding.

### 1.3 Arithmetic is a claim too
A previous run reported "15 WRITE-REVIEW, 4 REMOVE-ROUTE, 2 NEEDS-HUMAN-DECISION" for a
22-item list. 15+4+2=21. The table was right; the summary was wrong; the self-audit said
no numbers contradicted. **Add up every count you report and state the total.**

### 1.4 Cite or write UNKNOWN
A previous run marked nine tools "Active" with no source. If you assert maintenance
status, external facts, or dates, cite a URL. Otherwise write `UNKNOWN`. UNKNOWN is a
success; an uncited confident claim is a failure.

### 1.5 Banned in reports
"should be", "appears to", "looks like", "presumably", "likely", "should now work".
VERIFIED with pasted output, or NOT DONE. No third state.

### 1.6 No self-serving test edits
Never modify, relax, skip, or reroute a verification command or CI gate to make it pass.

### 1.7 Report failures loudly
Print errors. Never silently retry with different arguments and present the eventual
success as the first attempt.

### 1.8 Raw output means raw
A previous run replaced required `git diff --stat` output with a parenthetical summary.
Truncated or paraphrased output counts as **no output**.

---

## 2. VERIFIED FACTS

| Fact | Value |
|---|---|
| `.html` on disk (excl `_next`, `.git`) | 186 |
| Review pages on disk | 139 |
| Reviews with `noindex` | 95 |
| Indexable reviews | 44 (43 individual + `reviews/index.html` hub) |
| `sitemap.xml` URLs | 84 |
| `tools.json` entries with a `review:` route | 160 |
| Broken review routes | 22 |
| Vault `MY-NOTES/` | 17 commits, remote `github.com/Qutaifan/thehub-vault.git`, **26 uncommitted** |
| Tracked `.pyc` | 0 |

---

## 3. ALREADY CORRECT — DO NOT TOUCH

Verified. Changing any is a regression. If you think one is wrong, STOP and report.

1. **Sitemap canonical bug** — fixed and deployed (PR #22). Live sitemap: 84 URLs, 0 `//`.
2. **Sitemap generator CRLF check** — fixed (PR #24). A clean checkout now reports
   `✅ already 100% up-to-date`. If you see "Changes detected" on an unmodified tree,
   that is a real regression — STOP.
3. **`ads.txt`** — `google.com, pub-9640734919758311, DIRECT, f08c47fec0942fa0`. Live 200.
4. **AdSense** — publisher ID consistent across 186 files; `async` present on all 182
   script tags; all 18 `<ins>` units carry `min-height`. Do not "optimise" any of this.
5. **GSC "Page with redirect: 75"** — NOT an error. Legacy `.html` 308-ing to
   extensionless canonicals; Cloudflare Pages working as designed. Do not add redirect
   rules or rewrite internal links to reduce it.
6. **`/404` returning 200** — investigated, NON-ISSUE. Unlinked, absent from sitemap,
   carries `noindex`, genuine misses return real 404s. Do not "fix" it.
7. **The 95 `noindex` tags** — deliberate. See §4.
8. **`MY-NOTES/`** — already version-controlled with a remote. **Never `git init` it,
   never delete it, read-only unless a task says otherwise.**

---

## 4. CRITICAL CONTEXT — THE ADSENSE COMPLIANCE PROGRAM

PR #20 (merged 2026-08-19): *"overhaul 15 review pages for AdSense compliance and expand
sitewide indexable URLs to 84."*

The 95 `noindex` tags are a deliberate low-value-content mitigation. Thin,
template-repetitive reviews are held out of the index until rewritten to pass the gates,
at which point `noindex` lifts and the sitemap grows. 15 have been through this.

**Therefore, absolutely forbidden:**
- Bulk-removing `noindex` to raise the indexed count.
- Generating, scaffolding, stubbing, or "drafting" review prose. Template repetition is
  the original defect; LLM filler recreates it at scale.
- Lifting `noindex` from any page that has not passed both gates with zero FAILs.

---

## 5. TASKS

Strict order.

### T0 — Baseline

```powershell
cd Q:\world\Projects\thehub
git fetch origin
git rev-parse --abbrev-ref HEAD
git rev-parse --short origin/main
git status --porcelain
node .\scripts\generate_full_sitemap.js
$sm=[xml](Get-Content .\sitemap.xml -Raw); $u=@($sm.urlset.url.loc)
"sitemap urls: $($u.Count)   trailing //: $(@($u | Where-Object {$_ -match '//$'}).Count)"
```

**PASS:** values pasted; generator reports **already up-to-date** (§3.2); 84 URLs; 0 `//`.

---

### T1 — Remove the 3 duplicate routes  *(mechanical, safe)*

`tools.json` has three entries duplicating tools that already have review pages:

| Duplicate slug | Canonical slug | Canonical review |
|---|---|---|
| `suno-ai` | `suno` | `reviews/suno.html` (noindex) |
| `flux-1-1-pro` | `flux-1` | `reviews/flux-1.html` (noindex) |
| `pika-labs` | `pika` | `reviews/pika.html` (noindex) |

1. Re-verify each pair yourself: duplicate has no page, canonical does.
2. Confirm each duplicate slug is referenced **nowhere** on the site — count **and** a
   positive control proving the search works (§1.2). Check `.html`, `search-index.json`,
   `feed.xml`, `rss.xml`.
3. If and only if refs are 0: remove the three entries from `tools.json`.
4. Run both CI gates. Run the sitemap generator.
5. Branch from `origin/main`, commit, open PR. **Do not merge.**

**PASS:** 160 → 157 entries; both gates 0 FAILs; sitemap still 84 URLs; PR URL pasted.
**STOP** if any duplicate slug is referenced anywhere.

---

### T2 — Omnivore: remove a dead recommendation  *(REQUIRES A DECISION FIRST)*

Omnivore shut down 15 Nov 2024 (ElevenLabs acquihire). It is currently recommended as a
**"free pick"** on two *indexable* pages, including inside their JSON-LD:

```
free-alternative-to-ennevernote.html : 6 mentions
free-alternative-to-notion.html      : 6 mentions
```

Both pages are titled **"3 Genuinely Free Picks"** and both recommend the *same* three
tools — `appflowy`, `draw-io`, `omnivore` — with byte-identical sections. So this is two
defects: a dead recommendation, and near-duplicate pillar pages.

**DO NOT EDIT THESE PAGES YET.** Removing Omnivore leaves two identical two-item pages
titled "3 Genuinely Free Picks". Choosing a replacement is editorial.

Instead, produce `docs/OMNIVORE-DECISION.md` containing:
1. Every Omnivore mention in both files, with line numbers and surrounding markup.
2. Every place the title/count "3" appears and would need changing.
3. The JSON-LD blocks referencing Omnivore, quoted.
4. A byte-level diff of the two pages showing exactly how much is shared.
5. Candidate replacements **restricted to tools that already have review pages** — state
   for each whether its review is INDEXABLE or noindex. Note `joplin` and `logseq` both
   exist but are currently `noindex`.
6. Three costed options: (a) drop Omnivore + retitle to "2", (b) substitute an existing
   tool, (c) promote a replacement through the gates first.

**Open no PR. Change no `.html`.** This task outputs one markdown file.

---

### T3 — Revolt → Stoat  *(decision packet, no edit)*

Verified: Revolt rebranded to **Stoat** on 1 Oct 2025 after a trademark cease-and-desist;
repos moved to the `stoatchat` GitHub org; site is `stoat.chat`.
Source: https://en.wikipedia.org/wiki/Stoat_(software)

Report into `docs/OMNIVORE-DECISION.md` (append a section): every `revolt` reference in
`tools.json`, the vault note, and any `.html`; what a rename would touch; whether the
slug `revolt-chat` should become `stoat`. **Do not rename anything.**

---

### T4 — Verify the 9 uncited maintenance claims

A prior run marked these "Active" with no source: `open-webui`, `anything-llm`,
`hoppscotch`, `draw-io`, `cryptomator`, `v0-dev`, `bolt-new`, `windsurf-ai`,
`lovable-dev`.

For each, establish with a **cited URL**: last release or commit date, and whether the
project is active, slowed, or discontinued. Where you cannot find a source, write
`UNKNOWN` — do not infer from popularity or from your own training data.

Update `docs/BROKEN-ROUTES-TRIAGE.md` in place, adding a `Source` column. Change no
disposition without stating why. **Open no PR.**

---

### T5 — Vault backup  *(26 uncommitted files, currently unprotected)*

`MY-NOTES/` has 17 commits and remote `github.com/Qutaifan/thehub-vault.git`, 0 unpushed
commits, but **26 uncommitted working-tree entries**. That work exists in exactly one
place.

1. `git -C MY-NOTES status --porcelain` — print all 26 verbatim.
2. Classify: genuine notes vs Obsidian cache/workspace noise.
3. **STOP AND REPORT. Do not commit, do not push, do not add a remote, do not `git init`.**
   Ahmad decides what belongs in vault history.

**PASS:** all 26 listed and classified, nothing written.

---

### T6 — Search Console URLs  *(requires human input)*

Not derivable from the repo:
- `Not found (404)` — 1 URL
- `Excluded by 'noindex' tag` — 3 URLs

You cannot access Search Console. **Do not infer, guess, or reverse-engineer these.**
Request them and stop.

---

### T7 — Track the loose docs

Untracked and unbacked: `docs/AGENT-REPORT.md`, `docs/BROKEN-ROUTES-TRIAGE.md`,
`docs/ANTIGRAVITY-CLI-MASTER-PROMPT.md`, `docs/ANTIGRAVITY-TASK-PROMPT.md`,
`scripts/install-skills.ps1`.

Propose (do not execute) whether each should be committed or gitignored. One PR, docs
only, no code. **Do not merge.**

---

## 6. OUT OF SCOPE — REFUSE THESE

- **Writing the 16 missing reviews or the 95 noindexed ones.** ~111 pages of human
  authoring. See §4. If asked mid-run, refuse and cite this section.
- Removing `noindex` tags.
- Editing `.html` content in T2/T3 — those produce decision documents only.
- Chasing the 75 redirects (§3.5) or the `/404` 200 (§3.6).
- Any AdSense change (§3.4).
- Re-touching the sitemap or generator (§3.1, §3.2).
- Brand token migration, Catch Block retrofit, Astro/Tailwind migration.

---

## 7. GIT POLICY

- Never commit to `main`. Never force-push. Never rebase a shared branch.
- Always `git checkout -b <name> origin/main`.
- One branch, one PR per task. Never bundle.
- **Never merge.** Open the PR and stop.
- Paste verification output into every PR body.
- Never `git clean`, `git reset --hard`, or delete untracked files. `MY-NOTES/` holds 26
  uncommitted files — deleting them destroys work that exists nowhere else.

---

## 8. STOP AND ASK

Halt, write findings to `docs/AGENT-REPORT.md`, exit:

- A verification command fails twice.
- A change would touch more than 10 files.
- You are about to modify anything in §3.
- Measured numbers contradict §2 — the repo moved and this spec is stale. Report it; do
  not adapt silently.
- A CI gate fails and you cannot fix it without editing the gate.
- You need a credential or Search Console access.
- You are about to write "should" in a report.

Stopping is always correct. Guessing for momentum never is.

---

## 9. PER-TASK REPORT FORMAT

```
TASK: <id>
STATUS: VERIFIED | NOT DONE | BLOCKED | NON-ISSUE
COMMANDS RUN:
  <verbatim>
RAW OUTPUT:
  <unedited paste — no summarising, no trimming>
NUMBERS: before=<n> after=<n> delta=<n>   (state the total; confirm it adds up)
FILES CHANGED: <paths, or "none">
NEGATIVE CONTROL: <how you proved the test could fail; or "n/a">
SOURCES: <URLs for any external claim; or "none">
PR: <url, or "none">
UNRESOLVED: <anything unconfirmed>
```

`VERIFIED` without RAW OUTPUT is a violation.

---

## 10. FINAL COMPLETION REPORT — MANDATORY

Write to `docs/AGENT-REPORT.md` **and** print to stdout. The run is not complete without
it. Write it so a reviewer who does not trust you can still verify every claim.

**A. Metadata** — start/finish times, agent+model, `origin/main` SHA at start and finish,
every branch created.

**B. Status table** — T0–T7 with status, files changed, PR.

**C. Per-task evidence** — the full §9 block for each, verbatim.

**D. Regression guard** — re-run at the end, paste output:

```powershell
git fetch origin; git rev-parse --short origin/main
node .\scripts\generate_full_sitemap.js
$sm=[xml](Get-Content .\sitemap.xml -Raw); $u=@($sm.urlset.url.loc)
"sitemap urls: $($u.Count)   trailing //: $(@($u | Where-Object {$_ -match '//$'}).Count)"
$rev=@(Get-ChildItem .\reviews -Filter *.html -File)
$ni=@($rev | Where-Object { (Get-Content $_.FullName -Raw) -match '(?is)<head.*?noindex.*?</head>' })
"reviews: $($rev.Count)  noindex: $($ni.Count)  indexable: $($rev.Count - $ni.Count)"
python .github/scripts/compliance.py .
python .github/scripts/content_quality.py .
git status --porcelain
```

**Expected:** generator says **already up-to-date**; 84 URLs / 0 `//`; reviews 139 / 95
noindex / 44 indexable; both gates 0 FAILs. Any unintended deviation is a regression —
say so plainly and open no PR.

**E. Changed files** — full list, then `git diff --stat origin/main...HEAD` per branch
pasted raw (§1.8), and confirm the two lists match exactly.

**F. Pull requests** — URL, title, merge state. Confirm none merged.

**G. What you did NOT do, and why** — every §6 item encountered, every §8 trigger fired.
Long is good.

**H. Near-misses** — anything in §3 you considered touching; any suspicious zero before
you applied a negative control. **Writing "none" when a near-miss occurred is worse than
the near-miss.**

**I. Unverified claims** — every statement you could not back with printed output or a
cited URL. Three consecutive prior runs wrote "None" here while carrying uncited claims.
**If this section is empty, re-read §1.3 and §1.4 and check again before submitting.**

**J. Handoff** — what a human must do next, in order, with the specific input needed.

**K. Self-audit** — YES/NO, no elaboration:

```
Did every VERIFIED status include unedited raw command output?          YES / NO
Did you apply a negative control to every zero or absent result?        YES / NO
Does every count you reported add up to its stated total?               YES / NO
Does every external factual claim carry a cited URL?                    YES / NO
Did you modify, relax, or skip any verification command or CI gate?     YES / NO
Did you merge any pull request?                                         YES / NO
Did you commit directly to main or force-push anything?                 YES / NO
Did you delete, move, or clean any untracked file?                      YES / NO
Did you commit or push anything inside MY-NOTES/?                       YES / NO
Did you modify anything listed in section 3?                            YES / NO
Did you remove any noindex tag or generate review prose?                YES / NO
Did you edit any .html file in T2 or T3?                                YES / NO
Is every file you changed listed in section E?                          YES / NO
```

Expected: YES, YES, YES, YES, NO, NO, NO, NO, NO, NO, NO, NO, YES.
**Explain any deviation immediately below the checklist.**

**L. Honesty declaration** — in your own words: what you are confident in, what you are
unsure about, what a human should double-check before this ships. A report with no
uncertainty is not careful; it is incurious.
