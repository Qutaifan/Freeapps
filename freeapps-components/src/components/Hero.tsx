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
  onShowToast: _onShowToast
}: HeroProps) {
  return (
    <section className="hero-container">
      <div className="hero-eyebrow">THEHUB • 4 PILLARS • AI • UTILITIES • APPS • CLI</div>

      <h1 className="hero-kinetic-headline">
        Open-source software &amp; tools that just work
      </h1>

      <p className="hero-subtext">
        Discover verified open-source software, free web utilities, privacy-focused desktop apps, and CLI tools with zero signup traps.
      </p>

      <div className="hero-cta-group">
        <a href="#featured" className="btn-accent" style={{ padding: '0.66rem 1.4rem', fontSize: '0.9rem' }}>
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
          <span className="stat-number">100%</span>
          <span className="stat-label">Free &amp; Open Source</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">0</span>
          <span className="stat-label">Credit Card Traps</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">4</span>
          <span className="stat-label">Core Pillars</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">Local</span>
          <span className="stat-label">RAM Processing</span>
        </div>
      </div>
    </section>
  )
}
