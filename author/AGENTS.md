<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# author

## Purpose

The E-E-A-T surface. Holds the single editorial-board page that every review and pillar
byline links to. Its credibility is load-bearing for both search and AdSense policy.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `qutaifan-editorial-board/` | The editorial-board page. Serves 200 at `/author/qutaifan-editorial-board/`. |

## For AI Agents

### Working In This Directory

- **This is the page most exposed to hard rule §1.5 — never fabricate editorial claims.**
  No invented credentials, no invented staff, no testing methodology that no human
  performed, no awards. The site's whole premise is honest coverage; manufacturing
  authority here is worse than shipping nothing and is an AdSense policy risk.
- Byline links across the site point at `/author/qutaifan-editorial-board/`
  **with the trailing slash** — it is an `index.html`, so that is the 200 form.
  Changing this path silently orphans ~140 bylines. If you move it, rewrite every
  reference in the same change and verify the count.
- If `Person` or `Organization` JSON-LD is present, everything it asserts must be true
  and visible on the page.

### Testing Requirements

```bash
python .github/scripts/compliance.py .
node scripts/audit_internal_redirects.js
grep -rl "author/qutaifan-editorial-board" reviews/ *.html vs/ | wc -l   # byline count
```

Compare the byline count before and after any change to this path.

### Common Patterns

Directory-plus-`index.html` layout, matching `vs/` and `how-to/`.

## Dependencies

### Internal

- Linked from `../reviews/*.html`, root pillar `*.html`, `../vs/*/index.html`

### External

- schema.org `Person` / `Organization`

<!-- MANUAL: notes added below this line are preserved on regeneration -->
