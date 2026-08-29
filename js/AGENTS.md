<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-29 | Updated: 2026-08-29 -->

# js

## Purpose

`motion.js` drives the immersive layer defined in `../css/motion.css`. It is dependency-free,
deferred, and entirely progressive enhancement — the site is complete and readable without it.

Its central design decision: **it injects its own ambient markup and enhances existing
components by selector, rather than requiring edits to 180 hand-maintained HTML pages.**
That is why adding an effect here costs one file instead of a bulk regex rewrite of the
corpus — and root `AGENTS.md` hard rule §1.4 exists because such a rewrite once destroyed
the entire review corpus.

Untracked as of 2026-08-29 (`git status` reports `?? js/`); new work on the
`design/unify-and-homepage` branch, not yet committed.

## Key Files

| File | Description |
|------|-------------|
| `motion.js` | 952 lines. Single IIFE, `'use strict'`, no exports and no globals. Loaded sitewide as `<script src="/js/motion.js" defer>`. |

Linked by 179 of the 180 site HTML pages (measured 2026-08-29); the holdout is `404.html`.

## Architecture

Three capability flags are read once at startup (`motion.js:23–26`) and gate everything:

| Flag | Source | Effect when false |
|------|--------|-------------------|
| `reduced` | `prefers-reduced-motion: reduce` | The whole layer stands down; reveals resolve to their final state immediately |
| `fine` | `(hover: hover) and (pointer: fine)` | Tilt, magnetism and the pointer halo are skipped — they are meaningless on touch |
| `supportsIO` | `'IntersectionObserver' in window` | Reveals and counters resolve immediately instead of on scroll |

`init()` runs at the bottom of the file (on `DOMContentLoaded`, or immediately if the
document is already parsed) and calls each enhancer in order: `armIntro`, `buildField`,
`enhanceBrand`, `wrapTables`, `armHeroScroll`, `splitKinetic`, `enhanceCards`,
`enhanceMagnets`, `armReveals`, `armCounters`, `armTickers`, `armCanvas`.

### Custom properties written to the DOM

These are the contract with `../css/motion.css`. Renaming one here means renaming it there.

| Property | Meaning |
|----------|---------|
| `--mx` / `--my` | Pointer position within an element, 0–100% |
| `--rx` / `--ry` | Tilt rotation, deg |
| `--px` / `--py` | Pointer position within the viewport, 0–100% |
| `--scroll` | Document scroll progress, 0–1 |
| `--i` | Stagger index on a revealed child |
| `--vw` | Viewport width in px, excluding the scrollbar |

`--vw` is set **synchronously in `init()`**, not from the rAF loop, because `.fx-bleed`
reads it and a starved rAF would leave it on the `100vw` fallback that includes the
scrollbar. Do not move it into the frame loop.

### Selectors it enhances

`.bento-card`, `.card`, `.tool-card`, `.pick-card`, `.pair-card`, `.related-card`,
`.distro-card`, `.game-card`, `.category-chip-card`, `.faq-item`, `.hero-stats-strip`,
`.section-header-quiet`, `.code-install-block`, `.brand-lockup`, `.brand-mark`,
`.hero-immersive`, `.hero-scroll-track`, `.fx-ticker-track`, `table`, and the attribute
hooks `[data-fx-card]`, `[data-reveal]`, `[data-kinetic]`, `[data-count]`,
`[data-fx-magnetic]`.

## For AI Agents

### Working In This Directory

- **Ad units are never animated.** `armReveals()` explicitly skips anything inside
  `.ad-slot-container, .adsbygoogle` (`motion.js:527`) so units occupy their reserved
  height from first paint. This implements root `AGENTS.md` §5 and the code cites it. Any
  new enhancer that walks the DOM must apply the same exclusion.
- **Performance invariants — this site is monetised and tracks Core Web Vitals:**
  - all pointer work runs in one rAF loop, never in the event handler
  - every listener is `passive: true`; nothing here may block scrolling
  - only `transform`, `opacity` and custom properties are written, so **no effect in this
    file can cost CLS**. Writing `width`, `height`, `top`, `margin` or `display` breaks this.
  - the canvas stops when off-screen or the tab is hidden
- **Every new effect needs its reduced-motion path in the same change.** The pattern is
  `if (reduced) { <resolve to final state>; return; }` — stand down, never leave content
  hidden. `armIntro()` (`motion.js:162`) is the worked example.
- **Never hide content by default in CSS and reveal it only from JS.** A failed or blocked
  script must leave a complete, readable page. The `.js` class on `<html>` is set by a tiny
  inline script in each page's `<head>`, not by this file.
- **Enhance by selector; do not require markup changes.** If an effect needs a new hook,
  prefer an existing class or a `data-` attribute added to the few pages that need it —
  not a sitewide rewrite. See the note under Purpose.
- Guard every `querySelector` result. These pages are hand-maintained and inconsistent;
  assume any element may be absent on any page.

### Testing Requirements

No test suite and no bundler — the file is served as authored. Verify in a real browser,
and say so:

1. Load a page with DevTools open; the console must be clean.
2. Toggle **Rendering → Emulate `prefers-reduced-motion`** and confirm the page is
   complete, readable, and static.
3. Throttle to a coarse pointer / mobile emulation and confirm tilt and magnetism are off.
4. Run a Lighthouse or Performance trace and confirm **CLS is unchanged** by your edit.
5. Disable JavaScript entirely — the page must still be complete.

```bash
# adoption
grep -rl 'js/motion\.js' --include=*.html . | grep -v freeapps-components | wc -l

# the repository gates still apply to any page you touched
python .github/scripts/compliance.py .
```

Root `AGENTS.md` §0 rule 3: "verified in Chrome" and "reported by an HTTP fetch" are
different claims. State which you made.

### Common Patterns

- One IIFE, `var` declarations, ES5-level syntax — no build step, no transpiler, no
  polyfills. Match it; do not introduce `import`, optional chaining, or a framework.
- Each feature is a self-contained `arm*` / `enhance*` function that returns early when its
  target is absent or its capability flag is false.
- Section banners (`/* ---- Name ---- */`) separate features. Add yours the same way and
  call it from `init()`.
- Comments explain *why* a constraint exists, not what the line does. Match that.

## Dependencies

### Internal

- `../css/motion.css` — consumes every custom property listed above; the two files are one
  unit and must change together
- `../css/site.css` — the structural system the effects sit on top of
- Each page's inline `<head>` script that sets `<html class="js">`

### External

None. No framework, no CDN, no npm package.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
