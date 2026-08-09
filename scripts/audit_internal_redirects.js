/**
 * Internal Link & Redirect Consistency Auditor
 * THEHUB by QUTAIFAN.COM (https://www.qutaifan.com/)
 * 
 * Verifies that all internal links and canonical tags point directly to fully-qualified https://www.qutaifan.com/ target URLs.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

console.log('🔍 Auditing internal links and canonical redirects...');

let issuesFound = 0;

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replace http:// with https:// for qutaifan.com
  if (newContent.includes('http://qutaifan.com') || newContent.includes('http://www.qutaifan.com')) {
    newContent = newContent.replace(/http:\/\/qutaifan\.com/g, 'https://www.qutaifan.com');
    newContent = newContent.replace(/http:\/\/www\.qutaifan\.com/g, 'https://www.qutaifan.com');
    issuesFound++;
  }

  // Replace non-www https://qutaifan.com with https://www.qutaifan.com
  if (newContent.includes('https://qutaifan.com')) {
    newContent = newContent.replace(/https:\/\/qutaifan\.com/g, 'https://www.qutaifan.com');
    issuesFound++;
  }

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

// Audit root HTML files
const rootFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
rootFiles.forEach(f => auditFile(path.join(ROOT_DIR, f)));

// Audit review HTML files
const REVIEWS_DIR = path.join(ROOT_DIR, 'reviews');
if (fs.existsSync(REVIEWS_DIR)) {
  const reviewFiles = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.html'));
  reviewFiles.forEach(f => auditFile(path.join(REVIEWS_DIR, f)));
}

console.log(`\n🎉 Audit Completed! Resolved ${issuesFound} non-canonical / redirect link references.`);
