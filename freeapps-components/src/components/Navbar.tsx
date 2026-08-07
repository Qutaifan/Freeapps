interface NavbarProps {
  onOpenSearch: () => void
  onOpenSubmit: () => void
}

export function Navbar({ onOpenSearch, onOpenSubmit }: NavbarProps) {
  return (
    <nav className="navbar-fixed glass-nav">
      <a href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        {/* Dark Circular Circuit Network Emblem (Option 1) */}
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.3))' }}>
          <circle cx="32" cy="32" r="28" fill="#111113" stroke="#A1A1AA" strokeWidth="2.5" strokeOpacity="0.8" />
          <path d="M 32 14 L 32 30 L 40 38 L 40 48" fill="none" stroke="#F4F4F5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="40" cy="48" r="2.5" fill="#22D3EE" />
          <path d="M 32 22 L 22 22 L 16 28 L 16 40" fill="none" stroke="#F4F4F5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="40" r="2.5" fill="#22D3EE" />
          <path d="M 22 28 L 28 28 L 28 44" fill="none" stroke="#F4F4F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="44" r="2" fill="#38BDF8" />
          <circle cx="22" cy="28" r="2" fill="#38BDF8" />
          <circle cx="32" cy="14" r="2.5" fill="#22D3EE" />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.04em', color: '#FFFFFF', fontFamily: 'var(--font-sans)' }}>
            THEHUB
          </span>
          <span style={{ fontSize: '0.5rem', letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '3px', textTransform: 'uppercase', opacity: 0.65 }}>
            BY QUTAIFAN.COM
          </span>
        </div>
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
