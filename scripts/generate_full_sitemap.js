/**
 * Comprehensive Sitemap Generator Script
 * THEHUB by QUTAIFAN.COM (https://www.qutaifan.com/)
 * 
 * Automatically scans all landing pages, pSEO guides, and review pages to generate a complete sitemap.xml
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');
const TODAY = '2026-08-09';

console.log('🤖 Generating Complete XML Sitemap for THEHUB...');

const staticPages = [
  { url: 'https://www.qutaifan.com/', priority: '1.0', changefreq: 'daily' },
  { url: 'https://www.qutaifan.com/free-ai-prompt-generator/', priority: '0.9', changefreq: 'daily' },
  { url: 'https://www.qutaifan.com/best-free-ai-tools-2026/', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/best-free-ai-writing-tools-2026/', priority: '0.8', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/best-open-source-software-alternatives-2026/', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://www.qutaifan.com/best-free-password-managers-2026/', priority: '0.8', changefreq: 'monthly' },
  { url: 'https://www.qutaifan.com/best-free-video-editing-software-2026/', priority: '0.8', changefreq: 'monthly' },
  { url: 'https://www.qutaifan.com/best-free-photo-graphic-design-tools-2026/', priority: '0.8', changefreq: 'monthly' }
];

let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

staticPages.forEach(p => {
  xmlContent += `  <url>\n    <loc>${p.url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
});

// Scan all review files
const REVIEWS_DIR = path.join(ROOT_DIR, 'reviews');
if (fs.existsSync(REVIEWS_DIR)) {
  const reviewFiles = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.html'));
  console.log(`Adding ${reviewFiles.length} review pages to sitemap...`);

  reviewFiles.forEach(file => {
    const url = `https://www.qutaifan.com/reviews/${file}`;
    xmlContent += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });
}

xmlContent += `</urlset>\n`;

fs.writeFileSync(SITEMAP_PATH, xmlContent, 'utf8');

console.log(`🎉 Complete sitemap.xml generated with ${staticPages.length + (fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.html')).length)} URLs!`);
