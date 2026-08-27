<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-27 | Updated: 2026-08-27 -->

# docs/facts

## Purpose

The structured fact corpus: one cited JSON sheet per tool, produced under
`../FACT-GATHERING-SPEC.md` and gated by `../../scripts/verify_facts.js`. Facts only —
never prose, and never anything that could be pasted into a page.

17 sheets exist: `anything-llm`, `appflowy`, `bolt-new`, `cryptomator`,
`cyberchef-engine`, `devtoys`, `draw-io`, `duckdb`, `hoppscotch`, `kimi`, `lovable-dev`,
`open-webui`, `podman-desktop`, `stirling-pdf`, `v0-dev`, `ventoy`, `windsurf-ai`.

## Key Files

| File | Description |
|------|-------------|
| `<slug>.json` | One tool. The slug matches its `tools.json` entry. |

Sheet shape:

```json
{
  "slug": "kimi",
  "name": "Kimi AI",
  "verified_at": "2026-08-22",
  "official_url": "https://kimi.com",
  "fetch_log": [ { "url": "https://kimi.com", "status": 200, "bytes": 482960 } ],
  "license":       { "value": "UNKNOWN", "source": null },
  "pricing_model": { "value": "UNKNOWN", "source": null }
}
```

## For AI Agents

### Working In This Directory

This corpus exists **because five consecutive agent runs answered their own checklist
correctly while shipping fabrications.** The header of `verify_facts.js` names all five:
a per-page cap misread as a 90-day count, five citations to pages never fetched, an
invented price, a watermark claim sourced to an Apache-2.0 licence file, and a tool
documented entirely from a different product's docs.

So:

- **`UNKNOWN` with a `null` source is a correct, expected answer.** It is always better
  than a plausible value. Do not fill a field to make a sheet look complete.
- **Every non-`UNKNOWN` value needs a `source` pointing at a URL that appears in
  `fetch_log` with status 200.** Citing a page you did not fetch is the exact failure
  this gate was built to catch.
- **A meta tag is not a source for pricing, tiers, or status.** Neither is a licence file
  for a product claim.
- **Never edit `verify_facts.js` to make a batch pass.** It is mechanical on purpose and
  cannot be reasoned around.
- `_fetches/` is gitignored: raw third-party HTTP responses must never be committed to a
  public repo. Keep evidence substrings in the sheet, not whole pages.
- `verified_at` is the date you actually fetched. Do not carry an old one forward.

### Testing Requirements

```bash
node scripts/verify_facts.js
```

It must pass for every sheet you touch. A failure here means the sheet is wrong, not that
the gate is.

### Common Patterns

Every claim is `{ "value": ..., "source": ... }`, so an unsourced value is structurally
impossible to express. `fetch_log` records what was actually retrieved, with status and
byte count, so a citation can be checked against it mechanically.

## Dependencies

### Internal

- `../FACT-GATHERING-SPEC.md` — the authoring rules (v2; v1 was run and failed, see §0.5)
- `../../scripts/verify_facts.js` — the gate
- `../../tools.json` — the slug namespace

### External

- Each tool's own official site and documentation, fetched live.

<!-- MANUAL: notes added below this line are preserved on regeneration -->
