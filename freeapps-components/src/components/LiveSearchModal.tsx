import type { ToolCard } from '../types/tool'

interface LiveSearchModalProps {
  isOpen: boolean
  searchQuery: string
  filteredTools: ToolCard[]
  onClose: () => void
  onSearchChange: (query: string) => void
  onSelectTool: (tool: ToolCard) => void
}

export function LiveSearchModal({
  isOpen,
  searchQuery,
  filteredTools,
  onClose,
  onSearchChange,
  onSelectTool
}: LiveSearchModalProps) {
  if (!isOpen) return null

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-card bento-card glass-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
            ⌘K LIVE DIRECTORY SEARCH
          </span>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <input
          type="text"
          className="code-install-text search-input-field"
          placeholder="Search AI, CLI tools, password managers, tags..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />

        <div className="modal-live-results">
          {filteredTools.length === 0 ? (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No tools found matching "{searchQuery}"
            </div>
          ) : (
            filteredTools.slice(0, 5).map((tool) => (
              <div
                key={tool.id}
                className="live-result-item"
                onClick={() => {
                  onSelectTool(tool)
                  onClose()
                }}
              >
                <div>
                  <div className="live-result-title">{tool.name}</div>
                  <div className="live-result-desc">{tool.description}</div>
                </div>
                <span className="card-license-badge">{tool.license}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
