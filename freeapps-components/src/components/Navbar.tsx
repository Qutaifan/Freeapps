interface NavbarProps {
  onOpenSearch: () => void
  onOpenSubmit: () => void
}

export function Navbar({ onOpenSearch, onOpenSubmit }: NavbarProps) {
  return (
    <nav className="navbar-fixed glass-nav">
      <a href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="16" fill="#0A0A0B" />
          <rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="#22D3EE" strokeWidth="3" strokeOpacity="0.8" />
          <path d="M 18 16 L 18 48" stroke="#22D3EE" strokeWidth="6" strokeLinecap="round" />
          <path d="M 46 16 L 46 48" stroke="#22D3EE" strokeWidth="6" strokeLinecap="round" />
          <path d="M 18 32 L 46 32" stroke="#22D3EE" strokeWidth="5" strokeLinecap="round" />
          <circle cx="46" cy="18" r="4" fill="#38BDF8" />
        </svg>
        <span><span className="brand-accent">THE</span>HUB</span>
      </a>

      <ul className="nav-links-group">
        <li><a href="#categories" className="nav-link">Pillars</a></li>
        <li><a href="#featured" className="nav-link">Directory</a></li>
        <li><a href="#prompt-generator" className="nav-link">AI Prompt Gen</a></li>
        <li><a href="#faq" className="nav-link">FAQ</a></li>
      </ul>

      <div className="nav-right-actions">
        <button className="search-trigger-btn" onClick={onOpenSearch}>
          <span>Search directory...</span>
          <span className="kbd-tag">⌘K</span>
        </button>
        <button className="btn-accent" onClick={onOpenSubmit}>
          Submit tool
        </button>
      </div>
    </nav>
  )
}
