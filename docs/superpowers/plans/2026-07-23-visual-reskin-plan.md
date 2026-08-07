# qutaifan.com Visual Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a softer, more visually comfortable dark-mode color
palette across all 15 published qutaifan.com pages, as a pure in-place
value substitution — no structural, layout, or architecture changes.

**Architecture:** One small script, `retone_colors.py` (Freetools project
root, outside the `pages/` git repo), applies a fixed table of literal
string replacements to a page's full file content — old hex/rgba values
to new ones. Nothing is removed, relocated, or shared between files; each
page keeps its own CSS exactly as structured today. This replaces an
earlier shared-stylesheet approach that planning found unsafe (see the
design spec's "Revision note" — the 15 pages use at least 5 different CSS
custom-property naming conventions and even similarly-styled pages have
small rule differences, so deduplication risked silently changing
behavior).

**Tech Stack:** Plain HTML/CSS, Python 3 stdlib only.

## Global Constraints

- No layout, component-shape, structural, or copy changes — literal color
  values only.
- Apply the substitution table to a page's **entire file content**,
  including its `#cookie-banner` `<style>` block — there's no shared file
  to keep in sync, so there's no reason to leave it the old shade.
- Do not touch any color value that isn't an exact match for a table
  entry (many pages have one-off colors from earlier iterations — e.g.
  `rgba(255,255,255,.10)` in `about.html`/`contact.html`, `#6c4ce6` in a
  couple of pages — those are out of scope).
- Commits happen inside `pages/` (this worktree, on branch
  `worktree-visual-reskin`). Do not push, and do not merge into `main` —
  that's a separate, explicit step for the user once everything is
  reviewed.

### Color substitution table

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

`--green`/`#10b981` and `--amber`/`#f59e0b` are unchanged (badge
semantics) — they're not in the table, so the script leaves them alone
automatically.

### Standard Retone Procedure (referenced by Tasks 2-4)

Each task gives you a list of `(FILE, expected_count)` pairs. For each one:

1. From the Freetools project root (`/mnt/q/World/projects/Freetools`),
   with your working directory inside this worktree's `pages/` checkout
   (`/mnt/q/World/projects/Freetools/pages/.claude/worktrees/visual-reskin`),
   run:
   ```bash
   python3 /mnt/q/World/projects/Freetools/retone_colors.py <FILE> --check
   ```
   Confirm the total substitution count printed matches `expected_count`
   for that file. If it doesn't match, stop and report — don't proceed
   until you understand why (the file may have changed since this plan
   was written).
2. Run it for real (same command, without `--check`).
3. Run `git diff <FILE>` and confirm every changed line only differs in
   substrings from the substitution table above — no other text on any
   changed line should differ from the original. (Reference: migrating
   `free-alternative-to-photoshop.html` during planning produced exactly
   this — 20 substitutions across the main `<style>` block and the
   `#cookie-banner` block, nothing else touched.)
4. Visually spot-check the page: serve `pages/` locally
   (`python3 -m http.server 8000` from the worktree's `pages/` root) and
   open `http://localhost:8000/<FILE>` — confirm the background reads
   softer/less stark and nothing looks broken.
5. Commit:
   ```bash
   git add <FILE> && git commit -m "Retone <FILE> to softer dark-mode palette"
   ```

---

### Task 1: Create `retone_colors.py`

**Files:**
- Create: `/mnt/q/World/projects/Freetools/retone_colors.py` (outside the
  `pages/` git repo — this is a project-level dev tool, not a site file,
  so it isn't committed to `pages/`)

**Interfaces:**
- Produces: a CLI, `python3 retone_colors.py <path> [--check]`, used by
  every task below.

- [ ] **Step 1: Write the script**

If this file already exists with this exact content (it may — it was
authored and validated against `free-alternative-to-photoshop.html`
during planning), just verify it matches; otherwise create it:

```python
"""Apply the approved color substitution table (docs/superpowers/specs/
2026-07-23-visual-reskin-design.md) to a page, in place, as literal string
replacement across the whole file. Does not touch anything else -- no
selectors, no structure, no variable names, no colors outside the table.

Usage: python3 retone_colors.py <path/to/page.html> [--check]
  --check   don't write; print a summary of what would change
"""
import sys
from pathlib import Path

SUBS = [
    ("#09090b", "#121216"),
    ("#111114", "#1a1a20"),
    ("#18181c", "#22222a"),
    ("#f2f2f3", "#e7e7ec"),
    ("#a0a0ab", "#a8a8b5"),
    ("#8b8b96", "#85858f"),
    ("#7c5cf6", "#8a72e8"),
    ("#06b6d4", "#29b8d6"),
    ("rgba(9,9,11,", "rgba(18,18,22,"),
    ("rgba(124,92,246,", "rgba(138,114,232,"),
    ("rgba(6,182,212,", "rgba(41,184,214,"),
    ("rgba(255,255,255,.08)", "rgba(255,255,255,.07)"),
    ("rgba(255,255,255,.14)", "rgba(255,255,255,.15)"),
]


def main():
    args = sys.argv[1:]
    check = "--check" in args
    args = [a for a in args if a != "--check"]
    path = Path(args[0])
    original = path.read_text(encoding="utf-8")

    updated = original
    counts = {}
    for old, new in SUBS:
        n = updated.count(old)
        if n:
            counts[f"{old} -> {new}"] = n
        updated = updated.replace(old, new)

    if not counts:
        print(f"NO MATCHES in {path} — nothing to do (check the file manually)")
        return

    print(f"{path}: {sum(counts.values())} substitution(s)")
    for label, n in counts.items():
        print(f"  {label}  x{n}")

    if check:
        print("(--check: no file written)")
        return

    path.write_text(updated, encoding="utf-8")
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Verify it against a known case**

From this worktree's `pages/` root:

```bash
python3 /mnt/q/World/projects/Freetools/retone_colors.py free-alternative-to-photoshop.html --check
```

Expected output: `... : 20 substitution(s)` with these exact counts —
`#09090b x1`, `#111114 x1`, `#18181c x1`, `#f2f2f3 x1`, `#a0a0ab x2`,
`#8b8b96 x1`, `#7c5cf6 x3`, `#06b6d4 x1`, `rgba(9,9,11, x2`,
`rgba(124,92,246, x4`, `rgba(6,182,212, x1`, `rgba(255,255,255,.08) x1`,
`rgba(255,255,255,.14) x1`. `--check` doesn't write, so nothing to revert.

No commit for this task (the script lives outside `pages/`, nothing to
commit in this repo).

---

### Task 2: Retone the static/simple pages

Follow the Standard Retone Procedure for each. Expected substitution
counts (verified against current `origin/main` content during planning):

| FILE | expected_count |
|---|---|
| `404.html` | 13 |
| `about.html` | 11 |
| `contact.html` | 13 |
| `privacy-policy.html` | 9 |
| `terms-of-service.html` | 9 |

- [ ] Complete the Standard Retone Procedure for `404.html`.
- [ ] Complete the Standard Retone Procedure for `about.html`.
- [ ] Complete the Standard Retone Procedure for `contact.html`.
- [ ] Complete the Standard Retone Procedure for `privacy-policy.html`.
- [ ] Complete the Standard Retone Procedure for `terms-of-service.html`.

---

### Task 3: Retone the template-family guide pages

Follow the Standard Retone Procedure for each.

| FILE | expected_count |
|---|---|
| `free-alternative-to-photoshop.html` | 20 |
| `best-open-source-software-alternatives-2026.html` | 20 |
| `best-linux-distros-beginners-2026.html` | 24 |
| `best-free-graphic-design-tools-2026.html` | 10 |
| `best-free-video-editing-software-2026.html` | 10 |

- [ ] Complete the Standard Retone Procedure for `free-alternative-to-photoshop.html`.
- [ ] Complete the Standard Retone Procedure for `best-open-source-software-alternatives-2026.html`.
- [ ] Complete the Standard Retone Procedure for `best-linux-distros-beginners-2026.html`.
- [ ] Complete the Standard Retone Procedure for `best-free-graphic-design-tools-2026.html`.
- [ ] Complete the Standard Retone Procedure for `best-free-video-editing-software-2026.html`.

---

### Task 4: Retone the remaining guide pages and the homepage

Follow the Standard Retone Procedure for each. `best-free-ai-tools-2026.html`
and `index.html` are the two largest/most recently-modified pages (the
2026-07-21 tool-detail-modal rewrite) — nothing about the procedure
changes, just take a little more care reading their diffs since there's
more CSS text to scan.

| FILE | expected_count |
|---|---|
| `best-free-ai-writing-tools-2026.html` | 15 |
| `best-free-games-2026.html` | 20 |
| `best-free-password-managers-2026.html` | 17 |
| `best-free-ai-tools-2026.html` | 28 |
| `index.html` | 26 |

- [ ] Complete the Standard Retone Procedure for `best-free-ai-writing-tools-2026.html`.
- [ ] Complete the Standard Retone Procedure for `best-free-games-2026.html`.
- [ ] Complete the Standard Retone Procedure for `best-free-password-managers-2026.html`.
- [ ] Complete the Standard Retone Procedure for `best-free-ai-tools-2026.html`.
- [ ] Complete the Standard Retone Procedure for `index.html`.

---

### Task 5: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm no old values remain anywhere**

From this worktree's `pages/` root:

```bash
grep -rl '#09090b\|#111114\|#18181c\|#f2f2f3\|#a0a0ab\|#8b8b96\|#7c5cf6\|#06b6d4\|rgba(9,9,11,\|rgba(124,92,246,\|rgba(6,182,212,\|rgba(255,255,255,\.08)\|rgba(255,255,255,\.14)' *.html
```

Expected: no output (empty). If any filename prints, that page still has
a leftover old value — go back and check whether Task 2-4 actually
completed for it.

- [ ] **Step 2: Run the existing test suite**

```bash
cd /mnt/q/World/projects/Freetools
python3 -m unittest discover -s tests -v
```

Expected: all tests pass — this migration doesn't touch anything the
suite covers, so this is a pure regression check.

- [ ] **Step 3: Run the AdSense gate**

```bash
python3 check_adsense.py
```

Expected: passes (exit 0).

- [ ] **Step 4: Full visual QA pass**

```bash
cd pages && python3 -m http.server 8000
```

Open each of the 15 pages in a browser and confirm: softer background,
readable off-white body text, purple/cyan-ish accent tones, badges still
colored correctly (green/amber unchanged), nothing visibly broken.

- [ ] **Step 5: Confirm clean state and summarize**

```bash
git log --oneline -20 && git status --short
```

Expected: a clean working tree with one commit per page (15 commits) plus
the docs commits. Report the final commit list — merging into `main` and
pushing (which triggers the Cloudflare Pages deploy) is a separate,
explicit step for the user to approve.
