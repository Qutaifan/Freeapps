<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# scripts/archive

## Purpose

One-shot repair and generation scripts that have already been run. **Kept for provenance,
not for reuse.** Each documents, in its own header, a specific incident and the fix that
was applied — several of the project's hard rules exist because of what is in this
directory.

Moved here 2026-08-27 to separate them from live tooling in `../`. Nothing in CI invokes
anything in this directory.

## Key Files

### Generators — running these again would violate a hard rule

| File | Description |
|------|-------------|
| `build_review_pages.js` | Generated review pages from `tools.json`. **This is the script that produced the templated corpus still holding 95 pages out of the index.** Hard rule §1.6 forbids auto-generating reviews. Archived specifically so it is not run by reflex. |
| `enrich_and_fix_all_reviews.js` | Bulk canonical / JSON-LD / byline / ad-container pass across every review. |
| `merge_reviews_recovery.js` | Spliced ~47,000 words of human editorial content back in from commit `3ef61dc` after a bulk regex rewrite destroyed the corpus. **The reason hard rule §1.4 exists.** |
| `write_video_editors_content.py` | One-shot hand-written rewrite of 5 video-editor reviews from vendor docs. Claims no hands-on testing. |

### Completed repairs

| File | Description |
|------|-------------|
| `fix_compliance.js` | Added `google-adsense-account` meta sitewide; fixed conflicting indexability directives on `404.html`. |
| `fix_h1_and_duplicate_urls.js` | Collapsed duplicate `<h1>`s; deleted thin trailing-slash duplicate stubs. |
| `fix_review_truthfulness.py` | Replaced the fabricated "How we tested it" section with honest research provenance. **The reason hard rule §1.5 exists.** Its `body_words` counter is still referenced by `.github/scripts/compliance.py` in a comment. |
| `fix_seo_indexing.js` | Replaced `noindex, follow` with `index, follow, max-image-preview:large`. Superseded by `../fix_lifecycle_exposure.py`, which computes exposure rather than setting it blindly. |
| `fix_broken_internal_links.py` | Rewrote links to review slugs with no file in `reviews/`. |
| `insert_pillar_ads.js` | Inserted in-content ad units into root pillars at ~22% and ~62% of the copy. |
| `set_adsense_slots.js` | Replaced placeholder slot IDs with real unit IDs; added `min-height` guards. |
| `resize_logo.ps1` | Resized `logo.jpg` to 256×256 via System.Drawing. |

## For AI Agents

### Working In This Directory

- **Default to not running anything here.** These scripts were written against a repo
  state that no longer exists. Most are not idempotent against today's corpus, and several
  would re-introduce the exact defect they once fixed.
- **`build_review_pages.js` is the single most dangerous file in this repository.** It runs
  cleanly and produces plausible output. That is the problem.
- Read a script's header before assuming what it does — each explains the incident it was
  written for, which is usually more useful than the code.
- If you genuinely need one of these behaviours again, **write a new script in `../`** to
  the current contract (dry-run default, `--apply`, idempotent, verification that can
  fail). Do not resurrect one of these in place.
- **Do not delete these.** Retract in place, never remove — the project keeps superseded
  work with an explanation rather than erasing it.

### Testing Requirements

Not applicable — nothing here should be run. If you do run one against a scratch copy,
never point it at the working tree without a clean `git status` first.

### Common Patterns

Node scripts are CommonJS with `path.join(__dirname, '..')` for the repo root — **note
that this now resolves to `scripts/`, not the repo root**, since these files moved one
level deeper. Any script run from here would need its root path corrected first. This is
another reason to write new rather than revive.

## Dependencies

### Internal

- Historical: `../../tools.json`, `../../reviews/`, root `*.html`
- `.github/scripts/compliance.py` references `fix_review_truthfulness.py` in a comment

### External

- Node 20, Python 3.11, PowerShell 5.1 — stdlib only

<!-- MANUAL: notes added below this line are preserved on regeneration -->
