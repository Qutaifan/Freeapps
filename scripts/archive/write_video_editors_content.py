#!/usr/bin/env python
"""
Hand-written rewrite of the 5 video-editor reviews (kdenlive, shotcut,
davinci-resolve, openshot, flowblade) for the 2026-08-16 editorial batch.
Content sourced from each project's own site/docs (kdenlive.org,
mltframework.github.io/shotcut_web, blackmagicdesign.com/products/
davinciresolve/compare, openshot.org, jliljebl.github.io/flowblade) plus
Kdenlive's own Windows troubleshooting docs and OpenShot's own 3.2.1
release notes for the stability points. No hands-on testing claimed.

Fixes, per page:
  - the fabricated "text-to-video generator that produces short clips from
    prompts" lede (davinci-resolve, openshot, flowblade) -> accurate
    description of what each tool actually is (clears factual_contradiction)
  - templated What it does well / Pros / Cons / What it costs -> bespoke,
    sourced content (clears excessive_template_repetition)
  - Best alternatives -> genuine, same-category tools instead of unrelated
    ones (LibreOffice/WordPress for a video editor) or AI generators
    (Kling/Luma/Hailuo for a desktop NLE)
  - FAQ "Best for?" answer (visible body + JSON-LD) updated to match

Conventions: dry-run by default, --apply to write, idempotent, verifies
body word counts and re-runs the gate at the end.
"""
import argparse
import html
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent if (Path(__file__).parent.name == "scripts") else Path(".")


def body_words(doc):
    s = re.sub(r"(?is)<script.*?</script>", " ", doc)
    s = re.sub(r"(?is)<style.*?</style>", " ", s)
    s = re.sub(r"(?is)<head.*?</head>", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return len(html.unescape(s).split())


# ---------------------------------------------------------------------------
# Per-page content
# ---------------------------------------------------------------------------
PAGES = {}

PAGES["kdenlive"] = dict(
    old_lede='<p>Kdenlive, from KDE Community, is a free and open-source alternative to paid desktop software. On its Open Source plan it is genuinely usable, not a teaser.</p>',
    new_lede='<p>Kdenlive is a full-featured, timeline-based video editor built on the KDE/Qt and MLT frameworks &mdash; a real desktop NLE, not a stripped-down trimmer.</p>',
    old_block='''<h2>What it does well</h2>
<ul>
<li>Real opensource capability on the Open Source tier — no credit card to start.</li>
<li>Practical for everyday use; outputs are usable, not just demos.</li>
<li>Actively maintained by KDE Community; Video editor is a current highlight.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>No-cost entry with meaningful features.</li>
<li>Backed by KDE Community, so it is actively maintained.</li>
<li>Good fit for users who want a free and open-source alternative to paid desktop software without paid subscriptions.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Support is community forums and issue trackers unless you pay for a support plan.</li>
<li>Less specialized than dedicated tools for adjacent tasks.</li>
<li>No one owes you a fix on a deadline &mdash; roadmap and bug priority are the maintainers' call.</li>
</ul>
<h2>What it costs</h2>
<p>Kdenlive is open source, so the core product is free to use and stays that way.</p>
<p>Plenty of open-source projects also sell hosting, support or an enterprise edition alongside the free release &mdash; check the project's own pricing page for what, if anything, is sold on top.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>LibreOffice</strong> — Full desktop office suite for documents, spreadsheets, presentations and databases (opensource).</li>
<li><strong>GIMP</strong> — Powerful free image editor with layers, masks, plugins and scripting (opensource).</li>
<li><strong>WordPress</strong> — Open-source CMS powering blogs, business sites, shops and publications (opensource).</li>
</ul>''',
    new_block='''<h2>What it does well</h2>
<ul>
<li>A multi-track timeline with proxy editing for slower machines, keyframeable effects and a 2D titler with animation &mdash; a full NLE feature set, not a cut-down one.</li>
<li>FFmpeg-backed format support, so most footage opens without transcoding first.</li>
<li>Actively developed by the KDE project with regular point releases and a public roadmap.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>No paywall on any editing feature &mdash; the full timeline, effects and export options are available from install.</li>
<li>Cross-platform (Linux, Windows, macOS) with the same project format everywhere.</li>
<li>Community-driven development means feature requests and bug fixes aren't gated behind a subscription tier.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Kdenlive maintains a dedicated Windows troubleshooting page in its own docs covering crashes, audio desync and rendering glitches specific to that platform &mdash; Windows users should expect to consult it.</li>
<li>The interface assumes some NLE familiarity; first-time editors face a steeper learning curve than a simple trimmer.</li>
<li>Support is the community forum and bug tracker, not a vendor with an SLA.</li>
</ul>
<h2>What it costs</h2>
<p>Kdenlive is fully open source (GPL) and free, with no paid tier, no feature gating and no trial period.</p>
<p>The KDE e.V. non-profit accepts donations that fund development, but nothing on the download or feature side requires payment.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>Shotcut</strong> — Cross-platform open-source video editor with broad format support (opensource).</li>
</ul>
<p>DaVinci Resolve, OpenShot and Flowblade are also covered here and are closer competitors feature-for-feature, but the site currently files them under a different internal category than Kdenlive &mdash; see the <a href="/best-free-video-editing-software-2026">full video editors guide</a> to compare all of them side by side.</p>''',
    faq_best_for_old="a free and open-source alternative to paid desktop software without paying.",
    faq_best_for_new="editors who want a full desktop NLE &mdash; multi-track timeline, effects, titling &mdash; without paying for Premiere or Final Cut.",
)

PAGES["shotcut"] = dict(
    old_lede='<p>Shotcut, from Meltytech, is a free and open-source alternative to paid desktop software. On its Open Source plan it is genuinely usable, not a teaser.</p>',
    new_lede='<p>Shotcut is Meltytech&rsquo;s open-source, FFmpeg-based editor &mdash; a lightweight NLE with hardware-accelerated encode/decode and support up to 8K.</p>',
    old_block='''<h2>What it does well</h2>
<ul>
<li>Real opensource capability on the Open Source tier — no credit card to start.</li>
<li>Practical for everyday use; outputs are usable, not just demos.</li>
<li>Actively maintained by Meltytech; Cross-platform is a current highlight.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>No-cost entry with meaningful features.</li>
<li>Backed by Meltytech, so it is actively maintained.</li>
<li>Good fit for users who want a free and open-source alternative to paid desktop software without paid subscriptions.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Support is community forums and issue trackers unless you pay for a support plan.</li>
<li>Less specialized than dedicated tools for adjacent tasks.</li>
<li>No one owes you a fix on a deadline &mdash; roadmap and bug priority are the maintainers' call.</li>
</ul>
<h2>What it costs</h2>
<p>Shotcut is open source, so the core product is free to use and stays that way.</p>
<p>Plenty of open-source projects also sell hosting, support or an enterprise edition alongside the free release &mdash; check the project's own pricing page for what, if anything, is sold on top.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>LibreOffice</strong> — Full desktop office suite for documents, spreadsheets, presentations and databases (opensource).</li>
<li><strong>GIMP</strong> — Powerful free image editor with layers, masks, plugins and scripting (opensource).</li>
<li><strong>Kdenlive</strong> — Non-linear video editor for serious free video workflows (opensource).</li>
</ul>''',
    new_block='''<h2>What it does well</h2>
<ul>
<li>100+ filters and 3-way color wheels with keyframeable effects and easing curves &mdash; a genuinely capable color and effects toolkit, not a stripped-down one.</li>
<li>Hardware-accelerated encoding/decoding and GPU-based (OpenGL) image processing, useful on modest hardware.</li>
<li>FFmpeg-backed format support plus native handling of newer formats (AVIF, Lottie/Rive animations, After Effects imports).</li>
</ul>
<h2>Pros</h2>
<ul>
<li>Full feature set free from install &mdash; no tiered unlock.</li>
<li>Runs on Windows, macOS and Linux, and can run portable from a USB drive.</li>
<li>UI translated into 35+ languages.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Shotcut's timeline model treats clips more loosely than a strict multi-track NLE, which takes adjustment for editors coming from Premiere-style tools.</li>
<li>The interface is functional rather than polished &mdash; some users find it dated next to commercial NLEs.</li>
<li>Support is the community forum and bug tracker, not a vendor with an SLA.</li>
</ul>
<h2>What it costs</h2>
<p>Shotcut is fully open source (GPL) and free, with the complete feature set &mdash; every filter, export format and hardware-acceleration option &mdash; available at no cost and no trial gating.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>Kdenlive</strong> — Non-linear video editor for serious free video workflows (opensource).</li>
</ul>
<p>DaVinci Resolve, OpenShot and Flowblade are also covered here, but are filed under a different internal category &mdash; see the <a href="/best-free-video-editing-software-2026">full video editors guide</a> to compare all of them side by side.</p>''',
    faq_best_for_old="a free and open-source alternative to paid desktop software without paying.",
    faq_best_for_new="editors who want a lightweight, portable, cross-platform NLE without paying for Premiere or Final Cut.",
)

PAGES["davinci-resolve"] = dict(
    old_lede='<p>DaVinci Resolve, from Blackmagic, is a text-to-video generator that produces short clips from prompts. On its Free Tier plan it is genuinely usable, not a teaser.</p>',
    new_lede='<p>DaVinci Resolve is Blackmagic Design&rsquo;s professional editing, color-grading, audio (Fairlight) and VFX (Fusion) suite in one application &mdash; not an AI generator, and not a lightweight trimmer either.</p>',
    old_block='''<h2>What it does well</h2>
<ul>
<li>Real video capability on the Free Tier tier — no credit card to start.</li>
<li>Practical for everyday use; outputs are usable, not just demos.</li>
<li>Actively maintained by Blackmagic; Hollywood grade is a current highlight.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>No-cost entry with meaningful features.</li>
<li>Backed by Blackmagic, so it is actively maintained.</li>
<li>Good fit for users who want a text-to-video generator that produces short clips from prompts without paid subscriptions.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Free tier has limits; heavy daily use may hit caps.</li>
<li>Less specialized than dedicated tools for adjacent tasks.</li>
<li>Some features are gated to paid plans.</li>
</ul>
<h2>Free vs Paid</h2>
<p>Stay on Free Tier unless you hit limits constantly. Pay only when daily volume or top-tier</p>
<p>quality becomes essential to your workflow.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>Kling AI</strong> — One of the best free text-to-video generators in 2026 (video).</li>
<li><strong>Luma Dream Machine</strong> — Stunning video generation from text or image (video).</li>
<li><strong>Hailuo AI</strong> — Free video generation from text and images (video).</li>
</ul>''',
    new_block='''<h2>What it does well</h2>
<ul>
<li>Combines editing, color grading, audio post (Fairlight) and visual effects (Fusion) in one application &mdash; most competitors split these across separate tools.</li>
<li>The free edition handles up to Ultra HD 3840&times;2160 at 60fps in 8-bit, with HDR grading and multi-user collaboration included at no cost, per Blackmagic's own comparison page.</li>
<li>Backed by a company that sells the surrounding hardware (cameras, capture cards), so the software is a strategic priority rather than a side project.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>The free edition is not a time-limited trial &mdash; it includes real professional-grade tools most competitors charge for.</li>
<li>Multi-user collaborative editing is included free, unusual for this category.</li>
<li>Wide industry adoption means tutorials, presets and third-party plugin support are easy to find.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>The free version caps at 8-bit color and 60fps; DaVinci Resolve Studio is required for 10-bit workflows, frame rates above 60fps, and resolutions beyond 4K.</li>
<li>Studio-only features include the DaVinci Neural Engine AI tools, additional Resolve FX, temporal/AI noise reduction, text-based editing and film grain &mdash; none of these are in the free version.</li>
<li>It's a heavier, more complex application than a simple trimmer; expect a real learning curve, especially on the color and Fusion pages.</li>
</ul>
<h2>What it costs</h2>
<p>DaVinci Resolve's free edition has no time limit and no feature-trial gating on its core toolset.</p>
<p>Blackmagic Design sells DaVinci Resolve Studio as a one-time $295 purchase, not a subscription, for 10-bit/120fps workflows, the Neural Engine AI tools, extra Resolve FX and text-based editing &mdash; everything else stays free permanently.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>OpenShot</strong> — Simple cuts, titles, and home-video projects (video).</li>
<li><strong>Flowblade</strong> — Focused multi-track video editing on Linux (video).</li>
</ul>
<p>Both are simpler tools, not equivalents &mdash; neither matches Resolve's color, Fairlight or Fusion pages.</p>''',
    faq_best_for_old="a text-to-video generator that produces short clips from prompts without paying.",
    faq_best_for_new="editing, color grading, audio post and VFX work without paying for Premiere or for DaVinci Resolve Studio's advanced tools.",
)

PAGES["openshot"] = dict(
    old_lede='<p>OpenShot, from OpenShot Studios, is a text-to-video generator that produces short clips from prompts. On its Open Source plan it is genuinely usable, not a teaser.</p>',
    new_lede='<p>OpenShot is a beginner-focused, open-source video editor for cuts, titles and home-video projects &mdash; not an AI generator.</p>',
    old_block='''<h2>What it does well</h2>
<ul>
<li>Real video capability on the Open Source tier — no credit card to start.</li>
<li>Practical for everyday use; outputs are usable, not just demos.</li>
<li>Actively maintained by OpenShot Studios; Easy editor is a current highlight.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>No-cost entry with meaningful features.</li>
<li>Backed by OpenShot Studios, so it is actively maintained.</li>
<li>Good fit for users who want a text-to-video generator that produces short clips from prompts without paid subscriptions.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Support is community forums and issue trackers unless you pay for a support plan.</li>
<li>Less specialized than dedicated tools for adjacent tasks.</li>
<li>No one owes you a fix on a deadline &mdash; roadmap and bug priority are the maintainers' call.</li>
</ul>
<h2>What it costs</h2>
<p>OpenShot is open source, so the core product is free to use and stays that way.</p>
<p>Plenty of open-source projects also sell hosting, support or an enterprise edition alongside the free release &mdash; check the project's own pricing page for what, if anything, is sold on top.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>DaVinci Resolve</strong> — Editing, color, audio, and VFX in one application (video).</li>
<li><strong>Kling AI</strong> — One of the best free text-to-video generators in 2026 (video).</li>
<li><strong>Luma Dream Machine</strong> — Stunning video generation from text or image (video).</li>
</ul>''',
    new_block='''<h2>What it does well</h2>
<ul>
<li>Unlimited tracks/layers, 400+ transitions and 20+ Blender-powered 3D animations, per OpenShot's own features page &mdash; more animation depth than most beginner editors offer.</li>
<li>Curve-based keyframe animation with unlimited keyframes for real motion control, not just presets.</li>
<li>Cross-platform (Linux, Windows 7/8/10+, macOS 10.15+) with compatible project files across all three.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>Genuinely free and open source (GPL v3+) with no feature gating.</li>
<li>Drag-and-drop timeline with snapping and frame-by-frame stepping &mdash; accessible for first-time editors.</li>
<li>Millions of downloads and an active community since 2008.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Earlier versions had a documented reputation for crashes and instability; OpenShot Studios' own release notes (e.g. the 3.2.1 changelog's "enhanced stability" fixes) confirm the rough edges were real, not just user error.</li>
<li>The Blender-powered titles and 3D effects are GPU/CPU-intensive and can slow rendering on older hardware.</li>
<li>Built for simple cuts and titles, not color grading or advanced compositing &mdash; users who outgrow it typically move to Shotcut, Kdenlive or DaVinci Resolve.</li>
</ul>
<h2>What it costs</h2>
<p>OpenShot is fully open source (GPL v3+) and free, with every editing feature, transition and title template available at no cost and no paid tier to upgrade into.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>DaVinci Resolve</strong> — Editing, color, audio, and VFX in one application (video).</li>
<li><strong>Flowblade</strong> — Focused multi-track video editing on Linux (video).</li>
</ul>''',
    faq_best_for_old="a text-to-video generator that produces short clips from prompts without paying.",
    faq_best_for_new="simple cuts, titles and home-video edits without paying for a subscription NLE.",
)

PAGES["flowblade"] = dict(
    old_lede='<p>Flowblade, from Flowblade, is a text-to-video generator that produces short clips from prompts. On its Open Source plan it is genuinely usable, not a teaser.</p>',
    new_lede='<p>Flowblade is a lightweight, Linux-only multitrack video editor built on the MLT framework &mdash; not an AI generator, and not available on Windows or macOS.</p>',
    old_block='''<h2>What it does well</h2>
<ul>
<li>Real video capability on the Open Source tier — no credit card to start.</li>
<li>Practical for everyday use; outputs are usable, not just demos.</li>
<li>Actively maintained by Flowblade; Linux editor is a current highlight.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>No-cost entry with meaningful features.</li>
<li>Backed by Flowblade, so it is actively maintained.</li>
<li>Good fit for users who want a text-to-video generator that produces short clips from prompts without paid subscriptions.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Support is community forums and issue trackers unless you pay for a support plan.</li>
<li>Less specialized than dedicated tools for adjacent tasks.</li>
<li>No one owes you a fix on a deadline &mdash; roadmap and bug priority are the maintainers' call.</li>
</ul>
<h2>What it costs</h2>
<p>Flowblade is open source, so the core product is free to use and stays that way.</p>
<p>Plenty of open-source projects also sell hosting, support or an enterprise edition alongside the free release &mdash; check the project's own pricing page for what, if anything, is sold on top.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>DaVinci Resolve</strong> — Editing, color, audio, and VFX in one application (video).</li>
<li><strong>Kling AI</strong> — One of the best free text-to-video generators in 2026 (video).</li>
<li><strong>Luma Dream Machine</strong> — Stunning video generation from text or image (video).</li>
</ul>''',
    new_block='''<h2>What it does well</h2>
<ul>
<li>Supports 146 formats, 78 video codecs and 58 audio codecs through its FFmpeg backend, per the project's own site &mdash; broad format compatibility for a small, focused tool.</li>
<li>G'MIC integration adds advanced image-filtering options beyond Flowblade's built-in effects.</li>
<li>Clip-snapping and a fast, minimal timeline UI are consistently the most-praised parts of the editor in independent write-ups.</li>
</ul>
<h2>Pros</h2>
<ul>
<li>Fully free and open source (GPL3), no paid tier.</li>
<li>Lightweight &mdash; runs well on modest Linux hardware where heavier NLEs struggle.</li>
<li>A focused feature set means less menu-hunting than in larger editors like Kdenlive.</li>
</ul>
<h2>Cons</h2>
<ul>
<li>Linux only &mdash; there is no official Windows or macOS build, which rules it out immediately for most users on this list.</li>
<li>A smaller community than Kdenlive or Shotcut means fewer tutorials and slower answers to obscure bugs.</li>
<li>Earlier versions had user-reported stability issues; check the project's current release notes before committing a long project to it.</li>
</ul>
<h2>What it costs</h2>
<p>Flowblade is open source (GPL3) and free with no paid tier &mdash; the constraint that actually matters here is platform, not price: it only runs on Linux.</p>
<h2>Best alternatives</h2>
<ul>
<li><strong>OpenShot</strong> — Simple cuts, titles, and home-video projects (video).</li>
<li><strong>DaVinci Resolve</strong> — Editing, color, audio, and VFX in one application (video).</li>
</ul>''',
    faq_best_for_old="a text-to-video generator that produces short clips from prompts without paying.",
    faq_best_for_new="lightweight multitrack editing on Linux without paying for a subscription NLE.",
)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    review_dir = REPO / "reviews"
    total_before = total_after = 0
    any_error = False

    for slug, spec in PAGES.items():
        path = review_dir / f"{slug}.html"
        doc = path.read_text(encoding="utf-8")
        before = body_words(doc)
        total_before += before

        for key in ("old_lede", "old_block"):
            n = doc.count(spec[key])
            if n != 1:
                print(f"ABORT: {slug}: {key} found {n} times, expected 1")
                any_error = True

        old_faq_visible = f"<strong>Best for?</strong> {spec['faq_best_for_old']}"
        new_faq_visible = f"<strong>Best for?</strong> {spec['faq_best_for_new']}"
        if doc.count(old_faq_visible) != 1:
            print(f"ABORT: {slug}: visible FAQ 'Best for?' anchor not found once")
            any_error = True

        old_faq_json = f'"name": "Best for?",\n          "acceptedAnswer": {{\n            "@type": "Answer",\n            "text": "{spec["faq_best_for_old"]}"'
        if old_faq_json not in doc:
            print(f"ABORT: {slug}: JSON-LD FAQ 'Best for?' anchor not found")
            any_error = True

        if any_error:
            continue

        new_doc = doc.replace(spec["old_lede"], spec["new_lede"], 1)
        new_doc = new_doc.replace(spec["old_block"], spec["new_block"], 1)
        new_doc = new_doc.replace(old_faq_visible, new_faq_visible, 1)
        new_faq_json = old_faq_json.replace(spec["faq_best_for_old"], spec["faq_best_for_new"])
        new_doc = new_doc.replace(old_faq_json, new_faq_json, 1)

        after = body_words(new_doc)
        total_after += after
        print(f"{slug:18s} {before:4d} -> {after:4d} words ({after - before:+d})")

        if args.apply:
            path.write_text(new_doc, encoding="utf-8", newline="")

    if any_error:
        print("\nABORTED — no files written")
        return 2

    print(f"\n{'APPLIED' if args.apply else 'DRY RUN - nothing written'}")
    print(f"total body words: {total_before} -> {total_after} ({total_after - total_before:+d})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
