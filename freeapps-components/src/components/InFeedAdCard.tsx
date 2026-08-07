import { useEffect } from 'react'

export function InFeedAdCard() {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || []
        adsbygoogle.push({})
      }
    } catch (e) {
      console.warn('InFeed AdSense push skipped:', e)
    }
  }, [])

  return (
    <article className="bento-card bento-card-medium in-feed-ad-card">
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span className="adsense-label">SPONSORED NATIVE AD</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.75rem 0' }}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-format="fluid"
            data-ad-layout-key="-fb+5w+4e-db+86"
            data-ad-client="ca-pub-9640734919758311"
            data-ad-slot="auto"
          />
        </div>
        <span className="github-stars" style={{ fontSize: '0.7rem' }}>Google Certified Sponsor</span>
      </div>
    </article>
  )
}
