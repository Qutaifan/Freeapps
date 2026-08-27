<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# fonts

## Purpose

Self-hosted web fonts. Self-hosting rather than linking Google Fonts is deliberate: it
removes a third-party request from every page, which matters both for Core Web Vitals and
for what the privacy policy has to disclose.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `inter/` | Holds `inter-latin-var.woff2` — the Inter variable font, Latin subset. |

## For AI Agents

### Working In This Directory

- **Measured 2026-08-27: 7 deployable pages reference `fonts/inter`** — the graphic-design,
  video-editing, Linux-distro and open-source pillars, plus `editorial-policy.html`,
  `free-alternative-to-photoshop.html`, and `free-password-generator.html`. Method:
  `grep -rl "fonts/inter" --include="*.html" .`, excluding `freeapps-components/`. Every
  other page falls back to a system stack. That inconsistency is real; do not "fix" it by
  bulk-editing `<head>` across the corpus without counting words before and after.
- **Renaming or moving this file breaks those 7 pages silently.** A missing `woff2` does
  not error — it falls back to a system font — so a browser check is required, not an
  HTTP fetch.
- Binary assets are served straight from the repo root. Adding a font here adds a public
  URL and page weight; prefer subsetting an existing family over adding another.
- Keep `font-display: swap` and the `preload` hint together wherever the face is declared.
  Dropping either reintroduces layout shift, which is also an ad-placement concern.

### Testing Requirements

```bash
grep -rl "fonts/inter" --include="*.html" . | grep -v freeapps-components | wc -l
```

Compare this count before and after any change here. Confirm rendering in a browser —
a font fallback is invisible to `curl`.

### Common Patterns

One directory per family, variable format (`woff2`) only, Latin subset only.

## Dependencies

### Internal

- The 7 pages listed above; `../docs/superpowers/specs/` treats this as the type stack for
  the visual reskin.

### External

- Inter (SIL Open Font License 1.1). Retain the licence terms if the font is redistributed.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
