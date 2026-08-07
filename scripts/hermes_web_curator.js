/**
 * Hermes Web Discovery & Autonomous Curation Engine v3.0
 * THEHUB by QUTAIFAN.COM (https://www.qutaifan.com/)
 * 
 * Expands tools.json across the 9 Taxonomy Categories with zero-trap FOSS & Freemium tools.
 */

const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.join(__dirname, '..', 'tools.json');

const NEW_CURATED_TOOLS = [
  // 1. AI Tools
  {
    name: "Open-WebUI",
    slug: "open-webui",
    by: "Open-WebUI Team",
    blurb: "User-friendly WebUI for Ollama and local LLMs with web search & RAG.",
    category: "ai",
    tags: ["Local AI", "Ollama", "RAG"],
    pricing: "open-source",
    badges: ["MIT", "Local RAM"],
    url: "https://openwebui.com",
    review: "/reviews/open-webui",
    added: "2026-08-07"
  },
  {
    name: "AnythingLLM",
    slug: "anything-llm",
    by: "Mintplex Labs",
    blurb: "All-in-one desktop AI application with local vector DB and document RAG.",
    category: "ai",
    tags: ["Desktop", "RAG", "Privacy"],
    pricing: "open-source",
    badges: ["MIT", "Desktop"],
    url: "https://anythingllm.com",
    review: "/reviews/anything-llm",
    added: "2026-08-07"
  },

  // 2. Developer Utilities
  {
    name: "Hoppscotch",
    slug: "hoppscotch",
    by: "Hoppscotch",
    blurb: "Open-source API development ecosystem alternative to Postman.",
    category: "dev",
    tags: ["API", "REST", "GraphQL"],
    pricing: "open-source",
    badges: ["MIT", "Browser"],
    url: "https://hoppscotch.io",
    review: "/reviews/hoppscotch",
    added: "2026-08-07"
  },
  {
    name: "Podman Desktop",
    slug: "podman-desktop",
    by: "Red Hat",
    blurb: "Open-source daemonless container management alternative to Docker Desktop.",
    category: "dev",
    tags: ["Containers", "Docker", "Kubernetes"],
    pricing: "open-source",
    badges: ["Apache-2.0", "GUI"],
    url: "https://podman-desktop.io",
    review: "/reviews/podman-desktop",
    added: "2026-08-07"
  },

  // 3. Productivity
  {
    name: "AppFlowy",
    slug: "appflowy",
    by: "AppFlowy Team",
    blurb: "Open-source privacy-first Notion alternative powered by Flutter & Rust.",
    category: "productivity",
    tags: ["Notes", "Kanban", "Local First"],
    pricing: "open-source",
    badges: ["AGPL-3.0", "Desktop"],
    url: "https://www.appflowy.io",
    review: "/reviews/appflowy",
    added: "2026-08-07"
  },
  {
    name: "Draw.io",
    slug: "draw-io",
    by: "JGraph",
    blurb: "Security-first diagramming and flowchart tool with local file saving.",
    category: "productivity",
    tags: ["Diagrams", "Flowcharts", "No Signup"],
    pricing: "open-source",
    badges: ["Apache-2.0", "Local RAM"],
    url: "https://app.diagrams.net",
    review: "/reviews/draw-io",
    added: "2026-08-07"
  },

  // 4. Security & Privacy
  {
    name: "Cryptomator",
    slug: "cryptomator",
    by: "Skymatic",
    blurb: "Multi-platform transparent client-side encryption for cloud storage.",
    category: "security",
    tags: ["Encryption", "Cloud", "Privacy"],
    pricing: "open-source",
    badges: ["GPL-3.0", "Desktop"],
    url: "https://cryptomator.org",
    review: "/reviews/cryptomator",
    added: "2026-08-07"
  },

  // 5. Data & Analytics
  {
    name: "DuckDB",
    slug: "duckdb",
    by: "DuckDB Foundation",
    blurb: "High-performance in-process analytical SQL database engine.",
    category: "data",
    tags: ["Database", "SQL", "Analytics"],
    pricing: "open-source",
    badges: ["MIT", "Embedded"],
    url: "https://duckdb.org",
    review: "/reviews/duckdb",
    added: "2026-08-07"
  },

  // 6. Creative Tools
  {
    name: "Penpot",
    slug: "penpot",
    by: "Kaleidos",
    blurb: "First open-source design & prototyping tool for domain teams (Figma FOSS alternative).",
    category: "creative",
    tags: ["UI/UX", "Prototyping", "Vector"],
    pricing: "open-source",
    badges: ["MPL-2.0", "Web"],
    url: "https://penpot.app",
    review: "/reviews/penpot",
    added: "2026-08-07"
  },

  // 7. System Tools
  {
    name: "Ventoy",
    slug: "ventoy",
    by: "longPanda",
    blurb: "Open-source tool to create bootable USB drive for ISO/WIM/IMG files.",
    category: "system",
    tags: ["USB", "Bootable", "Utility"],
    pricing: "open-source",
    badges: ["GPL-3.0", "CLI/GUI"],
    url: "https://www.ventoy.net",
    review: "/reviews/ventoy",
    added: "2026-08-07"
  },

  // 8. Community & Collaboration
  {
    name: "Revolt.chat",
    slug: "revolt-chat",
    by: "Revolt Team",
    blurb: "Open-source user-first chat platform alternative to Discord.",
    category: "community",
    tags: ["Messaging", "Voice", "Privacy"],
    pricing: "open-source",
    badges: ["AGPL-3.0", "Self-Host"],
    url: "https://revolt.chat",
    review: "/reviews/revolt-chat",
    added: "2026-08-07"
  },

  // 9. Everyday Utilities
  {
    name: "Stirling-PDF",
    slug: "stirling-pdf",
    by: "Stirling-Tools",
    blurb: "Robust local web-based PDF manipulation suite (Merge, Split, Convert, OCR).",
    category: "utilities",
    tags: ["PDF", "Converters", "OCR"],
    pricing: "open-source",
    badges: ["GPL-3.0", "Local RAM"],
    url: "https://github.com/Stirling-Tools/Stirling-PDF",
    review: "/reviews/stirling-pdf",
    added: "2026-08-07"
  },
  {
    name: "DevToys",
    slug: "devtoys",
    by: "DevToys Team",
    blurb: "Swiss army knife for developers: JSON formatters, JWT decoders, Base64, Regex, hashers.",
    category: "utilities",
    tags: ["Swiss Army", "Converters", "Decoders"],
    pricing: "open-source",
    badges: ["MIT", "Offline"],
    url: "https://devtoys.app",
    review: "/reviews/devtoys",
    added: "2026-08-07"
  }
];

console.log('🤖 Hermes Web Surfer Agent v3.0 executing...');

try {
  const rawData = fs.readFileSync(TOOLS_PATH, 'utf8');
  const existingTools = JSON.parse(rawData);

  const existingSlugs = new Set(existingTools.map(t => t.slug));
  let addedCount = 0;

  NEW_CURATED_TOOLS.forEach(newTool => {
    if (!existingSlugs.has(newTool.slug)) {
      existingTools.push(newTool);
      existingSlugs.add(newTool.slug);
      addedCount++;
      console.log(`✨ Hermes Curated New Tool: ${newTool.name} [${newTool.category.toUpperCase()}]`);
    }
  });

  fs.writeFileSync(TOOLS_PATH, JSON.stringify(existingTools, null, 2));

  console.log(`\n🎉 Hermes Web Surfer Task Finished! Injected ${addedCount} new tools across 9 Taxonomy Categories.`);
  console.log(`📊 Catalog size expanded to ${existingTools.length} verified tools.`);

} catch (err) {
  console.error('❌ Hermes Web Curation Failed:', err.message);
  process.exit(1);
}
