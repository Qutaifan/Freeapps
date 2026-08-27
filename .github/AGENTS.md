<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# .github

## Purpose

Continuous integration for qutaifan.com: the two quality gates that decide whether a
pull request is mergeable, and the workflows that run them plus the Cloudflare Pages
deploy. This directory is dot-prefixed, so Cloudflare Pages does not upload it — nothing
here becomes a public URL.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `scripts/` | The gate implementations, `compliance.py` and `content_quality.py` (see `scripts/AGENTS.md`) |
| `workflows/` | GitHub Actions definitions (see `workflows/AGENTS.md`) |

## For AI Agents

### Working In This Directory

- **The workflows hardcode `.github/scripts/`.** Do not move the gates into `scripts/`
  at the repo root — that directory is for maintenance tooling and is publicly served.
- Workflows run on **Ubuntu** and correctly call `python3`. Locally you must use
  `python`. Do not "fix" the workflows to match the local machine.
- Branch protection on `main` requires **Compliance** and **Deploy**; **Content Quality**
  is advisory. Changing which checks are required is a GitHub settings change, not a
  file change here — ask first.

### Testing Requirements

Run both gates locally before pushing, and report the delta:

```bash
python .github/scripts/compliance.py .        # must stay passing
python .github/scripts/content_quality.py .   # exits 0, but read the warning counts
```

`content_quality.py` exits 0 as of 2026-08-27 (`FAIL=0`), but 95 of 138 reviews are held
out of the index for template repetition. `CLAUDE.md` and root `AGENTS.md` §6 still
describe it as failing; that text is stale. See `scripts/AGENTS.md` for the measured
numbers and why the "no new review pages" rule still stands regardless of exit code.

### Common Patterns

Each gate is a standalone script with a `main()`, exits non-zero on failure, and prints
findings grouped by check name. They are importable, so checks can be unit-tested.

## Dependencies

### Internal

- Reads the whole repo tree — every `*.html`, plus `robots.txt`, `ads.txt`,
  `sitemap.xml`, `tools.json`.

### External

- Python 3.11 (stdlib only — no `requirements.txt`)
- `actions/checkout@v4`, `actions/setup-python@v5`, `actions/setup-node@v4`
- `cloudflare/wrangler-action@v3`

<!-- MANUAL: notes added below this line are preserved on regeneration -->
