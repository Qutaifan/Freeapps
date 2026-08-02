# qutaifan.com Visual Reskin — Design

## Overview

Refresh the visual design of all published pages to a softer, more
visually comfortable dark-mode palette by applying a fixed color
substitution table in place, everywhere the old values appear. This is a
color-value change only — no layout, structure, CSS architecture, or copy
change.

## Revision note (supersedes the original architecture decision)

The original version of this spec proposed extracting the duplicated
inline CSS into one shared `pages/css/theme.css` file. Investigation
during planning found that assumption didn't hold:

- The 15 pages use at least 5 different CSS custom-property naming
  schemes (`--purple`/`--cyan`/`--bg-2` vs `--accent`/`--card`/`--bg2` vs
  others), some pages define no `:root` block at all and hardcode colors
  directly, and even pages that looked like the same "family" turned out
  to have small but real rule differences (e.g. `best-free-games-2026.html`
  and `best-free-password-managers-2026.html` use a different `nav`
  z-index and background opacity than the template).
- A selector-name-based coverage check (built and tested during planning)
  can only confirm a selector *exists* somewhere after migration — it
  cannot tell "identical rule, safe to delete the duplicate" apart from
  "same selector name, different rule, would silently change behavior if
  deleted." Given the real divergence found, that risk is not
  hypothetical.
- Local `main` was also found to be 2 commits stale versus `origin/main`
  (a 2026-07-21 change touching all 14 then-existing pages, adding a new
  `contact.html`, and substantially rewriting `index.html` and
  `best-free-ai-tools-2026.html` for a tool-detail-modal feature) — the
  original selector-level analysis was partly built against stale content
  regardless.

True deduplication would require rewriting pages to actually converge on
one system first — a much larger "full consolidation" effort, not what
was approved. Given the goal is visual comfort, not architecture, the
plan now uses direct in-place substitution instead: safe regardless of
how much the underlying CSS structures differ, because it never removes,
moves, or relies on anything matching between pages.

## Motivation (unchanged from original)

The site's dark theme uses near-pure-black background (`#09090b`) against
near-pure-white text (`#f2f2f3`), a ~19:1 contrast ratio. Research on
dark-mode reading (NN/g, PMC visual-fatigue studies) ties high-contrast
dark UIs to "halation" glare for the ~30-50% of adults with astigmatism,
and to measurably slower reading comprehension for long-form text versus
light mode — a real cost given guide pages run 2,500-6,000 words. The
audience (people researching free/open-source software) skews technical
and shows a documented preference for dark UIs in their own tools, so
staying dark-as-default (not switching to light mode) is a defensible
choice; softening it is a readability/comfort fix, not a traffic-growth
mechanism — no color choice here is expected to move engagement metrics
on its own.

## Scope

All 15 published pages: `index.html`, `about.html`, `contact.html`,
`privacy-policy.html`, `terms-of-service.html`, `404.html`, and the 10
guide pages (`best-free-*.html`,
`best-linux-distros-beginners-2026.html`,
`best-open-source-software-alternatives-2026.html`,
`free-alternative-to-photoshop.html`).

Out of scope: layout changes, component/behavior changes, copy changes,
CSS deduplication/architecture changes, a light theme or theme toggle,
and any color value not in the substitution table below (many pages carry
one-off colors from earlier design iterations — those stay as they are).

## Color substitution table

Applied as literal string replacement across each page's full file
content (every `<style>` block, including the cookie-banner block —
there's no reason to leave it the old shade once nothing is being
extracted/removed):

| Old | New |
|---|---|
| `#09090b` | `#121216` |
| `#111114` | `#1a1a20` |
| `#18181c` | `#22222a` |
| `#f2f2f3` | `#e7e7ec` |
| `#a0a0ab` | `#a8a8b5` |
| `#8b8b96` | `#85858f` |
| `#7c5cf6` | `#8a72e8` |
| `#06b6d4` | `#29b8d6` |
| `rgba(9,9,11,` | `rgba(18,18,22,` |
| `rgba(124,92,246,` | `rgba(138,114,232,` |
| `rgba(6,182,212,` | `rgba(41,184,214,` |
| `rgba(255,255,255,.08)` | `rgba(255,255,255,.07)` |
| `rgba(255,255,255,.14)` | `rgba(255,255,255,.15)` |

`--green`/`#10b981` and `--amber`/`#f59e0b` (wherever named) are
unchanged — badge semantics. Confirmed present in all 15 pages (9-28
matches each) by grepping `origin/main`'s actual current content before
finalizing this table.

Not in scope: `rgba(255,255,255,.10)` (a third, one-off border opacity
used only in the `about.html`/`contact.html` family), `#6c4ce6` (a
hover-darkened purple used only in a couple of pages), and any other
color that isn't an exact match for a row above.

## Architecture

No new files, no `<link>` tags, no removed CSS. Each page keeps its
existing inline `<style>` blocks exactly as structured today; only the
literal values in the table above change, wherever they appear in the
file. A single script, `retone_colors.py` (Freetools project root),
performs this per page: reads the file, applies the table as sequential
string replacement, reports exactly what changed and how many times,
writes the result. Verification is `git diff <page>` after each run,
confirmed to show no changes outside the table's values (already
validated during planning on `free-alternative-to-photoshop.html`: 20
matches, diff touched only those exact substrings, cookie-banner block
included, everything else — JSON-LD, markup, other colors — untouched).

`CLAUDE.md`'s existing rule about new pages copying an existing page's
CSS is unaffected by this change (still true; no architecture changed)
and needs no update.

## Rollout order

1. Confirm the substitution table's match counts against each page's
   current `origin/main` content (done during planning — see table above).
2. Run `retone_colors.py` on each of the 15 pages, reviewing `git diff`
   per page before committing.
3. Run the existing test suite and `check_adsense.py`.
4. Visual QA pass across all 15 pages.
5. Commit within `pages/` (its own git repo, executed from this isolated
   worktree). Pushing/deploying is a separate, explicit step for the user
   to approve.

## Testing

- `python3 -m unittest discover -s tests -v` must still pass unchanged.
- `python3 check_adsense.py` must still pass.
- Per-page `git diff` review: every changed line must only contain
  substrings from the substitution table.
- Manual visual check of each page for: softer background, readable
  off-white body text, purple/cyan-ish accent tones, badges still colored
  correctly (green/amber unchanged), nothing visibly broken.

## Non-goals

- No light theme or theme toggle.
- No component/layout restructuring.
- No CSS deduplication or shared-stylesheet architecture (see Revision
  note above).
- No SEO/content changes.
