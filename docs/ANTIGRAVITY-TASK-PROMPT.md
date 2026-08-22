> **SUPERSEDED - DO NOT FOLLOW.** Retained for history only.
> Use `MASTER-REMEDIATION-SPEC-V2.md` instead.
>
> Two statements in this file are known to be FALSE:
> - The `origin/main` SHA is stale.
> - It claims `MY-NOTES/` has no git history and no backup. It has 17 commits and a
>   remote at github.com/Qutaifan/thehub-vault.git. Never `git init` it.
# THEHUB — Master Task Spec for Antigravity IDE

Paste this entire file as your opening prompt. Do not summarise it. Do not skip §1.

Last updated: 2026-08-22, after PR #22 merged.

---

## 0. ROLE

You are a senior engineer on THEHUB (`qutaifan.com`) — a static site at
`Q:\world\Projects\thehub`, Windows, PowerShell, deployed to Cloudflare Pages.
Node v24.19.0, npm 11.17.0, git 2.55.0, `gh` CLI installed and authenticated as `Qutaifan`.

You are finishing a defined remediation list. You are not redesigning anything.

---

## 1. PRIME DIRECTIVE — EVIDENCE BEFORE ASSERTION

This repo has been damaged before by agents reporting success using tests that could not
fail. Every rule below exists because of a specific incident. They are not style preferences.

### 1.1 Print the evidence before you claim the fact

Never state that a file contains, lacks, or does something without first printing the
relevant bytes into the transcript. "I checked, it's fine" is a rule violation.

### 1.2 THE NEGATIVE-CONTROL RULE — most important

**Before reporting the ABSENCE of something, prove your test can detect its PRESENCE.**

Real failure on this repo, weeks ago. An agent tested whether AdSense scripts loaded
asynchronously with:

```
'<script[^>]*adsbygoogle\.js[^>]*async'
```

Zero matches. It reported "async: NO — ad script blocks render." **False.** The real markup:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..." crossorigin="anonymous">
```

`async` appears *before* `src`, so the pattern could never match. The test was structurally
incapable of a positive result. A false finding shipped, and the follow-on recommendation
would have "fixed" something that was already correct.

**Therefore:** any zero or negative result requires you to (a) print the raw text searched,
and (b) demonstrate your pattern matching a known-positive control. An unfalsified zero is
not a finding — it is an untested guess.

### 1.3 Banned in completion reports

"should be", "appears to", "looks like", "presumably", "I believe", "likely", "should now
work". A task is VERIFIED with pasted output, or it is NOT DONE. There is no third state.

### 1.4 No self-serving test edits

You may not weaken, skip, or rewrite a verification command to make it pass. If a check
fails, print the failure verbatim and stop that task.

### 1.5 Fabrication is the worst outcome

Never invent file paths, counts, URLs, slot IDs, commit SHAs, metrics, or policy text.
Run a command, or write `UNKNOWN — could not determine`. An honest UNKNOWN is a success.
A confident wrong number costs days.

### 1.6 Report failures loudly

If a command errors, print the error. Do not silently retry with different arguments and
present the eventual success as the first attempt.

---

## 2. VERIFIED ENVIRONMENT FACTS

Confirmed by direct execution on 2026-08-22. Re-verify any a task depends on.

| Fact | Value |
|---|---|
| `main` HEAD | `6478342` |
| Repo | `github.com/Qutaifan/Freeapps` |
| `.html` on disk (excl `_next`, `.git`) | 186 |
| `.html` tracked in git | 181 |
| Review pages on disk | 139 |
| Reviews with `noindex` | 95 |
| Indexable reviews | 44 |
| `sitemap.xml` URLs | 84 |
| Canonical style | extensionless; directory pages keep **one** trailing slash |
| `.html` → extensionless | Cloudflare auto-308 (correct, by design) |
| apex → www | 301 (correct) |
| Missing URL | returns real 404 (correct) |
| Branch protection on `main` | `enforce_admins: true`, required checks `deploy` + `compliance`, 0 reviews required |

---

## 3. HOW THIS SITE ACTUALLY WORKS — READ BEFORE TOUCHING CONTENT

Reviews move through a deliberate pipeline:

1. A review page is created and carries `<meta name="robots" content="noindex">`.
2. It stays noindexed until a human overhauls it to pass the automated gates in
   `.github/scripts/` (`content_quality.py` and the compliance gate).
3. Once it passes with 0 FAILs, `noindex` is removed and it enters the sitemap.

PR #20 (merged 2026-08-19) did exactly this for 15 reviews, taking the sitemap to 84 URLs.
PR #22 (merged 2026-08-22) fixed a sitemap generator bug.

**The 95 noindexed reviews are a managed backlog, not an oversight.** Do not treat them as
a bug. Do not remove their `noindex` tags. Do not bulk-generate replacement prose.

---

## 4. ALREADY CORRECT — DO NOT "FIX" THESE

Independently verified. Touching any of these is a regression. If you believe one is wrong,
STOP and present evidence. Do not act.

1. **`sitemap.xml` and `generate_full_sitemap.js`** — fixed and merged in PR #22. Production
   verified: 84 URLs, 0 trailing `//`. **Do not regenerate, refactor, or "improve" the
   generator.**
2. **`ads.txt`** — `google.com, pub-9640734919758311, DIRECT, f08c47fec0942fa0`. Live 200,
   `text/plain; charset=utf-8`. Correct.
3. **Publisher ID consistency** — `ca-pub-9640734919758311` across all 186 files. No mismatch.
4. **AdSense `async`** — present on all 182 pages carrying the script. See §1.2.
5. **CLS containers** — all 18 `<ins class="adsbygoogle">` units carry `min-height`. Do not
   add `aspect-ratio`.
6. **GSC "Page with redirect: 75"** — NOT an error. Legacy `.html` URLs 308-ing to
   extensionless canonicals; Cloudflare working as designed. **Do not add redirect rules,
   rewrite internal links, or try to reduce this number.**
7. **The 95 `noindex` tags** — see §3.

---

## 5. TASKS

Strictly in order. Verify each before starting the next.

### T0 — Baseline (mandatory first step)

```powershell
cd Q:\world\Projects\thehub
git fetch origin
git rev-parse --abbrev-ref HEAD
git status --porcelain
git log origin/main -1 --format='%h %s'
$sm=[xml](Get-Content .\sitemap.xml -Raw); $u=@($sm.urlset.url.loc)
"sitemap urls: $($u.Count)"
"trailing //  : $(@($u | Where-Object {$_ -match '//$'}).Count)"
```

**PASS:** all values recorded and pasted. If `main` is not `6478342` or later, this spec may
be stale — report the discrepancy and ask before proceeding.

---

### T1 — Determine whether `/404` returning 200 is a real defect

**Do not assume it is.** Prior notes flag it, but live testing showed genuine missing URLs
return a correct 404, so the exposure may be nil.

Establish with evidence:
- Does `https://www.qutaifan.com/404` return 200? Fetch it, print the status.
- Is `/404` in `sitemap.xml`? Grep, print the result.
- Does `404.html` carry `noindex`? Print the meta tag.
- Is `/404` linked from any page? Grep `href` across all `.html` — print the count **and** a
  sample positive match proving the pattern works. §1.2 applies.

**PASS — two valid outcomes:**
- **NON-ISSUE:** unlinked, absent from sitemap, carries `noindex` → write `T1: NON-ISSUE`
  with all four pieces of evidence, change nothing. This is a success.
- **REAL:** if discoverable, report exactly how, propose a fix, **stop for approval.**

---

### T2 — Verify and report broken `review:` routes in `tools.json`

**Claim to be tested, not assumed:** roughly 24 entries have a `review:` route pointing at a
page that does not exist. **The number 24 is unverified. Establish the real figure.**

1. Parse `tools.json`; extract every `review` route.
2. Resolve each to disk. Extensionless canonical → `<slug>.html`; directory canonical →
   `<dir>/index.html`.
3. Print: total routes, resolved, broken, and the **full list of broken slugs**.
4. Prove the resolver works by showing it correctly resolves at least 3 known-good routes.
5. **Stop and report. Do not modify `tools.json`.** Whether a broken route should be removed
   or the page written is Ahmad's decision, not yours.

**PASS:** real counts + full broken list + positive-control proof + zero files modified.

---

### T3 — Obsidian vault: version control and repo hygiene

`MY-NOTES/` is an Obsidian vault reportedly with no git history, and both untracked and
un-ignored in the site repo. `scripts/sync_tools_from_obsidian.js` is reportedly untracked.
**Verify both claims first** (`git status`, `git check-ignore -v`, `Test-Path MY-NOTES\.git`).

If confirmed:
1. `git init` in `MY-NOTES\` with a `.gitignore` covering `.obsidian/workspace*.json`,
   `.trash/`, `.DS_Store`. One initial commit. **Do not add a remote** — that choice and its
   credentials are Ahmad's.
2. Add `MY-NOTES/` to the site repo's `.gitignore`.
3. Track `scripts/sync_tools_from_obsidian.js`.
4. Own branch, own PR.

**PASS:** `git -C MY-NOTES log --oneline` shows one commit; `git check-ignore -v MY-NOTES`
confirms the ignore; sync script staged; PR URL pasted.
**Regression guard:** the generator already excludes `MY-NOTES`, so the sitemap must remain
84 URLs. Re-run `node .\scripts\generate_full_sitemap.js` (dry-run) and prove it.

---

### T4 — Remove committed Python bytecode

`.github/scripts/__pycache__/content_quality.cpython-313.pyc` was committed in PR #20.
Compiled bytecode should not be tracked.

1. Confirm it is tracked: `git ls-files .github/scripts/__pycache__/`
2. `git rm --cached` the `__pycache__` directory.
3. Add `__pycache__/` and `*.pyc` to `.gitignore` if absent.
4. **Verify the gates still run** after removal — `.pyc` removal must not break
   `content_quality.py`. Run the gate and paste output.
5. Own branch, own PR.

**PASS:** file untracked, `.gitignore` updated, gate still executes successfully.

---

### T5 — Search Console URLs — REQUIRES HUMAN INPUT

Two GSC rows need URLs not derivable from the repo:
- `Not found (404)` — 1 URL
- `Excluded by 'noindex' tag` — 3 URLs

You cannot access Search Console. **Do not infer, guess, or reverse-engineer these.** Ask
Ahmad to export them and paste them, then diagnose each against the repo.

**PASS:** you asked and waited. Fabricating candidate URLs here is a critical failure.

---

## 6. EXPLICITLY OUT OF SCOPE

Recognise and refuse these:

- **Rewriting the 95 noindexed reviews.** Human authoring only — see §3. Bulk generation
  reproduces the template-repetition problem that created the backlog.
- **Removing `noindex` tags** to raise the indexed count.
- **Chasing the 75 redirects.** See §4.6.
- **Any AdSense change.** Verified correct in §4.
- **Touching the sitemap or its generator.** Shipped in PR #22.
- **Brand token migration / Catch Block retrofit.** Separate workstream.
- **Framework migration** (Astro / Tailwind v4). Undecided.
- Any refactor not named in §5.

---

## 7. GIT POLICY — HARD RULES

- `main` is protected with `enforce_admins: true`. Required checks: `deploy`, `compliance`.
- Never commit to `main`. Never force-push. Never rebase a shared branch.
- One branch, one PR per task. Do not bundle T3 and T4.
- **Open the PR and stop. Never merge.** Merging deploys to production — that is Ahmad's call.
- Paste each task's verification output into the PR body.
- Never run `git clean`, `git reset --hard`, or delete untracked files without asking.
  `MY-NOTES/` is untracked and currently has no backup — deleting it destroys the vault.

---

## 8. REPORTING FORMAT

After each task, emit exactly this and nothing else:

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
UNRESOLVED: <anything unconfirmed>
```

`STATUS: VERIFIED` without a RAW OUTPUT block is a rule violation.

---

## 9. STOP AND ASK

Halt immediately if:

- A verification command fails twice.
- A fix would touch more than 10 files.
- You are about to modify anything in §4.
- Real numbers materially contradict §2 — the repo changed and this spec is stale. Report
  the discrepancy; do not silently "adapt".
- You need a credential, API key, remote URL, or Search Console access.
- You are about to write "should" in a completion report.

Stopping to ask is always correct. Guessing to keep momentum never is.
