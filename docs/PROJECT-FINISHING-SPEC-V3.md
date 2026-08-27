# THEHUB — Project Finishing Spec (v3)

Supersedes `MASTER-REMEDIATION-SPEC-V2.md` and both `ANTIGRAVITY-*.md` prompts.
Paste this whole file as the opening prompt. Do not summarise it.

```
cd Q:\world\Projects\thehub
agy
```

---

## 0. ENVIRONMENT AND CURRENT STATE

| | |
|---|---|
| Repo root | `Q:\world\Projects\thehub` |
| Remote | `https://github.com/Qutaifan/Freeapps` — **PUBLIC** |
| `origin/main` | `6c3ae49` — **re-verify, do not trust this** |
| Shell | Windows PowerShell |
| Toolchain | Node v24.19.0, npm 11.17.0, git 2.55.0, `gh` (auth: Qutaifan), Python 3 |
| CI gates | `python .github/scripts/compliance.py .` · `python .github/scripts/content_quality.py .` |
| Fact gate | `node scripts/verify_facts.js` |
| Branch protection | `main`, `enforce_admins: true`, required: `deploy` + `compliance`. No bypass. |

### Four PRs are open and unmerged. Check before assuming anything.

| PR | Contents |
|---|---|
| #21 | GPU hero particle background + design tokens (older, unrelated) |
| #25 | Removes 3 duplicate `tools.json` entries (`suno-ai`, `flux-1-1-pro`, `pika-labs`) |
| #26 | 16 fact sheets in `docs/facts/`, `scripts/verify_facts.js`, all agent specs |
| #27 | Splits the Claude/Kimi homepage card; stops compliance scanning the vault |

**`docs/facts/`, `verify_facts.js` and the specs exist only on PR #26's branch.** If you
branch from `origin/main` before #26 merges, they will not be in your working tree. Check
`git log origin/main --oneline -3` first. If they are absent, **STOP and say so** — most
tasks below depend on them.

---

## 1. PRIME DIRECTIVES

Nine agent runs have now been audited on this repo. Every rule traces to a real defect.

### 1.1 Evidence before assertion
Never state that a file contains, lacks, or does something without printing the bytes.

### 1.2 Negative control
**Before reporting something ABSENT, prove your test detects it when PRESENT.**
Real failure: `<script[^>]*adsbygoogle\.js[^>]*async` matched nothing and "async: NO" was
reported. The markup is `<script async src="...">` — `async` precedes `src`, so the
pattern could never match. An unfalsified zero is a guess.

### 1.3 A source is a page you fetched
Not a search result, not a snippet, not a URL you constructed. Every citation needs a
`fetch_log` entry with status 200 **and** an `evidence` substring from that page.

### 1.4 Cite or write UNKNOWN
Nine tools were once marked "Active" with no source. `UNKNOWN` is a success.

### 1.5 Arithmetic is a claim
"15 + 4 + 2" was reported for a 22-item list. Add up every count and state the total.

### 1.6 Raw output means raw
A required `git diff --stat` was once replaced with a parenthetical summary. Truncated or
paraphrased output counts as no output.

### 1.7 Banned in reports
"should", "appears to", "looks like", "presumably", "likely". VERIFIED with pasted output,
or NOT DONE.

### 1.8 Never edit a gate to pass
Not `verify_facts.js`, not `compliance.py`, not `content_quality.py`. If you believe a gate
is wrong, STOP and report the case.

### 1.9 The checklist is not the check
Five consecutive runs answered their self-audit correctly while shipping fabrications.
Re-read your own output against §1 before submitting.

---

## 2. ALREADY DONE — DO NOT REDO

Verified. Touching any of these is a regression.

1. **Sitemap canonical bug** — fixed, merged, deployed (#22). Live: 84 URLs, 0 trailing `//`.
2. **Generator CRLF idempotency** — fixed (#24). A clean checkout reports
   `already 100% up-to-date`. If you see "Changes detected" on an unmodified tree, STOP.
3. **Tracked `.pyc`** — removed (#23). `__pycache__/` gitignored.
4. **`/404` returning 200** — investigated, NON-ISSUE. Unlinked, not in sitemap, carries
   `noindex`, real misses 404 correctly.
5. **GSC "Page with redirect: 75"** — NOT an error. Legacy `.html` 308-ing to extensionless
   canonicals; Cloudflare Pages working as designed. Do not try to reduce it.
6. **AdSense** — `ads.txt` correct and live; publisher ID consistent across all pages;
   `async` present on all loader tags; all `<ins>` units carry `min-height`. Do not "optimise".
7. **The 95 `noindex` tags** — deliberate. See §3.
8. **`MY-NOTES/`** — has 17 commits and remote `github.com/Qutaifan/thehub-vault.git`.
   **Never `git init` it. Never commit, push, or delete anything inside it.**
9. **`docs/facts/_fetches/`** — gitignored on purpose. Raw third-party page HTML; this repo
   is public. Never commit it.

---

## 3. CRITICAL CONTEXT — THE ADSENSE PROGRAM

PR #20 (merged 2026-08-19): *"overhaul 15 review pages for AdSense compliance and expand
sitewide indexable URLs to 84."*

95 of 139 reviews carry `noindex` as a deliberate low-value-content mitigation. Thin,
template-repetitive reviews are held out of the index until rewritten to pass both gates,
at which point `noindex` lifts and the sitemap grows.

**Absolutely forbidden:**
- Bulk-removing `noindex` to raise the indexed count.
- Generating, scaffolding, stubbing or "drafting" review prose. Template repetition is the
  original defect; LLM filler recreates it at scale.
- Lifting `noindex` from any page that has not passed both gates with zero FAILs.

---

## 4. TASKS

Strict order. One branch and one PR per task, always from `origin/main`. **Never merge.**

### T0 — Baseline

```powershell
cd Q:\world\Projects\thehub
git fetch origin
git rev-parse --short origin/main
git log origin/main --oneline -3
git status --porcelain
gh pr list --state open --json number,title
node .\scripts\generate_full_sitemap.js
python .github/scripts/compliance.py .
```

**PASS:** all pasted; generator says already up-to-date; compliance exit 0.
State whether `docs/facts/` and `scripts/verify_facts.js` are present (see §0).

---

### T1 — Omnivore: a dead product is recommended on two live pages

**This is the highest-priority item on the board.** Omnivore shut down 15 Nov 2024
(ElevenLabs acquihire). It is still presented as a **"free pick"** on two *indexable*
pages, including inside their JSON-LD:

```
free-alternative-to-ennevernote.html
free-alternative-to-notion.html
```

Both are titled **"3 Genuinely Free Picks"** and both recommend the same three tools —
`appflowy`, `draw-io`, `omnivore` — with byte-identical sections. So there are two defects:
a dead recommendation, and near-duplicate pillar pages.

`docs/OMNIVORE-DECISION.md` (on PR #26) documents the options.

**Ahmad must choose the direction before you edit these pages.** If no choice has been
given to you in this session, do T1 as follows and nothing more:

1. Re-verify every Omnivore mention in both files, with line numbers.
2. Confirm both pages are in `sitemap.xml` and carry no `noindex`.
3. Print the exact title strings containing "3" that would need changing.
4. **STOP and ask which option to take.**

Do not pick a replacement tool yourself. `joplin` and `logseq` both have reviews but both
are currently `noindex`, which is exactly the kind of trade-off that is Ahmad's call.

---

### T2 — Kimi has no backing

PR #27 split the homepage card "Claude & Kimi AI" into two. Kimi now has a card with **no
review page, no `tools.json` entry, and no fact sheet** — the only tool on the homepage in
that position. Its card links out to kimi.com only.

1. Confirm the above (grep `reviews/`, `tools.json`, `docs/facts/`).
2. Produce `docs/facts/kimi.json` under the §5 fact-gathering rules — primary sources,
   `fetch_log`, `evidence` per field. Run `node scripts/verify_facts.js`; it must exit 0.
3. **STOP.** Whether Kimi gets a written review or comes off the homepage is Ahmad's call.
   Do not write a review. Do not add a `tools.json` entry with a `review:` route pointing
   at a page that does not exist.

---

### T3 — Four evidence strings do not support their claims

The fact gate proves a page was fetched. It cannot judge whether the page *says* what the
field claims. These four passed the gate and are wrong:

| File | Field | Evidence that does not support it |
|---|---|---|
| `bolt-new.json` | `account_required: false` | a sentence about checking out the open-source codebase |
| `v0-dev.json` | `license: Proprietary` | a sentence about connecting a GitHub repo to Vercel |
| `v0-dev.json` | `status: active` | a FAQ intro line |
| `windsurf-ai.json` | `platforms` | a sentence about JetBrains IDEs |

Also: `windsurf-ai.json` `free_tier_limits` contains *"Includes access to SWE-1.7"* — that
is a **feature, not a limit**, and its evidence is vendor marketing. `free_tier_limits`
holds what you do **not** get.

Re-source each from a page that actually establishes it, or set the field to `UNKNOWN`.
Gate must exit 0. One PR.

---

### T4 — Remaining broken-route tools

`docs/archive/BROKEN-ROUTES-TRIAGE.md` triaged 22 routes: **16 WRITE-REVIEW, 4 REMOVE-ROUTE,
2 NEEDS-HUMAN-DECISION** (16+4+2 = 22).

Three REMOVE-ROUTE entries are handled by PR #25. The fourth is `omnivore` — part of T1.

For the 16 WRITE-REVIEW tools, produce fact sheets only, in batches of 5, gate-clean, one
PR per batch. Nine already exist. **Do not write reviews** (§3).

The 2 NEEDS-HUMAN-DECISION are Ahmad's:
- `revolt-chat` — Revolt renamed to **Stoat** on 1 Oct 2025 after a trademark
  cease-and-desist; repos moved to the `stoatchat` org; site is `stoat.chat`.
  Source: https://en.wikipedia.org/wiki/Stoat_(software). Should the slug change?
- `it-tools` — original repo slowed; an active fork exists at `sharevb/it-tools`. Cover
  which?

Report both, change neither.

---

### T5 — Nine uncited "Active" verdicts

`open-webui`, `anything-llm`, `hoppscotch`, `draw-io`, `cryptomator`, `v0-dev`, `bolt-new`,
`windsurf-ai`, `lovable-dev` were marked Active with no source.

For each, establish with a **cited URL**: last release or commit date, and whether the
project is active, slowed, or discontinued. Where no source is findable, write `UNKNOWN`.
Add a `Source` column to the triage doc. Change no disposition without stating why.

---

### T6 — Search Console URLs (HUMAN INPUT REQUIRED)

Not derivable from the repo:
- `Not found (404)` — 1 URL
- `Excluded by 'noindex' tag` — 3 URLs

You cannot access Search Console. **Do not infer, guess, or reverse-engineer these.**
Ask and stop. Fabricating candidates here is a critical failure.

---

### T7 — Final regression

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
node .\scripts\verify_facts.js
git status --porcelain
```

**Expected:** generator already up-to-date; 84 URLs / 0 `//`; reviews 139 / 95 / 44;
compliance exit 0 across ~182 pages; content_quality FAIL=0; fact gate exit 0.
Any unintended deviation is a regression — say so and open no PR.

---

## 5. FACT-SHEET RULES (T2, T4, T5)

Full spec: `docs/FACT-GATHERING-SPEC.md` (PR #26). Non-negotiables:

- **Never copy sentences.** Extract values. No field may carry 10+ consecutive words from a
  source page. No `description` / `summary` / `pros` / `cons` / `verdict` fields, ever.
- **`evidence` is the one place a verbatim quote belongs** — it is proof, it never reaches a
  published page. Shortest span that settles the point, minimum 12 characters.
- **A licence file cannot establish** pricing, limits, account requirements, or platforms.
- **Derived numbers declare their query.** For commit counts use `?since=<-90d>&per_page=1`
  and read the `Link` header's `rel="last"` page number. `per_page=N` is a cap, not a count.
- **`free_tier_limits` is the highest-value field** — seat caps, storage caps, feature
  gates, watermarks, read-only modes, export restrictions.
- **Record contradictions, don't resolve them.** Set `"conflict": true` and cite both.
- Output confined to `docs/facts/`. `_fetches/` stays gitignored.

---

## 6. OUT OF SCOPE — REFUSE THESE

- **Writing any review.** ~111 pages of human authoring. See §3. If asked mid-run, refuse
  and cite this section.
- Removing `noindex` tags.
- Editing `.html` in T1 before a direction is chosen.
- Chasing the 75 redirects, or the `/404` 200 (§2.4, §2.5).
- Any AdSense change (§2.6).
- Re-touching the sitemap or its generator (§2.1, §2.2).
- Anything inside `MY-NOTES/` (§2.8).
- Committing `docs/facts/_fetches/` (§2.9).
- Brand token migration, Catch Block retrofit, Astro/Tailwind migration.
- Merging any PR.

---

## 7. GIT POLICY

- Never commit to `main`. Never force-push. Never rebase a shared branch.
- Always `git checkout -b <name> origin/main`.
- One branch, one PR per task. Never bundle.
- **Never merge.** Open the PR and stop.
- Paste verification output into every PR body.
- Never `git clean`, `git reset --hard`, or delete untracked files. The vault holds 26
  uncommitted files existing in exactly one place on earth.

---

## 8. STOP AND ASK

Halt, write findings to `docs/AGENT-REPORT.md`, exit:

- A verification command fails twice.
- A change would touch more than 10 files.
- You are about to modify anything in §2.
- Measured numbers contradict §0 or §2 — the repo moved and this spec is stale. Report it;
  do not adapt silently.
- `docs/facts/` or `verify_facts.js` are missing from your working tree (see §0).
- A gate fails and you cannot fix it without editing the gate.
- You need Search Console access or a credential.
- You are about to write "should" in a report.

---

## 9. REPORT FORMAT

Per task:

```
TASK: <id>
STATUS: VERIFIED | NOT DONE | BLOCKED | NON-ISSUE
COMMANDS RUN:   <verbatim>
RAW OUTPUT:     <unedited paste — no summarising, no trimming>
NUMBERS:        before=<n> after=<n> delta=<n>  (state the total; confirm it adds up)
FILES CHANGED:  <paths, or "none">
NEGATIVE CONTROL: <how you proved the test could fail; or "n/a">
SOURCES:        <URLs for every external claim; or "none">
PR:             <url, or "none">
UNRESOLVED:     <anything unconfirmed>
```

At the end, write `docs/AGENT-REPORT.md` and print it, with:
**A** metadata · **B** status table · **C** per-task evidence ·
**D** the §4 T7 regression output · **E** changed files plus raw
`git diff --stat origin/main...HEAD` per branch · **F** PRs, none merged ·
**G** what you did NOT do and why · **H** near-misses ·
**I** unverified claims · **J** handoff · **K** self-audit · **L** honesty declaration.

### K — self-audit, YES/NO, no elaboration

```
Did every VERIFIED status include unedited raw command output?          YES / NO
Did you apply a negative control to every zero or absent result?        YES / NO
Does every count you reported add up to its stated total?               YES / NO
Does every external factual claim carry a cited URL?                    YES / NO
Does every fact-sheet source appear in fetch_log with status 200?       YES / NO
Did you edit any gate to make output pass?                              YES / NO
Did you merge any pull request?                                         YES / NO
Did you commit to main or force-push?                                   YES / NO
Did you touch anything inside MY-NOTES/?                                YES / NO
Did you commit docs/facts/_fetches/?                                    YES / NO
Did you modify anything listed in section 2?                            YES / NO
Did you remove a noindex tag or write review prose?                     YES / NO
Did you edit .html in T1 without a chosen direction?                    YES / NO
Is every file you changed listed in section E?                          YES / NO
```

Expected: YES ×5, NO ×8, YES. Explain any deviation immediately below.

### I — unverified claims

Four consecutive runs wrote "None" here while carrying uncited claims. **If this section is
empty, re-read §1.3 and §1.4 and check again before submitting.**

### L — honesty declaration

In your own words: what you are confident in, what you are unsure about, what a human
should double-check before this ships. A report with no uncertainty is not careful.

---

## 10. WHAT ONLY AHMAD CAN DO

List these in your handoff. Do not attempt them.

1. **Merge PRs #25, #26, #27** (and decide on #21).
2. **Commit the 26 uncommitted files in `MY-NOTES/`.** They exist in one place with no
   history. This is the single largest data-loss risk in the project.
3. **Choose the Omnivore direction** (T1).
4. **Decide Kimi's fate** — review, or off the homepage (T2).
5. **Export the Search Console URLs** (T6).
6. **Decide Revolt→Stoat and it-tools** (T4).
7. **Write the reviews.** ~111 pages. No agent may do this (§3).
