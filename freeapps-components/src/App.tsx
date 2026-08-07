import { useState, useMemo, useEffect } from 'react'
import './App.css'

interface ToolCard {
  id: string
  name: string
  description: string
  mainCategory: 'ai' | 'utilities' | 'apps' | 'opensource'
  mainCategoryLabel: string
  tags: string[]
  license: string
  stars: string
  url: string
  size: 'large' | 'medium' | 'small'
}

const FEATURED_TOOLS: ToolCard[] = [
  {
    id: '1',
    name: 'Photopea Engine',
    description: 'Full-featured browser-based PSD editor & digital paint engine operating 100% in local RAM.',
    mainCategory: 'utilities',
    mainCategoryLabel: '🛠️ Online Utilities',
    tags: ['Browser', 'GUI', 'Graphics'],
    license: 'Freemium',
    stars: '18.4k ★',
    url: 'https://www.photopea.com',
    size: 'large'
  },
  {
    id: '2',
    name: 'Bitwarden Vault',
    description: 'Zero-knowledge end-to-end encrypted password manager with unlimited device sync on free tier.',
    mainCategory: 'utilities',
    mainCategoryLabel: '🛠️ Online Utilities',
    tags: ['Self-hosted', 'Security', 'GUI'],
    license: 'GPL-3.0',
    stars: '21.5k ★',
    url: 'https://bitwarden.com',
    size: 'medium'
  },
  {
    id: '3',
    name: 'Claude & Kimi AI',
    description: 'State-of-the-art AI reasoning models for code generation, technical text, and document parsing.',
    mainCategory: 'ai',
    mainCategoryLabel: '🤖 AI & Automation',
    tags: ['AI', 'CLI / Web', 'Code'],
    license: 'Free Tier',
    stars: '42.1k ★',
    url: 'https://claude.ai',
    size: 'medium'
  },
  {
    id: '4',
    name: 'Excalibur Canvas',
    description: 'Hand-drawn infinite whiteboard and architecture flowchart canvas with local SVG exports.',
    mainCategory: 'utilities',
    mainCategoryLabel: '🛠️ Online Utilities',
    tags: ['Browser', 'Design'],
    license: 'MIT',
    stars: '14.2k ★',
    url: 'https://excalibur.com',
    size: 'small'
  },
  {
    id: '5',
    name: 'CryptPad Workspace',
    description: 'Zero-knowledge encrypted collaborative docs, spreadsheets, and private drive suite.',
    mainCategory: 'utilities',
    mainCategoryLabel: '🛠️ Online Utilities',
    tags: ['Self-hosted', 'Privacy'],
    license: 'AGPL-3.0',
    stars: '9.8k ★',
    url: 'https://cryptpad.fr',
    size: 'small'
  },
  {
    id: '6',
    name: 'Proton VPN Free',
    description: 'Unlimited bandwidth zero-log privacy VPN created by CERN scientists.',
    mainCategory: 'apps',
    mainCategoryLabel: '💻 Desktop Apps',
    tags: ['Privacy', 'Security', 'GUI'],
    license: 'GPL-3.0',
    stars: '16.5k ★',
    url: 'https://protonvpn.com',
    size: 'medium'
  },
  {
    id: '7',
    name: 'DaVinci Resolve',
    description: 'Hollywood-grade 4K video editing suite with zero watermarks on free edition.',
    mainCategory: 'apps',
    mainCategoryLabel: '💻 Desktop Apps',
    tags: ['Desktop', 'GUI', 'Media'],
    license: 'Freemium',
    stars: '32.1k ★',
    url: 'https://www.blackmagicdesign.com/products/davinciresolve',
    size: 'large'
  },
  {
    id: '8',
    name: 'LocalSend',
    description: 'Open-source cross-platform air-drop alternative for sharing files securely on local network.',
    mainCategory: 'apps',
    mainCategoryLabel: '💻 Desktop Apps',
    tags: ['Utility', 'Network', 'CLI'],
    license: 'MIT',
    stars: '38.0k ★',
    url: 'https://localsend.org',
    size: 'medium'
  },
  {
    id: '9',
    name: 'Ghostty Terminal',
    description: 'Fast native terminal emulator with GPU acceleration and Rust performance.',
    mainCategory: 'opensource',
    mainCategoryLabel: '🔓 Open Source CLI',
    tags: ['CLI', 'System', 'Rust'],
    license: 'MIT',
    stars: '24.0k ★',
    url: 'https://ghostty.org',
    size: 'small'
  },
  {
    id: '10',
    name: 'OBS Studio',
    description: 'Free open-source screen recorder, live streaming engine, and video capture tool.',
    mainCategory: 'apps',
    mainCategoryLabel: '💻 Desktop Apps',
    tags: ['Desktop', 'Media', 'GUI'],
    license: 'GPL-2.0',
    stars: '54.2k ★',
    url: 'https://obsproject.com',
    size: 'small'
  }
]

function App() {
  const [copied, setCopied] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const installCmd = 'curl -sSL https://util-os.com/install.sh | sh'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(installCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredTools = useMemo(() => {
    return FEATURED_TOOLS.filter(t => {
      const matchesCat = activeCategory === 'all' || t.mainCategory === activeCategory
      const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <div>
      <div className="grain-overlay" />

      {/* Navbar */}
      <nav className="navbar-fixed glass-nav">
        <a href="/" className="nav-brand">UTIL.OS</a>

        <ul className="nav-links-group">
          <li><a href="#categories" className="nav-link">Pillars</a></li>
          <li><a href="#featured" className="nav-link">Directory</a></li>
          <li><a href="#how-it-works" className="nav-link">Workflow</a></li>
        </ul>

        <div className="nav-right-actions">
          <button className="search-trigger-btn" onClick={() => setShowSearchModal(true)}>
            <span>Search</span>
            <span className="kbd-tag">⌘K</span>
          </button>
          <a href="#featured" className="btn-accent">Submit tool</a>
        </div>
      </nav>

      <main className="app-wrapper">
        {/* Hero Section */}
        <section className="hero-container">
          <div className="hero-eyebrow">4 PILLARS • AI • UTILITIES • APPS • CLI</div>

          <h1 className="hero-kinetic-headline">
            Utility tools that just work
          </h1>

          <p className="hero-subtext">
            Explore 4 core software categories: AI Assistants, Web Utilities, Desktop Applications, and Open Source CLI tools.
          </p>

          <div className="code-install-block">
            <span className="code-install-text">{installCmd}</span>
            <button className={`code-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopyCode}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="hero-cta-group">
            <a href="#featured" className="btn-accent" style={{ padding: '0.6rem 1.3rem', fontSize: '0.88rem' }}>
              Browse free tools
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-secondary-hero">
              Star on GitHub
            </a>
          </div>

          <div className="hero-stats-strip">
            <div className="stat-item">
              <span className="stat-val">🤖 AI</span>
              <span className="stat-lbl">Assistants & Models</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">🛠️ Utilities</span>
              <span className="stat-lbl">Browser Engines</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">💻 Apps</span>
              <span className="stat-lbl">Desktop Suites</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">🔓 Open Source</span>
              <span className="stat-lbl">CLI Repos</span>
            </div>
          </div>
        </section>

        {/* 4 Major Pillars Filter Section */}
        <section id="categories" style={{ marginBottom: '2.5rem' }}>
          <div className="section-header-quiet">
            <div>
              <span className="section-tag">01 / PRIMARY PILLARS</span>
              <h2 className="section-title">Select Category Pillar</h2>
            </div>
          </div>

          <div className="bento-grid-categories">
            <button className={`bento-card category-chip-card ${activeCategory === 'all' ? 'active-pill' : ''}`} onClick={() => setActiveCategory('all')}>
              <span className="cat-name">⚡ All Software</span>
              <span className="cat-count">142</span>
            </button>
            <button className={`bento-card category-chip-card ${activeCategory === 'ai' ? 'active-pill' : ''}`} onClick={() => setActiveCategory('ai')}>
              <span className="cat-name">🤖 AI & Automation</span>
              <span className="cat-count">38</span>
            </button>
            <button className={`bento-card category-chip-card ${activeCategory === 'utilities' ? 'active-pill' : ''}`} onClick={() => setActiveCategory('utilities')}>
              <span className="cat-name">🛠️ Online Utilities</span>
              <span className="cat-count">54</span>
            </button>
            <button className={`bento-card category-chip-card ${activeCategory === 'apps' ? 'active-pill' : ''}`} onClick={() => setActiveCategory('apps')}>
              <span className="cat-name">💻 Apps & Software</span>
              <span className="cat-count">32</span>
            </button>
            <button className={`bento-card category-chip-card ${activeCategory === 'opensource' ? 'active-pill' : ''}`} onClick={() => setActiveCategory('opensource')}>
              <span className="cat-name">🔓 Open Source CLI</span>
              <span className="cat-count">18</span>
            </button>
          </div>
        </section>

        {/* Dense Bento Grid */}
        <section id="featured" style={{ marginBottom: '3.5rem' }}>
          <div className="bento-grid-featured">
            {filteredTools.map((tool) => {
              const cardClass = tool.size === 'large' 
                ? 'bento-card bento-card-large' 
                : tool.size === 'medium' 
                ? 'bento-card bento-card-medium' 
                : 'bento-card bento-card-small'

              return (
                <article key={tool.id} className={cardClass}>
                  <div>
                    <div className="card-top-header">
                      <div>
                        <h3 className="card-tool-name">{tool.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{tool.mainCategoryLabel}</span>
                      </div>
                      <span className="card-license-badge">{tool.license}</span>
                    </div>

                    <p className="card-tool-desc">{tool.description}</p>

                    <div className="card-tag-group">
                      {tool.tags.map((t, idx) => (
                        <span key={idx} className="card-tag">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="card-action-bar">
                    <span className="github-stars">{tool.stars}</span>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-try-tool">
                      Try Tool &rarr;
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer-quiet">
          <div className="footer-note">© 2026 UTIL.OS • Built for humans & agents</div>
          <div className="footer-links">
            <a href="#categories" className="footer-link">Pillars</a>
            <a href="#featured" className="footer-link">Tools</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>
        </footer>
      </main>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="search-modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="search-modal-card bento-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>⌘K QUICK SEARCH</span>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowSearchModal(false)}>&times;</button>
            </div>
            <input
              type="text"
              className="code-install-text"
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '8px', outline: 'none' }}
              placeholder="Search AI, CLI tools, password managers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
