import type { ToolCard } from '../types/tool'

interface ToolDetailModalProps {
  tool: ToolCard | null
  isSaved: boolean
  onClose: () => void
  onToggleBookmark: (id: string, name: string) => void
}

export function ToolDetailModal({
  tool,
  isSaved,
  onClose,
  onToggleBookmark
}: ToolDetailModalProps) {
  if (!tool) return null

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

        <div className="card-tag-group" style={{ marginBottom: '1.5rem' }}>
          {tool.tags.map((t, i) => (
            <span key={i} className="card-tag">
              {t}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <span className="github-stars">{tool.stars} • License: {tool.license}</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-secondary-hero"
              onClick={() => onToggleBookmark(tool.id, tool.name)}
            >
              {isSaved ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-accent">
              Visit {tool.name} &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
