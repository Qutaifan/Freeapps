interface NavbarProps {
  onOpenSearch: () => void
  onOpenSubmit: () => void
}

export function Navbar({ onOpenSearch, onOpenSubmit }: NavbarProps) {
  return (
    <nav className="navbar-fixed glass-nav">
      <a href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
        {/* Dark Circular Circuit Network Emblem (Option 1 - 44px Bigger) */}
        <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.45))' }}>
          <circle cx="32" cy="32" r="28" fill="#111113" stroke="#A1A1AA" strokeWidth="2.5" strokeOpacity="0.85" />
          <path d="M 32 14 L 32 30 L 40 38 L 40 48" fill="none" stroke="#F4F4F5" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="40" cy="48" r="3" fill="#22D3EE" />
          <path d="M 32 22 L 22 22 L 16 28 L 16 40" fill="none" stroke="#F4F4F5" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="40" r="3" fill="#22D3EE" />
          <path d="M 22 28 L 28 28 L 28 44" fill="none" stroke="#F4F4F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="44" r="2.5" fill="#38BDF8" />
          <circle cx="22" cy="28" r="2.5" fill="#38BDF8" />
          <circle cx="32" cy="14" r="3" fill="#22D3EE" />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontWeight: 900, fontSize: '1.45rem', letterSpacing: '0.03em', color: '#FFFFFF', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center' }}>
            THE<span style={{ color: 'var(--accent-cyan)', margin: '0 0.15rem', textShadow: '0 0 10px rgba(34, 211, 238, 0.8)' }}>•</span>HUB
          </span>
          <span style={{ fontSize: '0.46rem', letterSpacing: '0.26em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', textTransform: 'uppercase', opacity: 0.55 }}>
            BY QUTAIFAN.COM
          </span>
        </div>
      </a>

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
