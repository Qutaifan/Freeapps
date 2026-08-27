<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# _next

## Purpose

Leftover static payload from an abandoned Next.js build: hashed JS chunks, one CSS
bundle, and the build manifests. **Generated output with no source in this repository.**
There is no `next.config.js`, no `app/` or `pages/` directory, and no Next.js build step
in any workflow — nothing here can be regenerated from what is in this repo.

The live pages are hand-maintained static HTML at the repository root. **Measured
2026-08-27: exactly one deployable page still references this directory — `404.html`.**
Method: `grep -rl "_next/" --include="*.html" .`, excluding `freeapps-components/` and
`_next/` itself. That single reference is the only thing keeping this directory load-bearing.

## Key Files

17 files, all generated:

| Path | Description |
|------|-------------|
| `static/<buildId>/_buildManifest.js`, `_ssgManifest.js` | Next.js route manifests for build `BX09i2HuxaStLrSpDmmPC`. |
| `static/chunks/framework-*.js`, `main-*.js`, `main-app-*.js`, `webpack-*.js`, `polyfills-*.js` | Framework and runtime chunks. |
| `static/chunks/app/page-*.js`, `layout-*.js`, `best-free-ai-tools-2026/page-*.js`, `_not-found/page-*.js` | App-router page chunks. |
| `static/chunks/pages/_app-*.js`, `_error-*.js` | Pages-router fallbacks. |
| `static/css/a7d4bdddfbc27273.css` | The single stylesheet. |

## For AI Agents

### Working In This Directory

- **Do not hand-edit anything here.** The root `AGENTS.md` §8 names `_next/` and
  `index.txt` explicitly as generated output. Filenames are content-hashed, so an edit
  makes the hash a lie and any cached copy diverges.
- **Do not delete this directory casually.** Check first which live pages still reference
  it, and remember Cloudflare Pages does not remove files that disappear from a deploy —
  a deletion here will not take effect in production until the cache is purged, so the
  site can appear fine while a fresh visitor breaks, or vice versa.
- Removing it is an editorial-risk change, not a cleanup: if a root pillar page pulls its
  stylesheet from `static/css/`, deleting that file unstyles a live page.
- **`robots.txt` does not disallow `/_next/`, and that is correct.** Google needs JS and
  CSS to render pages. Do not add a disallow here.

### Testing Requirements

Before proposing any change to this directory:

```bash
grep -rl "_next/" --include="*.html" . | grep -v freeapps-components
```

That command reports the pages that would be affected. It can return zero — which is the
only condition under which removal is safe — so it is a check that can actually fail. As
of 2026-08-27 it returns `404.html` and nothing else.

Note the interaction with root `AGENTS.md` §5: `404.html` deliberately carries **no**
AdSense loader and no ad units, and the compliance gate exempts it for that reason. Do
not "fix" that exemption while working out what `404.html` pulls from here.

### Common Patterns

Content-hashed filenames, immutable by convention. Never renamed, never patched, only
replaced wholesale by a build that no longer exists here.

## Dependencies

### Internal

- Referenced by root `*.html` pages that have not been fully de-Next-ified.

### External

- None at runtime. The Next.js toolchain that produced this is not installed anywhere in
  the repo.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
