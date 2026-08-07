import { useState } from 'react'

export function StickyAnchorAd() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <aside className="sticky-anchor-bar glass-modal">
      <div className="anchor-ad-content">
        <span className="adsense-label" style={{ fontSize: '0.6rem', marginBottom: 0 }}>SPONSORED AD</span>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '728px', height: '90px' }}
          data-ad-client="ca-pub-9640734919758311"
          data-ad-slot="auto"
        />
      </div>
      <button className="anchor-close-btn" onClick={() => setDismissed(true)} title="Close advertisement">
        &times;
      </button>
    </aside>
  )
}
