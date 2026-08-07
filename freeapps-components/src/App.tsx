import { useState, useEffect } from 'react'
import './App.css'

interface ToolCard {
  id: string
  name: string
  description: string
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
    tags: ['Utility', 'Network', 'CLI'],
    license: 'MIT',
    stars: '38.0k ★',
    url: 'https://localsend.org',
    size: 'medium'
  },
  {
    id: '9',
    name: 'FFmpeg Core',
    description: 'Ultra-fast media transcoding and video editing command line engine.',
    tags: ['CLI', 'System', 'Media'],
    license: 'LGPL-2.1',
    stars: '45.0k ★',
    url: 'https://ffmpeg.org',
    size: 'small'
  },
  {
    id: '10',
    name: 'OBS Studio',
    description: 'Free open-source screen recorder, live streaming engine, and video capture tool.',
    tags: ['Desktop', 'Media', 'GUI'],
    license: 'GPL-2.0',
    stars: '54.2k ★',
    url: 'https://obsproject.com',
    size: 'small'
  }
]

const OPEN_SOURCE_SPOTLIGHT = [
  {
    name: 'Ghostty Terminal',
    desc: 'Fast, native, feature-rich terminal emulator leveraging GPU acceleration.',
    snippet: '$ ghostty --config-file=~/.config/ghostty/config',
    url: 'https://ghostty.org'
  },
  {
    name: 'Zoxide CLI',
    desc: 'Smarter cd command for your terminal. Remembers your most used paths.',
    snippet: '$ z workspace  # jumps instantly to ~/Projects',
    url: 'https://github.com/ajeetdsouza/zoxide'
  },
  {
    name: 'Ruff Linter',
    desc: 'Extremely fast Python linter and code formatter written in Rust.',
    snippet: '$ ruff check . --fix',
    url: 'https://github.com/astral-sh/ruff'
  }
]

function App() {
  const [copied, setCopied] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [headlineScale, setHeadlineScale] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const installCmd = 'curl -sSL https://util-os.com/install.sh | sh'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(installCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const scale = Math.max(0.95, 1 - scrollY * 0.0003)
      setHeadlineScale(scale)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal((prev) => !prev)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div>
      <div className="grain-overlay" />

      {/* 1. Navbar */}
      <nav className="navbar-fixed glass-nav">
        <a href="/" className="nav-brand">UTIL.OS</a>

        <ul className="nav-links-group">
          <li><a href="#featured" className="nav-link">Tools</a></li>
          <li><a href="#opensource" className="nav-link">Open Source</a></li>
          <li><a href="#categories" className="nav-link">Categories</a></li>
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
        {/* 2. Compact Hero Section */}
        <section className="hero-container">
          <div className="hero-eyebrow">FREE • OPEN SOURCE • NO BS</div>

          <h1
            className="hero-kinetic-headline"
            style={{ transform: `scale(${headlineScale})` }}
          >
            Utility tools that just work
          </h1>

          <p className="hero-subtext">
            Hand-curated directory of verified open-source software, CLI utilities, and zero-account web tools.
          </p>

          <div className="code-install-block">
            <span className="code-install-text">{installCmd}</span>
            <button
              className={`code-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyCode}
            >
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

          {/* Stat Strip Bar (Fills empty space) */}
          <div className="hero-stats-strip">
            <div className="stat-item">
              <span className="stat-val">142</span>
              <span className="stat-lbl">Verified Free Tools</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">100%</span>
              <span className="stat-lbl">No Account Walls</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">0</span>
              <span className="stat-lbl">Trackers / Bloat</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">14.8k</span>
              <span className="stat-lbl">Developer Stars</span>
            </div>
          </div>
        </section>

        {/* 3. Dense Bento Grid of Featured Free Utilities */}
        <section id="featured" style={{ marginBottom: '3.5rem' }}>
          <div className="section-header-quiet">
            <div>
              <span className="section-tag">01 / FEATURED DIRECTORY</span>
              <h2 className="section-title">Essential Free Utilities</h2>
            </div>
          </div>

          <div className="bento-grid-featured">
            {FEATURED_TOOLS.map((tool) => {
              const cardClass = tool.size === 'large' 
                ? 'bento-card bento-card-large' 
                : tool.size === 'medium' 
                ? 'bento-card bento-card-medium' 
                : 'bento-card bento-card-small'

              return (
                <article key={tool.id} className={cardClass}>
                  <div>
                    <div className="card-top-header">
                      <h3 className="card-tool-name">{tool.name}</h3>
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

        {/* 4. Categories Section */}
        <section id="categories" style={{ marginBottom: '3.5rem' }}>
          <div className="section-header-quiet">
            <div>
              <span className="section-tag">02 / CATEGORY INDEX</span>
              <h2 className="section-title">Explore by Domain</h2>
            </div>
          </div>

          <div className="bento-grid-categories">
            <a href="#featured" className="bento-card category-chip-card">
              <span className="cat-name">System Utilities</span>
              <span className="cat-count">142</span>
            </a>
            <a href="#featured" className="bento-card category-chip-card">
              <span className="cat-name">Privacy & Vaults</span>
              <span className="cat-count">88</span>
            </a>
            <a href="#featured" className="bento-card category-chip-card">
              <span className="cat-name">Developer CLI</span>
              <span className="cat-count">210</span>
            </a>
            <a href="#featured" className="bento-card category-chip-card">
              <span className="cat-name">Productivity</span>
              <span className="cat-count">64</span>
            </a>
            <a href="#featured" className="bento-card category-chip-card">
              <span className="cat-name">Media & Graphics</span>
              <span className="cat-count">95</span>
            </a>
            <a href="#featured" className="bento-card category-chip-card">
              <span className="cat-name">Security Auditing</span>
              <span className="cat-count">52</span>
            </a>
          </div>
        </section>

        {/* 5. Open Source Spotlight */}
        <section id="opensource" style={{ marginBottom: '3.5rem' }}>
          <div className="bento-card bento-spotlight-card">
            <span className="section-tag">03 / OPEN SOURCE SPOTLIGHT</span>
            <h2 className="section-title">Verified High-Performance Repos</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Clean, single-purpose CLI utilities and terminal engines written in Rust, C++, and Go with zero analytics tracking.
            </p>

            <div className="spotlight-grid">
              {OPEN_SOURCE_SPOTLIGHT.map((item, idx) => (
                <div key={idx} className="spotlight-item">
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{item.desc}</div>
                  <div className="spotlight-snippet">{item.snippet}</div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-try-tool">
                    View source &rarr;
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. How It Works Section */}
        <section id="how-it-works" style={{ marginBottom: '3.5rem' }}>
          <div className="section-header-quiet">
            <div>
              <span className="section-tag">04 / PROTOCOL WORKFLOW</span>
              <h2 className="section-title">How UTIL.OS Operates</h2>
            </div>
          </div>

          <div className="how-it-works-grid">
            <div className="bento-card step-card">
              <div className="step-num">01</div>
              <h3 className="step-title">Strict Verification</h3>
              <p className="step-desc">Every tool is audited for genuine free tiers, open-source licenses, and zero dark patterns.</p>
            </div>
            <div className="bento-card step-card">
              <div className="step-num">02</div>
              <h3 className="step-title">No Account Walls</h3>
              <p className="step-desc">Direct access links to web tools and one-line CLI installation packages without registration traps.</p>
            </div>
            <div className="bento-card step-card">
              <div className="step-num">03</div>
              <h3 className="step-title">Machine Readable</h3>
              <p className="step-desc">Full API and JSON manifests structured for both human developers and autonomous AI coding agents.</p>
            </div>
          </div>
        </section>

        {/* 7. Footer */}
        <footer className="footer-quiet">
          <div className="footer-note">
            © 2026 UTIL.OS • Built for humans & agents
          </div>

          <div className="footer-links">
            <a href="#featured" className="footer-link">Tools</a>
            <a href="#opensource" className="footer-link">Open Source</a>
            <a href="#categories" className="footer-link">Categories</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>
        </footer>
      </main>

      {/* ⌘K Search Modal */}
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
              placeholder="Search CLI tools, password managers, photo editors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />

            <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {FEATURED_TOOLS.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--surface-2)', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontSize: '0.85rem' }}>
                  <span>{t.name}</span>
                  <span className="mono" style={{ color: 'var(--accent-cyan)' }}>{t.stars}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
