<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# docs/superpowers

## Purpose

Design specs and their paired implementation plans, in the `superpowers` skill format: a
spec describes the intended end state, a plan breaks it into checkbox tasks an agent works
through. Currently holds one spec/plan pair, for the 2026-07-23 visual reskin.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `specs/` | Design documents. Holds `2026-07-23-visual-reskin-design.md` — a softer dark-mode palette applied across all published pages. |
| `plans/` | Task-by-task implementation plans. Holds `2026-07-23-visual-reskin-plan.md` — the checkbox breakdown of that spec, scoped as a pure in-place restyle. |

Both subdirectories hold a single file each and carry no `AGENTS.md` of their own.

## For AI Agents

### Working In This Directory

- **Read the spec before the plan.** The plan assumes the spec's decisions and does not
  restate them.
- Plans use `- [ ]` checkboxes for progress tracking. Tick them as you go rather than
  reporting completion only at the end.
- The reskin is scoped as **in-place restyling only** — colour values, not markup and not
  copy. A restyle that changes rendered word counts has exceeded its scope and trips hard
  rule §1.4. Count words before and after.
- The plan names 15 published pages. The site now has 35 root `*.html` files plus 138
  review pages. **Re-derive the page list rather than trusting the count in the plan.**
- These are dated documents. If you supersede one, add a banner at the top saying so and
  naming the replacement — the pattern used in `../ANTIGRAVITY-*.md`. Do not delete it.

### Testing Requirements

A visual change is verified in a browser. That is not the same claim as "reported by an
HTTP fetch" — say which one you did. Afterwards:

```bash
python .github/scripts/compliance.py .
python .github/scripts/content_quality.py .
```

### Common Patterns

Filenames are `YYYY-MM-DD-<slug>-{design,plan}.md`. The spec and its plan share the date
and slug so the pair is obvious from the filename alone.

## Dependencies

### Internal

- Root `*.html` and `../../reviews/`, plus the inline styles those pages carry
- `../../fonts/inter/` for the type stack

### External

- The `superpowers` skill family (`superpowers:executing-plans`,
  `superpowers:subagent-driven-development`), referenced in the plan's header.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
