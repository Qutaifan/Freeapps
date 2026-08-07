import type { ToolCard } from '../types/tool'

interface CategoryPillarsProps {
  activeCategory: string
  onSelectCategory: (cat: string) => void
  tools: ToolCard[]
  savedCount: number
}

export function CategoryPillars({
  activeCategory,
  onSelectCategory,
  tools,
  savedCount
}: CategoryPillarsProps) {
  const countCategory = (cat: string) => {
    if (cat === 'all') return tools.length
    return tools.filter((t) => t.mainCategory === cat).length
  }

  return (
    <section id="categories" style={{ marginBottom: '2.5rem' }}>
      <div className="section-header-quiet">
        <div>
          <span className="section-tag">01 / PRIMARY PILLARS</span>
          <h2 className="section-title">Select Category Pillar</h2>
        </div>
      </div>

      <div className="bento-grid-categories">
        <button
          className={`bento-card category-chip-card ${activeCategory === 'all' ? 'active-pill' : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          <span className="cat-name">⚡ All Software</span>
          <span className="cat-count">{countCategory('all')}</span>
        </button>
        <button
          className={`bento-card category-chip-card ${activeCategory === 'ai' ? 'active-pill' : ''}`}
          onClick={() => onSelectCategory('ai')}
        >
          <span className="cat-name">🤖 AI & Automation</span>
          <span className="cat-count">{countCategory('ai')}</span>
        </button>
        <button
          className={`bento-card category-chip-card ${activeCategory === 'utilities' ? 'active-pill' : ''}`}
          onClick={() => onSelectCategory('utilities')}
        >
          <span className="cat-name">🛠️ Online Utilities</span>
          <span className="cat-count">{countCategory('utilities')}</span>
        </button>
        <button
          className={`bento-card category-chip-card ${activeCategory === 'apps' ? 'active-pill' : ''}`}
          onClick={() => onSelectCategory('apps')}
        >
          <span className="cat-name">💻 Apps & Software</span>
          <span className="cat-count">{countCategory('apps')}</span>
        </button>
        <button
          className={`bento-card category-chip-card ${activeCategory === 'opensource' ? 'active-pill' : ''}`}
          onClick={() => onSelectCategory('opensource')}
        >
          <span className="cat-name">🔓 Open Source CLI</span>
          <span className="cat-count">{countCategory('opensource')}</span>
        </button>
        <button
          className={`bento-card category-chip-card ${activeCategory === 'saved' ? 'active-pill' : ''}`}
          onClick={() => onSelectCategory('saved')}
        >
          <span className="cat-name">⭐ Saved Library</span>
          <span className="cat-count">{savedCount}</span>
        </button>
      </div>
    </section>
  )
}
