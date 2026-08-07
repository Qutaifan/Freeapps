interface NavbarProps {
  onOpenSearch: () => void
  onOpenSubmit: () => void
}

export function Navbar({ onOpenSearch, onOpenSubmit }: NavbarProps) {
  return (
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
