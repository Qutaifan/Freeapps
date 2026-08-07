import type { ToolCard } from '../types/tool'

interface ToolDetailModalProps {
  tool: ToolCard | null
  isSaved: boolean
  onClose: () => void
  onToggleBookmark: (id: string, name: string) => void
  onShowToast?: (msg: string) => void
}

export function ToolDetailModal({
  tool,
  isSaved,
  onClose,
  onToggleBookmark,
  onShowToast
}: ToolDetailModalProps) {
  if (!tool) return null

  const shareUrl = encodeURIComponent(`https://www.qutaifan.com/#${tool.name.toLowerCase().replace(/\s+/g, '-')}`)
  const shareText = encodeURIComponent(`Check out ${tool.name} on THEHUB — ${tool.description}`)

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank')
  }

  const handleShareReddit = () => {
    window.open(`https://www.reddit.com/submit?title=${encodeURIComponent(tool.name)}&url=${shareUrl}`, '_blank')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://www.qutaifan.com/#${tool.name.toLowerCase().replace(/\s+/g, '-')}`)
    if (onShowToast) {
      onShowToast(`Deep link to ${tool.name} copied to clipboard!`)
    }
  }

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="tool-detail-card bento-card glass-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tool-detail-header">
          <div>
            <span className="section-tag">{tool.mainCategoryLabel}</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>{tool.name}</h2>
          </div>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem' }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 1.25rem', lineHeight: 1.6 }}>
          {tool.fullDetails || tool.description}
        </p>

        {tool.features && tool.features.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Key Features:</h4>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              {tool.features.map((f, i) => (
                <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card-tag-group" style={{ marginBottom: '1.25rem' }}>
          {tool.tags.map((t, i) => (
            <span key={i} className="card-tag">
              {t}
            </span>
          ))}
        </div>

        {/* Social Share Bar */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Share Tool:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="tag-chip" onClick={handleShareTwitter}>𝕏 Twitter</button>
            <button className="tag-chip" onClick={handleShareReddit}>Reddit</button>
            <button className="tag-chip" onClick={handleCopyLink}>🔗 Copy Link</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span className="github-stars">{tool.stars} • License: {tool.license}</span>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary-hero"
              onClick={() => onToggleBookmark(tool.id, tool.name)}
            >
              {isSaved ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
            
            {tool.secondaryUrls && tool.secondaryUrls.length > 0 ? (
              tool.secondaryUrls.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-accent">
                  Visit {link.label} &rarr;
                </a>
              ))
            ) : (
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-accent">
                Visit {tool.name} &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
