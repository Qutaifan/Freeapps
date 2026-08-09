/**
 * Search Console Indexing Fixer Script
 * THEHUB by QUTAIFAN.COM (https://www.qutaifan.com/)
 * 
 * Replaces `noindex, follow` with `index, follow, max-image-preview:large` across all review HTML pages.
 * Fixes canonical URLs to point to valid `.html` target paths.
 */

const fs = require('fs');
const path = require('path');

const REVIEWS_DIR = path.join(__dirname, '..', 'reviews');

console.log('🔍 Executing Search Console Indexing Fixer...');

try {
  const files = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.html'));
  console.log(`Found ${files.length} review HTML pages to update.`);

  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(REVIEWS_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let modified = false;

    // 1. Replace noindex tag with index, follow
    if (content.includes('content="noindex, follow"') || content.includes('content="noindex"')) {
      content = content.replace(
        /meta name="robots" content="noindex,?\s*follow?"/g,
        'meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"'
      );
      content = content.replace(
        /meta name="robots" content="noindex"/g,
        'meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"'
      );
      modified = true;
    }

    // 2. Fix Canonical URLs to include .html or exact path
    const slug = file.replace('.html', '');
    const oldCanonicalRegex = new RegExp(`link rel="canonical" href="https:\\/\\/www\\.qutaifan\\.com\\/reviews\\/${slug}"`, 'g');
    if (oldCanonicalRegex.test(content)) {
      content = content.replace(
        `link rel="canonical" href="https://www.qutaifan.com/reviews/${slug}"`,
        `link rel="canonical" href="https://www.qutaifan.com/reviews/${slug}.html"`
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
    }
  });

  console.log(`\n🎉 SUCCESSFULLY FIXED ${updatedCount} review pages!`);
  console.log('✅ All review pages now have `index, follow` and valid canonical URLs.');

} catch (err) {
  console.error('❌ Indexing Fixer Failed:', err.message);
  process.exit(1);
}
