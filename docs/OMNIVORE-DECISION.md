# THEHUB — Decision Packet: Omnivore Remediation & Revolt Rebranding (Tasks T2 & T3)

**Date:** 2026-08-22  
**Status:** Awaiting Editorial & Product Decision  
**Spec Reference:** `archive/MASTER-REMEDIATION-SPEC-V2.md` §5 (T2 & T3)

---

# PART 1: Task T2 — Omnivore Remediation

## 1. Problem Statement

Omnivore, an open-source read-it-later application, **permanently shut down on November 15, 2024** after the team was acquihired by ElevenLabs (Sources: `elevenlabs.io`, `gleamr.io`). The hosted service `omnivore.app` is offline.

Omnivore is currently featured as an active **"free pick"** on two live, indexable pillar pages:
1. `free-alternative-to-ennevernote.html`
2. `free-alternative-to-notion.html`

Both pages are titled **"3 Genuinely Free Picks"** and currently present the identical trio of tools: **AppFlowy**, **Draw.io**, and **Omnivore**.

---

## 2. Omnivore Mentions in Live HTML

### A. `free-alternative-to-ennevernote.html` (6 mentions)

1. **Line 68 (JSON-LD ItemList):**
   ```json
   {"@type":"ListItem","position":3,"name":"Omnivore","description":"Open-source read-it-later application for articles, newsletters, and documents with TTS.","url":"https://www.qutaifan.com/free-alternative-to-ennevernote#omnivore"}
   ```
2. **Line 81 (Summary Table Row):**
   ```html
   <tr><td><a href="/#omnivore" class="qh-review-link">Omnivore</a></td><td>Open-source read-it-later application for articles, newsletters, and documents with TTS.</td><td><span class="badge badge-free">Free</span></td><td><a href="https://omnivore.app" rel="nofollow noopener" target="_blank" class="qh-official-link">Visit site &rarr;</a></td></tr>
   ```
3. **Line 103 (Pair Card Section Anchor):**
   ```html
   <section class="pair-card" id="omnivore">
   ```
4. **Line 105 (Section Header):**
   ```html
   <h2><a href="/#omnivore" class="qh-review-link">Omnivore</a> — free pick in this category</h2>
   ```
5. **Line 106 (Official Website Link):**
   ```html
   <div class="official-links"><a href="https://omnivore.app" rel="nofollow noopener" target="_blank">Official website &rarr;</a></div>
   ```
6. **Line 108 (Fit Description):**
   ```html
   <p class="fit">Best for: Open-source read-it-later application for articles, newsletters, and documents with TTS.</p>
   ```

### B. `free-alternative-to-notion.html` (6 mentions)

1. **Line 68 (JSON-LD ItemList):**
   ```json
   {"@type":"ListItem","position":3,"name":"Omnivore","description":"Open-source read-it-later application for articles, newsletters, and documents with TTS.","url":"https://www.qutaifan.com/free-alternative-to-notion#omnivore"}
   ```
2. **Line 81 (Summary Table Row):**
   ```html
   <tr><td><a href="/#omnivore" class="qh-review-link">Omnivore</a></td><td>Open-source read-it-later application for articles, newsletters, and documents with TTS.</td><td><span class="badge badge-free">Free</span></td><td><a href="https://omnivore.app" rel="nofollow noopener" target="_blank" class="qh-official-link">Visit site &rarr;</a></td></tr>
   ```
3. **Line 103 (Pair Card Section Anchor):**
   ```html
   <section class="pair-card" id="omnivore">
   ```
4. **Line 105 (Section Header):**
   ```html
   <h2><a href="/#omnivore" class="qh-review-link">Omnivore</a> — free pick in this category</h2>
   ```
5. **Line 106 (Official Website Link):**
   ```html
   <div class="official-links"><a href="https://omnivore.app" rel="nofollow noopener" target="_blank">Official website &rarr;</a></div>
   ```
6. **Line 108 (Fit Description):**
   ```html
   <p class="fit">Best for: Open-source read-it-later application for articles, newsletters, and documents with TTS.</p>
   ```

---

## 3. Occurrences of Count "3" Requiring Update

In both pages, the number "3" appears in 8 key structural locations:

| Line # | Element | Current Text in `free-alternative-to-ennevernote.html` | Current Text in `free-alternative-to-notion.html` |
|---|---|---|---|
| 8 | `<title>` | `Free Alternative to Evernote 2026: 3 Genuinely Free Picks` | `Free Alternative to Notion 2026: 3 Genuinely Free Picks` |
| 9 | `<meta name="description">` | `...in 2026 — 3 genuinely free, open-source and free-tier...` | `...in 2026 — 3 genuinely free, open-source and free-tier...` |
| 15 | `<meta property="og:title">` | `Free Alternative to Evernote 2026: 3 Genuinely Free Picks` | `Free Alternative to Notion 2026: 3 Genuinely Free Picks` |
| 16 | `<meta property="og:description">` | `...in 2026 — 3 genuinely free...` | `...in 2026 — 3 genuinely free...` |
| 21 | `<meta name="twitter:title">` | `Free Alternative to Evernote 2026: 3 Genuinely Free Picks` | `Free Alternative to Notion 2026: 3 Genuinely Free Picks` |
| 22 | `<meta name="twitter:description">` | `...in 2026 — 3 genuinely free...` | `...in 2026 — 3 genuinely free...` |
| 68 | `<script type="application/ld+json">` | `{"@type":"Article","headline":"Free Alternative to Evernote 2026: 3 Genuinely Free Picks", ...}` | `{"@type":"Article","headline":"Free Alternative to Notion 2026: 3 Genuinely Free Picks", ...}` |
| 74 | `<h1>` in `<section class="hero">` | `<h1>Free <span>Alternative to Evernote</span>: 3 Genuinely Free Picks</h1>` | `<h1>Free <span>Alternative to Notion</span>: 3 Genuinely Free Picks</h1>` |

---

## 4. Shared Content Analysis (Pillar Overlap)

Comparing `free-alternative-to-ennevernote.html` and `free-alternative-to-notion.html`:
- **Total lines per file:** 188 lines.
- **Identical lines:** 119 lines (63.3% of the document is byte-for-byte identical).
- **Substantive difference:** Only the target tool name ("Evernote" vs "Notion") and hero lead paragraph differ. The entire picks table, AppFlowy card, Draw.io card, Omnivore card, and FAQs are duplicated between the two pages.

---

## 5. Candidate Replacements (from existing reviews corpus)

To replace Omnivore without writing unvetted prose, candidate tools must already have coverage:

| Tool Slug | Tool Name | Review Page on Disk | Review Indexability | Category / Fit |
|---|---|---|---|---|
| `joplin` | Joplin | `reviews/joplin.html` | `noindex` (in quality gate review backlog) | Markdown notes, sync, Evernote replacement |
| `logseq` | Logseq | `reviews/logseq.html` | `noindex` (in quality gate review backlog) | Outliner, local-first graph, Notion/Roam replacement |
| `obsidian` | Obsidian | *No review page on disk* | N/A | Local-first markdown knowledge base |
| `affine` | AFFiNE | *No review page on disk* | N/A | Block-based visual workspace |

---

## 6. Costed Options for Decision

### Option A: Drop Omnivore & Retitle to "2 Genuinely Free Picks"
- **Action:** Remove the Omnivore table row, card section, and JSON-LD item. Update titles/meta from "3" to "2".
- **Pros:** Fast, zero new prose required, immediately cleans dead external link and false recommendation.
- **Cons:** Leaves two near-identical 2-pick listicles (`appflowy` + `draw-io`).
- **Effort / Risk:** Low effort, zero compliance risk.

### Option B: Differentiate the Two Pages with Existing Tools
- **Action:**
  - `free-alternative-to-ennevernote.html`: Replace Omnivore with `joplin` (natural note-taking alternative).
  - `free-alternative-to-notion.html`: Replace Omnivore with `logseq` (natural database/outliner alternative).
- **Pros:** Differentiates the two pages; fixes duplicate content risk; provides accurate, category-specific alternatives.
- **Cons:** `joplin` and `logseq` reviews are currently `noindex` (though linking from a pillar page to a noindex review or external tool site is technically valid).
- **Effort / Risk:** Medium effort; requires authoring/editing card prose for Joplin and Logseq.

### Option C: Quality Gate Promotion First
- **Action:** First rewrite `reviews/joplin.html` and `reviews/logseq.html` to pass `content_quality.py` with 0 warnings/prominent warnings, lift their `noindex`, then integrate them into the respective pillar pages.
- **Pros:** Cleanest architectural flow — both linked reviews become fully indexable.
- **Cons:** Requires human review authoring effort for 2 review pages before pillar update.
- **Effort / Risk:** Highest quality, requires human editorial time.

---

# PART 2: Task T3 — Revolt Rebranding to Stoat

## 1. Context & Verification

- **Rebrand Date:** October 1, 2025 (Source: [Wikipedia - Stoat](https://en.wikipedia.org/wiki/Stoat_(software))).
- **Reason:** Trademark dispute over the name "Revolt".
- **Current Official URL:** `https://stoat.chat` (formerly `revolt.chat`).
- **GitHub Organization:** `https://github.com/stoatchat` (formerly `revoltchat`).

## 2. Current References in Repository

1. **`tools.json` (Line 2504):**
   ```json
   {
     "name": "Revolt.chat",
     "slug": "revolt-chat",
     "by": "Revolt Team",
     "blurb": "Open-source user-first chat platform alternative to Discord.",
     "category": "community",
     "tags": [
       "Messaging",
       "Voice",
       "Privacy"
     ],
     "pricing": "open-source",
     "badges": [
       "AGPL-3.0",
       "Self-Host"
     ],
     "url": "https://revolt.chat",
     "review": "/reviews/revolt-chat",
     "added": "2026-08-07"
   }
   ```
2. **Vault Note (`MY-NOTES/THEHUB/Tools/community/tool--revolt-chat.md`):**
   Contains YAML frontmatter with `name: "Revolt.chat"`, `slug: "revolt-chat"`, `url: "https://revolt.chat"`.
3. **Site `.html` files:** **0 references.** (Revolt is not linked from any listicle, comparison, or review page).
4. **`reviews/` on disk:** **0 files.** (No `reviews/revolt-chat.html` exists).

## 3. Impact Assessment for Rename

If Ahmad decides to update Revolt → Stoat:
1. Rename vault note to `tool--stoat.md` with:
   - `name: "Stoat"`
   - `slug: "stoat"`
   - `by: "Stoat Team"` (formerly Revolt)
   - `url: "https://stoat.chat"`
   - `review: "/reviews/stoat"`
2. Re-sync `tools.json` via `node scripts/sync_tools_from_obsidian.js --apply`.
3. Zero HTML pages or internal links will break because `revolt-chat` is not referenced anywhere on the live site.
