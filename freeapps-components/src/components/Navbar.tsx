interface NavbarProps {
  onOpenSearch: () => void
  onOpenSubmit: () => void
}

export function Navbar({ onOpenSearch, onOpenSubmit }: NavbarProps) {
  return (
    <nav className="navbar-fixed glass-nav">
      <a href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <img
          src="/logo.jpg"
          alt="THEHUB Logo"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            border: '1.5px solid rgba(34, 211, 238, 0.8)',
            boxShadow: '0 0 12px rgba(34, 211, 238, 0.4)',
            objectFit: 'cover'
          }}
        />
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
