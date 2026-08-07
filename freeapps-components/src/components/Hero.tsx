import { useState } from 'react'

interface HeroProps {
  totalToolsCount: number
  savedCount: number
  activeCategory: string
  onSelectCategory: (cat: string) => void
  onShowToast: (msg: string) => void
}

export function Hero({
  totalToolsCount,
  savedCount,
  activeCategory,
  onSelectCategory,
  onShowToast
}: HeroProps) {
  const [copied, setCopied] = useState(false)
  const installCmd = 'git clone https://github.com/Qutaifan/Freeapps.git'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(installCmd)
    setCopied(true)
    onShowToast('Install command copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
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
        <button className={`code-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopyCode}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="hero-cta-group">
        <a href="#featured" className="btn-accent" style={{ padding: '0.6rem 1.3rem', fontSize: '0.88rem' }}>
          Explore {totalToolsCount} Verified Tools
        </a>
        <button
          className={`btn-secondary-hero ${activeCategory === 'saved' ? 'active-saved' : ''}`}
          onClick={() => onSelectCategory('saved')}
        >
          ⭐ Saved Tools ({savedCount})
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
  )
}
