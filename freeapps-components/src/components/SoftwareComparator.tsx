import { useState } from 'react'

interface ComparisonPair {
  proprietary: string
  openSource: string
  category: string
  costSaving: string
  advantage: string
  url: string
}

const COMPARISONS: ComparisonPair[] = [
  {
    proprietary: 'Adobe Photoshop ($239/yr)',
    openSource: 'Photopea Engine',
    category: 'Graphics / Photo',
    costSaving: '$239 / year',
    advantage: 'Runs 100% in local RAM without cloud file upload',
    url: 'https://www.photopea.com'
  },
  {
    proprietary: '1Password / LastPass ($36/yr)',
    openSource: 'Bitwarden Vault',
    category: 'Security / Vault',
    costSaving: '$36 / year',
    advantage: 'Zero-knowledge self-hostable encryption with unlimited devices',
    url: 'https://bitwarden.com'
  },
  {
    proprietary: 'Apple AirDrop (Apple Only)',
    openSource: 'LocalSend AirDrop',
    category: 'Network / Utility',
    costSaving: 'Free Forever',
    advantage: 'Cross-platform transfer over local Wi-Fi between iOS, Android, Mac & PC',
    url: 'https://localsend.org'
  },
  {
    proprietary: 'Google Docs / Notion ($120/yr)',
    openSource: 'CryptPad Workspace',
    category: 'Privacy Docs',
    costSaving: '$120 / year',
    advantage: 'Client-side end-to-end encrypted real-time document collaboration',
    url: 'https://cryptpad.fr'
  },
  {
    proprietary: 'Firebase Paid Tier ($300+/yr)',
    openSource: 'Supabase Postgres',
    category: 'Backend / Database',
    costSaving: '$300+ / year',
    advantage: 'Open-source PostgreSQL with row-level security and real-time APIs',
    url: 'https://supabase.com'
  }
]

export function SoftwareComparator() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const current = COMPARISONS[selectedIndex]

  return (
    <section className="comparator-section bento-card" style={{ marginBottom: '3rem', padding: '2rem' }}>
      <div className="section-header-quiet">
        <span className="section-tag">03 / FREE ALTERNATIVE CALCULATOR</span>
        <h2 className="section-title">Software Cost &amp; Feature Comparison</h2>
      </div>

      <div className="comparator-tabs" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1.25rem 0' }}>
        {COMPARISONS.map((comp, idx) => (
          <button
            key={idx}
            className={`tag-chip ${selectedIndex === idx ? 'tag-chip-active' : ''}`}
            onClick={() => setSelectedIndex(idx)}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            {comp.openSource} vs {comp.proprietary.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="comparison-display-box" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PROPRIETARY COST</span>
          <h3 style={{ fontSize: '1.15rem', color: '#EF4444', margin: '0.2rem 0' }}>{current.proprietary}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Requires recurring subscription &amp; cloud data lock-in.</p>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>OPEN SOURCE WINNER</span>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--accent-cyan)', margin: '0.2rem 0' }}>{current.openSource}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{current.advantage}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#10B981' }}>Saved: {current.costSaving}</span>
            <a href={current.url} target="_blank" rel="noopener noreferrer" className="btn-accent" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}>
              Switch Free &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
