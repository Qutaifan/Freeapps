import type { ToolCard } from '../types/tool'

interface ToolCardItemProps {
  tool: ToolCard
  isSaved: boolean
  selectedTag: string | null
  onToggleBookmark: (id: string, name: string) => void
  onSelectTag: (tag: string | null) => void
  onSelectTool: (tool: ToolCard) => void
}

export function ToolCardItem({
  tool,
  isSaved,
  selectedTag,
  onToggleBookmark,
  onSelectTag,
  onSelectTool
}: ToolCardItemProps) {
  const cardClass =
    tool.size === 'large'
      ? 'bento-card bento-card-large'
      : tool.size === 'medium'
      ? 'bento-card bento-card-medium'
      : 'bento-card bento-card-small'

  return (
    <article className={cardClass}>
      <div>
        <div className="card-top-header">
          <div>
            <h3 className="card-tool-name" onClick={() => onSelectTool(tool)}>
              {tool.name}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {tool.mainCategoryLabel}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              className={`btn-star-icon ${isSaved ? 'is-saved' : ''}`}
              onClick={() => onToggleBookmark(tool.id, tool.name)}
              title={isSaved ? 'Remove bookmark' : 'Bookmark tool'}
            >
              {isSaved ? '★' : '☆'}
            </button>
            <span className="card-license-badge">{tool.license}</span>
          </div>
        </div>

        <p className="card-tool-desc">{tool.description}</p>

        <div className="card-tag-group">
          {tool.tags.map((t, idx) => (
            <span
              key={idx}
              className={`card-tag ${selectedTag === t ? 'tag-highlight' : ''}`}
              onClick={() => onSelectTag(selectedTag === t ? null : t)}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="card-action-bar">
        <span className="github-stars">{tool.stars}</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-details" onClick={() => onSelectTool(tool)}>
            Details
          </button>
          <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-try-tool">
            Visit &rarr;
          </a>
        </div>
      </div>
    </article>
  )
}
