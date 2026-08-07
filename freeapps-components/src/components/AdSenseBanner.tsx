export function AdSenseBanner() {
  return (
    <section className="adsense-banner-wrapper" style={{ marginBottom: '1.5rem' }}>
      <div className="adsense-slot-container bento-card">
        <span className="adsense-label">SPONSORED / ADVERTISEMENT</span>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-client="ca-pub-9640734919758311"
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  )
}
