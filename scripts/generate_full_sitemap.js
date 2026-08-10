/**
 * Comprehensive Extensionless Sitemap Generator Script (Cloudflare Pages 308 Compatible)
 * THEHUB by QUTAIFAN.COM (https://www.qutaifan.com/)
 * 
 * Automatically generates sitemap.xml using 100% clean extensionless URLs (no .html suffixes)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');
const TODAY = '2026-08-11';

console.log('🤖 Generating Complete Extensionless XML Sitemap for THEHUB...');

const staticPages = [
  { url: 'https://www.qutaifan.com/', priority: '1.0', changefreq: 'daily' },
  { url: 'https://www.qutaifan.com/free-ai-prompt-generator', priority: '0.9', changefreq: 'daily' },
  { url: 'https://www.qutaifan.com/best-free-ai-tools-2026', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/best-free-ai-writing-tools-2026', priority: '0.8', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/best-open-source-software-alternatives-2026', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/best-free-password-managers-2026', priority: '0.8', changefreq: 'monthly' },
  { url: 'https://www.qutaifan.com/best-free-video-editing-software-2026', priority: '0.8', changefreq: 'monthly' },
  { url: 'https://www.qutaifan.com/best-free-photo-graphic-design-tools-2026', priority: '0.8', changefreq: 'monthly' },
  { url: 'https://www.qutaifan.com/author/qutaifan-editorial-board', priority: '0.8', changefreq: 'monthly' },
  { url: 'https://www.qutaifan.com/how-to/how-to-choose-the-best-free-software-2026', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/vs/claude-vs-chatgpt', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/vs/bitwarden-vs-keepassxc', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/reviews', priority: '0.9', changefreq: 'daily' }
];

let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

staticPages.forEach(p => {
  xmlContent += `  <url>\n    <loc>${p.url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
});

// Scan all review files and output clean extensionless URLs
const REVIEWS_DIR = path.join(ROOT_DIR, 'reviews');
if (fs.existsSync(REVIEWS_DIR)) {
  const reviewFiles = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
  console.log(`Adding ${reviewFiles.length} extensionless review pages to sitemap...`);

  reviewFiles.forEach(file => {
    const slug = file.replace('.html', '');
    const url = `https://www.qutaifan.com/reviews/${slug}`;
    xmlContent += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });
}

xmlContent += `</urlset>\n`;

fs.writeFileSync(SITEMAP_PATH, xmlContent, 'utf8');

console.log(`🎉 Extensionless sitemap.xml generated with ${staticPages.length + (fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.html') && f !== 'index.html').length)} 200-OK URLs!`);
