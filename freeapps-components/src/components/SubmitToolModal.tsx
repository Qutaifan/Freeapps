import { useState } from 'react'

interface SubmitToolModalProps {
  isOpen: boolean
  onClose: () => void
  onShowToast: (msg: string) => void
}

export function SubmitToolModal({ isOpen, onClose, onShowToast }: SubmitToolModalProps) {
  const [form, setForm] = useState({ name: '', url: '', category: 'ai', description: '' })
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
      setForm({ name: '', url: '', category: 'ai', description: '' })
      onShowToast('Thank you! Your tool submission has been recorded for review.')
    }, 1500)
  }

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-card bento-card glass-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
            SUBMIT TOOL TO THEHUB
          </span>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🎉</span>
            <h3 style={{ marginTop: '0.5rem' }}>Submission Received!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Our curation team will review your suggested tool for inclusion in THEHUB.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tool Name</label>
              <input
                type="text"
                required
                className="code-install-text search-input-field"
                placeholder="e.g. Supabase, Ghostty, Excalidraw"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Website or Repository URL</label>
              <input
                type="url"
                required
                className="code-install-text search-input-field"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div>
              <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category Pillar</label>
              <select
                className="code-install-text search-input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="ai">🤖 AI & Automation</option>
                <option value="utilities">🛠️ Online Utilities</option>
                <option value="apps">💻 Apps & Software</option>
                <option value="opensource">🔓 Open Source CLI</option>
              </select>
            </div>
            <div>
              <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Short Description</label>
              <textarea
                required
                rows={3}
                className="code-install-text search-input-field"
                placeholder="Describe what makes this tool exceptional..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-accent" style={{ marginTop: '0.5rem', width: '100%' }}>
              Submit Tool
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
