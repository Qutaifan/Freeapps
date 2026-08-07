import type { ToolCard } from '../types/tool'

export const FEATURED_TOOLS: ToolCard[] = [
  {
    id: '1',
    name: 'Photopea Engine',
    description: 'Full-featured browser-based PSD editor & digital paint engine operating 100% in local RAM.',
    fullDetails: 'Photopea is a comprehensive raster and vector graphics editor operating inside the browser without uploading files to remote servers. It supports PSD, AI, XCF, Sketch, and RAW formats with full layer blending and brush dynamics.',
    mainCategory: 'utilities',
    mainCategoryLabel: '🛠️ Online Utilities',
    tags: ['Browser', 'GUI', 'Graphics'],
    license: 'Freemium',
    stars: '18.4k ★',
    url: 'https://www.photopea.com',
    size: 'large',
    features: ['Local RAM processing', 'PSD & AI native support', 'Zero installation', 'Smart object editing']
  },
  {
    id: '2',
    name: 'Bitwarden Vault',
    description: 'Zero-knowledge end-to-end encrypted password manager with unlimited device sync on free tier.',
    fullDetails: 'Bitwarden gives individuals and enterprise teams open-source tools to generate, audit, and store credentials safely. Features end-to-end AES-256 bit encryption and multi-factor authentication.',
    mainCategory: 'utilities',
    mainCategoryLabel: '🛠️ Online Utilities',
    tags: ['Self-hosted', 'Security', 'GUI'],
    license: 'GPL-3.0',
    stars: '21.5k ★',
    url: 'https://bitwarden.com',
    size: 'medium',
    features: ['Unlimited device sync', 'Zero-knowledge vault', 'Self-hostable backend', 'Autofill extension']
  },
  {
    id: '3',
    name: 'Claude & Kimi AI',
    description: 'State-of-the-art AI reasoning models for code generation, technical text, and document parsing.',
    fullDetails: 'Cutting-edge artificial intelligence platforms designed for advanced coding assistance, document synthesis, and multi-step agent reasoning with ultra-large context windows.',
    mainCategory: 'ai',
    mainCategoryLabel: '🤖 AI & Automation',
    tags: ['AI', 'CLI / Web', 'Code'],
    license: 'Free Tier',
    stars: '42.1k ★',
    url: 'https://claude.ai',
    size: 'medium',
    features: ['Context windowing', 'Artifact sandbox', 'Multi-modal analysis', 'Code interpreter']
  },
  {
    id: '4',
    name: 'Excalibur Canvas',
    description: 'Hand-drawn infinite whiteboard and architecture flowchart canvas with local SVG exports.',
    fullDetails: 'Excalibur (Excalidraw) provides a virtual collaborative whiteboard for brainstorming, diagramming architecture, and wireframing with end-to-end encryption.',
    mainCategory: 'utilities',
    mainCategoryLabel: '🛠️ Online Utilities',
    tags: ['Browser', 'Design'],
    license: 'MIT',
    stars: '14.2k ★',
    url: 'https://excalidraw.com',
    size: 'small',
    features: ['Infinite canvas', 'SVG/PNG export', 'Live collaboration', 'Hand-drawn aesthetics']
  },
  {
    id: '5',
    name: 'CryptPad Workspace',
    description: 'Zero-knowledge encrypted collaborative docs, spreadsheets, and private drive suite.',
    fullDetails: 'Privacy-first document workspace built with client-side encryption. All content is encrypted in your browser before being transmitted to the server.',
    mainCategory: 'utilities',
    mainCategoryLabel: '🛠️ Online Utilities',
    tags: ['Self-hosted', 'Privacy'],
    license: 'AGPL-3.0',
    stars: '9.8k ★',
    url: 'https://cryptpad.fr',
    size: 'small',
    features: ['Encrypted Rich Text', 'Real-time Kanban', 'Anonymous access', 'No telemetry']
  },
  {
    id: '6',
    name: 'Proton VPN Free',
    description: 'Unlimited bandwidth zero-log privacy VPN created by CERN scientists.',
    fullDetails: 'High-speed Swiss-based VPN with strict no-logs policy, DNS leak protection, and AES-256 encryption engineered for privacy advocates.',
    mainCategory: 'apps',
    mainCategoryLabel: '💻 Desktop Apps',
    tags: ['Privacy', 'Security', 'GUI'],
    license: 'GPL-3.0',
    stars: '16.5k ★',
    url: 'https://protonvpn.com',
    size: 'medium',
    features: ['No speed limits', 'Zero logging policy', 'Kill switch protection', 'Open-source apps']
  },
  {
    id: '7',
    name: 'DaVinci Resolve',
    description: 'Hollywood-grade 4K video editing suite with zero watermarks on free edition.',
    fullDetails: 'Professional video editing, color correction, visual effects, motion graphics, and audio post-production software in a single application.',
    mainCategory: 'apps',
    mainCategoryLabel: '💻 Desktop Apps',
    tags: ['Desktop', 'GUI', 'Media'],
    license: 'Freemium',
    stars: '32.1k ★',
    url: 'https://www.blackmagicdesign.com/products/davinciresolve',
    size: 'large',
    features: ['Fusion visual effects', 'Fairlight audio suite', 'Node-based color grading', 'HDR color wheels']
  },
  {
    id: '8',
    name: 'LocalSend',
    description: 'Open-source cross-platform air-drop alternative for sharing files securely on local network.',
    fullDetails: 'An open-source cross-platform application that allows secure file and message transfer over local network without internet servers.',
    mainCategory: 'apps',
    mainCategoryLabel: '💻 Desktop Apps',
    tags: ['Utility', 'Network', 'CLI'],
    license: 'MIT',
    stars: '38.0k ★',
    url: 'https://localsend.org',
    size: 'medium',
    features: ['Zero external server', 'TLS encryption', 'Cross-platform', 'No file size limits']
  },
  {
    id: '9',
    name: 'Ghostty Terminal',
    description: 'Fast native terminal emulator with GPU acceleration and Rust performance.',
    fullDetails: 'Ghostty is a cross-platform terminal emulator designed for high performance, modern feature support, and native UI feel across Linux and macOS.',
    mainCategory: 'opensource',
    mainCategoryLabel: '🔓 Open Source CLI',
    tags: ['CLI', 'System', 'Rust'],
    license: 'MIT',
    stars: '24.0k ★',
    url: 'https://ghostty.org',
    size: 'small',
    features: ['GPU rendering', 'TrueColor support', 'Font ligatures', 'Native tab management']
  },
  {
    id: '10',
    name: 'OBS Studio',
    description: 'Free open-source screen recorder, live streaming engine, and video capture tool.',
    fullDetails: 'High performance real-time video/audio capturing and mixing. Create scenes made of multiple sources including window captures, images, text, and browser windows.',
    mainCategory: 'apps',
    mainCategoryLabel: '💻 Desktop Apps',
    tags: ['Desktop', 'Media', 'GUI'],
    license: 'GPL-2.0',
    stars: '54.2k ★',
    url: 'https://obsproject.com',
    size: 'small',
    features: ['Unlimited scenes', 'Intuitive audio mixer', 'VST plugin support', 'Hardware encoding']
  }
]

export const ALL_TAGS: string[] = [
  'Browser', 'GUI', 'Graphics', 'Security', 'Self-hosted', 'AI', 'Privacy', 'Media', 'Design', 'Network', 'Rust', 'CLI'
]
