/**
 * Phase 4 (safe): set isBuilt: true on every verified live FINANCE/EDUCATION
 * registry entry lacking the flag. Insertion is always before the entry's
 * closing brace / after status: "live" — never inside a string.
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
    const esc = e.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Anchor: this entry's status: "live" (the one inside ITS object).
    // Entries are comma-separated objects; grab the smallest match from the
    // entry's opening { to the status literal.
    const re = new RegExp(`(slug: "${esc}"[\\s\\S]{0,2000}?status: "live")`, '');
    const m = src.match(re);
    if (!m) { console.log('MISS:', e.slug); continue; }
    const segStart = m.index;
    // find the object boundaries around the match: last { before slug, first } after status
    const open = src.lastIndexOf('{', segStart);
    const close = src.indexOf('}', m.index + m[0].length);
    if (open === -1 || close === -1) { console.log('BOUNDS MISS:', e.slug); continue; }
    const obj = src.slice(open, close + 1);
    if (/isBuilt:\s*true/.test(obj)) { already++; continue; }
    // insert ` isBuilt: true` before the closing brace
    const newObj = obj.slice(0, -1).replace(/\s*$/, '') + ', isBuilt: true }';
    src = src.slice(0, open) + newObj + src.slice(close + 1);
    flipped++;
  }
  fs.writeFileSync(regFile, src);
  console.log(regFile, '— flipped:', flipped, 'already:', already);
}
