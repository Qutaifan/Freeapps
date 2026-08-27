<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# how-to

## Purpose

Instructional guide pages, as distinct from tool reviews (`reviews/`), listicles (root
`*.html`), and comparisons (`vs/`). One guide per directory, each holding an `index.html`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `how-to-choose-the-best-free-software-2026/` | Buyer's-guide style article. Serves 200 at `/how-to/how-to-choose-the-best-free-software-2026/`. |

## For AI Agents

### Working In This Directory

- `x/index.html` serves 200 at `/how-to/x/` **with** the trailing slash. Canonicals,
  `og:url`, sitemap entries, and internal links must use that form.
- Guides are pillar-class for ads: at most two units (`qutaifan-pillar-top`,
  `qutaifan-pillar-mid`), ≥400 words apart, `min-height: 250px` on each. Pages under
  1200 words get one unit only.
- `HowTo` JSON-LD, if used, must describe steps actually rendered on the page — same rule
  as `FAQPage`. Invisible structured data risks a manual action.
- Do not fabricate testing or measurement to make a guide sound authoritative.
- Link out to `/reviews/<slug>` (extensionless) for any tool that has a review page;
  check the file exists in `reviews/` first, since 19 `tools.json` review routes have no
  page behind them.

### Testing Requirements

```bash
python .github/scripts/compliance.py .
python .github/scripts/content_quality.py .
node scripts/audit_internal_redirects.js
```

### Common Patterns

Single `<h1>`, editorial-board byline, `BreadcrumbList` + `Article` JSON-LD, table of
contents driven by the sitewide `toc.js`.

## Dependencies

### Internal

- `../tools.json`, `../reviews/`, `../author/qutaifan-editorial-board/`, `../toc.js`

### External

- Google AdSense, schema.org

<!-- MANUAL: notes added below this line are preserved on regeneration -->
