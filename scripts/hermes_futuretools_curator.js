/**
 * Hermes FutureTools.io Curation & Monetization Engine v4.0
 * THEHUB by QUTAIFAN.COM (https://www.qutaifan.com/)
 * 
 * Curates top trending AI, Creative, Coding & Utility tools from FutureTools.io benchmark.
 */

const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.join(__dirname, '..', 'tools.json');

const FUTURETOOLS_BATCH = [
  // Top AI Code & App Builders
  {
    name: "v0.dev",
    slug: "v0-dev",
    by: "Vercel",
    blurb: "Generative UI system by Vercel creating production React & Tailwind components.",
    category: "ai",
    tags: ["UI", "React", "Frontend"],
    pricing: "freemium",
    badges: ["Freemium", "Vercel"],
    url: "https://v0.dev",
    review: "/reviews/v0-dev",
    added: "2026-08-07"
  },
  {
    name: "Bolt.new",
    slug: "bolt-new",
    by: "StackBlitz",
    blurb: "AI-powered full-stack web application builder executing inside browser WebContainers.",
    category: "ai",
    tags: ["Full Stack", "WebContainer", "Dev"],
    pricing: "freemium",
    badges: ["Freemium", "Browser Engine"],
    url: "https://bolt.new",
    review: "/reviews/bolt-new",
    added: "2026-08-07"
  },
  {
    name: "Windsurf AI",
    slug: "windsurf-ai",
    by: "Codeium",
    blurb: "Next-generation agentic AI IDE with deep codebase flow & multi-file reasoning.",
    category: "ai",
    tags: ["IDE", "Agent", "Code"],
    pricing: "freemium",
    badges: ["Freemium", "Desktop"],
    url: "https://codeium.com/windsurf",
    review: "/reviews/windsurf-ai",
    added: "2026-08-07"
  },
  {
    name: "Lovable.dev",
    slug: "lovable-dev",
    by: "Lovable Team",
    blurb: "GPT-4o powered full-stack app builder converting ideas to deployed software.",
    category: "ai",
    tags: ["No-Code", "AI Builder", "Full Stack"],
    pricing: "freemium",
    badges: ["Freemium", "Web"],
    url: "https://lovable.dev",
    review: "/reviews/lovable-dev",
    added: "2026-08-07"
  },

  // Top AI Media & Audio Models
  {
    name: "Suno AI",
    slug: "suno-ai",
    by: "Suno",
    blurb: "State-of-the-art AI music generator creating full songs from text prompts.",
    category: "ai",
    tags: ["Audio", "Music", "Generative"],
    pricing: "freemium",
    badges: ["Freemium", "Top Pick"],
    url: "https://suno.com",
    review: "/reviews/suno-ai",
    added: "2026-08-07"
  },
  {
    name: "ElevenLabs",
    slug: "elevenlabs",
    by: "ElevenLabs",
    blurb: "Ultra-realistic AI voice generator, text-to-speech, and voice cloning platform.",
    category: "ai",
    tags: ["Voice", "TTS", "Audio"],
    pricing: "freemium",
    badges: ["Freemium", "High Quality"],
    url: "https://elevenlabs.io",
    review: "/reviews/elevenlabs",
    added: "2026-08-07"
  },
  {
    name: "Flux 1.1 Pro",
    slug: "flux-1-1-pro",
    by: "Black Forest Labs",
    blurb: "State-of-the-art open-weights photorealistic image generation model.",
    category: "ai",
    tags: ["Image", "Open Weights", "Diffusion"],
    pricing: "freemium",
    badges: ["Freemium", "Open Weights"],
    url: "https://blackforestlabs.ai",
    review: "/reviews/flux-1-1-pro",
    added: "2026-08-07"
  },
  {
    name: "Kling AI",
    slug: "kling-ai",
    by: "Kuaishou",
    blurb: "Advanced cinematic video generation model creating 1080p high-motion scenes.",
    category: "ai",
    tags: ["Video", "Cinematic", "AI"],
    pricing: "freemium",
    badges: ["Freemium", "1080p"],
    url: "https://klingai.com",
    review: "/reviews/kling-ai",
    added: "2026-08-07"
  },
  {
    name: "Pika Labs",
    slug: "pika-labs",
    by: "Pika",
    blurb: "Idea-to-video AI platform for 3D animation, cinematic motion, and video effects.",
    category: "ai",
    tags: ["Video", "Animation", "3D"],
    pricing: "freemium",
    badges: ["Freemium", "Web"],
    url: "https://pika.art",
    review: "/reviews/pika-labs",
    added: "2026-08-07"
  },

  // Top Productivity & Swiss Army Utilities
  {
    name: "IT-Tools",
    slug: "it-tools",
    by: "CorentinTh",
    blurb: "Handy online tools for developers & IT workers: SQL formatters, Docker compose generators, CRON parsers.",
    category: "utilities",
    tags: ["DevOps", "Converters", "Swiss Army"],
    pricing: "open-source",
    badges: ["MIT", "Local RAM"],
    url: "https://it-tools.tech",
    review: "/reviews/it-tools",
    added: "2026-08-07"
  },
  {
    name: "CyberChef Engine",
    slug: "cyberchef-engine",
    by: "GCHQ",
    blurb: "The Cyber Swiss Army Knife for encryption, encoding, compression, and data analysis.",
    category: "utilities",
    tags: ["Crypto", "Base64", "Analysis"],
    pricing: "open-source",
    badges: ["Apache-2.0", "Local RAM"],
    url: "https://gchq.github.io/CyberChef",
    review: "/reviews/cyberchef-engine",
    added: "2026-08-07"
  },
  {
    name: "Omnivore",
    slug: "omnivore",
    by: "Omnivore Team",
    blurb: "Open-source read-it-later application for articles, newsletters, and documents with TTS.",
    category: "productivity",
    tags: ["Read Later", "Bookmark", "RSS"],
    pricing: "open-source",
    badges: ["AGPL-3.0", "FOSS"],
    url: "https://omnivore.app",
    review: "/reviews/omnivore",
    added: "2026-08-07"
  }
];

console.log('🤖 FutureTools.io Curation Engine executing...');

try {
  const rawData = fs.readFileSync(TOOLS_PATH, 'utf8');
  const existingTools = JSON.parse(rawData);
  const slugs = new Set(existingTools.map(t => t.slug));

  let addedCount = 0;
  FUTURETOOLS_BATCH.forEach(item => {
    if (!slugs.has(item.slug)) {
      existingTools.push(item);
      slugs.add(item.slug);
      addedCount++;
      console.log(`🔥 Injected FutureTools Benchmark: ${item.name} [${item.category.toUpperCase()}]`);
    }
  });

  fs.writeFileSync(TOOLS_PATH, JSON.stringify(existingTools, null, 2));

  console.log(`\n🎉 FutureTools Curation Completed! Injected ${addedCount} top-tier tools.`);
  console.log(`📊 Catalog size expanded to ${existingTools.length} tools.`);

} catch (err) {
  console.error('❌ FutureTools Curation Failed:', err.message);
  process.exit(1);
}
