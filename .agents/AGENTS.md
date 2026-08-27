<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# .agents

## Purpose

A **byte-identical mirror of `.claude/skills/`**, for agent runners that look in
`.agents/` rather than `.claude/`. It holds no unique content. Dot-prefixed, so
Cloudflare Pages does not upload it — nothing here becomes a public URL.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `skills/programmatic-seo/` | Mirror of `../.claude/skills/programmatic-seo/`. `SKILL.md`, `references/playbooks.md`, `evals/evals.json`. Verified identical 2026-08-27. |

## For AI Agents

### Working In This Directory

- **Never edit only one side.** Any change here must be made identically in
  `../.claude/skills/`, in the same commit. Two agents reading divergent instructions
  from the same repository is a silent failure mode with no gate to catch it.
- Skills are **installed, not authored** — `scripts/install-skills.ps1` writes them and
  `../skills-lock.json` pins the source and `computedHash`. Hand-editing invalidates the
  hash; reinstall or update the lock in the same change.
- The `programmatic-seo` skill is subordinate to the root `AGENTS.md`. It teaches
  page generation at scale; hard rule §1.6 forbids auto-generating review pages, and §6
  forbids adding review pages at all until the content-quality gate passes. Where they
  conflict, `AGENTS.md` wins.
- The skill probes for `.agents/product-marketing.md`. It does not exist and should not be
  created here — project context lives in the vault at `MY-NOTES/THEHUB/PROJECT-BRIEF.md`,
  which is deliberately outside this repository.

### Testing Requirements

```bash
diff -r .agents/skills .claude/skills    # must report no differences
```

Run this after touching either side. It is a check that can actually fail.

### Common Patterns

Mirrors the layout of `.claude/skills/` exactly — same paths, same bytes.

## Dependencies

### Internal

- `../.claude/skills/` — the primary copy (see `../.claude/AGENTS.md`)
- `../skills-lock.json`, `../scripts/install-skills.ps1`

### External

- `npx skills` CLI; the `coreyhaines31/marketingskills` GitHub repository.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
