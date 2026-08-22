/**
 * Safe & Compliant Sitemap Generator Script (Cloudflare Pages 200 Canonical Compatible)
 * THEHUB by QUTAIFAN.COM (https://www.qutaifan.com/)
 * 
 * Contract (per AGENTS.md §7):
 * - Dry-run by default (--check mode).
 * - Writes only when --apply flag is provided.
 * - Filters out noindex pages sitewide (matches lifecycle indexability sync).
 * - Formats 200 canonical URLs correctly (directory index.html -> trailing slash, single .html -> extensionless).
 * - Idempotent output with verification metrics.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');
const DOMAIN = 'https://www.qutaifan.com';

const IS_APPLY = process.argv.includes('--apply');
const TODAY = new Date().toISOString().split('T')[0];

function isNoIndex(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const headMatch = content.match(/<head[\s\S]*?<\/head>/i);
    const head = headMatch ? headMatch[0] : content;
    return /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(head);
  } catch (err) {
    return false;
  }
}

function getCanonicalUrl(relPath) {
  const posixPath = relPath.replace(/\\/g, '/');

  // Root homepage
  if (posixPath === 'index.html') {
    return `${DOMAIN}/`;
  }

  // Directory index pages (e.g. reviews/index.html, vs/claude-vs-chatgpt/index.html) -> trailing slash
  if (posixPath.endsWith('/index.html')) {
    const dir = posixPath.slice(0, -'/index.html'.length);
    return `${DOMAIN}/${dir}/`;
  }

  // Single HTML files (e.g. best-free-ai-tools-2026.html, reviews/chatgpt.html) -> extensionless
  if (posixPath.endsWith('.html')) {
    const slug = posixPath.slice(0, -5);
    return `${DOMAIN}/${slug}`;
  }

  return null;
}

function getPriorityAndFreq(url) {
  if (url === `${DOMAIN}/`) {
    return { priority: '1.0', changefreq: 'daily' };
  }
  if (url.includes('/free-ai-prompt-generator') || url.includes('/reviews/')) {
    return { priority: url.endsWith('/reviews/') ? '0.9' : '0.7', changefreq: 'weekly' };
  }
  if (url.includes('/best-') || url.includes('/vs/')) {
    return { priority: '0.8', changefreq: 'weekly' };
  }
  return { priority: '0.7', changefreq: 'monthly' };
}

function collectSiteUrls() {
  const urls = [];
  const EXEMPT_DIRS = new Set(['.git', '.github', '.agents', '.claude', '_next', 'freeapps-components', 'MY-NOTES', 'node_modules']);
  const EXEMPT_FILES = new Set(['404.html', 'hero-circuit-demo.html']);

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!EXEMPT_DIRS.has(entry.name)) {
          scanDir(path.join(dir, entry.name));
        }
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(ROOT_DIR, fullPath);

        if (EXEMPT_FILES.has(relPath.replace(/\\/g, '/'))) continue;
        if (isNoIndex(fullPath)) continue;

        const canonicalUrl = getCanonicalUrl(relPath);
        if (canonicalUrl) {
          const { priority, changefreq } = getPriorityAndFreq(canonicalUrl);
          urls.push({ url: canonicalUrl, priority, changefreq });
        }
      }
    }
  }

  scanDir(ROOT_DIR);

  // Sort URLs deterministically: homepage first, then alphabetical
  urls.sort((a, b) => {
    if (a.url === `${DOMAIN}/`) return -1;
    if (b.url === `${DOMAIN}/`) return 1;
    return a.url.localeCompare(b.url);
  });

  return urls;
}

function buildSitemapXml(urls) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const p of urls) {
    xml += `  <url>\n    <loc>${p.url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
  }
  xml += `</urlset>\n`;
  return xml;
}

function main() {
  console.log(`🤖 THEHUB Sitemap Generator [Mode: ${IS_APPLY ? 'APPLY' : 'CHECK (dry-run)'}]`);
  
  const siteUrls = collectSiteUrls();
  const generatedXml = buildSitemapXml(siteUrls);
  
  let currentXml = '';
  if (fs.existsSync(SITEMAP_PATH)) {
    currentXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  }

  const reviewUrlsCount = siteUrls.filter(u => u.url.includes('/reviews/') && u.url !== `${DOMAIN}/reviews/`).length;
  console.log(`Found ${siteUrls.length} indexable URLs sitewide (${reviewUrlsCount} review pages).`);

  if (currentXml === generatedXml) {
    console.log('✅ sitemap.xml is already 100% up-to-date and in sync.');
    return;
  }

  if (!IS_APPLY) {
    console.log('⚠️ Changes detected! Re-run with --apply to write to sitemap.xml.');
    console.log(`Current size: ${currentXml.length} bytes -> Generated size: ${generatedXml.length} bytes`);
    return;
  }

  fs.writeFileSync(SITEMAP_PATH, generatedXml, 'utf8');
  console.log(`🎉 sitemap.xml successfully updated with ${siteUrls.length} URLs (${reviewUrlsCount} indexable reviews).`);
}

main();
