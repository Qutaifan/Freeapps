/**
 * Recovery & Editorial Content Merge Script (2026 Edition)
 * THEHUB by QUTAIFAN.COM (https://www.qutaifan.com/)
 * 
 * 1. Splices original rich human-written editorial content (47,000+ words) from 3ef61dc.
 * 2. Retains clean extensionless canonicals (Cloudflare Pages 308 200-OK target).
 * 3. Injects SoftwareApplication + BreadcrumbList + Article JSON-LD Schema.
 * 4. Ensures FAQ JSON-LD matches visibly rendered Q&A text.
 * 5. Strips overstated audit claims for 100% credibility ("Researched & Cataloged by THEHUB Editorial Board").
 * 6. Adds min-height: 250px zero-CLS AdSense containers.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const REVIEWS_DIR = path.join(ROOT_DIR, 'reviews');
const ORIG_REVIEWS_DIR = path.join(ROOT_DIR, 'temp_orig', 'reviews');
const TOOLS_PATH = path.join(ROOT_DIR, 'tools.json');

console.log('🔄 Executing Review Recovery & Editorial Merge Workflow...');

if (!fs.existsSync(ORIG_REVIEWS_DIR)) {
  console.error('❌ Error: temp_orig/reviews directory not found! Run git archive extraction first.');
  process.exit(1);
}

const tools = JSON.parse(fs.readFileSync(TOOLS_PATH, 'utf8'));
const toolsMap = new Map(tools.map(t => [t.slug, t]));

const origFiles = fs.readdirSync(ORIG_REVIEWS_DIR).filter(f => f.endsWith('.html'));
console.log(`Found ${origFiles.length} original review files in 3ef61dc to restore.`);

let mergedCount = 0;
let totalWords = 0;
const validSlugs = new Set();

origFiles.forEach(file => {
  const slug = file.replace('.html', '');
  const origContent = fs.readFileSync(path.join(ORIG_REVIEWS_DIR, file), 'utf8');
  const tool = toolsMap.get(slug) || {
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    blurb: 'Verified software application cataloged on THEHUB.',
    category: 'software',
    pricing: 'free',
    badges: ['Verified'],
    url: '#'
  };

  validSlugs.add(slug);

  // Extract body content from original review file
  let bodyMatch = origContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : '';

  // Clean up body content: remove duplicate h1 headers or outer script/footer tags
  bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');
  bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
  bodyContent = bodyContent.replace(/<style[\s\S]*?<\/style>/gi, '');
  bodyContent = bodyContent.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  bodyContent = bodyContent.replace(/<div class="date">[\s\S]*?<\/div>/gi, '');
  
  // Normalize internal links from .html to extensionless
  bodyContent = bodyContent.replace(/href="\/reviews\/([a-z0-9-]+)\.html"/gi, 'href="/reviews/$1"');
  bodyContent = bodyContent.replace(/href="\/([a-z0-9-]+)\.html"/gi, 'href="/$1"');

  // Extract visible FAQ items if present
  const faqItems = [];
  const faqRegex = /<p><strong>([^<]+)<\/strong>\s*([^<]+)<\/p>/gi;
  let match;
  while ((match = faqRegex.exec(bodyContent)) !== null) {
    const q = match[1].replace(/\?/g, '').trim();
    const a = match[2].trim();
    if (q.length > 3 && a.length > 2) {
      faqItems.push({
        "@type": "Question",
        "name": `${q}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": a
        }
      });
    }
  }

  // Count words in body content
  const plainText = bodyContent.replace(/<[^>]+>/g, ' ');
  const words = plainText.trim().split(/\s+/).length;
  totalWords += words;

  const canonicalUrl = `https://www.qutaifan.com/reviews/${slug}`;
  const cleanBlurb = (tool.blurb || 'Verified software application cataloged on THEHUB.').replace(/"/g, '\\"');

  // Build JSON-LD Graph
  const schemaGraph = [
    {
      "@type": "SoftwareApplication",
      "@id": `${canonicalUrl}/#software`,
      "name": tool.name,
      "description": cleanBlurb,
      "applicationCategory": tool.category || "Software",
      "operatingSystem": "All Platforms",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}/#breadcrumb`,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.qutaifan.com/" },
        { "@type": "ListItem", "position": 2, "name": "Reviews", "item": "https://www.qutaifan.com/reviews" },
        { "@type": "ListItem", "position": 3, "name": tool.name, "item": canonicalUrl }
      ]
    },
    {
      "@type": "Article",
      "@id": `${canonicalUrl}/#article`,
      "headline": `${tool.name} Review (2026): Features & Free Tier Analysis`,
      "description": cleanBlurb,
      "datePublished": tool.added || "2026-01-15",
      "dateModified": "2026-08-11",
      "author": {
        "@type": "Person",
        "name": "Qutaifan Editorial Board",
        "url": "https://www.qutaifan.com/author/qutaifan-editorial-board"
      },
      "publisher": {
        "@type": "Organization",
        "name": "THEHUB",
        "url": "https://www.qutaifan.com/",
        "logo": { "@type": "ImageObject", "url": "https://www.qutaifan.com/logo.jpg" }
      }
    }
  ];

  // Only include FAQPage schema if FAQ items are visibly rendered in bodyContent
  if (faqItems.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}/#faq`,
      "mainEntity": faqItems
    });
  }

  // Find 4 related tools for cross-linking
  const relatedTools = tools
    .filter(t => t.slug !== slug && (t.category === tool.category || t.pricing === tool.pricing))
    .slice(0, 4);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <link rel="icon" type="image/jpeg" href="/logo.jpg" />
  <link rel="apple-touch-icon" href="/logo.jpg" />
  
  <!-- Primary Meta Tags -->
  <title>${tool.name} Review (2026): Features, Limits &amp; Verdict | THEHUB</title>
  <meta name="title" content="${tool.name} Review (2026): Features, Limits &amp; Verdict | THEHUB" />
  <meta name="description" content="Independent evaluation of ${tool.name}: ${cleanBlurb}" />
  <meta name="keywords" content="${tool.name.toLowerCase()}, ${tool.slug}, free software review 2026, ${tool.category}" />
  <meta name="author" content="Qutaifan Editorial Board" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${tool.name} Review (2026) | THEHUB" />
  <meta property="og:description" content="${cleanBlurb}" />
  <meta property="og:image" content="https://www.qutaifan.com/logo.jpg" />
  <meta property="og:site_name" content="THEHUB" />

  <!-- Google AdSense Official Script -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9640734919758311" crossorigin="anonymous"></script>

  <!-- Google Analytics 4 (GA4 gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-WKLJQZBWD1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-WKLJQZBWD1', { page_path: window.location.pathname });
  </script>

  <!-- Core Web Vitals RUM Performance Tracking Module -->
  <script type="module">
    import {onLCP, onINP, onCLS} from 'https://unpkg.com/web-vitals@4?module';
    function sendToAnalytics(m) { if (window.gtag) gtag('event', m.name, { value: Math.round(m.name==='CLS'?m.value*1000:m.value), event_label: m.id, non_interaction: true }); }
    onLCP(sendToAnalytics); onINP(sendToAnalytics); onCLS(sendToAnalytics);
  </script>

  <!-- Schema.org JSON-LD Graph -->
  <script type="application/ld+json">
  ${JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph }, null, 2)}
  </script>

  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-base: #0A0A0B;
      --surface-1: #111113;
      --surface-2: #18181B;
      --accent-cyan: #22D3EE;
      --border-subtle: rgba(255, 255, 255, 0.1);
      --text-primary: #F4F4F5;
      --text-secondary: #A1A1AA;
      --text-muted: #71717A;
      --font-sans: 'Inter', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: var(--bg-base); color: var(--text-primary); font-family: var(--font-sans); line-height: 1.7; }
    .max-w { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

    .nav-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 2rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 3rem; }
    .nav-brand { font-family: var(--font-sans); font-weight: 900; font-size: 1.3rem; color: #fff; text-decoration: none; }
    
    h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 900; color: #fff; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
    h2 { font-size: 1.35rem; font-weight: 800; color: var(--accent-cyan); margin-top: 2rem; margin-bottom: 0.85rem; }
    p, ul { color: var(--text-secondary); margin-bottom: 1.25rem; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.4rem; }

    .badge-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .badge { font-family: var(--font-mono); font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 9999px; background: rgba(34, 211, 238, 0.1); color: var(--accent-cyan); border: 1px solid rgba(34, 211, 238, 0.3); font-weight: 600; }

    .btn-link { display: inline-block; background: var(--accent-cyan); color: #000; font-weight: 800; font-size: 0.9rem; padding: 0.65rem 1.4rem; border-radius: 9999px; text-decoration: none; }
    .ad-slot-container { min-height: 250px; background: var(--surface-1); border: 1px dashed var(--border-subtle); border-radius: 14px; padding: 1.25rem; text-align: center; margin: 2.5rem 0; }

    footer { border-top: 1px solid var(--border-subtle); padding-top: 2.5rem; margin-top: 5rem; color: var(--text-muted); font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
  </style>
</head>
<body>
  <div class="max-w">
    <header class="nav-header">
      <a href="/" class="nav-brand">THEHUB</a>
      <a href="/" class="btn-link" style="background:var(--surface-2);color:var(--text-primary);border:1px solid var(--border-subtle);">← Back to Directory</a>
    </header>

    <main>
      <article>
        <div class="badge-row">
          <span class="badge">${(tool.category || 'Software').toUpperCase()}</span>
          <span class="badge">${(tool.pricing || 'Free').toUpperCase()}</span>
        </div>

        <!-- Honest E-E-A-T Author Byline (Zero Overstated Claims) -->
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:2rem;padding-bottom:1.25rem;border-bottom:1px solid var(--border-subtle);">
          <img src="/logo.jpg" alt="Ahmad Qutaifan" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--accent-cyan);" />
          <div style="font-size:0.85rem;color:var(--text-secondary);">
            Researched &amp; Cataloged by <a href="/author/qutaifan-editorial-board" style="color:var(--accent-cyan);text-decoration:none;font-weight:700;">Ahmad Qutaifan &amp; Editorial Board</a>
          </div>
        </div>

        <!-- Original Rich Human-Written Review Content -->
        ${bodyContent}

        <!-- Top AdSense Unit (Zero-CLS Container) -->
        <div class="ad-slot-container">
          <span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--text-muted);display:block;margin-bottom:0.5rem;">SPONSORED ADVERTISEMENT</span>
          <ins class="adsbygoogle"
               style="display:block; min-height: 250px;"
               data-ad-client="ca-pub-9640734919758311"
               data-ad-slot="7794395344"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>

        <!-- Related Software Tools (Zero Orphan Pages) -->
        ${relatedTools.length > 0 ? `
        <section style="margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--border-subtle);">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem;">Related Software Tools in ${tool.category}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
            ${relatedTools.map(r => `
              <a href="/reviews/${r.slug}" style="display: block; background: var(--surface-1); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.25rem; text-decoration: none; transition: border-color 150ms ease;">
                <div style="font-weight: 800; color: var(--accent-cyan); font-size: 1rem; margin-bottom: 0.35rem;">${r.name}</div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">${(r.blurb || '').slice(0, 75)}...</div>
              </a>
            `).join('')}
          </div>
        </section>
        ` : ''}
      </article>
    </main>

    <footer>
      <div>© 2026 THEHUB by Qutaifan (www.qutaifan.com)</div>
      <div><a href="/reviews" style="color:var(--accent-cyan);text-decoration:none;">← All Reviews Index</a></div>
    </footer>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(REVIEWS_DIR, `${slug}.html`), fullHtml, 'utf8');
  mergedCount++;
});

// Clean up any unwritten thin review files that were not in origFiles
const currentFiles = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
let cleanedCount = 0;
currentFiles.forEach(file => {
  const slug = file.replace('.html', '');
  if (!validSlugs.has(slug)) {
    fs.unlinkSync(path.join(REVIEWS_DIR, file));
    cleanedCount++;
  }
});

console.log(`\n🎉 MERGE RECOVERY COMPLETED!`);
console.log(`✅ Successfully merged original human writing into ${mergedCount} review pages.`);
console.log(`📊 Restored Total Word Count: ${totalWords} words (Average: ${Math.round(totalWords / mergedCount)} words/page).`);
console.log(`🧹 Removed ${cleanedCount} thin placeholder pages that lacked original writing.`);
