export function InFeedAdCard() {
  return (
    <article className="bento-card bento-card-medium in-feed-ad-card">
      <div>
        <div className="card-top-header">
          <div>
            <span className="section-tag" style={{ color: 'var(--text-muted)' }}>SPONSORED AD</span>
            <h3 className="card-tool-name" style={{ fontSize: '1rem', marginTop: '0.2rem' }}>Featured Partner</h3>
          </div>
          <span className="card-license-badge">Ad</span>
        </div>
        <p className="card-tool-desc" style={{ fontSize: '0.82rem' }}>
          Discover verified developer tools, AI software, and cloud infrastructure.
        </p>
      </div>

      <div className="card-action-bar" style={{ justifyContent: 'center' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', textAlign: 'center' }}
          data-ad-client="ca-pub-9640734919758311"
          data-ad-slot="auto"
          data-ad-format="fluid"
          data-ad-layout-key="-fb+5w+4e-db+86"
        />
      </div>
    </article>
  )
}
