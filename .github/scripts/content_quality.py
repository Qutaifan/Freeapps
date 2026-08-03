#!/usr/bin/env python3
"""CONTENT QUALITY gate — checks for the phase between OPTIMIZE and COMPLIANCE
in the proposed pipeline (RESEARCH -> STRATEGY -> WRITE -> OPTIMIZE ->
CONTENT QUALITY -> COMPLIANCE -> PUBLISH -> LOG -> EVOLVE).

Not wired into hermes.py's live state machine — that's real orchestration
work deferred to the "Hermes Week 1 implementation" stage. This module is
the checking logic itself: runnable standalone (see main()) and importable
by both the eventual pipeline wiring and tests/test_content_quality.py.

Each check_* function returns a list of Finding — empty means clean.

The gate decision is now two questions, not one:
  - PUBLISHABLE: safe to have live at its URL at all (accurate, not broken,
    not spam-shaped). Blocked by anything in PUBLISHABLE_BLOCKING_CHECKS.
  - INDEXABLE: safe to actively promote to search engines (sitemap entry,
    no noindex). A stricter bar — everything PUBLISHABLE requires, plus not
    excessively duplicated across other pages. Blocked by anything in
    INDEXABLE_BLOCKING_CHECKS (a superset of PUBLISHABLE_BLOCKING_CHECKS).

A page's outcome is one of four lifecycle states — see determine_lifecycle_state.
"""
from __future__ import annotations
import re
import json
from collections import Counter, namedtuple
from pathlib import Path

Finding = namedtuple("Finding", ["check", "detail"])

PLACEHOLDER_PAT = re.compile(r"\bTODO\b|\bTBD\b|Lorem ipsum|\[PLACEHOLDER\]|\bXXX\b|\{\{.*?\}\}|<placeholder>", re.I)
MARKDOWN_PAT = re.compile(r"\*\*[^*]+\*\*|(?<!\*)\*[^*]+\*(?!\*)")
SECTION_PAT = re.compile(r"<h2>(.*?)</h2>\s*((?:<p>.*?</p>\s*|<ul>.*?</ul>\s*)+)", re.S)
_STYLE_SCRIPT_PAT = re.compile(r"<style\b.*?</style>|<script\b.*?</script>", re.S | re.I)


def _prose_only(html: str) -> str:
    """Strip <style>/<script> blocks before running prose-oriented checks
    (markdown, placeholders) — CSS selectors like `*, *::before` and JS
    exponentiation/wildcards can otherwise false-positive as markdown."""
    return _STYLE_SCRIPT_PAT.sub("", html)

# A section variant reused across this many *other* pages (after stripping the
# product/vendor name) is flagged as excessive templating, not organic overlap.
TEMPLATE_REPETITION_THRESHOLD = 5


def check_visible_markdown(html: str) -> list[Finding]:
    m = MARKDOWN_PAT.search(_prose_only(html))
    return [Finding("visible_markdown", m.group(0)[:60])] if m else []


def check_placeholder_content(html: str) -> list[Finding]:
    m = PLACEHOLDER_PAT.search(_prose_only(html))
    return [Finding("placeholder_content", m.group(0))] if m else []


def check_required_metadata(html: str) -> list[Finding]:
    findings = []
    if not re.search(r"<title>(.+?)</title>", html, re.S):
        findings.append(Finding("missing_metadata", "title"))
    if not re.search(r'name="description"\s+content="[^"]+"', html):
        findings.append(Finding("missing_metadata", "description"))
    if not re.search(r'<link rel="canonical" href="[^"]+"', html):
        findings.append(Finding("missing_metadata", "canonical"))
    return findings


def check_canonical_correctness(html: str, expected_url: str) -> list[Finding]:
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if not m:
        return []  # already caught by check_required_metadata
    if m.group(1) != expected_url:
        return [Finding("canonical_mismatch", f"got {m.group(1)!r}, expected {expected_url!r}")]
    return []


def check_product_category_relationship(html: str, tool_name: str) -> list[Finding]:
    """Cheap but real: the page's own <title> should mention the product it's
    reviewing. Catches wholesale template mix-ups, not subtler mismatches."""
    m = re.search(r"<title>(.*?)</title>", html, re.S)
    if m and tool_name and tool_name.lower() not in m.group(1).lower():
        return [Finding("product_category_mismatch", f"title {m.group(1)!r} omits product name {tool_name!r}")]
    return []


def check_category_matched_alternatives(html: str, own_category: str, tools_by_slug: dict) -> list[Finding]:
    """Every listed alternative must be a real tool in the SAME category as
    the page's own subject — this is what actually failed before remediation
    (every page recommended the same three AI chatbots regardless of topic)."""
    m = re.search(r"<h2>Best alternatives</h2>\s*<ul>(.*?)</ul>", html, re.S)
    if not m:
        return [Finding("category_mismatch", "no Best alternatives section found")]
    names = re.findall(r"<strong>(.*?)</strong>", m.group(1))
    by_name = {t["name"]: t for t in tools_by_slug.values()}
    findings = []
    for n in names:
        t = by_name.get(n)
        if t is None:
            findings.append(Finding("category_mismatch", f"alternative {n!r} is not a known tool"))
        elif t["category"] != own_category:
            findings.append(Finding("category_mismatch", f"alternative {n!r} is category {t['category']!r}, page is {own_category!r}"))
    return findings


GENERATOR_CLAIM_PAT = re.compile(
    r"\bgenerator\b|\bgenerates\b|turns prompts into|produces short clips from prompts", re.I
)
GENERATIVE_BLURB_PAT = re.compile(
    r"generat|text-to-|from a text prompt|from text|synthesis|synthesize", re.I
)
NON_GENERATIVE_BLURB_PAT = re.compile(
    r"\bediting\b|\beditor\b|\brecognition\b|\brecogni[sz]es\b|\bmanagement\b|publishing|"
    r"non-destructive|batch photo|cuts,|splits|multi-track|RAW development|"
    r"illustration|painting|comics|diagrams|prototyping|print-ready|social graphics|presentations",
    re.I,
)


def check_factual_contradiction(html: str, tool_blurb: str) -> list[Finding]:
    """Catches the confirmed real defect: a page's own opening description
    claims the product is a prompt-based generator, while tools.json's own
    blurb for the same tool describes an editor, recognizer, or other
    non-generative function, with no generative language of its own.

    This is deliberately narrow and evidence-based — it flags a
    contradiction only when the page's claim and the site's own existing
    data actively disagree, never on genericness or vagueness alone. It
    will not catch every possible factual error, only this specific,
    confirmed pattern (which affected 17 of 138 pages: Whisper plus 10
    image-category and 6 video-category tools wrongly called generators)."""
    if not GENERATOR_CLAIM_PAT.search(html):
        return []
    if GENERATIVE_BLURB_PAT.search(tool_blurb):
        return []
    if NON_GENERATIVE_BLURB_PAT.search(tool_blurb):
        return [Finding("factual_contradiction",
                         f"page claims a generator; tools.json blurb says {tool_blurb!r}")]
    return []


def check_broken_internal_links(html: str, page_path: Path, site_root: Path) -> list[Finding]:
    findings = []
    for m in re.finditer(r'(?:href|src)=["\']([^"\']+)["\']', html):
        url = m.group(1)
        if url.startswith(("http://", "https://", "mailto:", "tel:", "//", "data:", "javascript:", "#")):
            continue
        path = url.split("#")[0].split("?")[0]
        if not path:
            continue
        target = (site_root / path.lstrip("/")) if path.startswith("/") else (page_path.parent / path)
        candidates = [target] + ([Path(str(target) + ".html")] if target.suffix == "" else [])
        if not any(c.exists() or c.is_dir() for c in candidates):
            findings.append(Finding("broken_internal_link", url))
    return findings


def find_duplicate_canonicals(pages: dict[str, str]) -> list[Finding]:
    """pages: {slug: html}. Cross-page check, not per-page."""
    seen = Counter()
    for html in pages.values():
        m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        if m:
            seen[m.group(1)] += 1
    return [Finding("duplicate_canonical_url", url) for url, n in seen.items() if n > 1]


def find_excessive_template_repetition(pages: dict[str, str], tools_by_slug: dict) -> dict[str, list[Finding]]:
    """Cross-page check: normalizes each <h2> section by stripping the page's
    own product/vendor name, then flags any section text reused verbatim
    across more than TEMPLATE_REPETITION_THRESHOLD other pages. Returns
    {slug: [Finding, ...]} only for pages that have at least one flagged
    section — this is what actually caught the real defect (94-97% of pages
    sharing near-identical "How we tested it" / "Cons" / "Free vs Paid" text)."""
    variants = {}  # section_name -> normalized_text -> [slugs]
    for slug, html in pages.items():
        t = tools_by_slug.get(slug, {})
        name, by = t.get("name", ""), t.get("by", "")
        for h2, block in SECTION_PAT.findall(html):
            norm = re.sub(r"\s+", " ", block).strip()
            for token in (name, by):
                if token:
                    norm = norm.replace(token, "\x00")
            variants.setdefault(h2.strip(), {}).setdefault(norm, []).append(slug)

    result: dict[str, list[Finding]] = {}
    for section, by_text in variants.items():
        for norm_text, slugs in by_text.items():
            if len(slugs) > TEMPLATE_REPETITION_THRESHOLD:
                for slug in slugs:
                    result.setdefault(slug, []).append(
                        Finding("excessive_template_repetition",
                                f'"{section}" identical (after name substitution) on {len(slugs)} pages')
                    )
    return result


def check_page(slug: str, html: str, page_path: Path, site_root: Path, tools_by_slug: dict, domain: str) -> list[Finding]:
    t = tools_by_slug.get(slug, {})
    findings: list[Finding] = []
    findings += check_visible_markdown(html)
    findings += check_placeholder_content(html)
    findings += check_required_metadata(html)
    findings += check_canonical_correctness(html, f"{domain}/reviews/{slug}")
    findings += check_product_category_relationship(html, t.get("name", ""))
    findings += check_category_matched_alternatives(html, t.get("category", ""), tools_by_slug)
    findings += check_broken_internal_links(html, page_path, site_root)
    findings += check_factual_contradiction(html, t.get("blurb", ""))
    return findings


# --- Lifecycle model -------------------------------------------------------
#
#   DRAFT              a PUBLISHABLE_BLOCKING finding exists — should not be
#                       live at its URL in this state.
#   PUBLISHABLE_NOINDEX safe to be live, but not safe to actively promote to
#                       search engines (an INDEXABLE_BLOCKING-only finding
#                       exists — currently, in practice, excessive template
#                       repetition).
#   INDEXABLE           clean by both bars — safe in the sitemap/feed.
#   RETIRED             not derived from these checks at all. A page reaches
#                       RETIRED via an explicit lifecycle decision (removed
#                       from the site, cross-links cleaned up — see the
#                       niche_001 precedent in the Architecture doc's Asset
#                       Lifecycle Management section), not by failing a gate.

LIFECYCLE_STATES = ("DRAFT", "PUBLISHABLE_NOINDEX", "INDEXABLE", "RETIRED")

PUBLISHABLE_BLOCKING_CHECKS = frozenset({
    "visible_markdown", "placeholder_content", "missing_metadata",
    "canonical_mismatch", "product_category_mismatch", "category_mismatch",
    "broken_internal_link", "duplicate_canonical_url", "factual_contradiction",
})
INDEXABLE_BLOCKING_CHECKS = PUBLISHABLE_BLOCKING_CHECKS | {"excessive_template_repetition"}


def determine_lifecycle_state(findings: list[Finding]) -> str:
    checks = {f.check for f in findings}
    if checks & PUBLISHABLE_BLOCKING_CHECKS:
        return "DRAFT"
    if checks & INDEXABLE_BLOCKING_CHECKS:
        return "PUBLISHABLE_NOINDEX"
    return "INDEXABLE"


def run_gate(site_root: Path, reviews_subdir: str = "reviews", domain: str = "https://www.qutaifan.com") -> dict:
    """Returns {slug: {"findings": [Finding, ...], "lifecycle": str}} for
    every page that has at least one finding OR is not INDEXABLE — i.e. the
    return value tells you both what's wrong and what to do about it."""
    raw_tools = json.loads((site_root / "tools.json").read_text())
    seen, tools = set(), []
    for t in raw_tools:
        if t["slug"] in seen:
            continue
        seen.add(t["slug"])
        tools.append(t)
    tools_by_slug = {t["slug"]: t for t in tools}

    review_dir = site_root / reviews_subdir
    pages = {p.stem: p.read_text(errors="ignore") for p in sorted(review_dir.glob("*.html"))}

    per_page_findings: dict[str, list[Finding]] = {}
    for slug, html in pages.items():
        per_page_findings[slug] = check_page(slug, html, review_dir / f"{slug}.html", site_root, tools_by_slug, domain)

    cross_page = find_duplicate_canonicals(pages)
    for slug in pages:
        per_page_findings.setdefault(slug, [])
    if cross_page:
        # duplicate canonicals are cross-page but still block the pages involved
        for f in cross_page:
            for slug, html in pages.items():
                if f.detail in html:
                    per_page_findings[slug].append(f)

    for slug, findings in find_excessive_template_repetition(pages, tools_by_slug).items():
        per_page_findings.setdefault(slug, []).extend(findings)

    results = {}
    for slug, findings in per_page_findings.items():
        lifecycle = determine_lifecycle_state(findings)
        if findings or lifecycle != "INDEXABLE":
            results[slug] = {"findings": findings, "lifecycle": lifecycle}
    return results


if __name__ == "__main__":
    import sys
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    results = run_gate(root)
    counts = Counter(r["lifecycle"] for r in results.values())
    for slug, r in sorted(results.items()):
        for f in r["findings"]:
            severity = "BLOCK" if f.check in PUBLISHABLE_BLOCKING_CHECKS else "WARN "
            print(f"[{severity}] {slug} ({r['lifecycle']}): {f.check} — {f.detail}")
    print(f"\nDRAFT={counts.get('DRAFT',0)} PUBLISHABLE_NOINDEX={counts.get('PUBLISHABLE_NOINDEX',0)} "
          f"INDEXABLE (flagged only, rest are clean and unlisted)={counts.get('INDEXABLE',0)}")
    sys.exit(1 if counts.get("DRAFT", 0) else 0)
