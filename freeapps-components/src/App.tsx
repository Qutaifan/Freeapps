import { useState, useMemo, useEffect } from 'react'
import './App.css'

interface ToolCard {
  id: string
  name: string
  description: string
  fullDetails?: string
  mainCategory: 'ai' | 'utilities' | 'apps' | 'opensource'
  mainCategoryLabel: string
  tags: string[]
  license: string
  stars: string
  url: string
  size: 'large' | 'medium' | 'small'
  features?: string[]
}

const FEATURED_TOOLS: ToolCard[] = [
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

const ALL_TAGS = ['Browser', 'GUI', 'Graphics', 'Security', 'Self-hosted', 'AI', 'Privacy', 'Media', 'Design', 'Network', 'Rust', 'CLI']

function App() {
  const [copied, setCopied] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedTool, setSelectedTool] = useState<ToolCard | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Bookmarks state
  const [savedToolIds, setSavedToolIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('thehub_saved_tools')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Submit form state
  const [submitForm, setSubmitForm] = useState({
    name: '',
    url: '',
    category: 'ai',
    description: ''
  })
  const [submitSubmitted, setSubmitSubmitted] = useState(false)

  const installCmd = 'curl -sSL https://thehub.dev/install.sh | sh'

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCopyCode = (text: string, label = 'Command') => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    showToast(`${label} copied to clipboard!`)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleBookmark = (id: string, name: string) => {
    setSavedToolIds((prev) => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem('thehub_saved_tools', JSON.stringify(next))
      } catch (e) {
        console.error(e)
      }
      showToast(exists ? `Removed "${name}" from saved tools` : `Saved "${name}" to your library! ⭐`)
      return next
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal((prev) => !prev)
      } else if (e.key === 'Escape') {
        setShowSearchModal(false)
        setShowSubmitModal(false)
        setSelectedTool(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredTools = useMemo(() => {
    return FEATURED_TOOLS.filter((t) => {
      if (activeCategory === 'saved') {
        if (!savedToolIds.includes(t.id)) return false
      } else if (activeCategory !== 'all' && t.mainCategory !== activeCategory) {
        return false
      }

      if (selectedTag && !t.tags.includes(selectedTag)) {
        return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = t.name.toLowerCase().includes(query)
        const matchesDesc = t.description.toLowerCase().includes(query)
        const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(query))
        return matchesName || matchesDesc || matchesTags
      }

      return true
    })
  }, [activeCategory, selectedTag, searchQuery, savedToolIds])

  const handleSubmitTool = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitSubmitted(true)
    setTimeout(() => {
      setSubmitSubmitted(false)
      setShowSubmitModal(false)
      setSubmitForm({ name: '', url: '', category: 'ai', description: '' })
      showToast('Thank you! Your tool submission has been recorded for review.')
    }, 1500)
  }

  return (
    <div>
      <div className="grain-overlay" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification glass-modal">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Glass Navbar */}
      <nav className="navbar-fixed glass-nav">
        <a href="/" className="nav-brand">
          <span className="brand-accent">THE</span>HUB
        </a>

        <ul className="nav-links-group">
          <li><a href="#categories" className="nav-link">Pillars</a></li>
          <li><a href="#featured" className="nav-link">Directory</a></li>
          <li><a href="#how-it-works" className="nav-link">Features</a></li>
        </ul>

        <div className="nav-right-actions">
          <button className="search-trigger-btn" onClick={() => setShowSearchModal(true)}>
            <span>Search directory...</span>
            <span className="kbd-tag">⌘K</span>
          </button>
          <button className="btn-accent" onClick={() => setShowSubmitModal(true)}>
            Submit tool
          </button>
        </div>
      </nav>

      <main className="app-wrapper">
        {/* Hero Section */}
        <section className="hero-container">
          <div className="hero-eyebrow">THEHUB • 4 PILLARS • AI • UTILITIES • APPS • CLI</div>

          <h1 className="hero-kinetic-headline">
            Open-source software & tools that just work
          </h1>

          <p className="hero-subtext">
            Discover verified open-source software, free web utilities, privacy-focused desktop apps, and CLI tools with zero signup traps.
          </p>

          <div className="code-install-block">
            <span className="code-install-text">{installCmd}</span>
            <button className={`code-copy-btn ${copied ? 'copied' : ''}`} onClick={() => handleCopyCode(installCmd, 'Install command')}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="hero-cta-group">
            <a href="#featured" className="btn-accent" style={{ padding: '0.6rem 1.3rem', fontSize: '0.88rem' }}>
              Explore {FEATURED_TOOLS.length} Verified Tools
            </a>
            <button
              className={`btn-secondary-hero ${activeCategory === 'saved' ? 'active-saved' : ''}`}
              onClick={() => setActiveCategory('saved')}
            >
              ⭐ Saved Tools ({savedToolIds.length})
            </button>
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
            <button
              className={`bento-card category-chip-card ${activeCategory === 'all' ? 'active-pill' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <span className="cat-name">⚡ All Software</span>
              <span className="cat-count">{FEATURED_TOOLS.length}</span>
            </button>
            <button
              className={`bento-card category-chip-card ${activeCategory === 'ai' ? 'active-pill' : ''}`}
              onClick={() => setActiveCategory('ai')}
            >
              <span className="cat-name">🤖 AI & Automation</span>
              <span className="cat-count">{FEATURED_TOOLS.filter((t) => t.mainCategory === 'ai').length}</span>
            </button>
            <button
              className={`bento-card category-chip-card ${activeCategory === 'utilities' ? 'active-pill' : ''}`}
              onClick={() => setActiveCategory('utilities')}
            >
              <span className="cat-name">🛠️ Online Utilities</span>
              <span className="cat-count">{FEATURED_TOOLS.filter((t) => t.mainCategory === 'utilities').length}</span>
            </button>
            <button
              className={`bento-card category-chip-card ${activeCategory === 'apps' ? 'active-pill' : ''}`}
              onClick={() => setActiveCategory('apps')}
            >
              <span className="cat-name">💻 Apps & Software</span>
              <span className="cat-count">{FEATURED_TOOLS.filter((t) => t.mainCategory === 'apps').length}</span>
            </button>
            <button
              className={`bento-card category-chip-card ${activeCategory === 'opensource' ? 'active-pill' : ''}`}
              onClick={() => setActiveCategory('opensource')}
            >
              <span className="cat-name">🔓 Open Source CLI</span>
              <span className="cat-count">{FEATURED_TOOLS.filter((t) => t.mainCategory === 'opensource').length}</span>
            </button>
            <button
              className={`bento-card category-chip-card ${activeCategory === 'saved' ? 'active-pill' : ''}`}
              onClick={() => setActiveCategory('saved')}
            >
              <span className="cat-name">⭐ Saved Library</span>
              <span className="cat-count">{savedToolIds.length}</span>
            </button>
          </div>

          {/* Tag Filter Cloud */}
          <div className="tag-filter-cloud">
            <span className="tag-cloud-label">Filter by Tag:</span>
            <button
              className={`tag-chip ${selectedTag === null ? 'tag-chip-active' : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              All Tags
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${selectedTag === tag ? 'tag-chip-active' : ''}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Responsive Google AdSense Banner Slot */}
        <section className="adsense-banner-wrapper" style={{ marginBottom: '1.5rem' }}>
          <div className="adsense-slot-container bento-card">
            <span className="adsense-label">SPONSORED / ADVERTISEMENT</span>
            <ins
              className="adsbygoogle"
              style={{ display: 'block', textAlign: 'center' }}
              data-ad-client="ca-pub-9640734919758311"
              data-ad-slot="auto"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </section>

        {/* Directory Header Bar */}
        <section id="featured" style={{ marginBottom: '1.5rem' }}>
          <div className="directory-results-bar">
            <div>
              <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{filteredTools.length}</strong> {filteredTools.length === 1 ? 'tool' : 'tools'}
                {activeCategory !== 'all' ? ` in ${activeCategory}` : ''}
                {selectedTag ? ` tagged #${selectedTag}` : ''}
              </span>
            </div>
            {(activeCategory !== 'all' || selectedTag !== null || searchQuery !== '') && (
              <button
                className="btn-clear-filters"
                onClick={() => {
                  setActiveCategory('all')
                  setSelectedTag(null)
                  setSearchQuery('')
                }}
              >
                Reset Filters &times;
              </button>
            )}
          </div>
        </section>

        {/* Bento Grid */}
        <section style={{ marginBottom: '3.5rem' }}>
          {filteredTools.length === 0 ? (
            <div className="empty-results-box bento-card">
              <h3>No software matches your criteria</h3>
              <p>Try resetting your tag filters, search queries, or category selection.</p>
              <button
                className="btn-accent"
                onClick={() => {
                  setActiveCategory('all')
                  setSelectedTag(null)
                  setSearchQuery('')
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bento-grid-featured">
              {filteredTools.map((tool) => {
                const cardClass =
                  tool.size === 'large'
                    ? 'bento-card bento-card-large'
                    : tool.size === 'medium'
                    ? 'bento-card bento-card-medium'
                    : 'bento-card bento-card-small'
                const isSaved = savedToolIds.includes(tool.id)

                return (
                  <article key={tool.id} className={cardClass}>
                    <div>
                      <div className="card-top-header">
                        <div>
                          <h3 className="card-tool-name" onClick={() => setSelectedTool(tool)}>
                            {tool.name}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            {tool.mainCategoryLabel}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            className={`btn-star-icon ${isSaved ? 'is-saved' : ''}`}
                            onClick={() => toggleBookmark(tool.id, tool.name)}
                            title={isSaved ? 'Remove bookmark' : 'Bookmark tool'}
                          >
                            {isSaved ? '★' : '☆'}
                          </button>
                          <span className="card-license-badge">{tool.license}</span>
                        </div>
                      </div>

                      <p className="card-tool-desc">{tool.description}</p>

                      <div className="card-tag-group">
                        {tool.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className={`card-tag ${selectedTag === t ? 'tag-highlight' : ''}`}
                            onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="card-action-bar">
                      <span className="github-stars">{tool.stars}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-details" onClick={() => setSelectedTool(tool)}>
                          Details
                        </button>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-try-tool">
                          Visit &rarr;
                        </a>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Features / Workflow section */}
        <section id="how-it-works" className="features-architecture-section bento-card">
          <div className="section-header-quiet">
            <span className="section-tag">02 / WHY THEHUB</span>
            <h2 className="section-title">Built For Privacy & Technical Speed</h2>
          </div>
          <div className="features-grid">
            <div className="feature-cell">
              <h4>🔒 100% Free & Open Source</h4>
              <p>Every featured tool in THEHUB is independently audited, open-source or genuinely free tier without dark patterns or hidden credit card prompts.</p>
            </div>
            <div className="feature-cell">
              <h4>⚡ Zero Telemetry & RAM-First</h4>
              <p>Pillar applications like Photopea and CryptPad perform computations in client-side WebAssembly and local memory for maximal privacy.</p>
            </div>
            <div className="feature-cell">
              <h4>🤖 Agent & Developer Friendly</h4>
              <p>Clean structured data, JSON-LD schemas, and accessible web standards make THEHUB easy to browse for both humans and AI agents.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer-quiet">
          <div className="footer-note">© 2026 THEHUB • Built for developers, creators & power users</div>
          <div className="footer-links">
            <a href="#categories" className="footer-link">Pillars</a>
            <a href="#featured" className="footer-link">Tools</a>
            <a href="https://github.com/Qutaifan/Freeapps" target="_blank" rel="noopener noreferrer" className="footer-link">
              GitHub Repo
            </a>
          </div>
        </footer>
      </main>

      {/* Live Search Modal */}
      {showSearchModal && (
        <div className="search-modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="search-modal-card bento-card glass-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
                ⌘K LIVE DIRECTORY SEARCH
              </span>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => setShowSearchModal(false)}
              >
                &times;
              </button>
            </div>
            <input
              type="text"
              className="code-install-text search-input-field"
              placeholder="Search AI, CLI tools, password managers, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />

            <div className="modal-live-results">
              {filteredTools.length === 0 ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No tools found matching "{searchQuery}"
                </div>
              ) : (
                filteredTools.slice(0, 5).map((tool) => (
                  <div
                    key={tool.id}
                    className="live-result-item"
                    onClick={() => {
                      setSelectedTool(tool)
                      setShowSearchModal(false)
                    }}
                  >
                    <div>
                      <div className="live-result-title">{tool.name}</div>
                      <div className="live-result-desc">{tool.description}</div>
                    </div>
                    <span className="card-license-badge">{tool.license}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tool Details Modal */}
      {selectedTool && (
        <div className="search-modal-overlay" onClick={() => setSelectedTool(null)}>
          <div className="tool-detail-card bento-card glass-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tool-detail-header">
              <div>
                <span className="section-tag">{selectedTool.mainCategoryLabel}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>{selectedTool.name}</h2>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem' }}
                onClick={() => setSelectedTool(null)}
              >
                &times;
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 1.25rem', lineHeight: 1.6 }}>
              {selectedTool.fullDetails || selectedTool.description}
            </p>

            {selectedTool.features && selectedTool.features.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Key Features:</h4>
                <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                  {selectedTool.features.map((f, i) => (
                    <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card-tag-group" style={{ marginBottom: '1.5rem' }}>
              {selectedTool.tags.map((t, i) => (
                <span key={i} className="card-tag">
                  {t}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <span className="github-stars">{selectedTool.stars} • License: {selectedTool.license}</span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn-secondary-hero"
                  onClick={() => toggleBookmark(selectedTool.id, selectedTool.name)}
                >
                  {savedToolIds.includes(selectedTool.id) ? '★ Bookmarked' : '☆ Bookmark'}
                </button>
                <a href={selectedTool.url} target="_blank" rel="noopener noreferrer" className="btn-accent">
                  Visit {selectedTool.name} &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Tool Modal */}
      {showSubmitModal && (
        <div className="search-modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="search-modal-card bento-card glass-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
                SUBMIT TOOL TO THEHUB
              </span>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => setShowSubmitModal(false)}
              >
                &times;
              </button>
            </div>

            {submitSubmitted ? (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <h3 style={{ marginTop: '0.5rem' }}>Submission Received!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Our curation team will review your suggested tool for inclusion in THEHUB.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTool} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tool Name</label>
                  <input
                    type="text"
                    required
                    className="code-install-text search-input-field"
                    placeholder="e.g. Supabase, Ghostty, Excalidraw"
                    value={submitForm.name}
                    onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Website or Repository URL</label>
                  <input
                    type="url"
                    required
                    className="code-install-text search-input-field"
                    placeholder="https://..."
                    value={submitForm.url}
                    onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category Pillar</label>
                  <select
                    className="code-install-text search-input-field"
                    value={submitForm.category}
                    onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="ai">🤖 AI & Automation</option>
                    <option value="utilities">🛠️ Online Utilities</option>
                    <option value="apps">💻 Apps & Software</option>
                    <option value="opensource">🔓 Open Source CLI</option>
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Short Description</label>
                  <textarea
                    required
                    rows={3}
                    className="code-install-text search-input-field"
                    placeholder="Describe what makes this tool exceptional..."
                    value={submitForm.description}
                    onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-accent" style={{ marginTop: '0.5rem', width: '100%' }}>
                  Submit Tool
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

