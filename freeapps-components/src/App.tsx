import { useState, useMemo, useEffect } from 'react'
import './App.css'
import type { ToolCard } from './types/tool'
import { FEATURED_TOOLS, ALL_TAGS } from './data/tools'
import { useBookmarks } from './hooks/useBookmarks'

import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { CategoryPillars } from './components/CategoryPillars'
import { TagCloudFilter } from './components/TagCloudFilter'
import { ToolCardItem } from './components/ToolCardItem'
import { ToolDetailModal } from './components/ToolDetailModal'
import { LiveSearchModal } from './components/LiveSearchModal'
import { SubmitToolModal } from './components/SubmitToolModal'
import { AdSenseBanner } from './components/AdSenseBanner'
import { ToastNotification } from './components/ToastNotification'
import { FeaturesArchitecture } from './components/FeaturesArchitecture'
import { FooterSection } from './components/FooterSection'

function App() {
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedTool, setSelectedTool] = useState<ToolCard | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const { savedToolIds, toggleBookmark } = useBookmarks(showToast)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal((prev) => !prev)
      } else if (e.key === 'Escape') {
        setShowSearchModal(false)
        setShowSubmitModal(false)
        setSelectedTool(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredTools = useMemo(() => {
    return FEATURED_TOOLS.filter((t) => {
      if (activeCategory === 'saved') {
        if (!savedToolIds.includes(t.id)) return false
      } else if (activeCategory !== 'all' && t.mainCategory !== activeCategory) {
        return false
      }

      if (selectedTag && !t.tags.includes(selectedTag)) {
        return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = t.name.toLowerCase().includes(query)
        const matchesDesc = t.description.toLowerCase().includes(query)
        const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(query))
        return matchesName || matchesDesc || matchesTags
      }

      return true
    })
  }, [activeCategory, selectedTag, searchQuery, savedToolIds])

  const resetFilters = () => {
    setActiveCategory('all')
    setSelectedTag(null)
    setSearchQuery('')
  }

  return (
    <div>
      <div className="grain-overlay" />

      {/* Toast Notification */}
      <ToastNotification message={toastMessage} />

      {/* Floating Glass Navbar */}
      <Navbar
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenSubmit={() => setShowSubmitModal(true)}
      />

      <main className="app-wrapper">
        {/* Hero Section */}
        <Hero
          totalToolsCount={FEATURED_TOOLS.length}
          savedCount={savedToolIds.length}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onShowToast={showToast}
        />

        {/* 4 Major Pillars Filter Section */}
        <CategoryPillars
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          tools={FEATURED_TOOLS}
          savedCount={savedToolIds.length}
        />

        {/* Tag Filter Cloud */}
        <TagCloudFilter
          tags={ALL_TAGS}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        {/* AdSense Responsive Slot */}
        <AdSenseBanner />

        {/* Directory Header Bar */}
        <section id="featured" style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
          <div className="directory-results-bar">
            <div>
              <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{filteredTools.length}</strong> {filteredTools.length === 1 ? 'tool' : 'tools'}
                {activeCategory !== 'all' ? ` in ${activeCategory}` : ''}
                {selectedTag ? ` tagged #${selectedTag}` : ''}
              </span>
            </div>
            {(activeCategory !== 'all' || selectedTag !== null || searchQuery !== '') && (
              <button className="btn-clear-filters" onClick={resetFilters}>
                Reset Filters &times;
              </button>
            )}
          </div>
        </section>

        {/* Bento Grid */}
        <section style={{ marginBottom: '3.5rem' }}>
          {filteredTools.length === 0 ? (
            <div className="empty-results-box bento-card">
              <h3>No software matches your criteria</h3>
              <p>Try resetting your tag filters, search queries, or category selection.</p>
              <button className="btn-accent" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bento-grid-featured">
              {filteredTools.map((tool) => (
                <ToolCardItem
                  key={tool.id}
                  tool={tool}
                  isSaved={savedToolIds.includes(tool.id)}
                  selectedTag={selectedTag}
                  onToggleBookmark={toggleBookmark}
                  onSelectTag={setSelectedTag}
                  onSelectTool={setSelectedTool}
                />
              ))}
            </div>
          )}
        </section>

        {/* Features Architecture Section */}
        <FeaturesArchitecture />

        {/* Footer */}
        <FooterSection />
      </main>

      {/* Live Search Modal */}
      <LiveSearchModal
        isOpen={showSearchModal}
        searchQuery={searchQuery}
        filteredTools={filteredTools}
        onClose={() => setShowSearchModal(false)}
        onSearchChange={setSearchQuery}
        onSelectTool={setSelectedTool}
      />

      {/* Tool Detail Modal */}
      <ToolDetailModal
        tool={selectedTool}
        isSaved={selectedTool ? savedToolIds.includes(selectedTool.id) : false}
        onClose={() => setSelectedTool(null)}
        onToggleBookmark={toggleBookmark}
      />

      {/* Submit Tool Modal */}
      <SubmitToolModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onShowToast={showToast}
      />
    </div>
  )
}

export default App
