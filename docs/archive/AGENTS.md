<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# docs/archive

## Purpose

Superseded specifications and point-in-time reports. **Retained for history, not for
following.** Moved here 2026-08-27 so that `../` contains only documents that are still
current.

The project's convention is to **retract in place, never delete** — a spec that turns out
wrong keeps its file and gains a banner naming what replaced it. That is why these still
exist rather than having been removed.

## Key Files

### Superseded specs — do not follow

| File | Description |
|------|-------------|
| `ANTIGRAVITY-CLI-MASTER-PROMPT.md` | **SUPERSEDED — DO NOT FOLLOW.** Its own banner names two statements in it that are false: a stale `origin/main` SHA, and a claim that `MY-NOTES/` has no git history or backup (it has both). |
| `ANTIGRAVITY-TASK-PROMPT.md` | **SUPERSEDED — DO NOT FOLLOW.** Same banner, same two false statements. |
| `MASTER-REMEDIATION-SPEC-V2.md` | Superseded by `../PROJECT-FINISHING-SPEC-V3.md`. Was itself the replacement for the two ANTIGRAVITY prompts. |

### Point-in-time reports

| File | Description |
|------|-------------|
| `AGENT-REPORT.md` | Completion report for the Spec v2 remediation run, 2026-08-22 04:34–04:37. |
| `BROKEN-ROUTES-TRIAGE.md` | Triage of 22 broken review routes, 2026-08-22, per Spec V2 §5 (T4/T5): 16 WRITE-REVIEW, 4 REMOVE-ROUTE. **The count measured on 2026-08-27 is 19, not 22** — re-measure before quoting either. |

## For AI Agents

### Working In This Directory

- **Nothing here is authoritative.** The current spec is `../PROJECT-FINISHING-SPEC-V3.md`;
  the current fact-gathering rules are `../FACT-GATHERING-SPEC.md`. If you are reading a
  file in this directory to decide what to do, you are in the wrong place.
- **Following a superseded prompt is a documented failure mode in this repo**, not a
  hypothetical one — which is why the banners are the first thing in each file.
- **Report numbers here are dated and now stale.** Treat every count as a historical
  observation with a date attached, never as current state. Re-derive before quoting.
- `../PROJECT-FINISHING-SPEC-V3.md` still names `docs/AGENT-REPORT.md` as the **write
  target** for a future run. That is deliberate and was not repointed here: a new run
  should produce a fresh report at `docs/AGENT-REPORT.md`, leaving this one archived.
- **Do not delete these**, and do not strip the banners. Retract in place.

### Testing Requirements

None — these are inert Markdown. `robots.txt` disallows `/docs/`, so nothing here is
crawlable, but it is still deployed and publicly fetchable by direct URL. Do not add
anything here that would be a problem to read.

### Common Patterns

A superseded document keeps its original body and gains a top banner giving its status,
what replaced it, and — where known — the specific statements in it that are false.

## Dependencies

### Internal

- `../PROJECT-FINISHING-SPEC-V3.md` — the current spec that supersedes these
- `../OMNIVORE-DECISION.md` — still open; cites `archive/MASTER-REMEDIATION-SPEC-V2.md` §5

### External

- None. Plain Markdown.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
