#!/usr/bin/env python3
"""Fail (exit 1) unless every published *.html carries the AdSense code in <head>.

This is a CI-adapted copy of the Freetools-root check_adsense.py used by
deploy.sh. The only change from that original is path resolution: the
original lives one directory above a sibling pages/ checkout and points
PAGES at parent/pages. Here the script lives inside the site repo itself
(.github/scripts/), so the site root is the repo root three levels up.
The checking logic (head_ok, the rglob scan, the exit code) is unchanged.
"""
import sys
from pathlib import Path

PUB = "ca-pub-9640734919758311"
PAGES = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[2]

def head_ok(html: str) -> bool:
    if "</head>" not in html:
        return False
    head = html.split("</head>")[0]
    return (f"adsbygoogle.js?client={PUB}" in head
            and f'name="google-adsense-account" content="{PUB}"' in head)

def main() -> int:
    # rglob, not glob: publishable HTML isn't only at the top level (e.g. reviews/*.html) —
    # a top-level-only check silently skips whole page classes instead of validating them.
    all_pages = sorted(PAGES.rglob("*.html"))
    bad = [str(p.relative_to(PAGES)) for p in all_pages if not head_ok(p.read_text(errors="ignore"))]
    if bad:
        print("ADSENSE CHECK FAILED — code/meta missing from <head> in:", ", ".join(bad))
        return 1
    print(f"adsense head check OK ({len(all_pages)} pages)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
