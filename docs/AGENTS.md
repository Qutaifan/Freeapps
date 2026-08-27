<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# docs

## Purpose

Agent-facing specifications, remediation prompts, triage reports, and the structured
fact corpus. This is working documentation for the *repository*, not site content. It **is**
still deployed and publicly fetchable by direct URL — `robots.txt` now carries
`Disallow: /docs/` (added 2026-08-27), so it is not crawlable, but do not put anything here
that would be a problem to read.

## Key Files

Current documents only. Superseded specs and dated reports moved to `archive/` on 2026-08-27.

| File | Description |
|------|-------------|
| `PROJECT-FINISHING-SPEC-V3.md` | **Current.** Supersedes `archive/MASTER-REMEDIATION-SPEC-V2.md` and both archived ANTIGRAVITY prompts. Intended to be pasted whole as an opening prompt. |
| `FACT-GATHERING-SPEC.md` | **Current (v2).** How to produce a cited fact sheet per tool. Gathers facts, never prose. §0.5 documents exactly how v1 failed, with evidence — read it first. Enforced by `scripts/verify_facts.js`. |
| `OMNIVORE-DECISION.md` | **Open.** Decision packet on Omnivore remediation and Revolt rebranding, awaiting an editorial call. Do not act on it unilaterally. Kept out of `archive/` because it is unresolved, not historical. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `archive/` | Superseded specs and point-in-time reports — **not authoritative** (see `archive/AGENTS.md`) |
| `facts/` | Structured, cited fact sheets, one JSON per tool (see `facts/AGENTS.md`) |
| `superpowers/` | Design specs and implementation plans for the visual reskin (see `superpowers/AGENTS.md`) |

## For AI Agents

### Working In This Directory

- **Everything in this directory is current.** Superseded specs live in `archive/` and are
  not authoritative — following one is a known failure mode in this repo, not a
  hypothetical one. Check a document's banner before acting on it either way.
- **Retract in place, never delete.** A finding that turns out wrong is struck through and
  corrected where it was written. That is why the superseded prompts still exist, with
  banners, instead of being removed.
- Dated reports moved to `archive/`. `archive/BROKEN-ROUTES-TRIAGE.md` says 22 broken
  review routes as of 2026-08-22; the count measured on 2026-08-27 is 19. Re-measure before
  quoting any number, and say when you measured it.
- **Investigations belong in the vault, not here.** New audits go to
  `MY-NOTES/THEHUB/Audits/<date>-<name>.md`. This directory is for specs and the fact
  corpus.
- `docs/facts/_fetches/` is gitignored — raw third-party HTTP responses must never be
  committed to a public repo. Only evidence substrings go into the JSON sheets.

### Testing Requirements

```bash
node scripts/verify_facts.js        # gates docs/facts/*.json
```

The Markdown here has no gate. Its correctness is your responsibility.

### Common Patterns

Every spec opens with its status relative to the others, a date, and — where a prior
version failed — a section documenting that failure with evidence before it gives any
instructions.

## Dependencies

### Internal

- `../scripts/verify_facts.js` (enforces `FACT-GATHERING-SPEC.md`)
- `../tools.json`, `../reviews/`
- `MY-NOTES/THEHUB/` — the vault, which is the actual source of truth for project context

### External

- None. Plain Markdown and JSON.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
