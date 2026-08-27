<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# .claude

## Purpose

Claude Code project configuration and installed agent skills. Dot-prefixed, so Cloudflare
Pages does not upload it — nothing here becomes a public URL.

`.agents/` at the repo root is a **byte-identical mirror** of `skills/` for agent runners
that look there instead. The two must be kept in sync.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `skills/programmatic-seo/` | Installed skill: building SEO pages at scale from templates and data. `SKILL.md` plus `references/playbooks.md` and `evals/evals.json`. |

## For AI Agents

### Working In This Directory

- **Skills are installed, not authored.** They come from `npx skills` via
  `scripts/install-skills.ps1`, and their provenance is pinned in `../skills-lock.json`
  (source `coreyhaines31/marketingskills`, ref `main`, plus a `computedHash`). Hand-editing
  a `SKILL.md` invalidates that hash — reinstall or update the lock in the same change.
- **`.claude/skills/` and `.agents/skills/` must stay identical.** Verify with
  `diff -r .claude/skills .agents/skills`. Changing one and not the other means two agents
  read different instructions from the same repo.
- **Read `programmatic-seo` against this project's hard rules before applying it.** The
  skill is about generating templated pages at scale; this repository's content-quality
  gate currently *fails* on template repetition, and hard rules §1.6 and §6 forbid
  auto-generating review pages and forbid adding new review pages until the gate passes.
  Where the skill and the root `AGENTS.md` disagree, `AGENTS.md` wins. The legitimate use
  here is the `free-alternative-to-*` generator (`scripts/build_alternative_pages.js`),
  which is data-driven from the catalogue's own original blurbs — not the review corpus.
- The skill looks for `.agents/product-marketing.md` (or `.claude/product-marketing.md`)
  for business context. Neither exists here; the equivalent context lives in the vault at
  `MY-NOTES/THEHUB/PROJECT-BRIEF.md`.

### Testing Requirements

```bash
diff -r .claude/skills .agents/skills    # must report no differences
```

### Common Patterns

One directory per skill, `SKILL.md` with YAML frontmatter (`name`, `description`,
`metadata.version`), optional `references/` and `evals/`.

## Dependencies

### Internal

- `../skills-lock.json` — provenance and hash
- `../scripts/install-skills.ps1` — the installer
- `../.agents/` — the mirror

### External

- `npx skills` CLI; the `coreyhaines31/marketingskills` GitHub repository.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
