import type { ToolCard } from '../types/tool'

interface CategoryPillarsProps {
  activeCategory: string
  onSelectCategory: (cat: string) => void
  tools: ToolCard[]
  savedCount: number
}

interface TaxonomyCategory {
  id: string
  name: string
  icon: string
  subcategories: string[]
  topApps: string[]
}

const TAXONOMY_CATEGORIES: TaxonomyCategory[] = [
  {
    id: 'ai',
    name: 'AI Tools',
    icon: '🤖',
    subcategories: ['Text Generation', 'Image Generation', 'Code Assistants', 'Audio & Speech', 'Video AI'],
    topApps: ['ChatGPT', 'Claude AI', 'Kimi AI', 'Ollama', 'Cursor AI']
  },
  {
    id: 'dev',
    name: 'Developer Utilities',
    icon: '💻',
    subcategories: ['Frameworks & Libraries', 'APIs & Integrations', 'DevOps Tools', 'Testing & Debugging', 'Version Control'],
    topApps: ['Supabase CLI', 'Neovim', 'Ghostty', 'Lazygit', 'FZF']
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: '⚡',
    subcategories: ['Task Management', 'Note-Taking', 'Collaboration Suites', 'Automation Tools', 'Time Tracking'],
    topApps: ['CryptPad', 'Obsidian', 'Logseq', 'N8N', 'AppFlowy']
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    icon: '🔒',
    subcategories: ['Encryption Tools', 'VPNs & Proxy', 'Password Managers', 'Secure Cloud', 'Privacy Utilities'],
    topApps: ['Bitwarden', 'KeePassXC', 'Proton Vault', 'Tor Browser', 'Mullvad']
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    icon: '📊',
    subcategories: ['Data Visualization', 'Machine Learning', 'Business Intelligence', 'Databases', 'Web Scraping'],
    topApps: ['DBeaver', 'DuckDB', 'Grafana', 'Metabase', 'PostgreSQL']
  },
  {
    id: 'creative',
    name: 'Creative Tools',
    icon: '🎨',
    subcategories: ['Graphic Design', 'Video Editing', 'Audio Production', '3D Modeling', 'Writing & Publishing'],
    topApps: ['Photopea', 'DaVinci Resolve', 'Blender', 'OBS Studio', 'Krita']
  },
  {
    id: 'system',
    name: 'System Tools',
    icon: '⚙️',
    subcategories: ['OS Utilities', 'Monitoring', 'Backup & Recovery', 'Virtualization', 'Performance'],
    topApps: ['Linux Mint', 'BleachBit', 'Proxmox', 'VirtualBox', 'HTop']
  },
  {
    id: 'community',
    name: 'Community & Collaboration',
    icon: '💬',
    subcategories: ['Forums & Discussion', 'Messaging', 'Project Management', 'Knowledge Sharing', 'Open Source'],
    topApps: ['Discourse', 'Mattermost', 'Matrix Element', 'Disroot', 'Zulip']
  },
  {
    id: 'utilities',
    name: 'Everyday Utilities',
    icon: '🧰',
    subcategories: ['Converters', 'Calculators', 'Date & Time Tools', 'Encoding & Hashing', 'Randomizers & Passwords'],
    topApps: ['Password Gen', 'Format Converter', 'Base64 Encoder', 'JSON Crack', 'CyberChef']
  }
]

export function CategoryPillars({
  activeCategory,
  onSelectCategory,
  tools,
  savedCount
}: CategoryPillarsProps) {
  const countCategory = (catId: string) => {
    if (catId === 'all') return tools.length
    if (catId === 'saved') return savedCount
    return tools.filter((t) => 
      t.mainCategory === catId || 
      t.tags.some(tag => tag.toLowerCase().includes(catId)) ||
      (catId === 'creative' && ['graphics', 'video', 'audio', 'image'].includes(t.mainCategory)) ||
      (catId === 'system' && ['linux', 'apps'].includes(t.mainCategory)) ||
      (catId === 'dev' && ['opensource', 'code', 'cli'].includes(t.mainCategory))
    ).length
  }

  return (
    <section id="categories" style={{ marginBottom: '3.5rem' }}>
      <div className="section-header-quiet" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag" style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: 700 }}>
            01 / 9-CATEGORY TAXONOMY DIRECTORY
          </span>
          <h2 className="section-title" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.3rem' }}>
            Browse Free Software &amp; Top App Utilities
          </h2>
        </div>
      </div>

      {/* Main Filter Chips Bar */}
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          className={`btn-pill-filter ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
          style={{
            padding: '0.5rem 1.1rem',
            borderRadius: '9999px',
            border: activeCategory === 'all' ? '1px solid #22D3EE' : '1px solid rgba(255,255,255,0.1)',
            background: activeCategory === 'all' ? 'rgba(34, 211, 238, 0.15)' : 'var(--surface-1)',
            color: activeCategory === 'all' ? '#22D3EE' : 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ⚡ All Tools ({tools.length})
        </button>

        <button
          className={`btn-pill-filter ${activeCategory === 'saved' ? 'active' : ''}`}
          onClick={() => onSelectCategory('saved')}
          style={{
            padding: '0.5rem 1.1rem',
            borderRadius: '9999px',
            border: activeCategory === 'saved' ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.1)',
            background: activeCategory === 'saved' ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-1)',
            color: activeCategory === 'saved' ? '#38BDF8' : 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ⭐ Saved Library ({savedCount})
        </button>
      </div>

      {/* 9-Category Bento Grid Showcase */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {TAXONOMY_CATEGORIES.map((cat) => {
          const count = countCategory(cat.id)
          const isActive = activeCategory === cat.id

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="bento-card"
              style={{
                background: isActive ? 'rgba(34, 211, 238, 0.08)' : 'var(--surface-1)',
                border: isActive ? '1.5px solid #22D3EE' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.4rem',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</h3>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'var(--accent-cyan)'
                  }}>
                    {count} tools
                  </span>
                </div>

                {/* Subcategory Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {cat.subcategories.map((sub, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Apps Strip */}
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Top Utilities: {cat.topApps.slice(0, 3).join(', ')}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>Browse &rarr;</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
