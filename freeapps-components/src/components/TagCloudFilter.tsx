interface TagCloudFilterProps {
  tags: string[]
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
}

export function TagCloudFilter({ tags, selectedTag, onSelectTag }: TagCloudFilterProps) {
  return (
    <div className="tag-filter-cloud">
      <span className="tag-cloud-label">Filter by Tag:</span>
      <button
        className={`tag-chip ${selectedTag === null ? 'tag-chip-active' : ''}`}
        onClick={() => onSelectTag(null)}
      >
        All Tags
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tag-chip ${selectedTag === tag ? 'tag-chip-active' : ''}`}
          onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
