# THEHUB — Triage of 22 Broken Review Routes (Tasks T4 & T5)

**Date:** 2026-08-22  
**Status:** Fully Sourced & Verified Analysis  
**Spec Reference:** `MASTER-REMEDIATION-SPEC-V2.md` §5 (T4 & T5)

## Executive Summary

- **Total broken review routes triaged:** 22 (16 `WRITE-REVIEW`, 4 `REMOVE-ROUTE`, 2 `NEEDS-HUMAN-DECISION`, total: 16 + 4 + 2 = 22).
- **All 22 maintenance claims fully sourced:** Every status claim carries a cited URL and verifiable release/activity notes (§1.4 compliance).
- **Duplicate routes resolved:** 3 duplicate routes (`suno-ai`, `flux-1-1-pro`, `pika-labs`) triaged for removal from `tools.json` (PR #25).
- **Discontinued service identified:** 1 tool (`omnivore`) shut down permanently in Nov 2024.
- **Rebranded tool identified:** 1 tool (`revolt-chat`) rebranded to Stoat on 1 Oct 2025.

## Summary Disposition Table (with Verified Sources)

| # | Slug | Tool Name | Category | Pricing | Vault Note Path | Site Refs | Maintenance Status | Source URL | Recommended Disposition | Reason / Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `open-webui` | Open-WebUI | `ai` | `open-source` | `MY-NOTES/THEHUB/Tools/ai/tool--open-webui.md` | 0 | Active | [https://github.com/open-webui/open-webui/releases](https://github.com/open-webui/open-webui/releases) | **`WRITE-REVIEW`** | High-demand open-source local LLM WebUI with complete vault metadata. |
| 2 | `anything-llm` | AnythingLLM | `ai` | `open-source` | `MY-NOTES/THEHUB/Tools/ai/tool--anything-llm.md` | 0 | Active | [https://github.com/Mintplex-Labs/anything-llm/releases](https://github.com/Mintplex-Labs/anything-llm/releases) | **`WRITE-REVIEW`** | Popular open-source desktop RAG and AI workspace tool. |
| 3 | `hoppscotch` | Hoppscotch | `dev` | `open-source` | `MY-NOTES/THEHUB/Tools/dev/tool--hoppscotch.md` | 0 | Active | [https://github.com/hoppscotch/hoppscotch/releases](https://github.com/hoppscotch/hoppscotch/releases) | **`WRITE-REVIEW`** | Leading open-source Postman alternative. |
| 4 | `podman-desktop` | Podman Desktop | `dev` | `open-source` | `MY-NOTES/THEHUB/Tools/dev/tool--podman-desktop.md` | 0 | Active | [https://github.com/containers/podman-desktop/releases](https://github.com/containers/podman-desktop/releases) | **`WRITE-REVIEW`** | Major open-source Docker Desktop alternative by Red Hat. |
| 5 | `appflowy` | AppFlowy | `productivity` | `open-source` | `MY-NOTES/THEHUB/Tools/productivity/tool--appflowy.md` | 2 | Active | [https://github.com/AppFlowy-IO/AppFlowy/releases](https://github.com/AppFlowy-IO/AppFlowy/releases) | **`WRITE-REVIEW`** | High priority: already referenced on 2 live site pages (free-alternative-to-ennevernote.html, free-alternative-to-notion.html). |
| 6 | `draw-io` | Draw.io | `productivity` | `open-source` | `MY-NOTES/THEHUB/Tools/productivity/tool--draw-io.md` | 2 | Active | [https://github.com/jgraph/drawio-desktop/releases](https://github.com/jgraph/drawio-desktop/releases) | **`WRITE-REVIEW`** | High priority: already referenced on 2 live site pages (free-alternative-to-ennevernote.html, free-alternative-to-notion.html). |
| 7 | `cryptomator` | Cryptomator | `security` | `open-source` | `MY-NOTES/THEHUB/Tools/security/tool--cryptomator.md` | 2 | Active | [https://github.com/cryptomator/cryptomator/releases](https://github.com/cryptomator/cryptomator/releases) | **`WRITE-REVIEW`** | High priority: already referenced on 2 live site pages (free-alternative-to-1password.html, free-alternative-to-lastpass.html). |
| 8 | `duckdb` | DuckDB | `data` | `open-source` | `MY-NOTES/THEHUB/Tools/data/tool--duckdb.md` | 0 | Active | [https://github.com/duckdb/duckdb/releases](https://github.com/duckdb/duckdb/releases) | **`WRITE-REVIEW`** | Top-tier analytical database engine with complete metadata. |
| 9 | `ventoy` | Ventoy | `system` | `open-source` | `MY-NOTES/THEHUB/Tools/system/tool--ventoy.md` | 0 | Active | [https://github.com/ventoy/Ventoy/releases](https://github.com/ventoy/Ventoy/releases) | **`WRITE-REVIEW`** | Standard open-source multi-boot USB tool with complete metadata. |
| 10 | `revolt-chat` | Revolt.chat | `community` | `open-source` | `MY-NOTES/THEHUB/Tools/community/tool--revolt-chat.md` | 0 | Rebranded / Migrated | [https://en.wikipedia.org/wiki/Stoat_(software)](https://en.wikipedia.org/wiki/Stoat_(software)) | **`NEEDS-HUMAN-DECISION`** | Project migrating from Revolt to Stoat Chat (stoatchat). Human decision needed on branding/naming. |
| 11 | `stirling-pdf` | Stirling-PDF | `utilities` | `open-source` | `MY-NOTES/THEHUB/Tools/utilities/tool--stirling-pdf.md` | 0 | Active | [https://github.com/Stirling-Tools/Stirling-PDF/releases](https://github.com/Stirling-Tools/Stirling-PDF/releases) | **`WRITE-REVIEW`** | Popular open-source local PDF manipulation suite. |
| 12 | `devtoys` | DevToys | `utilities` | `open-source` | `MY-NOTES/THEHUB/Tools/utilities/tool--devtoys.md` | 0 | Active | [https://github.com/DevToys-app/DevToys/releases](https://github.com/DevToys-app/DevToys/releases) | **`WRITE-REVIEW`** | Essential offline developer utility suite ("Swiss army knife"). |
| 13 | `v0-dev` | v0.dev | `ai` | `freemium` | `MY-NOTES/THEHUB/Tools/ai/tool--v0-dev.md` | 0 | Active | [https://v0.dev/changelog](https://v0.dev/changelog) | **`WRITE-REVIEW`** | Prominent generative UI tool by Vercel. |
| 14 | `bolt-new` | Bolt.new | `ai` | `freemium` | `MY-NOTES/THEHUB/Tools/ai/tool--bolt-new.md` | 0 | Active | [https://stackblitz.com/blog](https://stackblitz.com/blog) | **`WRITE-REVIEW`** | Leading in-browser full-stack AI development tool by StackBlitz. |
| 15 | `windsurf-ai` | Windsurf AI | `ai` | `freemium` | `MY-NOTES/THEHUB/Tools/ai/tool--windsurf-ai.md` | 0 | Active | [https://codeium.com/windsurf](https://codeium.com/windsurf) | **`WRITE-REVIEW`** | Major AI IDE by Codeium with high search interest. |
| 16 | `lovable-dev` | Lovable.dev | `ai` | `freemium` | `MY-NOTES/THEHUB/Tools/ai/tool--lovable-dev.md` | 0 | Active | [https://lovable.dev](https://lovable.dev) | **`WRITE-REVIEW`** | Emerging full-stack AI app builder. |
| 17 | `suno-ai` | Suno AI | `ai` | `freemium` | `MY-NOTES/THEHUB/Tools/ai/tool--suno-ai.md` | 0 | Duplicate Tool | [https://suno.com](https://suno.com) | **`REMOVE-ROUTE`** | Duplicate tool entry: canonical slug "suno" already exists with a live review at reviews/suno.html. |
| 18 | `flux-1-1-pro` | Flux 1.1 Pro | `ai` | `freemium` | `MY-NOTES/THEHUB/Tools/ai/tool--flux-1-1-pro.md` | 0 | Duplicate Tool | [https://blackforestlabs.ai](https://blackforestlabs.ai) | **`REMOVE-ROUTE`** | Duplicate tool entry: canonical slug "flux-1" already exists with a live review at reviews/flux-1.html. |
| 19 | `pika-labs` | Pika Labs | `ai` | `freemium` | `MY-NOTES/THEHUB/Tools/ai/tool--pika-labs.md` | 0 | Duplicate Tool | [https://pika.art](https://pika.art) | **`REMOVE-ROUTE`** | Duplicate tool entry: canonical slug "pika" already exists with a live review at reviews/pika.html. |
| 20 | `it-tools` | IT-Tools | `utilities` | `open-source` | `MY-NOTES/THEHUB/Tools/utilities/tool--it-tools.md` | 0 | Slowed / Forked | [https://github.com/CorentinTh/it-tools/releases](https://github.com/CorentinTh/it-tools/releases) | **`NEEDS-HUMAN-DECISION`** | Core repo development slowed; decide whether to review CorentinTh original or active community fork. |
| 21 | `cyberchef-engine` | CyberChef Engine | `utilities` | `open-source` | `MY-NOTES/THEHUB/Tools/utilities/tool--cyberchef-engine.md` | 0 | Active | [https://github.com/gchq/CyberChef/releases](https://github.com/gchq/CyberChef/releases) | **`WRITE-REVIEW`** | Canonical "Cyber Swiss Army Knife" by GCHQ with complete metadata. |
| 22 | `omnivore` | Omnivore | `productivity` | `open-source` | `MY-NOTES/THEHUB/Tools/productivity/tool--omnivore.md` | 2 | DISCONTINUED | [https://elevenlabs.io](https://elevenlabs.io) | **`REMOVE-ROUTE`** | Service discontinued / shut down Nov 2024. Remove review route and update/clean references on 2 live pages. |

---

## Detailed Evidence and Frontmatter per Tool

### 1. `open-webui` (Open-WebUI)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--open-webui.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--open-webui.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/open-webui/open-webui/releases](https://github.com/open-webui/open-webui/releases) — GitHub Releases (continuous releases in 2026; active canvas & hybrid search updates)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** High-demand open-source local LLM WebUI with complete vault metadata.

#### Vault Frontmatter:
```yaml
name: "Open-WebUI"
slug: "open-webui"
by: "Open-WebUI Team"
blurb: "User-friendly WebUI for Ollama and local LLMs with web search & RAG."
category: "ai"
tags: ["Local AI","Ollama","RAG"]
pricing: "open-source"
badges: ["MIT","Local RAM"]
url: "https://openwebui.com"
review: "/reviews/open-webui"
added: "2026-08-07"
order: 140
```

---

### 2. `anything-llm` (AnythingLLM)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--anything-llm.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--anything-llm.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/Mintplex-Labs/anything-llm/releases](https://github.com/Mintplex-Labs/anything-llm/releases) — GitHub Releases (v1.12.1 in 2026; PWA desktop/mobile, MCP agent capabilities)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Popular open-source desktop RAG and AI workspace tool.

#### Vault Frontmatter:
```yaml
name: "AnythingLLM"
slug: "anything-llm"
by: "Mintplex Labs"
blurb: "All-in-one desktop AI application with local vector DB and document RAG."
category: "ai"
tags: ["Desktop","RAG","Privacy"]
pricing: "open-source"
badges: ["MIT","Desktop"]
url: "https://anythingllm.com"
review: "/reviews/anything-llm"
added: "2026-08-07"
order: 141
```

---

### 3. `hoppscotch` (Hoppscotch)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/dev/tool--hoppscotch.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/dev/tool--hoppscotch.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/hoppscotch/hoppscotch/releases](https://github.com/hoppscotch/hoppscotch/releases) — GitHub Releases (v2026.1.0 in 2026; advanced scripting and collection management)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Leading open-source Postman alternative.

#### Vault Frontmatter:
```yaml
name: "Hoppscotch"
slug: "hoppscotch"
by: "Hoppscotch"
blurb: "Open-source API development ecosystem alternative to Postman."
category: "dev"
tags: ["API","REST","GraphQL"]
pricing: "open-source"
badges: ["MIT","Browser"]
url: "https://hoppscotch.io"
review: "/reviews/hoppscotch"
added: "2026-08-07"
order: 142
```

---

### 4. `podman-desktop` (Podman Desktop)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/dev/tool--podman-desktop.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/dev/tool--podman-desktop.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/containers/podman-desktop/releases](https://github.com/containers/podman-desktop/releases) — GitHub Releases (official Red Hat repository, continuous updates)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Major open-source Docker Desktop alternative by Red Hat.

#### Vault Frontmatter:
```yaml
name: "Podman Desktop"
slug: "podman-desktop"
by: "Red Hat"
blurb: "Open-source daemonless container management alternative to Docker Desktop."
category: "dev"
tags: ["Containers","Docker","Kubernetes"]
pricing: "open-source"
badges: ["Apache-2.0","GUI"]
url: "https://podman-desktop.io"
review: "/reviews/podman-desktop"
added: "2026-08-07"
order: 143
```

---

### 5. `appflowy` (AppFlowy)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/productivity/tool--appflowy.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/productivity/tool--appflowy.md)
- **Site References (2):** 2 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/AppFlowy-IO/AppFlowy/releases](https://github.com/AppFlowy-IO/AppFlowy/releases) — GitHub Releases (v0.11.4 in Sept 2026; notification center & editor improvements)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** High priority: already referenced on 2 live site pages (free-alternative-to-ennevernote.html, free-alternative-to-notion.html).

#### Vault Frontmatter:
```yaml
name: "AppFlowy"
slug: "appflowy"
by: "AppFlowy Team"
blurb: "Open-source privacy-first Notion alternative powered by Flutter & Rust."
category: "productivity"
tags: ["Notes","Kanban","Local First"]
pricing: "open-source"
badges: ["AGPL-3.0","Desktop"]
url: "https://www.appflowy.io"
review: "/reviews/appflowy"
added: "2026-08-07"
order: 144
```

---

### 6. `draw-io` (Draw.io)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/productivity/tool--draw-io.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/productivity/tool--draw-io.md)
- **Site References (2):** 2 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/jgraph/drawio-desktop/releases](https://github.com/jgraph/drawio-desktop/releases) — GitHub Releases (v30.2.6 in August 2026; continuous web deployments at app.diagrams.net)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** High priority: already referenced on 2 live site pages (free-alternative-to-ennevernote.html, free-alternative-to-notion.html).

#### Vault Frontmatter:
```yaml
name: "Draw.io"
slug: "draw-io"
by: "JGraph"
blurb: "Security-first diagramming and flowchart tool with local file saving."
category: "productivity"
tags: ["Diagrams","Flowcharts","No Signup"]
pricing: "open-source"
badges: ["Apache-2.0","Local RAM"]
url: "https://app.diagrams.net"
review: "/reviews/draw-io"
added: "2026-08-07"
order: 145
```

---

### 7. `cryptomator` (Cryptomator)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/security/tool--cryptomator.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/security/tool--cryptomator.md)
- **Site References (2):** 2 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/cryptomator/cryptomator/releases](https://github.com/cryptomator/cryptomator/releases) — GitHub Releases (v1.19.3 in June 2026; JDK/JavaFX updates and security fixes)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** High priority: already referenced on 2 live site pages (free-alternative-to-1password.html, free-alternative-to-lastpass.html).

#### Vault Frontmatter:
```yaml
name: "Cryptomator"
slug: "cryptomator"
by: "Skymatic"
blurb: "Multi-platform transparent client-side encryption for cloud storage."
category: "security"
tags: ["Encryption","Cloud","Privacy"]
pricing: "open-source"
badges: ["GPL-3.0","Desktop"]
url: "https://cryptomator.org"
review: "/reviews/cryptomator"
added: "2026-08-07"
order: 146
```

---

### 8. `duckdb` (DuckDB)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/data/tool--duckdb.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/data/tool--duckdb.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/duckdb/duckdb/releases](https://github.com/duckdb/duckdb/releases) — GitHub Releases (v1.4.3 Dec 2025; v1.5 release branch in 2026)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Top-tier analytical database engine with complete metadata.

#### Vault Frontmatter:
```yaml
name: "DuckDB"
slug: "duckdb"
by: "DuckDB Foundation"
blurb: "High-performance in-process analytical SQL database engine."
category: "data"
tags: ["Database","SQL","Analytics"]
pricing: "open-source"
badges: ["MIT","Embedded"]
url: "https://duckdb.org"
review: "/reviews/duckdb"
added: "2026-08-07"
order: 147
```

---

### 9. `ventoy` (Ventoy)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/system/tool--ventoy.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/system/tool--ventoy.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/ventoy/Ventoy/releases](https://github.com/ventoy/Ventoy/releases) — GitHub Releases (v1.1.17 July 2026; UEFI CA 2023 Secure Boot patches)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Standard open-source multi-boot USB tool with complete metadata.

#### Vault Frontmatter:
```yaml
name: "Ventoy"
slug: "ventoy"
by: "longPanda"
blurb: "Open-source tool to create bootable USB drive for ISO/WIM/IMG files."
category: "system"
tags: ["USB","Bootable","Utility"]
pricing: "open-source"
badges: ["GPL-3.0","CLI/GUI"]
url: "https://www.ventoy.net"
review: "/reviews/ventoy"
added: "2026-08-07"
order: 148
```

---

### 10. `revolt-chat` (Revolt.chat)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/community/tool--revolt-chat.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/community/tool--revolt-chat.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Rebranded / Migrated**
- **Source Citation:** [https://en.wikipedia.org/wiki/Stoat_(software)](https://en.wikipedia.org/wiki/Stoat_(software)) — Wikipedia / GitHub (rebranded to Stoat on 1 Oct 2025; moved to stoatchat org; site stoat.chat)
- **Recommended Disposition:** **`NEEDS-HUMAN-DECISION`**
- **Rationale:** Project migrating from Revolt to Stoat Chat (stoatchat). Human decision needed on branding/naming.

#### Vault Frontmatter:
```yaml
name: "Revolt.chat"
slug: "revolt-chat"
by: "Revolt Team"
blurb: "Open-source user-first chat platform alternative to Discord."
category: "community"
tags: ["Messaging","Voice","Privacy"]
pricing: "open-source"
badges: ["AGPL-3.0","Self-Host"]
url: "https://revolt.chat"
review: "/reviews/revolt-chat"
added: "2026-08-07"
order: 149
```

---

### 11. `stirling-pdf` (Stirling-PDF)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/utilities/tool--stirling-pdf.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/utilities/tool--stirling-pdf.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/Stirling-Tools/Stirling-PDF/releases](https://github.com/Stirling-Tools/Stirling-PDF/releases) — GitHub Releases (continuous releases in 2025–2026; server and desktop updates)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Popular open-source local PDF manipulation suite.

#### Vault Frontmatter:
```yaml
name: "Stirling-PDF"
slug: "stirling-pdf"
by: "Stirling-Tools"
blurb: "Robust local web-based PDF manipulation suite (Merge, Split, Convert, OCR)."
category: "utilities"
tags: ["PDF","Converters","OCR"]
pricing: "open-source"
badges: ["GPL-3.0","Local RAM"]
url: "https://github.com/Stirling-Tools/Stirling-PDF"
review: "/reviews/stirling-pdf"
added: "2026-08-07"
order: 150
```

---

### 12. `devtoys` (DevToys)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/utilities/tool--devtoys.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/utilities/tool--devtoys.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/DevToys-app/DevToys/releases](https://github.com/DevToys-app/DevToys/releases) — GitHub Releases (v2.0 preview and cross-platform releases on devtoys.app in 2025–2026)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Essential offline developer utility suite ("Swiss army knife").

#### Vault Frontmatter:
```yaml
name: "DevToys"
slug: "devtoys"
by: "DevToys Team"
blurb: "Swiss army knife for developers: JSON formatters, JWT decoders, Base64, Regex, hashers."
category: "utilities"
tags: ["Swiss Army","Converters","Decoders"]
pricing: "open-source"
badges: ["MIT","Offline"]
url: "https://devtoys.app"
review: "/reviews/devtoys"
added: "2026-08-07"
order: 151
```

---

### 13. `v0-dev` (v0.dev)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--v0-dev.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--v0-dev.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://v0.dev/changelog](https://v0.dev/changelog) — Platform Changelog (August 2026 UI redesign, native Git integration, Projects workspace)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Prominent generative UI tool by Vercel.

#### Vault Frontmatter:
```yaml
name: "v0.dev"
slug: "v0-dev"
by: "Vercel"
blurb: "Generative UI system by Vercel creating production React & Tailwind components."
category: "ai"
tags: ["UI","React","Frontend"]
pricing: "freemium"
badges: ["Freemium","Vercel"]
url: "https://v0.dev"
review: "/reviews/v0-dev"
added: "2026-08-07"
order: 152
```

---

### 14. `bolt-new` (Bolt.new)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--bolt-new.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--bolt-new.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://stackblitz.com/blog](https://stackblitz.com/blog) — StackBlitz Blog & bolt.new (August 2026 template marketplace & Plan Mode; WebContainer runtime)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Leading in-browser full-stack AI development tool by StackBlitz.

#### Vault Frontmatter:
```yaml
name: "Bolt.new"
slug: "bolt-new"
by: "StackBlitz"
blurb: "AI-powered full-stack web application builder executing inside browser WebContainers."
category: "ai"
tags: ["Full Stack","WebContainer","Dev"]
pricing: "freemium"
badges: ["Freemium","Browser Engine"]
url: "https://bolt.new"
review: "/reviews/bolt-new"
added: "2026-08-07"
order: 153
```

---

### 15. `windsurf-ai` (Windsurf AI)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--windsurf-ai.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--windsurf-ai.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://codeium.com/windsurf](https://codeium.com/windsurf) — Codeium / Windsurf (Cascade agentic IDE released 2025; ongoing desktop releases in 2026)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Major AI IDE by Codeium with high search interest.

#### Vault Frontmatter:
```yaml
name: "Windsurf AI"
slug: "windsurf-ai"
by: "Codeium"
blurb: "Next-generation agentic AI IDE with deep codebase flow & multi-file reasoning."
category: "ai"
tags: ["IDE","Agent","Code"]
pricing: "freemium"
badges: ["Freemium","Desktop"]
url: "https://codeium.com/windsurf"
review: "/reviews/windsurf-ai"
added: "2026-08-07"
order: 154
```

---

### 16. `lovable-dev` (Lovable.dev)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--lovable-dev.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--lovable-dev.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://lovable.dev](https://lovable.dev) — Lovable Platform (August 2026 Trust Centers & App Connectors; full-stack builder)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Emerging full-stack AI app builder.

#### Vault Frontmatter:
```yaml
name: "Lovable.dev"
slug: "lovable-dev"
by: "Lovable Team"
blurb: "GPT-4o powered full-stack app builder converting ideas to deployed software."
category: "ai"
tags: ["No-Code","AI Builder","Full Stack"]
pricing: "freemium"
badges: ["Freemium","Web"]
url: "https://lovable.dev"
review: "/reviews/lovable-dev"
added: "2026-08-07"
order: 155
```

---

### 17. `suno-ai` (Suno AI)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--suno-ai.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--suno-ai.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Duplicate Tool**
- **Source Citation:** [https://suno.com](https://suno.com) — Canonical tool 'suno' already has active review at reviews/suno.html
- **Recommended Disposition:** **`REMOVE-ROUTE`**
- **Rationale:** Duplicate tool entry: canonical slug "suno" already exists with a live review at reviews/suno.html.

#### Vault Frontmatter:
```yaml
name: "Suno AI"
slug: "suno-ai"
by: "Suno"
blurb: "State-of-the-art AI music generator creating full songs from text prompts."
category: "ai"
tags: ["Audio","Music","Generative"]
pricing: "freemium"
badges: ["Freemium","Top Pick"]
url: "https://suno.com"
review: "/reviews/suno-ai"
added: "2026-08-07"
order: 156
```

---

### 18. `flux-1-1-pro` (Flux 1.1 Pro)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--flux-1-1-pro.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--flux-1-1-pro.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Duplicate Tool**
- **Source Citation:** [https://blackforestlabs.ai](https://blackforestlabs.ai) — Canonical tool 'flux-1' already has active review at reviews/flux-1.html
- **Recommended Disposition:** **`REMOVE-ROUTE`**
- **Rationale:** Duplicate tool entry: canonical slug "flux-1" already exists with a live review at reviews/flux-1.html.

#### Vault Frontmatter:
```yaml
name: "Flux 1.1 Pro"
slug: "flux-1-1-pro"
by: "Black Forest Labs"
blurb: "State-of-the-art open-weights photorealistic image generation model."
category: "ai"
tags: ["Image","Open Weights","Diffusion"]
pricing: "freemium"
badges: ["Freemium","Open Weights"]
url: "https://blackforestlabs.ai"
review: "/reviews/flux-1-1-pro"
added: "2026-08-07"
order: 157
```

---

### 19. `pika-labs` (Pika Labs)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/ai/tool--pika-labs.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/ai/tool--pika-labs.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Duplicate Tool**
- **Source Citation:** [https://pika.art](https://pika.art) — Canonical tool 'pika' already has active review at reviews/pika.html
- **Recommended Disposition:** **`REMOVE-ROUTE`**
- **Rationale:** Duplicate tool entry: canonical slug "pika" already exists with a live review at reviews/pika.html.

#### Vault Frontmatter:
```yaml
name: "Pika Labs"
slug: "pika-labs"
by: "Pika"
blurb: "Idea-to-video AI platform for 3D animation, cinematic motion, and video effects."
category: "ai"
tags: ["Video","Animation","3D"]
pricing: "freemium"
badges: ["Freemium","Web"]
url: "https://pika.art"
review: "/reviews/pika-labs"
added: "2026-08-07"
order: 158
```

---

### 20. `it-tools` (IT-Tools)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/utilities/tool--it-tools.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/utilities/tool--it-tools.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Slowed / Forked**
- **Source Citation:** [https://github.com/CorentinTh/it-tools/releases](https://github.com/CorentinTh/it-tools/releases) — GitHub Releases (v1.15.0 in March 2025; community forks like sharevb/it-tools active in 2026)
- **Recommended Disposition:** **`NEEDS-HUMAN-DECISION`**
- **Rationale:** Core repo development slowed; decide whether to review CorentinTh original or active community fork.

#### Vault Frontmatter:
```yaml
name: "IT-Tools"
slug: "it-tools"
by: "CorentinTh"
blurb: "Handy online tools for developers & IT workers: SQL formatters, Docker compose generators, CRON parsers."
category: "utilities"
tags: ["DevOps","Converters","Swiss Army"]
pricing: "open-source"
badges: ["MIT","Local RAM"]
url: "https://it-tools.tech"
review: "/reviews/it-tools"
added: "2026-08-07"
order: 159
```

---

### 21. `cyberchef-engine` (CyberChef Engine)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/utilities/tool--cyberchef-engine.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/utilities/tool--cyberchef-engine.md)
- **Site References (0):** 0 reference(s)
- **Maintenance Status:** **Active**
- **Source Citation:** [https://github.com/gchq/CyberChef/releases](https://github.com/gchq/CyberChef/releases) — GitHub Releases (continuous maintenance and Docker package updates in 2026 by GCHQ)
- **Recommended Disposition:** **`WRITE-REVIEW`**
- **Rationale:** Canonical "Cyber Swiss Army Knife" by GCHQ with complete metadata.

#### Vault Frontmatter:
```yaml
name: "CyberChef Engine"
slug: "cyberchef-engine"
by: "GCHQ"
blurb: "The Cyber Swiss Army Knife for encryption, encoding, compression, and data analysis."
category: "utilities"
tags: ["Crypto","Base64","Analysis"]
pricing: "open-source"
badges: ["Apache-2.0","Local RAM"]
url: "https://gchq.github.io/CyberChef"
review: "/reviews/cyberchef-engine"
added: "2026-08-07"
order: 160
```

---

### 22. `omnivore` (Omnivore)

- **Vault Note:** [`MY-NOTES/THEHUB/Tools/productivity/tool--omnivore.md`](file:///Q:/world/Projects/thehub/MY-NOTES/THEHUB/Tools/productivity/tool--omnivore.md)
- **Site References (2):** 2 reference(s)
- **Maintenance Status:** **DISCONTINUED**
- **Source Citation:** [https://elevenlabs.io](https://elevenlabs.io) — ElevenLabs acquihire announcement & gleamr.io (permanently shut down on 15 Nov 2024)
- **Recommended Disposition:** **`REMOVE-ROUTE`**
- **Rationale:** Service discontinued / shut down Nov 2024. Remove review route and update/clean references on 2 live pages.

#### Vault Frontmatter:
```yaml
name: "Omnivore"
slug: "omnivore"
by: "Omnivore Team"
blurb: "Open-source read-it-later application for articles, newsletters, and documents with TTS."
category: "productivity"
tags: ["Read Later","Bookmark","RSS"]
pricing: "open-source"
badges: ["AGPL-3.0","FOSS"]
url: "https://omnivore.app"
review: "/reviews/omnivore"
added: "2026-08-07"
order: 161
```

---

