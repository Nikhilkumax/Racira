/**
 * Phase 4: set isBuilt: true on every verified live FINANCE/EDUCATION registry
 * entry that doesn't already have the flag (425 FINANCE + 36 EDUCATION).
 * Only touches entries with status: "live" — soon entries untouched.
 */
const fs = require('fs');

const FILES = {
  'src/domains/calculator/registry/finance.ts': 'scratch/_audit_FINANCE.json',
  'src/domains/calculator/registry/education.ts': 'scratch/_audit_EDUCATION.json',
};

for (const [regFile, dataFile] of Object.entries(FILES)) {
  const entries = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  let src = fs.readFileSync(regFile, 'utf8');
  let flipped = 0, already = 0;
  for (const e of entries) {
    if (e.status !== 'live') continue;
    if (e.isBuilt === true) { already++; continue; }
    // Append isBuilt: true inside this entry's object: find the entry by slug
    const esc = e.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // entry pattern: { slug: "X", ... status: "live" } (single-line or multi-line)
    const re = new RegExp(`(\\{[^{}]*?slug: "${esc}"[^{}]*?status: "live")([,\\s}])`);
    if (re.test(src)) {
      src = src.replace(re, (m, a, b) => {
        if (b === ',') return a + ', isBuilt: true' + b;
        return a.slice(0, -1) + ', isBuilt: true }'; // b was '}' — need to keep the closing
      });
      flipped++;
    } else {
      console.log('MISS:', e.slug);
    }
  }
  fs.writeFileSync(regFile, src);
  console.log(regFile, '— flipped:', flipped, 'already-flagged:', already);
}
