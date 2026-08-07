import { useState, useCallback } from 'react'

export function useBookmarks(showToast?: (msg: string) => void) {
  const [savedToolIds, setSavedToolIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('thehub_saved_tools')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const toggleBookmark = useCallback((id: string, name: string) => {
    setSavedToolIds((prev) => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem('thehub_saved_tools', JSON.stringify(next))
      } catch (e) {
        console.error('Failed to save to localStorage:', e)
      }
      if (showToast) {
        showToast(exists ? `Removed "${name}" from saved tools` : `Saved "${name}" to your library! ⭐`)
      }
      return next
    })
  }, [showToast])

  return { savedToolIds, toggleBookmark }
}
