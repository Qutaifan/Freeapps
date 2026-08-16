#!/usr/bin/env python
"""
Sync each review page's actual discovery state (robots meta, sitemap
membership) to the lifecycle content_quality.py already computes for it.

This is the mechanical half of the 2026-08-16 fail-121 triage
(MY-NOTES/THEHUB/Audits/2026-08-16-fail-121-triage.md). It does not touch
review body content, does not change any check/threshold in
content_quality.py, and does not weaken the gate — it makes the site's
live behaviour match a verdict the gate already reached. The editorial
backlog (excessive_template_repetition, factual_contradiction) is
untouched except where a separate editorial pass has genuinely resolved it.

Two things per non-INDEXABLE review page:
  1. <meta name="robots" content="..."> -> "noindex, follow"
  2. its <url> block removed from sitemap.xml

And the reverse for any review page that IS INDEXABLE but was previously
marked noindex / dropped from the sitemap — e.g. a page that just graduated
out of the editorial backlog. Idempotent in both directions.

Conventions (AGENTS.md/CLAUDE.md):
  * dry-run by default, writes only with --apply
  * prints exactly what changed, per file
  * idempotent - a second run is a no-op
  * verifies at the end and reports numbers that can be non-zero

Usage:
    python scripts/fix_lifecycle_exposure.py
    python scripts/fix_lifecycle_exposure.py --apply
"""
import argparse
import html
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / ".github" / "scripts"))
import content_quality as cq  # noqa: E402

ROBOTS_PAT = re.compile(r'(<meta\s+name="robots"\s+content=")([^"]*)(")')
INDEXABLE_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
NOINDEX_ROBOTS = "noindex, follow"


def body_words(doc):
    """Rendered body word count. Hard rule 4: this must not drop unexpectedly."""
    s = re.sub(r"(?is)<script.*?</script>", " ", doc)
    s = re.sub(r"(?is)<style.*?</style>", " ", s)
    s = re.sub(r"(?is)<head.*?</head>", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return len(html.unescape(s).split())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="write changes (default: dry run)")
    ap.add_argument("--today", default="2026-08-16", help="lastmod date for newly-added sitemap entries")
    args = ap.parse_args()

    results = cq.run_lifecycle_gate(REPO)
    review_dir = REPO / "reviews"

    page_changes = []
    words_before, words_after = {}, {}

    for slug, r in sorted(results.items()):
        path = review_dir / f"{slug}.html"
        doc = path.read_text(encoding="utf-8")
        words_before[slug] = body_words(doc)

        want_noindex = r["computed_lifecycle"] != "INDEXABLE"
        m = ROBOTS_PAT.search(doc)
        if not m:
            print(f"ABORT: {slug}: no <meta name=\"robots\"> tag found")
            return 2
        current = m.group(2)
        is_noindex = "noindex" in current.lower()

        if is_noindex != want_noindex:
            new_value = NOINDEX_ROBOTS if want_noindex else INDEXABLE_ROBOTS
            new_doc = ROBOTS_PAT.sub(lambda mm: mm.group(1) + new_value + mm.group(3), doc, count=1)
            page_changes.append((slug, current, new_value))
            doc = new_doc

        words_after[slug] = body_words(doc)

        if args.apply and doc != path.read_text(encoding="utf-8"):
            path.write_text(doc, encoding="utf-8", newline="")

    for slug in page_changes:
        s = slug[0]
        print(f"{s:32s} robots: {slug[1]!r} -> {slug[2]!r}")

    dropped = [s for s in words_before if words_after[s] != words_before[s]]
    if dropped:
        print(f"ABORT: body word count changed on {len(dropped)} page(s): {dropped[:10]}")
        return 2

    # --- sitemap.xml ---------------------------------------------------
    sitemap_path = REPO / "sitemap.xml"
    sitemap = sitemap_path.read_text(encoding="utf-8")
    indexable = {slug for slug, r in results.items() if r["computed_lifecycle"] == "INDEXABLE"}
    non_indexable = {slug for slug, r in results.items() if r["computed_lifecycle"] != "INDEXABLE"}

    url_block_pat = re.compile(r"  <url>\n(?:.*\n)*?  </url>\n")
    removed, present_review_slugs = [], set()

    def strip_block(m):
        block = m.group(0)
        loc_m = re.search(r"<loc>https://www\.qutaifan\.com/reviews/([a-z0-9\-]+)</loc>", block)
        if not loc_m:
            return block  # not a review URL, leave untouched
        slug = loc_m.group(1)
        present_review_slugs.add(slug)
        if slug in non_indexable:
            removed.append(slug)
            return ""
        return block

    new_sitemap = url_block_pat.sub(strip_block, sitemap)

    # Add back any INDEXABLE review not currently present in the sitemap
    # (e.g. one that just cleared the editorial backlog). Inserted just
    # before </urlset>, matching the existing per-review <url> block shape.
    missing = sorted(indexable - present_review_slugs)
    added_blocks = "".join(
        f"  <url>\n    <loc>https://www.qutaifan.com/reviews/{slug}</loc>\n"
        f"    <lastmod>{args.today}</lastmod>\n    <changefreq>weekly</changefreq>\n"
        f"    <priority>0.7</priority>\n  </url>\n"
        for slug in missing
    )
    if added_blocks:
        assert new_sitemap.rstrip().endswith("</urlset>")
        new_sitemap = new_sitemap.replace("</urlset>", added_blocks + "</urlset>", 1)

    sitemap_changed = new_sitemap != sitemap

    print(f"\nsitemap: removing {len(removed)} review URL(s), adding {len(missing)}")
    if removed[:10]:
        print("  removed e.g.:", removed[:10])
    if missing[:10]:
        print("  added:", missing[:10])

    if args.apply and sitemap_changed:
        sitemap_path.write_text(new_sitemap, encoding="utf-8", newline="")

    print(f"\n{'APPLIED' if args.apply else 'DRY RUN - nothing written'}")
    print(f"pages with robots meta changed: {len(page_changes)}")
    print(f"body words: {sum(words_before.values())} -> {sum(words_after.values())} "
          f"(delta {sum(words_after.values()) - sum(words_before.values())})")

    if not args.apply:
        print("\nRe-run with --apply to write. Then re-run the gate to verify.")
        return 0

    # --- verify ----------------------------------------------------------
    results2 = cq.run_lifecycle_gate(REPO)
    from collections import Counter
    verdicts = Counter(r["verdict"] for r in results2.values())
    print("\nVERIFICATION - post-apply gate verdicts:", dict(verdicts))
    ok = verdicts.get("FAIL", 0) == 0
    print("FAIL == 0:", ok)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
