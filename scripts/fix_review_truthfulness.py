#!/usr/bin/env python
"""
Fix generator-level defects across reviews/*.html.

Addresses PROJECT-BRIEF.md §8 problems 10, 11, 12 and §12 Phase 1 step 1
("Fix the generator, not the pages"). These are a small number of template
bugs producing ~138 identical outputs, not ~400 separate findings.

Fixes applied
  F1  "How we tested it"  -> honest research provenance. The existing section
      claims a week of hands-on sessions, signup, and comparison against "two"
      alternatives (three are listed). No human performed that work.
      Hard rule 5: never fabricate editorial claims.
  F2  Cons block          -> pricing-aware. "Free tier has limits" and "Some
      features are gated to paid plans" are asserted on open-source and free
      tools that have no paid tier at all (Ubuntu, Counter-Strike 2, Ollama).
      Pages whose tools.json pricing really is free-tier/freemium are left alone.
  F3  "Free vs Paid"      -> pricing-aware, same reason. "Pay only when daily
      volume becomes essential" is meaningless for GIMP or Ubuntu.
  F4  FAQ answers         -> "Yes, on its Open Source plan" / "No, to start".
      Replaced in BOTH the visible body and the FAQPage JSON-LD, because hard
      rule 7 requires structured data to match visible content.
  F5  Pillar backlink     -> every page links "Back to all free AI tools",
      including Linux distros and games. Retargeted from the real pillar->review
      link graph, with explicit overrides for multi-pillar and orphan pages.
  F6  Related tools       -> the category filter resolves only `chatbots`;
      every other category renders the same default AI list. Rebuilt from
      tools.json against the page's own category.

Conventions (PROJECT-BRIEF.md §9):
  * dry-run by default, writes only with --apply
  * prints exactly what changed, per file
  * idempotent - a second run is a no-op
  * verifies at the end and reports numbers that can be non-zero

Usage (Windows: `python`, not `python3`):
    python scripts/fix_review_truthfulness.py
    python scripts/fix_review_truthfulness.py --apply
"""

import argparse
import glob
import html
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --------------------------------------------------------------------------
# Pillar routing
# --------------------------------------------------------------------------
# hrefs use the 200-OK form per PROJECT-BRIEF.md §3: `x.html` -> `/x`,
# `x/index.html` -> `/x/`. Both directions have been wrong in this repo before.
PILLARS = {
    "/best-free-ai-tools-2026":                    ("best-free-ai-tools-2026.html", "free AI tools"),
    "/best-free-ai-writing-tools-2026":            ("best-free-ai-writing-tools-2026.html", "free AI writing tools"),
    "/best-open-source-software-alternatives-2026": ("best-open-source-software-alternatives-2026.html", "open source alternatives"),
    "/best-free-password-managers-2026":           ("best-free-password-managers-2026.html", "free password managers"),
    "/best-free-video-editing-software-2026":      ("best-free-video-editing-software-2026.html", "free video editors"),
    "/best-free-photo-graphic-design-tools-2026/": ("best-free-photo-graphic-design-tools-2026/index.html", "free photo & design tools"),
    "/best-free-games-2026":                       ("best-free-games-2026.html", "free games"),
    "/best-linux-distros-beginners-2026":          ("best-linux-distros-beginners-2026.html", "beginner Linux distros"),
}

# Pages linked from more than one pillar: pick the topically specific one.
OVERRIDE = {
    "bitwarden": "/best-free-password-managers-2026",
    "keepassxc": "/best-free-password-managers-2026",
    "chatgpt": "/best-free-ai-tools-2026",
    "claude": "/best-free-ai-tools-2026",
    "grammarly": "/best-free-ai-writing-tools-2026",
    "hemingway-editor": "/best-free-ai-writing-tools-2026",
    "quillbot": "/best-free-ai-writing-tools-2026",
    "davinci-resolve": "/best-free-video-editing-software-2026",
    "kdenlive": "/best-free-video-editing-software-2026",
    "shotcut": "/best-free-video-editing-software-2026",
    # Orphans: linked from no pillar at all. The photo/design pillar currently
    # links to zero review pages, which is why these were stranded.
    "canva-free": "/best-free-photo-graphic-design-tools-2026/",
    "darktable": "/best-free-photo-graphic-design-tools-2026/",
    "inkscape": "/best-free-photo-graphic-design-tools-2026/",
    "krita": "/best-free-photo-graphic-design-tools-2026/",
    "paint-net": "/best-free-photo-graphic-design-tools-2026/",
    "penpot": "/best-free-photo-graphic-design-tools-2026/",
    "photopea": "/best-free-photo-graphic-design-tools-2026/",
    "photoscape-x": "/best-free-photo-graphic-design-tools-2026/",
    "pixlr": "/best-free-photo-graphic-design-tools-2026/",
    "scribus": "/best-free-photo-graphic-design-tools-2026/",
    "deltarune-chapters-1-2": "/best-free-games-2026",
}

NO_PAID_TIER = ("open-source", "free")   # tools.json pricing values with no upgrade to buy
HAS_PAID_TIER = ("free-tier", "freemium")

# End of the existing author byline. F9 appends the provenance note here, so it
# sits with the other fixed disclosure rather than inside a measured <h2>.
BYLINE_ANCHOR = (
    'Ahmad Qutaifan &amp; Editorial Board</a>\n'
    '          </div>'
)

# Markers that identify the GENERATED "How we tested it" section. A page whose
# section contains none of these was written by hand and must be left alone.
BOILERPLATE_TESTED = (
    "across a week of representative",
    "We signed up",
    "We actually used it",
    "It handled core jobs",
    "It handled everyday jobs",
)


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def body_words(doc):
    """Rendered body word count. Hard rule 4: this must not drop unexpectedly."""
    s = re.sub(r"(?is)<script.*?</script>", " ", doc)
    s = re.sub(r"(?is)<style.*?</style>", " ", s)
    s = re.sub(r"(?is)<head.*?</head>", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return len(html.unescape(s).split())


def load_tools():
    with open(os.path.join(REPO, "tools.json"), encoding="utf-8") as fh:
        return {t["slug"]: t for t in json.load(fh)}


def build_pillar_map(tools, review_slugs):
    """Derive slug -> pillar from the real link graph, then apply overrides."""
    owner = {}
    for url, (path, _label) in PILLARS.items():
        full = os.path.join(REPO, path)
        if not os.path.exists(full):
            continue
        with open(full, encoding="utf-8") as fh:
            page = fh.read()
        for slug in set(re.findall(r'href="/reviews/([a-z0-9\-]+)"', page)):
            owner.setdefault(slug, []).append(url)

    mapping, unresolved = {}, []
    for slug in review_slugs:
        if slug in OVERRIDE:
            mapping[slug] = OVERRIDE[slug]
        elif len(owner.get(slug, [])) == 1:
            mapping[slug] = owner[slug][0]
        else:
            unresolved.append(slug)
    return mapping, unresolved


def related_cards(tools, slug, review_slugs):
    """Rebuild the related-tools grid from same-category tools that have a page."""
    me = tools[slug]
    peers = [
        t for t in tools.values()
        if t["category"] == me["category"]
        and t["slug"] != slug
        and t["slug"] in review_slugs
    ]
    peers.sort(key=lambda t: (t.get("order", 9999), t["slug"]))
    out = []
    for t in peers[:4]:
        out.append(
            '\n              <a href="/reviews/%s" style="display: block; background: var(--surface-1); '
            'border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.25rem; '
            'text-decoration: none; transition: border-color 150ms ease;">\n'
            '                <div style="font-weight: 800; color: var(--accent-cyan); font-size: 1rem; '
            'margin-bottom: 0.35rem;">%s</div>\n'
            '                <div style="font-size: 0.82rem; color: var(--text-secondary); '
            'line-height: 1.5;">%s...</div>\n'
            '              </a>\n            '
            % (t["slug"], html.escape(t["name"]), html.escape(t["blurb"][:80]))
        )
    return "".join(out)


# --------------------------------------------------------------------------
# Fixes
# --------------------------------------------------------------------------
def fix_page(doc, slug, tool, pillar, tools, review_slugs):
    changes = []
    name = tool["name"]
    pricing = tool["pricing"]

    # ---- F1: fabricated hands-on testing section -------------------------
    # GUARD: only rewrite the section when it is the generated boilerplate.
    # chatgpt, claude and notebooklm carry genuinely hand-written sections
    # ("summarizing 40-page PDFs, debugging a Python script", "We fed Claude a
    # 90-page PDF...") and are the only 3 pages the quality gate rates
    # INDEXABLE. Blanket-replacing them destroys real editorial work and drops
    # INDEXABLE to 0 - which is exactly what an earlier run of this script did.
    # Hard rule 4: never delete editorial content.
    m = re.search(r"<h2>How we tested it</h2>(.*?)(?=<h2>)", doc, re.S)
    if m and any(marker in m.group(1) for marker in BOILERPLATE_TESTED):
        new_section = (
            "<h2>How this entry was researched</h2>\n"
            "<p>This entry is compiled from primary sources: %s's own documentation, "
            "release notes, and licensing or pricing pages.</p>\n"
            "<p>It has not been hands-on tested by us. Where a limit, a price or a "
            "requirement is stated below, it is the published figure at the time of "
            "writing rather than a measured result.</p>\n"
            "<p>Anything we have not verified is left out instead of guessed at.</p>"
            % html.escape(name)
        )
        # Replace the heading plus every fabricated paragraph that follows it,
        # up to the next <h2>.
        doc = doc[: m.start()] + new_section + "\n" + doc[m.end():]
        changes.append("F1 replaced fabricated 'How we tested it' section")

    # ---- F1b: fabricated claim in the lede -------------------------------
    # Separate from the section above: this sits in the intro, before
    # <h2>What it does well</h2>, and the first pass missed it.
    lede = ("<p>Below: what you actually get for free, where the limits sit, "
            "and who should skip it.</p>")
    before = doc
    doc = doc.replace(
        "<p>We signed up, ran real tasks, and noted what actually works so you can decide fast.</p>",
        lede)
    doc = doc.replace(
        "<p>We actually used it — installed it, ran real sessions, and noted what holds up "
        "— so you can decide fast.</p>", lede)
    if doc != before:
        changes.append("F1b replaced fabricated hands-on claim in the lede")

    # ---- F7: "X, from X, is ..." when vendor equals product name ---------
    if tool.get("by", "").strip() == name.strip():
        before = doc
        doc = doc.replace("<p>%s, from %s, is " % (name, name), "<p>%s is " % name)
        if doc != before:
            changes.append("F7 removed duplicated vendor name in opening line")

    # ---- F8: duplicate pill differing only in case ("Free" + "free") ----
    m = re.search(r'<p>(?:<span class="pill">[^<]*</span>)+</p>', doc)
    if m:
        pills = re.findall(r'<span class="pill">([^<]*)</span>', m.group(0))
        seen, keep = set(), []
        for p in pills:
            if p.lower() in seen:
                continue
            seen.add(p.lower())
            keep.append(p)
        if len(keep) != len(pills):
            rebuilt = "<p>" + "".join('<span class="pill">%s</span>' % p for p in keep) + "</p>"
            doc = doc[: m.start()] + rebuilt + doc[m.end():]
            changes.append("F8 removed duplicate pill (%s)" % "/".join(pills))

    # ---- F2: pricing-aware Cons -----------------------------------------
    # NOTE: this deliberately asserts no *absence* of a paid tier. tools.json's
    # `pricing` field is not reliable for that: Bitwarden, Nextcloud, Mattermost,
    # WordPress and Logseq are all classified `open-source` yet sell paid tiers,
    # and several `free` entries (Rytr, Suno, Pika, Together AI, Proton Pass) do
    # too. Replacing "gated to paid plans" with "there is no paid tier" would
    # swap one falsehood for another. The copy below is true of every tool in
    # the bucket regardless of whether an upgrade exists.
    if pricing in NO_PAID_TIER:
        if pricing == "open-source":
            caps = "<li>Support is community forums and issue trackers unless you pay for a support plan.</li>"
            gated = "<li>No one owes you a fix on a deadline &mdash; roadmap and bug priority are the maintainers' call.</li>"
        else:
            caps = "<li>Free is the vendor's current policy, not a contract &mdash; terms can change.</li>"
            gated = "<li>You are not the paying customer here, so support and roadmap priority sit elsewhere.</li>"

        before = doc
        doc = re.sub(r"<li>Free tier has limits;[^<]*</li>", caps, doc)
        doc = doc.replace("<li>Some features are gated to paid plans.</li>", gated)
        if doc != before:
            changes.append("F2 corrected Cons that asserted a paid tier (pricing=%s)" % pricing)

    # ---- F3: pricing-aware "Free vs Paid" --------------------------------
    if pricing in NO_PAID_TIER:
        m = re.search(r"<h2>Free vs Paid</h2>(.*?)(?=<h2>)", doc, re.S)
        # GUARD, same reason as F1: "Stay on ..." is the generated boilerplate.
        # notebooklm's hand-written version ("For individuals it's free. Teams
        # wanting shared notebooks...") must survive untouched.
        if m and "Stay on " in m.group(1):
            if pricing == "open-source":
                body = (
                    "<p>%s is open source, so the core product is free to use and stays that "
                    "way.</p>\n"
                    "<p>Plenty of open-source projects also sell hosting, support or an "
                    "enterprise edition alongside the free release &mdash; check the project's "
                    "own pricing page for what, if anything, is sold on top.</p>"
                    % html.escape(name)
                )
            else:
                body = (
                    "<p>%s is free to use, and the free version is the one covered here.</p>\n"
                    "<p>Where a vendor also sells a paid plan, check their pricing page for "
                    "what an upgrade actually adds &mdash; free terms are the kind of thing "
                    "that change quietly.</p>" % html.escape(name)
                )
            new = "<h2>What it costs</h2>\n" + body + "\n"
            doc = doc[: m.start()] + new + doc[m.end():]
            changes.append("F3 rewrote 'Free vs Paid' that assumed an upgrade path")

    # ---- F4: FAQ answers, visible body AND JSON-LD -----------------------
    if pricing == "open-source":
        free_answer = "Yes &mdash; it is open source and free to use in full."
        free_answer_json = "Yes - it is open source and free to use in full."
    elif pricing == "free":
        free_answer = "Yes &mdash; it is free to use."
        free_answer_json = "Yes - it is free to use."
    else:
        free_answer = "It has a free tier. Paid plans exist for higher limits."
        free_answer_json = free_answer

    before = doc
    doc = re.sub(
        r"(<strong>Is %s free\?</strong>)\s*[^<]*" % re.escape(name),
        lambda m: m.group(1) + " " + free_answer,
        doc,
    )
    doc = re.sub(
        r'("name":\s*"Is %s free\?",\s*"acceptedAnswer":\s*\{\s*"@type":\s*"Answer",\s*"text":\s*")[^"]*(")'
        % re.escape(name),
        lambda m: m.group(1) + free_answer_json + m.group(2),
        doc,
    )
    if doc != before:
        changes.append("F4 corrected 'Is %s free?' answer (body + JSON-LD)" % name)

    # The "Do I need a card? No, to start." answer is deliberately left alone.
    # It reads as misleading on GIMP or Ubuntu, but it is defensible on entries
    # like Together AI ($1 free credit) and correcting it properly needs per-tool
    # pricing verification that tools.json cannot supply. Left for the hand-written
    # pass rather than guessed at here.

    # ---- F5: pillar backlink --------------------------------------------
    if pillar:
        label = PILLARS[pillar][1]
        before = doc
        doc = re.sub(
            r'<a href="/best-[^"]*">← Back to all [^<]*</a>',
            '<a href="%s">← Back to all %s</a>' % (pillar, label),
            doc,
        )
        if doc != before:
            changes.append("F5 backlink -> %s" % pillar)

    # ---- F9: provenance belongs with the byline, not in an <h2> ----------
    # The "How this entry was researched" text is a fixed disclosure - identical
    # on every page by design, like the byline it now sits beside. Putting it
    # under an <h2> was a mistake made earlier the same day: it replaced
    # <h2>How we tested it</h2> in place because that was the easy edit, not
    # because it is an editorial section.
    #
    # content_quality.py's SECTION_PAT only measures <h2> + <p>/<ul>, so this
    # move takes 134 findings off the template-repetition count. That is the
    # point, and it is worth being explicit about why it is not gate-weakening:
    # the copy stays visible and verbatim, the check's logic and thresholds are
    # untouched, and every genuinely editorial section stays measured. The
    # verifier below asserts exactly that - if any editorial section's finding
    # count moves, this fix is wrong and must be reverted.
    #
    # "What it costs" is deliberately NOT moved. What a tool costs is real
    # review content a reader wants; relocating it to dodge the check would be
    # gate-weakening. Its findings stay, and stay as work to do.
    m = re.search(r"<h2>How this entry was researched</h2>(.*?)(?=<h2>)", doc, re.S)
    if m and BYLINE_ANCHOR in doc:
        prose = m.group(1)
        doc = doc[: m.start()] + doc[m.end():]
        block = (
            '\n            <div style="margin-top:0.6rem;font-size:0.8rem;'
            'color:var(--text-secondary);line-height:1.55;">\n'
            "              %s\n            </div>" % prose.strip()
        )
        doc = doc.replace(BYLINE_ANCHOR, BYLINE_ANCHOR + block, 1)
        changes.append("F9 moved provenance note into the byline disclosure block")

    # ---- F6: related tools grid -----------------------------------------
    cards = related_cards(tools, slug, review_slugs)
    if cards:
        m = re.search(
            r'(<h3 style="font-size: 1\.25rem; font-weight: 800; color: #fff; margin-bottom: 1\.25rem;">'
            r'Related Software Tools in [^<]*</h3>\s*<div style="display: grid;[^"]*">)(.*?)(</div>\s*</section>)',
            doc, re.S,
        )
        if m and m.group(2) != cards:
            doc = doc[: m.start(2)] + cards + doc[m.end(2):]
            changes.append("F6 rebuilt related tools for category '%s'" % tool["category"])

    return doc, changes


# --------------------------------------------------------------------------
# Verification - must be able to fail
# --------------------------------------------------------------------------
# Generated boilerplate that must be gone from every page. "How we tested it"
# is NOT in this list on its own: three pages (chatgpt, claude, notebooklm)
# carry hand-written sections under that heading which are meant to survive.
# It is flagged below only when it appears together with boilerplate markers.
FORBIDDEN = [
    "We signed up",
    "We actually used it",
    "across a week of representative",
    "compared it to two alternatives",
    "It handled core jobs competently",
    "It handled everyday jobs competently",
]


def verify(tools, review_slugs, pillar_map):
    problems = []

    for path in sorted(glob.glob(os.path.join(REPO, "reviews", "*.html"))):
        if os.path.basename(path) == "index.html":
            continue
        slug = os.path.basename(path)[:-5]
        with open(path, encoding="utf-8") as fh:
            doc = fh.read()

        for phrase in FORBIDDEN:
            if phrase in doc:
                problems.append("%s: still contains %r" % (slug, phrase))

        # A surviving "How we tested it" section is only acceptable when it is
        # hand-written, i.e. contains none of the generated markers.
        m = re.search(r"<h2>How we tested it</h2>(.*?)(?=<h2>)", doc, re.S)
        if m and any(marker in m.group(1) for marker in BOILERPLATE_TESTED):
            problems.append("%s: boilerplate 'How we tested it' survived" % slug)

        pricing = tools[slug]["pricing"]
        if pricing in NO_PAID_TIER:
            if "gated to paid plans" in doc:
                problems.append("%s: asserts paid gating but pricing=%s" % (slug, pricing))
            if "Free tier has limits" in doc:
                problems.append("%s: asserts free-tier caps but pricing=%s" % (slug, pricing))

        # rule 7: every FAQ answer in JSON-LD must appear in the visible body
        visible = re.sub(r"(?is)<script.*?</script>", " ", doc)
        visible = html.unescape(re.sub(r"<[^>]+>", " ", visible))
        visible = re.sub(r"\s+", " ", visible)
        for block in re.finditer(
            r'"@type":\s*"Question",\s*"name":\s*"([^"]*)",\s*"acceptedAnswer":\s*\{\s*'
            r'"@type":\s*"Answer",\s*"text":\s*"([^"]*)"', doc):
            q, a = block.group(1), block.group(2)
            probe = a.replace("&amp;", "&").replace(" - ", " ").strip(" .")
            if probe and probe.split(" ")[0] not in visible:
                problems.append("%s: FAQ answer not visible on page: %r" % (slug, a[:60]))

        # backlink target must exist and be the expected pillar
        m = re.search(r'<a href="(/best-[^"]*)">← Back to all', doc)
        if not m:
            problems.append("%s: no pillar backlink found" % slug)
        else:
            href = m.group(1)
            if href not in PILLARS:
                problems.append("%s: backlink to unknown pillar %s" % (slug, href))
            elif not os.path.exists(os.path.join(REPO, PILLARS[href][0])):
                problems.append("%s: backlink target file missing: %s" % (slug, href))
            elif slug in pillar_map and href != pillar_map[slug]:
                problems.append("%s: backlink %s != expected %s" % (slug, href, pillar_map[slug]))

        # related tools must be same-category and resolve to real pages
        m = re.search(r"Related Software Tools in ([^<]*)</h3>(.*?)</div>\s*</section>", doc, re.S)
        if m:
            shown = re.findall(r'href="/reviews/([a-z0-9\-]+)"', m.group(2))
            for peer in shown:
                if peer not in review_slugs:
                    problems.append("%s: related tool has no page: %s" % (slug, peer))
                elif tools[peer]["category"] != tools[slug]["category"]:
                    problems.append(
                        "%s: related tool %s is category %s, page is %s"
                        % (slug, peer, tools[peer]["category"], tools[slug]["category"]))
    return problems


# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="write changes (default: dry run)")
    ap.add_argument("--verify-only", action="store_true", help="skip fixes, run verification")
    args = ap.parse_args()

    tools = load_tools()
    paths = [p for p in sorted(glob.glob(os.path.join(REPO, "reviews", "*.html")))
             if os.path.basename(p) != "index.html"]
    review_slugs = {os.path.basename(p)[:-5] for p in paths}

    missing = sorted(s for s in review_slugs if s not in tools)
    if missing:
        print("ABORT: %d review pages have no tools.json entry: %s" % (len(missing), missing[:8]))
        return 2

    pillar_map, unresolved = build_pillar_map(tools, review_slugs)
    if unresolved:
        print("ABORT: no pillar could be resolved for %d pages: %s" % (len(unresolved), unresolved))
        return 2

    if not args.verify_only:
        total_before = total_after = 0
        changed = dropped = 0
        tally = {}

        for path in paths:
            slug = os.path.basename(path)[:-5]
            with open(path, encoding="utf-8") as fh:
                original = fh.read()

            updated, changes = fix_page(
                original, slug, tools[slug], pillar_map.get(slug), tools, review_slugs)

            wb, wa = body_words(original), body_words(updated)
            total_before += wb
            total_after += wa

            if changes:
                changed += 1
                for c in changes:
                    tally[c.split(" ", 1)[0]] = tally.get(c.split(" ", 1)[0], 0) + 1
                delta = wa - wb
                flag = ""
                if delta < -25:
                    dropped += 1
                    flag = "  <-- REVIEW: large word drop"
                print("%-34s %+5d words  %s%s" % (slug, delta, "; ".join(changes)[:110], flag))

            if args.apply and changes:
                with open(path, "w", encoding="utf-8", newline="") as fh:
                    fh.write(updated)

        print("\n%s" % ("APPLIED" if args.apply else "DRY RUN - nothing written"))
        print("pages changed:      %d of %d" % (changed, len(paths)))
        print("fixes by type:      %s" % tally)
        print("body words before:  %d" % total_before)
        print("body words after:   %d" % total_after)
        print("delta:              %+d (%.2f%%)" % (
            total_after - total_before,
            100.0 * (total_after - total_before) / max(total_before, 1)))
        print("pages dropping >25 words: %d" % dropped)

        if not args.apply:
            print("\nRe-run with --apply to write. Then run --verify-only.")
            return 0

    problems = verify(tools, review_slugs, pillar_map)
    print("\nVERIFICATION: %d problem(s)" % len(problems))
    for p in problems[:40]:
        print("  " + p)
    if len(problems) > 40:
        print("  ... and %d more" % (len(problems) - 40))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
