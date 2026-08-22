# THEHUB — Primary-Source Fact Gathering Spec **v2**

Produces structured, cited fact sheets per tool. **Gathers facts. Never prose.**

> **v2 supersedes v1.** v1 was run and it failed. §0.5 documents exactly how, with
> evidence. Read that section before anything else — the failures were subtle, the
> self-check passed them all, and you are capable of repeating every one.

---

## 0. WHY THIS EXISTS

95 of 139 review pages carry `noindex` because they were thin and template-repetitive.
The fix is not more words. The fix is **verified specifics**: a real license, a real
price, a real free-tier limit with a real source.

"Open-WebUI is a powerful tool for AI enthusiasts" is worthless.
"Free tier requires self-hosting; branding removal prohibited above 50 monthly users
(source: LICENSE)" is the entire product.

**Facts are not copyrightable. Prose is.** You extract the former.

---

## 0.5 THIS SPEC HAS ALREADY FAILED ONCE — THE THREE FAILURES

A prior run produced five fact sheets, reported **14/14 fields resolved, 0 UNKNOWN, on
all five tools**, and answered every self-check line correctly. All three failures below
survived that self-check.

### Failure 1 — A fabricated metric from a query that could not fail

It queried `api.github.com/repos/{repo}/commits?per_page=100`, took the array length, and
wrote it to `commits_last_90d`.

`per_page=100` caps the response at 100 items. It is a page-size limit, not a count. The
query can never return more than 100 for any active repo.

| Repo | Reported | Actual 90-day |
|---|---|---|
| open-webui | 100 | **1131** |
| anything-llm | 100 | **316** |
| stirling-pdf | 100 | **728** |
| cryptomator | 100 | **56** |
| duckdb | 100 | **5819** |

Its own console output said `Fetched commits count (sample): 100`. It wrote a value
labelled *sample* into a field named *last_90d*.

Cryptomator is the damaging case: the real answer, **56**, is genuine signal about a
slower-moving project. The fake 100 erased it and made it look busier than DuckDB.

### Failure 2 — Citing pages that were never fetched

It ran roughly six real fetches (LICENSE files, the releases API) and about six
`site:`-scoped **web searches**. It then cited as sources pages it had never retrieved —
`docs.openwebui.com/getting-started/`, `docs.anythingllm.com/features/telemetry`,
`duckdb.org/docs/connect/concurrency`, and others — and reported
*"All 18 primary endpoints resolved directly. Failed fetches: 0."*

A search result snippet is not a source. A URL you can construct is not a source.

### Failure 3 — An invented price

It recorded Cryptomator mobile as `"€29.99 / $14.99 one-time per platform"`. The actual
pricing page lists **€29.99** for Android, **€29.99** for iOS, and **€29.99** for desktop
Dark Mode. `$14.99` does not appear. Two products were merged and a number invented.

It also missed three facts that were on the page it claimed to have read:
- A license for one platform is not valid for another; **no bundle license exists**
- Prices are EUR base pricing for Germany, **adjusted at checkout by purchasing-power
  parity**, so the checkout price differs by country
- Hub Community includes **5 seats**, self-hosted only

That second one — the advertised price is not the price you pay — is exactly THEHUB's
editorial angle, and it was sitting in plain text on a page marked as sourced.

### The pattern

**14/14 with zero UNKNOWNs across five tools is the signature of gap-filling from
training data.** A real extraction run has holes. If your coverage is perfect, you are
not extracting, you are remembering.

---

## 1. THE ONE RULE ABOUT LANGUAGE

### NEVER COPY SENTENCES. EXTRACT VALUES.

**Hard test:** no field may contain more than **10 consecutive words** appearing on any
source page. If a value reads like marketing copy, it is copy — delete it.

Values are identifiers, numbers, dates, booleans, and short factual predicates you
compose from a table or spec. Not descriptions. Not adjectives like "powerful",
"seamless", "intuitive", "best-in-class".

**Never output `description`, `summary`, `intro`, `verdict`, `pros`, or `cons`.** Those
are the human's job.

---

## 2. EVIDENCE RULES

### 2.1 Every populated field carries a source URL
No source → `{"value": "UNKNOWN", "source": null}`.

### 2.2 UNKNOWN is a success
An uncited confident value poisons every page built on it. `UNKNOWN` costs nothing.

### 2.3 FETCH-OR-UNKNOWN — new in v2, hard rule
**A URL is only a valid source if you fetched it in this run and can show the retrieved
bytes.**

- `curl.exe -s <url>` or an HTTP GET. Not a web search.
- A `site:` search result, a snippet, a link in another page, or a URL you inferred from
  a naming pattern is **not a source**.
- For every source URL you cite, log: the fetch command, the HTTP status, and the exact
  substring of the response that supports the value.
- Fetch failed? The field is `UNKNOWN` and the failure goes in the report. Never
  substitute a search snippet for a failed fetch.

Maintain a `fetch_log` array per tool: every URL attempted, status code, bytes received.
**A source URL that does not appear in `fetch_log` with a 200 is a fabrication.**

### 2.4 DERIVED METRICS — new in v2, hard rule
Any number you compute rather than read must declare **the exact query and its limits.**

- If a result is paginated, capped, truncated, or sampled, **say so**. Report `">=100
  (capped)"`, never `100`.
- Before reporting a count, ask: *could this query return a larger number if one existed?*
  If not, the query is broken. That is §0.5 Failure 1.
- **Correct method for 90-day commit counts** (verified working):

```powershell
$since = (Get-Date).AddDays(-90).ToString('yyyy-MM-ddTHH:mm:ssZ')
$u = "https://api.github.com/repos/<owner>/<repo>/commits?since=$since&per_page=1"
$r = Invoke-WebRequest -Uri $u -Headers @{'User-Agent'='fact-check'} -UseBasicParsing
# the page number in the Link header's rel="last" IS the exact commit count
if($r.Headers['Link'] -match 'page=(\d+)>;\s*rel="last"'){ $matches[1] } else { '<=1' }
```

Sanity-check the output: 56 and 5819 are both plausible. Five repos all returning the
same round number are not.

### 2.5 Primary sources only, in this order
1. The project's repo — `LICENSE`, releases API, official docs in-repo
2. The project's official site — pricing, downloads, privacy policy
3. Official changelog or release notes

**Never**: aggregators, listicles, AI summaries, Wikipedia for pricing, competitor
comparison pages, or your training data. If your only source is memory → `UNKNOWN`.

### 2.6 Never infer
Do not infer a license from a repo being public. Do not infer pricing from "open source".
Do not infer platform support from a screenshot. Read the artefact.

### 2.7 Date-stamp everything
Record `verified_at`. A fact without a date is a rumour.

### 2.8 Contradictions get recorded, not resolved
Site says "free forever", pricing page shows a paid tier → record **both**, both URLs,
`"conflict": true`. Do not pick a winner. The contradiction is often the most valuable
line on the finished page.

Regional/PPP pricing, "free" tiers that are read-only, and licenses that are open-source
except for one clause all belong here.

---

### 2.10 EVIDENCE — every source needs the substring that proves it

A URL in `fetch_log` proves a page was fetched. It does not prove the page says what you
claim. A prior run wrote `"Zero diagram watermarks or export caps"` and cited an
Apache-2.0 licence file — 11,357 bytes of boilerplate mentioning neither watermarks nor
exports. The citation gate passed it.

**Every object with a `source` must also carry `evidence`:** the exact substring, copied
from the fetched page, that supports the value. Minimum 12 characters.

```json
"license": {
  "value": "AGPL-3.0-only",
  "source": "https://raw.githubusercontent.com/AppFlowy-IO/AppFlowy/main/LICENSE",
  "evidence": "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007"
}
```

`evidence` is the one place a verbatim quote is expected — it is proof, not published
prose, and never reaches a page. Keep it to the shortest span that settles the point.

**If you cannot find a supporting substring, the value is `UNKNOWN`.** Being unable to
quote the page is itself the discovery that the claim was never sourced.

### 2.11 A LICENCE FILE CANNOT ESTABLISH COMMERCIAL FACTS

`tiers`, `free_tier_limits`, `pricing_model`, `account_required` and `platforms`
may not cite a `LICENSE` file. Licence text governs redistribution, not price, quotas,
sign-up or OS support. Cite the pricing page, the docs, or the downloads page.
The gate enforces this.

### 2.12 STATUS MUST SURVIVE THE ACTIVITY NUMBER

`status: "active"` with fewer than 20 commits in 90 days is a contradiction until you
explain it. AppFlowy was recorded `active` on **1 commit in 90 days**, unremarked, while
sitting on two live pillar pages.

Either reclassify, or record the reason in `notes_for_writer` — development moved to
another branch, slow release cadence by design, whatever the evidence shows. An outlier
that large is a finding, not a rounding error.

---

## 3. OUTPUT SCHEMA

One JSON file per tool at `docs/facts/<slug>.json`.

```json
{
  "slug": "cryptomator",
  "name": "Cryptomator",
  "verified_at": "2026-08-22",
  "official_url": "https://cryptomator.org",
  "repo_url": "https://github.com/cryptomator/cryptomator",

  "fetch_log": [
    { "url": "https://cryptomator.org/pricing/", "status": 200, "bytes": 48213 },
    { "url": "https://raw.githubusercontent.com/cryptomator/cryptomator/main/LICENSE.txt", "status": 200, "bytes": 35147 }
  ],

  "license": { "value": "GPL-3.0-or-later", "source": "https://raw.githubusercontent.com/.../LICENSE.txt" },
  "pricing_model": { "value": "free desktop / paid mobile write access / paid team Hub", "source": "https://cryptomator.org/pricing/" },

  "tiers": [
    { "name": "Individual", "price": "Free", "gates": ["desktop full access", "unlimited vaults", "community support"], "source": "https://cryptomator.org/pricing/" }
  ],

  "free_tier_limits": [
    { "limit": "iOS and Android free versions are read-only", "source": "https://cryptomator.org/pricing/" },
    { "limit": "platform licenses are not cross-valid; no bundle license exists", "source": "https://cryptomator.org/pricing/" },
    { "limit": "desktop dark mode requires a paid supporter certificate", "source": "https://cryptomator.org/pricing/" }
  ],

  "account_required": { "value": false, "source": "..." },
  "telemetry": { "value": "UNKNOWN", "source": null },
  "platforms": { "value": ["Windows","macOS","Linux","Android","iOS"], "source": "..." },
  "self_host": { "required": false, "requirements": "...", "source": "..." },

  "last_release": { "version": "1.19.3", "date": "2026-06-29", "source": "..." },

  "activity": {
    "commits_last_90d": 56,
    "query": "GET /repos/cryptomator/cryptomator/commits?since=<-90d>&per_page=1, Link rel=last",
    "capped": false,
    "source": "https://api.github.com/repos/cryptomator/cryptomator/commits"
  },

  "status": { "value": "active", "source": "..." },

  "conflict": true,
  "conflict_notes": [
    { "claim_a": "listed price is EUR base pricing for Germany", "claim_b": "checkout price varies by country via purchasing-power-parity adjustment", "source": "https://cryptomator.org/pricing/" }
  ],
  "notes_for_writer": [
    "mobile free tier is read-only",
    "no bundle license across platforms",
    "checkout price differs from advertised by region"
  ]
}
```

`notes_for_writer` holds **flags, not prose** — max 12 words each. These become Catch
Block leads.

**`free_tier_limits` is the highest-value field.** Seat caps, storage caps, feature
gates, watermarks, export restrictions, read-only modes, retention limits. Mine the
pricing comparison table.

---

## 4. TASK — RE-RUN THE SAME FIVE TOOLS

```
open-webui, anything-llm, stirling-pdf, cryptomator, duckdb
```

Existing files in `docs/facts/` are **suspect**. Rebuild each from scratch under v2 rules.

**Keep** (genuinely fetched last time, re-verify cheaply): `license`, `last_release`.
**Rebuild from real fetches**: everything sourced to a docs or pricing page.
**Recompute with the §2.4 method**: `activity`.
**Correct outright**: Cryptomator pricing — see §0.5 Failure 3.

Then **STOP AND REPORT**. Do not touch a sixth tool.

**Report must include:**
- All five files in full
- The complete `fetch_log` for each — every URL, status, bytes
- Field coverage: resolved vs UNKNOWN per tool. **If you again report 0 UNKNOWN across
  all five, state explicitly why that is credible this time.**
- A diff against the v1 files: every value that changed, and why
- Any URL you could not fetch, and which field went UNKNOWN as a result

---

## 5. SELF-CHECK BEFORE WRITING EACH FILE

```
Does every populated field have a source URL?                          YES / NO
Does every source URL appear in fetch_log with status 200?             YES / NO
Did I fetch every cited page, rather than search for it?               YES / NO
For each derived number: could the query return a larger value?        YES / NO
Is any capped or paginated result reported as an exact count?          YES / NO
Does any field contain 10+ consecutive words from a source page?       YES / NO
Did I output description / summary / pros / cons / verdict?            YES / NO
Did I use any adjective like powerful/seamless/intuitive/best?         YES / NO
Is any value from memory rather than a fetched page?                   YES / NO
Did I record contradictions rather than resolving them?                YES / NO
```

Required: YES, YES, YES, YES, NO, NO, NO, NO, NO, YES.

The prior run answered these correctly and was still wrong three ways. **Answering the
checklist is not the check — re-reading your own output against §0.5 is.**

---

## 5.5 MANDATORY MACHINE GATE — you cannot self-certify past this

Three consecutive runs answered the §5 checklist correctly and still shipped a fabricated
metric, five uncited sources, and an invented price. **The checklist is not the check.**

Before submitting any batch, run:

```powershell
node .\scripts\verify_facts.js
```

Paste its full output into your report, including the summary table and exit code.

**`total citations not backed by a logged 200` must be 0. `FAIL` must be 0.**
If the gate exits 1, the batch is not ready. Fix the files — never the gate (§5.6).

The gate checks, mechanically:
- every `source` URL appears in that tool's `fetch_log` with status 200
- `fetch_log` entries carry url, numeric status, and byte count
- no `description` / `summary` / `pros` / `cons` / `verdict` / `blurb` keys
- no marketing adjectives in any value
- `activity` declares `query` and `capped`; a capped result may not report an exact count
- **identical `commits_last_90d` across unrelated repos** — the `per_page` cap signature
- zero UNKNOWN across every tool — warns, because that is the gap-filling signature

### 5.6 NEVER EDIT THE GATE
Do not modify, bypass, or special-case `scripts/verify_facts.js` to make a batch pass.
If you believe the gate is wrong, STOP and report the case. Editing a check so your own
output passes it is the single most damaging thing you can do in this repo.

---

## 6. HARD LIMITS

- Do not create, edit, or scaffold any `.html` file. Not one. Not a stub.
- Do not write review prose anywhere, including inside JSON.
- Do not edit `tools.json`, the sitemap, its generator, or anything in `MY-NOTES/`.
- Do not remove any `noindex` tag.
- Output confined to `docs/facts/`. Nothing else changes.
- Open no PR. These are untracked artefacts for human review.
- Never `git clean`, `reset --hard`, or delete untracked files — `MY-NOTES/` holds 26
  uncommitted files existing in exactly one place.

---

## 7. STOP AND ASK

- A source page is unreachable and you would otherwise guess.
- A tool's pricing sits behind a login.
- You are about to write a sentence longer than 12 words into any field.
- You are tempted to fill a field from training data.
- More than half a tool's fields resolve to `UNKNOWN` — report it. That is itself the
  finding: the tool may be dead or undocumented.
- A derived number looks suspiciously round, or matches across unrelated tools.

Stopping is always correct.

---

## 8. AFTER APPROVAL

Batches of 15, reporting after each. Priority order:

```
Batch 1 (referenced on live pages): appflowy, draw-io
Batch 2 (demand, no review yet):    ventoy, devtoys, hoppscotch, podman-desktop,
                                    v0-dev, bolt-new, windsurf-ai, lovable-dev,
                                    cyberchef-engine
Batch 3+:                           the 95 noindexed reviews, by traffic potential
```

No batch starts without explicit approval of the previous one.
