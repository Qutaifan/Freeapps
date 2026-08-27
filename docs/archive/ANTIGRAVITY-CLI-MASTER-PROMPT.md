> **SUPERSEDED - DO NOT FOLLOW.** Retained for history only.
> Use `MASTER-REMEDIATION-SPEC-V2.md` instead.
>
> Two statements in this file are known to be FALSE:
> - The `origin/main` SHA is stale.
> - It claims `MY-NOTES/` has no git history and no backup. It has 17 commits and a
>   remote at github.com/Qutaifan/thehub-vault.git. Never `git init` it.
# THEHUB — Master Task Spec for Antigravity CLI (`agy`)

Invoke from the repo root. Paste this entire file as the opening prompt. Do not summarise it.

```
cd Q:\world\Projects\thehub
agy
```

---

## 0. ROLE AND ENVIRONMENT

You are a senior engineer finishing a defined remediation list on THEHUB
(`qutaifan.com`), a static site deployed to Cloudflare Pages.

| | |
|---|---|
| Repo root | `Q:\world\Projects\thehub` |
| Remote | `https://github.com/Qutaifan/Freeapps.git` |
| Shell | Windows PowerShell |
| Toolchain | Node v24.19.0, npm 11.17.0, git 2.55.0, `gh` CLI (authenticated as `Qutaifan`) |
| `origin/main` | `6478342` |
| Active local branch | `feat/gpu-hero-design-system` (unrelated work — leave it alone) |

You are finishing a list. You are not redesigning anything.

---

## 1. PRIME DIRECTIVE — EVIDENCE BEFORE ASSERTION

This repo has been damaged before by agents that reported success using tests that could
not fail. Every rule below exists because of a specific incident. They are not style
preferences.

### 1.1 Print the evidence before you claim the fact

Never state that a file contains, lacks, or does something without first printing the
relevant bytes to the transcript. "I checked and it's fine" is a rule violation.

### 1.2 THE NEGATIVE-CONTROL RULE — most important

**Before reporting the ABSENCE of something, prove your test can detect its PRESENCE.**

Worked example of the exact failure this prevents, from this repo:

An agent tested whether AdSense scripts loaded asynchronously using the pattern
`<script[^>]*adsbygoogle\.js[^>]*async`. It matched nothing, and the agent reported
"async: NO — ad script is blocking render." **That was false.** The real markup is:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..." crossorigin="anonymous">
```

`async` appears *before* `src`, so the pattern could never match. The test was incapable
of returning a positive result. A false finding was shipped and acted on.

**Therefore:** any zero or negative result requires you to (a) print the raw text you
searched, and (b) demonstrate the same pattern matching a known-positive control.
An unfalsified zero is not a finding. It is a guess wearing a number.

### 1.3 Banned language in completion reports

Never write: "should be", "appears to", "looks like", "presumably", "I believe",
"likely", "should now work". A task is VERIFIED with pasted command output, or it is
NOT DONE. There is no third state.

### 1.4 No self-serving test edits

You may not modify, relax, skip, or reroute a verification command or CI gate to make it
pass. If a check fails, print the failure verbatim and stop that task.

### 1.5 Fabrication is the worst outcome

Never invent file paths, URL counts, slot IDs, commit SHAs, metrics, or policy text.
If you do not know: run a command, or write `UNKNOWN — could not determine`.
An honest UNKNOWN is a success. A confident wrong number costs days.

### 1.6 Report failures loudly

If a command errors, print the error. Do not silently retry with different arguments and
present the eventual success as if it were the first attempt.

### 1.7 Non-interactive discipline

You are in a CLI. Nobody is watching each step. Do not "keep momentum" through
uncertainty — an unattended wrong guess propagates further than an attended one.
Any §8 trigger means: stop, write your findings to `docs/AGENT-REPORT.md`, and exit.

---

## 2. VERIFIED FACTS

Confirmed by direct command execution. Re-verify any that a task depends on.

| Fact | Value |
|---|---|
| `.html` files on disk (excl. `_next`, `.git`) | 186 |
| `.html` files tracked in git | 181 |
| Review pages on disk | 139 |
| Reviews carrying `noindex` | 95 |
| Indexable reviews | 44 |
| `sitemap.xml` URLs | 84 |
| Canonical style | extensionless; directory pages keep exactly one trailing slash |
| `.html` → extensionless | Cloudflare Pages auto-308 — correct, not a bug |
| apex → www | 301 — correct |
| Missing URL | returns a real 404 — correct |
| Tracked `.pyc` files | 1 (build artifact, committed in error) |

### CI gates — these run on every PR and are required by branch protection

```powershell
python3 .github/scripts/compliance.py .
python3 .github/scripts/content_quality.py .
```

Required contexts on `main`: `deploy`, `compliance`. `enforce_admins` is **true** —
there is no bypass, including for the repo owner.

---

## 3. ALREADY CORRECT — DO NOT "FIX" THESE

Independently verified. Changing any is a regression. If you believe one is wrong, STOP
and report your evidence. Do not act.

1. **Sitemap canonical bug — FIXED AND DEPLOYED.** PR #22, merged as `6478342`. The
   `getCanonicalUrl()` off-by-one is resolved; live sitemap verified at 84 URLs and 0
   trailing `//`. **Do not reopen, re-patch, or regenerate.**
2. **`ads.txt`** — `google.com, pub-9640734919758311, DIRECT, f08c47fec0942fa0`. Live 200,
   `text/plain`. Correct.
3. **Publisher ID consistency** — `ca-pub-9640734919758311` across all 186 files. No mismatch.
4. **AdSense `async`** — present on all 182 pages carrying the script. See §1.2.
5. **CLS containers** — all 18 `<ins class="adsbygoogle">` units carry `min-height`.
   Do not add `aspect-ratio`.
6. **Search Console "Page with redirect: 75"** — NOT an error. Legacy `.html` URLs 308-ing
   to extensionless canonicals; Cloudflare Pages working as designed. **Do not add redirect
   rules, rewrite internal links, or try to reduce this number.**
7. **The 95 `noindex` review tags** — deliberate. See §4 for why.

---

## 4. CRITICAL CONTEXT — THE ADSENSE COMPLIANCE PROGRAM

Read this before touching any review page.

PR #20, merged 2026-08-19: *"overhaul 15 review pages for AdSense compliance and expand
sitewide indexable URLs to 84."*

The 95 `noindex` tags are **not a bug and not neglect.** They are a deliberate
low-value-content mitigation: thin, template-repetitive reviews are held out of the index
until rewritten to pass the gates, at which point `noindex` is lifted and the sitemap
grows. 15 reviews have been through this. 95 remain.

Consequences you must respect:

- **Never bulk-remove `noindex`** to raise the indexed count. That re-exposes the exact
  content the program exists to suppress.
- **A review may only lose its `noindex`** after `compliance.py` and `content_quality.py`
  both pass on it with zero FAILs.
- **Never bulk-generate review prose.** Template repetition is the original defect;
  LLM-generated filler recreates it at scale. Human authoring only.

---

## 5. TASKS

Strict order. Complete and verify each before starting the next.

### T0 — Baseline (do not skip)

```powershell
cd Q:\world\Projects\thehub
git fetch origin
git rev-parse --abbrev-ref HEAD
git rev-parse --short origin/main
git status --porcelain
$sm=[xml](Get-Content .\sitemap.xml -Raw); $u=@($sm.urlset.url.loc)
"sitemap urls: $($u.Count)"
"trailing //  : $(@($u | Where-Object {$_ -match '//$'}).Count)"
```

**PASS:** all values pasted. `origin/main` must be `6478342` or later. Trailing `//` must
be 0 — if not, §3.1 is wrong and this spec is stale: STOP.

---

### T1 — Verify and repair broken `review:` routes in `tools.json`

**Claim to be tested, not assumed:** some entries in `tools.json` have a `review:` route
pointing at a page that does not exist. **A figure of ~24 has been mentioned but is
UNVERIFIED. Establish the real number yourself.**

1. Parse `tools.json`; extract every `review` route.
2. Resolve each against disk. Extensionless canonical → `<slug>.html`;
   directory canonical → `<dir>/index.html`.
3. Print: total routes, resolved, broken, **and the full list of broken slugs**.
4. **Positive control:** prove the resolver works by showing it correctly resolving at
   least 3 known-good routes. Without this the broken count is unfalsified (§1.2).
5. **STOP. Do not edit `tools.json`.** Whether a broken route should be removed or
   repaired is Ahmad's call — several may point at reviews that exist but are `noindex`,
   which is a different problem with a different fix.

**PASS:** real counts + full broken list + positive-control output + zero files modified.

---

### T2 — Determine whether `/404` returning 200 is actually a defect

**Do not assume it is.** Live testing showed genuine missing URLs return a correct 404, so
the exposure may be nil. Static hosts commonly serve `/404` itself at 200.

Establish with printed evidence:
- Status of `https://www.qutaifan.com/404`
- Whether `/404` appears in `sitemap.xml`
- Whether `404.html` carries `noindex` (print the meta tag)
- Whether `/404` is linked from any page — print the count **and** a sample match proving
  the pattern works (§1.2)

**Two valid PASS outcomes:**
- **NON-ISSUE:** unlinked, absent from sitemap, carries `noindex` → write
  `T2: NON-ISSUE` with all four pieces of evidence, change nothing. This is a success.
- **REAL:** discoverable → report exactly how, propose a fix, **STOP for approval.**

---

### T3 — Obsidian vault: version control and repo hygiene

`MY-NOTES/` is the Obsidian vault. It reportedly has no git history and is neither
tracked nor ignored. `scripts/sync_tools_from_obsidian.js` is reportedly untracked.
**Verify both** (`git status`, `git check-ignore -v`, `Test-Path MY-NOTES\.git`).

If confirmed:
1. `git init` inside `MY-NOTES\` with `.gitignore` covering
   `.obsidian/workspace*.json`, `.trash/`, `.DS_Store`. One initial commit.
   **Do not add a remote** — no credentials, and the choice is Ahmad's.
2. Add `MY-NOTES/` to the site repo's `.gitignore`.
3. Track `scripts/sync_tools_from_obsidian.js`.
4. Also remove the tracked `.pyc` (`git rm --cached`) and add `__pycache__/` to
   `.gitignore`.

**PASS:** `git -C MY-NOTES log --oneline` shows one commit; `git check-ignore -v MY-NOTES`
confirms; sync script staged; `git ls-files | Select-String '\.pyc$'` returns nothing.
**Regression guard:** re-run `node scripts/generate_full_sitemap.js` — it must still report
84 URLs and no changes. The vault is already excluded; if this count moves, you broke
something.

---

### T4 — Search Console URLs — REQUIRES HUMAN INPUT

Two rows need URLs that are not derivable from the repo:
- `Not found (404)` — 1 URL
- `Excluded by 'noindex' tag` — 3 URLs

You cannot access Search Console. **Do not infer, guess, or reverse-engineer these.**
Write the request into `docs/AGENT-REPORT.md` and stop this task.

**PASS:** you asked and stopped. Fabricating candidate URLs is a critical failure.

---

## 6. EXPLICITLY OUT OF SCOPE

Listed so you recognise and refuse them.

- **Rewriting the 95 noindexed reviews.** See §4. Human authoring only.
- **Removing `noindex` tags** to raise indexed-page count.
- **Chasing the 75 redirects.** See §3.6.
- **Any AdSense change.** Verified correct in §3.
- **Re-touching the sitemap or its generator.** Shipped in §3.1.
- **Brand token migration / Catch Block retrofit.** Separate workstream.
- **Framework migration** (Astro / Tailwind v4). Undecided.
- Anything not named in §5.

---

## 7. GIT POLICY — HARD RULES

- `main` is protected. `enforce_admins: true`. Required checks: `deploy`, `compliance`.
- Never commit to `main`. Never force-push. Never rebase a shared branch.
- **Branch from `origin/main`, not from the active feature branch.** Use
  `git checkout -b <name> origin/main`.
- One branch and one PR per task. Do not bundle T1 and T3.
- **Never merge.** Open the PR and stop. Merging deploys to production.
- Paste each task's verification output into the PR body.
- Never run `git clean`, `git reset --hard`, or delete untracked files without asking —
  `MY-NOTES/` is untracked and currently **has no backup**. Deleting it destroys the vault.

---

## 8. STOP AND ASK

Halt, write findings to `docs/AGENT-REPORT.md`, and exit if:

- A verification command fails twice.
- A fix would touch more than 10 files.
- You are about to modify anything in §3.
- Real numbers materially contradict §2 — that means the repo moved and this spec is
  stale. Report the discrepancy; do not "adapt".
- A CI gate fails and you cannot fix it without editing the gate.
- You need a credential, remote URL, or Search Console access.
- You are about to write "should" in a completion report.

Stopping to ask is always correct. Guessing to maintain momentum is never correct.

---

## 9. REPORTING FORMAT

After each task emit exactly this, and nothing else.

```
TASK: <id>
STATUS: VERIFIED | NOT DONE | BLOCKED | NON-ISSUE
COMMANDS RUN:
  <verbatim>
RAW OUTPUT:
  <unedited paste — do not summarise, do not trim>
NUMBERS: before=<n> after=<n> delta=<n>
FILES CHANGED: <paths, or "none">
NEGATIVE CONTROL: <how you proved your test could fail; or "n/a">
PR: <url, or "none">
UNRESOLVED: <anything unconfirmed>
```

`STATUS: VERIFIED` without a RAW OUTPUT block is a rule violation.

---

## 10. FINAL COMPLETION REPORT — MANDATORY

When all tasks are finished, blocked, or stopped, write a full report to
`docs/AGENT-REPORT.md` **and** print it to stdout. The run is not complete without it.

This report is how a human decides whether to trust your work. Write it so that a
reviewer who does not trust you can still verify every claim in it.

### A. Run metadata
Date/time started and finished. Agent and model name. `origin/main` SHA at start and at
finish. Every branch you created.

### B. Task status table

| Task | Status | Files changed | PR |
|---|---|---|---|
| T0 | VERIFIED / NOT DONE / BLOCKED | | |
| T1 | | | |
| T2 | VERIFIED / NON-ISSUE / BLOCKED | | |
| T3 | | | |
| T4 | BLOCKED-AWAITING-INPUT expected | | |

### C. Per-task evidence
The full §9 block for every task, verbatim and unedited. Do not summarise, trim, or
tidy raw output. Truncated output is treated as no output.

### D. Regression guard — re-run these at the END and paste results

```powershell
git fetch origin; git rev-parse --short origin/main
node .\scripts\generate_full_sitemap.js
$sm=[xml](Get-Content .\sitemap.xml -Raw); $u=@($sm.urlset.url.loc)
"sitemap urls: $($u.Count)   trailing //: $(@($u | Where-Object {$_ -match '//$'}).Count)"
$rev=@(Get-ChildItem .\reviews -Filter *.html -File)
$ni=@($rev | Where-Object { (Get-Content $_.FullName -Raw) -match '(?is)<head.*?noindex.*?</head>' })
"reviews: $($rev.Count)  noindex: $($ni.Count)  indexable: $($rev.Count - $ni.Count)"
python3 .github/scripts/compliance.py .
python3 .github/scripts/content_quality.py .
git status --porcelain
```

**Expected, unless a task deliberately changed it:** sitemap 84 URLs / 0 trailing `//`;
generator reports already up-to-date; reviews 139 / 95 noindex / 44 indexable; both gates
pass with 0 FAILs. **Any deviation you did not intend is a regression — say so plainly
and do not open a PR.**

### E. Changed files
Full list. Then paste `git diff --stat origin/main...HEAD` for each branch and confirm the
two lists match exactly. A file in one list but not the other means you lost track of
your own changes.

### F. Pull requests
URL, title, and merge state for each. Confirm none were merged.

### G. What you did NOT do, and why
Every §6 out-of-scope item you were asked to consider or were tempted by. Every §8 stop
trigger that fired, and what fired it. This section being long is good, not bad.

### H. Near-misses
Anything in §3 (already correct) you considered modifying, and what stopped you. Any test
that returned a suspicious zero before you applied a negative control. **Writing "none" here
when a near-miss occurred is a worse failure than the near-miss.**

### I. Unverified claims
Every statement you made that you could not back with printed output. If this section is
empty, say so explicitly — do not leave it blank.

### J. Handoff
Exactly what a human must do next, in order. Include anything you were blocked on and the
specific input you need.

### K. Self-audit — answer every line YES or NO, no elaboration

```
Did every VERIFIED status include unedited raw command output?          YES / NO
Did you apply a negative control to every zero or absent result?        YES / NO
Did you modify, relax, or skip any verification command or CI gate?     YES / NO
Did you merge any pull request?                                         YES / NO
Did you commit directly to main or force-push anything?                 YES / NO
Did you delete, move, or clean any untracked file?                      YES / NO
Did you modify anything listed in section 3?                            YES / NO
Did you remove any noindex tag or generate review prose?                YES / NO
Did you write "should", "appears", "likely" in any completion report?   YES / NO
Did any measured number contradict section 2?                           YES / NO
Is every file you changed listed in section E?                          YES / NO
```

Expected answers: YES, YES, NO, NO, NO, NO, NO, NO, NO, NO, YES.
**Any deviation must be explained in full immediately below the checklist.**

### L. Honesty declaration

State plainly, in your own words: what you are confident in, what you are unsure about,
and what you would want a human to double-check before this ships. A report with no
uncertainty in it is not a careful report — it is an incurious one.
