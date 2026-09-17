/**
 * Batch 1 audit: FINANCE + EDUCATION calculators.
 * Cross-references registry -> lazyComponents -> component file -> status.
 * Emits a work queue ordered: live-but-unverified first, then soon.
 */
const fs = require('fs');
const ts = require('typescript');
const path = require('path');

const COMPS = 'src/domains/calculator/components';
const fin = JSON.parse(fs.readFileSync('scratch/_audit_FINANCE.json', 'utf8'));
const edu = JSON.parse(fs.readFileSync('scratch/_audit_EDUCATION.json', 'utf8'));

// lazyComponents map
const lc = fs.readFileSync('src/app/calculator/lazyComponents.tsx', 'utf8');
const keyRe = /^\s*"([^"]+)": \(\) => import\("([^"]+)"\)/gm;
const lazyMap = {};
let m;
while ((m = keyRe.exec(lc))) lazyMap[m[1]] = m[2];

// component files on disk
const files = new Set(fs.readdirSync(COMPS).filter(f => f.endsWith('.tsx')));

// approved list (by component name, no .tsx)
let approved = { approved: [], slugs: [] };
try {
  approved = JSON.parse(fs.readFileSync(path.join(COMPS, '_approved.json'), 'utf8'));
} catch (e) { console.log('no _approved.json:', e.message); }

function classify(entries, label) {
  const rows = [];
  for (const e of entries) {
    const slug = e.slug;
    const lazyPath = lazyMap[slug];
    let lazyOk = !!lazyPath;
    let fileOk = false;
    let lazyTargetFile = null;
    if (lazyPath) {
      // "@/domains/calculator/components/X" -> X.tsx
      const base = lazyPath.replace('@/', 'src/');
      lazyTargetFile = base + '.tsx';
      const baseName = path.basename(base);
      fileOk = files.has(baseName + '.tsx') || files.has(baseName + '.ts');
    }
    const compName = lazyTargetFile ? path.basename(lazyTargetFile, path.extname(lazyTargetFile)) : null;
    const approvedOk = compName ? approved.approved.includes(compName) : false;
    rows.push({
      category: label,
      slug,
      name: e.name,
      status: e.status,
      isBuilt: e.isBuilt === true,
      subcategory: e.subcategory,
      registered: lazyOk,
      registeredPath: lazyPath || null,
      fileExists: fileOk,
      compName,
      approvedOk,
    });
  }
  return rows;
}

const finRows = classify(fin, 'FINANCE');
const eduRows = classify(edu, 'EDUCATION');
const all = finRows.concat(eduRows);

const stats = {
  FINANCE: { total: finRows.length, live: finRows.filter(r => r.status === 'live').length, soon: finRows.filter(r => r.status === 'soon').length },
  EDUCATION: { total: eduRows.length, live: eduRows.filter(r => r.status === 'live').length, soon: eduRows.filter(r => r.status === 'soon').length },
};

// Fabrication candidates: status live but not registered, or registered but file missing
const fab = all.filter(r => r.status === 'live' && (!r.registered || !r.fileExists));
// Soon entries that have both registration+file (may be buildable quickly)
const soonWithFile = all.filter(r => r.status === 'soon' && r.registered && r.fileExists);
const soonNoFile = all.filter(r => r.status === 'soon' && (!r.registered || !r.fileExists));
// Live entries approved
const liveApproved = all.filter(r => r.status === 'live' && r.approvedOk);
const liveUnapproved = all.filter(r => r.status === 'live' && !r.approvedOk);

console.log('=== STATS ===');
console.log(JSON.stringify(stats, null, 1));
console.log('FABRICATION candidates (live but unregistered/no file):', fab.length);
console.log('LIVE but not in _approved:', liveUnapproved.length, 'of', finRows.filter(r => r.status==='live').length + eduRows.filter(r => r.status==='live').length);
console.log('SOON with registration+file (pre-built, not live):', soonWithFile.length);
console.log('SOON with no registration/file:', soonNoFile.length);

fs.writeFileSync('scratch/_audit_rows.json', JSON.stringify(all, null, 1));
fs.writeFileSync('scratch/_audit_worklist.json', JSON.stringify({
  fab,
  liveUnapproved: liveUnapproved.map(r => ({ slug: r.slug, category: r.category, compName: r.compName, registered: r.registered, fileExists: r.fileExists })),
  soonWithFile: soonWithFile.map(r => ({ slug: r.slug, category: r.category, compName: r.compName })),
  soonNoFile: soonNoFile.map(r => ({ slug: r.slug, category: r.category })),
}, null, 1));

// Print first 40 live-unapproved to establish sub-batch order
console.log('\n=== FIRST 40 LIVE-UNAPPROVED (candidate sub-batch 1) ===');
liveUnapproved.slice(0, 40).forEach((r, i) => console.log(String(i + 1).padStart(3), r.category, r.slug, '->', r.compName, r.registered ? '' : '(NOT REGISTERED)', r.fileExists ? '' : '(NO FILE)'));
