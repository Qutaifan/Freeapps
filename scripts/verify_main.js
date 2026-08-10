const fs = require('fs');

console.log('--- 🔍 LIVE VERIFICATION REPORT FOR MAIN BRANCH ---');

// 1. Sitemap Check
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const locCount = (sitemap.match(/<loc>/g) || []).length;
const hasHtmlInSitemap = sitemap.includes('.html');
console.log(`1. Sitemap Total URLs: ${locCount}`);
console.log(`1. Sitemap Contains .html: ${hasHtmlInSitemap} (Expected: false)`);

// 2. Review Page Check (reviews/bitwarden.html)
const bitwarden = fs.readFileSync('reviews/bitwarden.html', 'utf8');
const canonicalMatch = bitwarden.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
const hasSoftwareSchema = bitwarden.includes('SoftwareApplication');
const hasMinHeight = bitwarden.includes('min-height: 250px');
const hasRelatedTools = bitwarden.includes('Related Software Tools');
const hasAuthorLink = bitwarden.includes('/author/qutaifan-editorial-board');

console.log(`2. Bitwarden Canonical URL: ${canonicalMatch}`);
console.log(`2. SoftwareApplication Schema: ${hasSoftwareSchema}`);
console.log(`2. Min-height: 250px Container: ${hasMinHeight}`);
console.log(`2. Related Tools Cross-Links: ${hasRelatedTools}`);
console.log(`2. Author Page Link: ${hasAuthorLink}`);

// 3. Logo Check
const logoSize = Math.round(fs.statSync('logo.jpg').size / 1024);
console.log(`3. logo.jpg File Size: ${logoSize} KB (Expected: ~14 KB)`);

// 4. Author Page Check
const authorExists = fs.existsSync('author/qutaifan-editorial-board/index.html');
console.log(`4. Author Page Exists: ${authorExists}`);

console.log('--- ✅ VERIFICATION COMPLETE ---');
