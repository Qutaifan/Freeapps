export function FooterSection() {
  return (
    <footer className="footer-quiet bento-card" style={{ marginTop: '4rem', padding: '2.5rem 2rem 2rem' }}>
      <div className="footer-content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <div className="footer-brand" style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>THE</span>HUB
          </div>
          <p className="footer-tagline" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '380px' }}>
            Independent reviews &amp; directory indexing of genuinely free, open-source, and freemium software. Zero dark patterns. Powered by local RAM processing.
          </p>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '1rem', textTransform: 'uppercase' }}>
            pSEO Guides 2026
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="/best-free-ai-tools-2026/" className="footer-link">Free AI Tools 2026</a></li>
            <li><a href="/best-free-ai-writing-tools-2026/" className="footer-link">AI Writing Tools</a></li>
            <li><a href="/best-open-source-software-alternatives-2026/" className="footer-link">Open Source Alternatives</a></li>
            <li><a href="/best-free-password-managers-2026/" className="footer-link">Password Managers</a></li>
            <li><a href="/best-free-video-editing-software-2026/" className="footer-link">Video Editors</a></li>
            <li><a href="/best-free-photo-graphic-design-tools-2026/" className="footer-link">Photo &amp; Graphic Tools</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Directory Pillars
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="/#prompt-generator" className="footer-link">⚡ Free AI Prompt Generator</a></li>
            <li><a href="/#faq" className="footer-link">❓ FAQ Accordion</a></li>
            <li><a href="/sitemap.xml" className="footer-link">🗺️ XML Sitemap</a></li>
            <li><a href="/rss.xml" className="footer-link">📡 RSS Syndication Feed</a></li>
            <li><a href="/manifest.json" className="footer-link">📱 Web App Manifest</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Legal &amp; Policy
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="/privacy-policy/" className="footer-link">Privacy Policy</a></li>
            <li><a href="/editorial-policy/" className="footer-link">Editorial Standards</a></li>
            <li><a href="/about/" className="footer-link">About THEHUB</a></li>
            <li><a href="/contact/" className="footer-link">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p className="copyright-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © 2026 THEHUB by Qutaifan (<a href="https://www.qutaifan.com" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>www.qutaifan.com</a>). All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>GA4 Analytics: Active</span>
          <span>•</span>
          <span>AdSense Publisher: pub-9640734919758311</span>
        </div>
      </div>
    </footer>
  )
}
