import { useRef } from 'react'
import type { ToolCard } from '../types/tool'

interface ToolCardItemProps {
  tool: ToolCard
  isSaved: boolean
  selectedTag: string | null
  onToggleBookmark: (id: string, name: string) => void
  onSelectTag: (tag: string | null) => void
  onSelectTool: (tool: ToolCard) => void
}

const MAX_TILT_DEG = 8

// Deterministic per-card seed so each card floats on its own slightly
// offset rhythm instead of bobbing in mechanical unison with the rest
// of the grid.
function floatSeed(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return hash
}

export function ToolCardItem({
  tool,
  isSaved,
  selectedTag,
  onToggleBookmark,
  onSelectTag,
  onSelectTool
}: ToolCardItemProps) {
  const cardRef = useRef<HTMLElement | null>(null)
  const tiltRef = useRef<HTMLDivElement | null>(null)
  const reducedMotionRef = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const cardClass =
    tool.size === 'large'
      ? 'bento-card showing-card bento-card-large'
      : tool.size === 'medium'
      ? 'bento-card showing-card bento-card-medium'
      : 'bento-card showing-card bento-card-small'

  const seed = floatSeed(tool.id)
  const floatStyle = {
    '--float-delay': `${-((seed % 500) / 100)}s`,
    '--float-duration': `${6 + ((seed >> 3) % 300) / 100}s`
  } as React.CSSProperties

  const handlePointerMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotionRef.current) return
    const card = cardRef.current
    const tilt = tiltRef.current
    if (!card || !tilt) return

    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rotateY = (px - 0.5) * MAX_TILT_DEG * 2
    const rotateX = (0.5 - py) * MAX_TILT_DEG * 2

    tilt.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
    card.style.setProperty('--mx', `${px * 100}%`)
    card.style.setProperty('--my', `${py * 100}%`)
  }

  const handlePointerLeave = () => {
    const tilt = tiltRef.current
    if (tilt) {
      tilt.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    }
  }

  return (
    <article
      ref={cardRef}
      className={cardClass}
      style={floatStyle}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <div className="showing-card-glare" aria-hidden="true" />
      <div ref={tiltRef} className="showing-card-tilt">
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
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-details" onClick={() => onSelectTool(tool)}>
              Details
            </button>

            {tool.secondaryUrls && tool.secondaryUrls.length > 0 ? (
              tool.secondaryUrls.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-visit"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  {link.label} &rarr;
                </a>
              ))
            ) : (
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-visit"
              >
                Visit &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
