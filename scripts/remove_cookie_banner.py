#!/usr/bin/env python3
"""Remove the homemade "cookie banner" from every deployable HTML page.

Why this exists: the banner only hides a div. It persists no choice, sets no
cookie, and produces no TCF/consent-mode signal, so it cannot satisfy the EU
user-consent policy or the certified-CMP requirement (see the vault audit
2026-08-15-adsense-compliance). The certified Google CMP is enabled in the
AdSense dashboard (Privacy & messaging) and injects its own messaging; two
consent interfaces must never be shown at once.

Run this ONLY after the Google CMP is live in the account. Dry-run by default.

What it removes, per page (regex is a targeted substitution of a known
self-contained block; every result is re-verified below):
  1. CSS lines whose stripped text starts with '#cookie-banner' (5-line rule
     block in <style>, 14 pages, three cosmetic variants - all start with
     '#cookie-banner')
  2. the banner <div id="cookie-banner" ...>...</div> block (152 pages)

Verification per page (the numbers must hold or --apply refuses to write):
  - after removal, 0 'cookie-banner' occurrences remain
  - rendered visible word delta equals exactly the words inside the removed
    banner block (hard rule 4: no editorial content may be lost)
  - <div>/</div> balance changes by exactly the number of removed blocks

Conventions (AGENTS.md/CLAUDE.md):
  * dry-run by default, writes only with --apply
  * prints exactly what changed, per file
  * idempotent - a second run is a no-op
  * verifies at the end and reports numbers that can be non-zero

Usage:
    python scripts/remove_cookie_banner.py
    python scripts/remove_cookie_banner.py --apply
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

EXCLUDED_DIRS = {".git", ".vs", "_next", "MY-NOTES", "node_modules", "freeapps-components"}

BANNER_DIV_PAT = re.compile(
    r'<div id="cookie-banner"[^>]*>\s*(?:<p>.*?</p>\s*)?(?:<button[^>]*>.*?</button>\s*)?</div>',
    re.S | re.I,
)
BANNER_CSS_LINE_PAT = re.compile(r"^[ \t]*#cookie-banner[^\n]*$", re.M)


def body_words(text: str) -> int:
    """Rendered visible word count - same method as the project's hard-rule-4
    counter (scripts/fix_review_truthfulness.py)."""
    s = re.sub(r"(?is)<script.*?</script>", " ", text)
    s = re.sub(r"(?is)<style.*?</style>", " ", s)
    s = re.sub(r"(?is)<head.*?</head>", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return len(html.unescape(s).split())


def html_pages(site_root: Path):
    for p in sorted(site_root.rglob("*.html")):
        if EXCLUDED_DIRS & set(p.parts):
            continue
        yield p


def banner_blocks(text: str) -> list[str]:
    """All banner div blocks found, in order."""
    return BANNER_DIV_PAT.findall(text)


def banner_css_lines(text: str) -> list[str]:
    return BANNER_CSS_LINE_PAT.findall(text)


def main() -> int:
    apply = "--apply" in sys.argv[1:]
    site_root = Path(sys.argv[-1]) if len(sys.argv) > 1 and not sys.argv[-1].startswith("-") else Path(".")

    pages = list(html_pages(site_root))
    plan: dict[Path, dict] = {}
    total_banner_blocks = 0
    total_css_lines = 0
    total_banner_words = 0

    for p in pages:
        text = p.read_text(encoding="utf-8", errors="ignore")
        blocks = banner_blocks(text)
        css_lines = banner_css_lines(text)
        if not blocks and not css_lines:
            continue
        banner_words = sum(body_words(b) for b in blocks)
        plan[p] = {"blocks": len(blocks), "css": len(css_lines), "words": banner_words}
        total_banner_blocks += len(blocks)
        total_css_lines += len(css_lines)
        total_banner_words += banner_words

    if not plan:
        print("No cookie-banner markup found in any deployable page. Nothing to do.")
        return 0

    print(f"{'DRY RUN' if not apply else 'APPLYING'}: {len(plan)} pages carry the homemade banner "
          f"({total_banner_blocks} div blocks, {total_css_lines} CSS lines, "
          f"{total_banner_words} visible banner words).")

    block_variants: dict[str, int] = {}
    for p in pages:
        for b in banner_blocks(p.read_text(encoding="utf-8", errors="ignore")):
            key = re.sub(r"\s+", " ", b).strip()
            block_variants[key] = block_variants.get(key, 0) + 1
    print(f"Distinct banner div variants: {len(block_variants)}")
    for key, count in block_variants.items():
        print(f"  x{count}: {key[:120]}")

    if not apply:
        return 0

    changed = 0
    total_delta = 0
    failures = []
    for p, info in plan.items():
        text = p.read_text(encoding="utf-8", errors="ignore")
        before_words = body_words(text)
        divs_before = text.count("<div")
        closes_before = text.count("</div>")
        updated = BANNER_CSS_LINE_PAT.sub("", text)
        updated = BANNER_DIV_PAT.sub("", updated)
        after_words = body_words(updated)
        delta = after_words - before_words
        divs_after = updated.count("<div")
        closes_after = updated.count("</div>")
        problems = []
        if "cookie-banner" in updated:
            problems.append("cookie-banner remnant after removal")
        if delta != -info["words"]:
            problems.append(f"word delta {delta} != banner words {-info['words']}")
        if (divs_before - divs_after) != info["blocks"] or (closes_before - closes_after) != info["blocks"]:
            problems.append(
                f"div balance changed by {divs_before - divs_after} open / "
                f"{closes_before - closes_after} close, expected {info['blocks']} of each"
            )
        if problems:
            failures.append(f"{p.relative_to(site_root)}: " + "; ".join(problems))
            continue
        p.write_text(updated, encoding="utf-8")
        changed += 1
        total_delta += delta
        print(f"{p.relative_to(site_root)}: removed {info['blocks']} div(s) + {info['css']} CSS line(s), "
              f"visible words {before_words} -> {after_words} ({delta:+d})")

    if failures:
        print("\nREFUSED to write these pages (no files modified for them):")
        for f in failures:
            print(f"  - {f}")
        print(f"\n{len(failures)} page(s) failed verification. Nothing further was written for them.")
        return 1

    remaining = sum(1 for p in pages if "cookie-banner" in p.read_text(encoding="utf-8", errors="ignore"))
    print(f"\nVERIFICATION: {changed} pages updated, {total_delta:+d} total visible words "
          f"(equals removed banner boilerplate), pages still carrying any cookie-banner markup: {remaining}.")
    if remaining != 0:
        print("FAIL: banner markup remains on some pages.")
        return 1
    print("Second run of this script is now a no-op (idempotent).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
