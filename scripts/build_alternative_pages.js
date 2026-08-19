/**
 * Programmatic SEO generator: "Free Alternative to [Paid Product]" pages.
 * THEHUB by QUTAIFAN.COM
 *
 * Clones the proven structure of free-alternative-to-photoshop.html but is
 * fully data-driven from tools.json, so every page uses the catalog's OWN
 * original blurbs / official URLs / badges (no spun or duplicated copy).
 *
 * Each seed = a well-known paid/proprietary product that maps to a category
 * the catalog genuinely covers. The catalog tools in that category become the
 * real free alternatives listed on the page.
 *
 * Output: free-alternative-to-<slug>.html at repo root (extensionless canonical,
 * consistent with the existing alternative page and Cloudflare Pages).
 *
 * Run: node scripts/build_alternative_pages.js
 * Add pages by appending to SEEDS — idempotent (overwrites each run).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOLS_PATH = path.join(ROOT, 'tools.json');
const tools = JSON.parse(fs.readFileSync(TOOLS_PATH, 'utf8'));

const PUB = '2026-01-15';
const MOD = '2026-08-18';
const PUB_ID = 'ca-pub-9640734919758311';
const AD_SLOT = '5215765247';

// Curated seed map: paid/proprietary product -> catalog category it competes with.
// `paid` frames the commercial-intent query; `angle` is honest, unique framing.
const SEEDS = [
  { product: 'Adobe Illustrator', slug: 'illustrator', category: 'image',
    paid: 'a subscription-based vector and illustration app',
    angle: 'Most people reach for Illustrator for logos, vectors, SVGs and clean line art. The free tools below cover the core vector and design work without a Creative Cloud bill.' },
  { product: 'Adobe Lightroom', slug: 'lightroom', category: 'image',
    paid: 'a paid photo-organizing and RAW-development subscription',
    angle: 'Lightroom is really two things: a RAW developer and a photo library. The free options here split that work across open-source editors that do the heavy lifting for $0.' },
  { product: 'Adobe Premiere Pro', slug: 'premiere-pro', category: 'video',
    paid: 'a subscription-based professional video editor',
    angle: 'Premiere is the industry timeline editor, but for cutting clips, adding titles and exporting 4K, several free editors get the job done with no watermark.' },
  { product: 'Final Cut Pro', slug: 'final-cut-pro', category: 'video',
    paid: 'a one-time-purchase (but Mac-only) professional editor',
    angle: 'Final Cut is powerful but locked to macOS and costs upfront. These free editors run on more platforms and cover the majority of editing workflows.' },
  { product: 'Adobe After Effects', slug: 'after-effects', category: 'video',
    paid: 'a subscription-based motion-graphics and compositing app',
    angle: 'After Effects owns motion graphics and VFX, but simple motion titles, keyframed text and short composites are reachable with free tools — especially open-source 3D and video suites.' },
  { product: 'Midjourney', slug: 'midjourney', category: 'image',
    paid: 'a paid, Discord-based AI image generator',
    angle: 'Midjourney produces striking art but charges a monthly fee and keeps you inside Discord. The free alternatives below run in a browser or locally and put the images under your control.' },
  { product: 'Jasper AI', slug: 'jasper-ai', category: 'writing',
    paid: 'a paid AI copywriting assistant',
    angle: 'Jasper markets itself to teams that write at scale. The free writing tools here handle rewriting, grammar, tone and drafting without a seat fee.' },
  { product: '1Password', slug: '1password', category: 'security',
    paid: 'a popular paid password manager',
    angle: '1Password is polished and well-loved, but it is a paid subscription. The free managers below cover the essentials — encrypted vaults, cross-device sync and autofill — for $0.' },
  { product: 'LastPass', slug: 'lastpass', category: 'security',
    paid: 'a freemium password manager with a limited free tier',
    angle: 'LastPass narrowed its free tier to one device type. These alternatives give you real multi-device, open-source or unlimited-free password safety.' },
  { product: 'Microsoft Office', slug: 'microsoft-office', category: 'opensource',
    paid: 'a subscription or license-based office suite',
    angle: 'For documents, spreadsheets and presentations, free open-source suites open Office formats and cover the daily 90% of what most people actually do.' },
  { product: 'Notion', slug: 'notion', category: 'productivity',
    paid: 'a popular freemium workspace and note app',
    angle: 'Notion is flexible but gated by plan limits and cloud lock-in. The free tools here give you notes, docs and databases you fully own and can export.' },
  { product: 'Slack', slug: 'slack', category: 'opensource',
    paid: 'a popular freemium team-chat platform',
    angle: 'Slack is the default for team chat, but its free tier caps history. These open-source and community alternatives are self-hostable or free with no history wall.' },
  { product: 'Zoom', slug: 'zoom', category: 'opensource',
    paid: 'a freemium video-conferencing service',
    angle: 'Zoom works, but meetings are time-limited on free plans and calls route through their servers. The free option here is open-source and can run on your own infrastructure.' },
  { product: 'Figma', slug: 'figma', category: 'image',
    paid: 'a popular freemium interface and vector design tool',
    angle: 'Figma is the协作 design standard, but teams hit seat and feature limits on free plans. The free tools below cover UI mockups, vectors and diagrams without a subscription.' },
  { product: 'Canva', slug: 'canva', category: 'image',
    paid: 'a freemium design tool with a paid tier',
    angle: 'Canva is easy but pushes a paid plan for many assets and brand features. These free editors let you design, edit and export without watermark anxiety.' },
  { product: 'Evernote', slug: 'ennevernote', category: 'productivity',
    paid: 'a freemium note-taking app with device limits on free',
    angle: 'Evernote restricted its free tier to two devices. The free note apps here sync everywhere, support Markdown and keep your notes exportable.' },
  { product: 'Windows', slug: 'windows', category: 'linux',
    paid: 'a paid, license-bound desktop operating system',
    angle: 'Switching an entire OS is a bigger step than swapping an app, but these free, open-source Linux distributions are the genuine no-cost alternative for desktops and laptops.' },
  { product: 'macOS', slug: 'macos', category: 'linux',
    paid: 'a paid operating system tied to Apple hardware',
    angle: 'If you want a Unix-based, polished desktop without buying Apple hardware, these free Linux distributions are the open alternative you can install on almost any PC.' },
];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function shortBest(t) {
  const b = (t.blurb || '').trim();
  if (!b) return (t.category || '').replace('-', ' ');
  const first = b.split(/(?<=\.)\s/)[0];
  return first.length > 90 ? first.slice(0, 87) + '…' : first;
}

function build(seed) {
  const matches = tools.filter(t => (t.category || '') === seed.category);
  if (matches.length < 3) {
    console.log(`  SKIP ${seed.slug}: only ${matches.length} tools in "${seed.category}"`);
    return null;
  }
  const year = 2026;
  const url = `https://www.qutaifan.com/free-alternative-to-${seed.slug}`;
  const title = `Free Alternative to ${esc(seed.product)} ${year}: ${matches.length} Genuinely Free Picks`;
  const desc = `The best free alternatives to ${esc(seed.product)} in ${year} — ${matches.length} genuinely free, open-source and free-tier tools. Real limits named, no forced subscriptions.`;

  const related = [
    { href: '/best-open-source-software-alternatives-2026', t: 'Open Source Alternatives to Paid Software', s: 'Replace Office, Premiere, Slack and more with free open-source tools.' },
    { href: '/best-free-ai-tools-2026', t: 'Best Free AI Tools 2026', s: '100+ genuinely free AI tools for chat, image, code and more.' },
    { href: '/about', t: 'How Qutaifan reviews software', s: 'Our free-first editorial methodology and standards.' },
  ];

  const rows = matches.map((t, i) => `
<tr><td><a href="${esc(t.review || t.url)}" class="qh-review-link">${esc(t.name)}</a></td><td>${esc(shortBest(t))}</td><td>${esc((t.pricing || 'free').replace('-', ' '))}</td><td><a href="${esc(t.url)}" rel="nofollow noopener" target="_blank">Official →</a></td></tr>`).join('');

  const cards = matches.map(t => `
<section class="pair-card" id="${esc(t.slug)}">
  <div class="pair-kicker">${esc((t.pricing || 'Free').replace('-', ' '))}</div>
  <h2><a href="${esc(t.review || t.url)}" class="qh-review-link">${esc(t.name)}</a> — free pick in this category</h2>
  <div class="official-links"><a href="${esc(t.url)}" rel="nofollow noopener" target="_blank">Official site</a>${t.review ? ` · <a href="${esc(t.review)}">Full review</a>` : ''}</div>
  <p>${esc(t.blurb || 'Verified free software listed on THEHUB.')}</p>
  <p class="fit">Best for: ${esc(shortBest(t))}. ${esc(t.by ? 'By ' + t.by + '.' : '')}</p>
  <div class="badges">${(t.badges || []).map(b => `<span class="badge">${esc(b)}</span>`).join('')}</div>
</section>`).join('');

  const faq = [
    { q: `Is there a completely free version of ${seed.product}?`,
      a: `${seed.product} is ${seed.paid}, so there is no permanent free desktop version without payment. The tools on this page are genuinely free alternatives — open-source, free-tier or no-cost — not trials.` },
    { q: `Will these free tools open my existing ${seed.product} files?`,
      a: `It depends on the format. Many free editors in this category import common file types, but complex proprietary files may not round-trip perfectly. Check each tool's official docs before moving important work.` },
    { q: `What do I give up by leaving ${seed.product}?`,
      a: `Usually a smaller feature set, fewer integrations, or a steeper learning curve. The honest trade-offs are named on each tool above so you can decide before switching.` },
    { q: `Are these really free with no watermark?`,
      a: `Open-source and free-tier tools listed here do not watermark your work. Some browser-based free tiers show ads or reserve a few extras for a paid plan, which we call out explicitly.` },
    { q: `How did Qutaifan choose these?`,
      a: `Independently, by matching the catalog's free and open-source tools to the job ${seed.product} is used for. No paid placements, no affiliate tracking links — every link goes to the official project.` },
  ];

  const faqJson = faq.map(f => ({
    '@type': 'Question', name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', headline: title, description: desc, url,
        image: 'https://www.qutaifan.com/og-qutaifan-home.jpg',
        datePublished: PUB, dateModified: MOD,
        author: { '@type': 'Organization', name: 'QUTAIFAN', url: 'https://www.qutaifan.com/about' },
        publisher: { '@type': 'Organization', name: 'QUTAIFAN', url: 'https://www.qutaifan.com/',
          logo: { '@type': 'ImageObject', url: 'https://www.qutaifan.com/logo.jpg' } } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.qutaifan.com/' },
        { '@type': 'ListItem', position: 2, name: `Free Alternative to ${seed.product}`, item: url } ] },
      { '@type': 'ItemList', name: `Free alternatives to ${seed.product}`, numberOfItems: matches.length,
        itemListElement: matches.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: t.url })) },
      { '@type': 'FAQPage', mainEntity: faqJson },
    ]
  };

  const faqHtml = faq.map(f => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#08080a" />
  <meta name="google-adsense-account" content="${PUB_ID}">
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="alternate" type="application/rss+xml" title="Qutaifan RSS Feed" href="https://www.qutaifan.com/feed.xml" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="https://www.qutaifan.com/og-qutaifan-home.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB_ID}" crossorigin="anonymous"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-WKLJQZBWD1');</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-WKLJQZBWD1"></script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#121216;--bg-2:#1a1a20;--border:rgba(255,255,255,.07);--border-2:rgba(255,255,255,.15);--text:#e7e7ec;--text-2:#a8a8b5;--text-3:#85858f;--accent:#8a72e8;--cyan:#29b8d6;--r:12px;--r-lg:18px;--font:'Inter',system-ui,sans-serif}
    html{scroll-behavior:smooth}body{font-family:var(--font);font-size:16px;line-height:1.7;color:var(--text);background:var(--bg);-webkit-font-smoothing:antialiased}
    a{color:inherit;text-decoration:none}.wrap{max-width:1100px;margin:0 auto;padding:0 24px}
    nav{position:sticky;top:0;z-index:20;background:rgba(18,18,22,.9);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
    .nav-inner{height:56px;display:flex;align-items:center;justify-content:space-between}.nav-brand{font-weight:900;letter-spacing:.1em;text-transform:uppercase}
    .nav-links{display:flex;gap:18px;list-style:none;flex-wrap:wrap}.nav-links a{font-size:.76rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3)}
    .nav-links a:hover{color:var(--text)}
    .hero{position:relative;padding:80px 0 48px;text-align:center;overflow:hidden}
    .hero::before{content:'';position:absolute;top:-140px;left:50%;transform:translateX(-50%);width:850px;height:520px;background:radial-gradient(ellipse at center,rgba(138,114,232,.22),rgba(41,184,214,.08) 42%,transparent 72%);pointer-events:none}
    .breadcrumb{font-size:.84rem;color:var(--text-3);padding-top:14px}.breadcrumb a{color:var(--text-2)}
    .hero-badge{display:inline-flex;gap:8px;align-items:center;padding:6px 16px;border:1px solid rgba(138,114,232,.35);background:rgba(138,114,232,.1);border-radius:9999px;font-size:.8rem;font-weight:600;color:var(--accent)}
    .hero h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.1;margin:18px 0;letter-spacing:-.02em}
    .hero h1 span{color:var(--accent)}
    .hero-sub{max-width:680px;margin:0 auto;color:var(--text-2);font-size:1.08rem}
    .disclosure{margin:22px auto 0;max-width:760px;font-size:.85rem;color:var(--text-3);border:1px solid var(--border);border-left:3px solid var(--cyan);border-radius:10px;padding:12px 16px;text-align:left}
    .section{padding:48px 0}.section h2{font-size:clamp(1.4rem,3vw,2rem);margin-bottom:18px}
    .table-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:var(--r-lg)}
    .comparison-table{width:100%;border-collapse:collapse;min-width:560px}
    .comparison-table th,.comparison-table td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--border)}
    .comparison-table th{background:var(--bg-2);font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-3)}
    .comparison-table td{color:var(--text-2)}
    .pair-card{border:1px solid var(--border);border-radius:var(--r-lg);padding:26px;margin:22px 0;background:var(--bg-2)}
    .pair-kicker{font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
    .pair-card h2{font-size:1.5rem;margin-bottom:10px}
    .official-links{margin-bottom:10px;font-size:.85rem}.official-links a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(41,184,214,.3)}
    .pair-card p{color:var(--text-2);margin-bottom:12px}
    .fit{font-size:.92rem;color:var(--text-3)}
    .badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .badge{font-size:.7rem;font-family:var(--font);padding:.2rem .6rem;border-radius:9999px;background:rgba(41,184,214,.1);color:var(--cyan);border:1px solid rgba(41,184,214,.3);font-weight:600}
    .ad-slot-container{min-height:250px;background:var(--bg-2);border:1px dashed var(--border);border-radius:14px;padding:1.25rem;text-align:center;margin:30px 0}
    .ad-slot-container span{font-size:.68rem;color:var(--text-3);display:block;margin-bottom:.5rem;font-family:var(--font)}
    .faq-item{border-top:1px solid var(--border);padding:18px 0}.faq-item h3{font-size:1.05rem;margin-bottom:8px;color:var(--text)}.faq-item p{color:var(--text-2)}
    .related-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:18px}
    .related-card{display:block;background:var(--bg-2);border:1px solid var(--border);border-radius:var(--r);padding:18px;transition:border-color .15s}
    .related-card:hover{border-color:var(--accent)}
    .related-card strong{display:block;color:var(--cyan);margin-bottom:6px}.related-card span{color:var(--text-2);font-size:.88rem}
    footer{border-top:1px solid var(--border);margin-top:40px;padding:30px 0;color:var(--text-3);font-size:.85rem;text-align:center}
    footer a{color:var(--accent);text-decoration:none}
    a.qh-review-link{color:inherit;text-decoration:none;border-bottom:1px dotted rgba(41,184,214,.55)}a.qh-review-link:hover{color:var(--cyan)}
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>
</head>
<body>
<nav><div class="wrap nav-inner"><a href="/" class="nav-brand">QUTAIFAN</a><ul class="nav-links"><li><a href="/best-free-ai-tools-2026">Free AI Tools</a></li><li><a href="/best-open-source-software-alternatives-2026">Open Source</a></li><li><a href="/best-free-password-managers-2026">Password Managers</a></li><li><a href="/best-linux-distros-beginners-2026">Linux</a></li><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li></ul></div></nav>
<main>
<div class="wrap breadcrumb"><a href="/">Home</a> › Free Alternative to ${esc(seed.product)}</div>
<section class="hero"><div class="hero-badge">Free ${esc(seed.product)} alternatives · tested ${year}</div><h1>Free <span>Alternative to ${esc(seed.product)}</span><br>${matches.length} tools that cost $0</h1><p class="hero-sub">${esc(seed.product)} is ${seed.paid}. These ${matches.length} genuinely free tools cover what most people actually use it for — with the real limits named. No forced subscription.</p></section>
<div class="disclosure">No paid placements. No tracking links. Every link goes straight to the official project with rel="nofollow noopener".</div>
<section class="section"><div class="wrap">
  <h2>Quick comparison: free alternatives to ${esc(seed.product)}</h2>
  <div class="table-wrap"><table class="comparison-table"><thead><tr><th>Tool</th><th>Best for</th><th>Free model</th><th>Official</th></tr></thead><tbody>${rows}</tbody></table></div>
</div></section>
<section class="section"><div class="wrap"><h2>How we picked these</h2><p>${esc(seed.angle)} We matched the catalog's free and open-source tools to the job ${esc(seed.product)} is used for, then named each tool's honest trade-offs. The goal is to help you drop a subscription without losing the work you care about.</p></div></section>
<section class="section"><div class="wrap"><div class="section-label">The picks</div>
  <div class="ad-slot-container"><span>Advertisement</span><ins class="adsbygoogle" style="display:block;min-height:250px;" data-ad-client="${PUB_ID}" data-ad-slot="${AD_SLOT}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>
  ${cards}
</div></section>
<section class="section faq"><div class="wrap"><h2>Free ${esc(seed.product)} alternative FAQ</h2>${faqHtml}</div></section>
<section class="section"><div class="wrap"><div class="section-label">You might also like</div><h2>More free-first Qutaifan guides</h2><div class="related-grid">${related.map(r=>`<a class="related-card" href="${r.href}"><strong>${esc(r.t)}</strong><span>${esc(r.s)}</span></a>`).join('')}</div></div></section>
</main>
<footer><div class="wrap"><p>Ratings and "best" labels are editorial opinion only.</p><p><strong>QUTAIFAN</strong> — <a href="/">Home</a> · <a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/privacy-policy">Privacy Policy</a> · <a href="/terms-of-service">Terms</a></p><p>Updated ${MOD}</p></div></footer>
<div id="cookie-banner" role="dialog" aria-label="Cookie consent" style="position:fixed;bottom:0;left:0;right:0;background:rgba(18,18,22,.95);border-top:1px solid rgba(255,255,255,.07);padding:16px 24px;z-index:1000;display:flex;align-items:center;justify-content:center;gap:16px;font-size:14px;color:#a8a8b5;font-family:sans-serif"><p style="margin:0">We use cookies and similar technologies to analyze traffic, serve ads, and improve your experience. <a href="/privacy-policy" style="color:#8a72e8;text-decoration:none">Learn more</a>.</p><button onclick="document.getElementById('cookie-banner').style.display='none'" style="background:#8a72e8;color:#fff;border:none;padding:8px 20px;border-radius:8px;font-weight:600;cursor:pointer">Accept</button></div>
</body>
</html>`;
}

let built = 0, skipped = 0;
for (const seed of SEEDS) {
  const html = build(seed);
  if (!html) { skipped++; continue; }
  const file = path.join(ROOT, `free-alternative-to-${seed.slug}.html`);
  fs.writeFileSync(file, html, 'utf8');
  built++;
  console.log(`  ✓ built free-alternative-to-${seed.slug}.html`);
}
console.log(`\nDONE: ${built} alternative pages built, ${skipped} skipped (insufficient catalog coverage).`);
