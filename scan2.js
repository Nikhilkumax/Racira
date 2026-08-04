// Read-only status scan. Writes report files; edits no calculator source.
const fs = require('fs');
const path = require('path');

const componentsDir = 'src/domains/calculator/components';
const registryDir = 'src/domains/calculator/registry';
const approvedFile = path.join(componentsDir, '_approved.json');
const lazyFile = 'src/app/calculator/lazyComponents.tsx';

const approved = JSON.parse(fs.readFileSync(approvedFile, 'utf8').replace(/^﻿/, ''));
const approvedSet = new Set(approved.approved);

// ---- authoritative slug -> component map (from the real route loader) ----
const lazySrc = fs.readFileSync(lazyFile, 'utf8');
const slugToComponent = {};
const mapRe = /"([^"]+)":\s*\(\)\s*=>\s*import\("@\/domains\/calculator\/components\/([^"]+)"\)/g;
let m;
while ((m = mapRe.exec(lazySrc)) !== null) slugToComponent[m[1]] = m[2];

const tsxFiles = new Set(
  fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx')).map(f => f.replace(/\.tsx$/, ''))
);

const pascal = s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

function resolve(slug) {
  const mapped = slugToComponent[slug];
  if (mapped && tsxFiles.has(mapped)) return { base: mapped, routed: true };
  if (mapped && !tsxFiles.has(mapped)) return { base: null, routed: true, brokenMap: mapped };
  const p = pascal(slug);
  const pc = p.endsWith('Calculator') ? p : p + 'Calculator';
  for (const cand of [p, pc]) if (tsxFiles.has(cand)) return { base: cand, routed: false };
  return { base: null, routed: false };
}

// ---- registry entries ----
const stubPatterns = ['"Value A"', '"Value B"', '"Coming Soon"', '"This calculator is planned"',
  '"planned for a future"', '"Back to Calculators"'];

const entries = [];
const seen = new Map();
for (const rf of fs.readdirSync(registryDir).filter(f => f.endsWith('.ts'))) {
  const content = fs.readFileSync(path.join(registryDir, rf), 'utf8');
  const blocks = content.split(/\{\s*slug:/).slice(1);
  for (const b of blocks) {
    const block = '{slug:' + b;
    const g = (re) => { const x = block.match(re); return x ? x[1] : ''; };
    const slug = g(/slug:\s*"([^"]+)"/);
    if (!slug) continue;
    const e = {
      slug,
      name: g(/name:\s*"([^"]+)"/),
      status: g(/status:\s*"(\w+)"/) || 'unknown',
      category: g(/category:\s*"([^"]+)"/),
      subcategory: g(/subcategory:\s*"([^"]+)"/),
      sourceFile: rf,
    };
    if (seen.has(slug)) { // keep the 'live' one if duplicated across registry files
      const prev = seen.get(slug);
      if (prev.status !== 'live' && e.status === 'live') Object.assign(prev, e);
      prev._dupe = true;
      continue;
    }
    seen.set(slug, e);
    entries.push(e);
  }
}
const duplicateSlugs = entries.filter(e => e._dupe).length;

const B = { approvedComplete: [], liveNotApproved: [], needsPolish: [], needsRebuild: [], notBuilt: [] };
const unrouted = [], brokenMap = [];

for (const e of entries) {
  const { slug, name, status, category, subcategory } = e;
  const label = name || slug;
  const cat = subcategory || category;
  const r = resolve(slug);

  if (r.brokenMap) brokenMap.push(`${slug} -> ${r.brokenMap}`);
  if (!r.base) { B.notBuilt.push({ slug, label, category: cat, status }); continue; }
  if (!r.routed) unrouted.push(slug);

  const c = fs.readFileSync(path.join(componentsDir, r.base + '.tsx'), 'utf8');
  const kb = fs.statSync(path.join(componentsDir, r.base + '.tsx')).size / 1024;

  const stubHit = stubPatterns.find(p => c.includes(p));
  const hasRecharts = /from\s+["']recharts["']/.test(c);
  const exactCalc = />\s*Calculate\s*</.test(c);
  const variantCalc = />\s*Calculate\s+[^<]{1,40}</.test(c) || /(?:label|children)\s*[=:]\s*["']Calculate\s+[^"']{1,40}["']/.test(c);
  const anyCalcBtn = exactCalc || variantCalc || /onClick=\{[^}]*(?:handleCalculate|calculate)/i.test(c);
  const hasPrimaryCard = (/border-l-4/.test(c) && /border-primary/.test(c)) || /bg-primary\/10/.test(c);

  // ---- core checks -> REBUILD ----
  let reason = null;
  if (stubHit) reason = `stub placeholder (${stubHit})`;
  else if (kb < 8) reason = `file < 8KB (${kb.toFixed(1)}KB)`;
  else if (!hasRecharts) reason = 'no Recharts import';
  else if (!anyCalcBtn) reason = 'no Calculate button';
  else if (!hasPrimaryCard) reason = 'missing Primary Result Card pattern';
  else if (status === 'soon') reason = 'status: "soon" in registry';
  if (reason) { B.needsRebuild.push({ slug, label, reason }); continue; }

  // ---- surface checks -> POLISH ----
  const issues = [];
  if (!exactCalc) issues.push('Calculate button label not exactly "Calculate"');

  const h1i = c.indexOf('</h1>');
  if (h1i !== -1) {
    const after = c.slice(h1i + 5, h1i + 305);
    const cut = after.search(/<div[^>]*(?:grid|lg:grid)/);
    if (/<p[\s>]/.test(cut === -1 ? after : after.slice(0, cut))) issues.push('subtitle line under H1');
  }
  if (/Advanced Options/.test(c) && !/uppercase tracking-wide/.test(c))
    issues.push('Advanced Options inputs not grouped into labeled sub-sections');

  const dm = c.match(/(?:const\s+DEFAULTS[^=]*=\s*|useState[^(]*\(\s*)\{([\s\S]{0,700}?)\}/);
  if (dm) {
    const firstFields = dm[1].split(',').slice(0, 4).join(',');
    if (/:\s*0\s*(?:,|$)/.test(firstFields) || /:\s*""/.test(firstFields))
      issues.push('possible zero/empty default in a normal-tier input (heuristic)');
  }

  const isApproved = approvedSet.has(r.base);
  if (isApproved && status === 'live') { B.approvedComplete.push(slug); continue; }
  if (issues.length) { B.needsPolish.push({ slug, label, issues: issues.slice(0, 5) }); continue; }
  if (status === 'live') { B.liveNotApproved.push({ slug, label }); continue; }
  B.needsPolish.push({ slug, label, issues: [`registry status "${status}"`] });
}

const n = x => x.toLocaleString();
const actionNeeded = B.liveNotApproved.length + B.needsPolish.length + B.needsRebuild.length + B.notBuilt.length;

const header = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total registry entries:        ${n(entries.length)}
Total component files:         ${n(tsxFiles.size)}
Approved (_approved.json):       ${n(approvedSet.size)}
─────────────────────────────────────────────────────
✅ Approved & Complete:          ${n(B.approvedComplete.length)}
🟢 Live / Not Approved:          ${n(B.liveNotApproved.length)}
🟠 Needs Polish:                 ${n(B.needsPolish.length)}
🔴 Needs Rebuild:                ${n(B.needsRebuild.length)}
🟡 Not Built:                    ${n(B.notBuilt.length)}
─────────────────────────────────────────────────────
Total action needed:             ${n(actionNeeded)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

const report = `${header}

🟢 LIVE / NOT APPROVED (${B.liveNotApproved.length})
${B.liveNotApproved.map(s => `  • ${s.label} — ${s.slug}`).join('\n')}

🟠 NEEDS POLISH (${B.needsPolish.length})
${B.needsPolish.map(s => `  • ${s.label} — ${s.issues.join('; ')}`).join('\n')}

🔴 NEEDS REBUILD (${B.needsRebuild.length})
${B.needsRebuild.map(s => `  • ${s.label} — ${s.reason}`).join('\n')}

🟡 NOT BUILT (${B.notBuilt.length})
${B.notBuilt.map(s => `  • ${s.slug} — [${s.category}]`).join('\n')}

─────────────────────────────────────────────────────
DATA-INTEGRITY NOTES (not buckets)
Duplicate slugs across registry files: ${duplicateSlugs}
Component file exists but slug NOT in lazyComponents map (unrouted): ${unrouted.length}
lazyComponents maps slug to a missing file (broken import): ${brokenMap.length}
${brokenMap.map(s => `  ! ${s}`).join('\n')}
`;

fs.writeFileSync('status_report.md', report);
fs.writeFileSync('status_live_not_approved.txt', B.liveNotApproved.map(s => s.slug).join('\n'));
fs.writeFileSync('status_polish.txt', B.needsPolish.map(s => `${s.slug} — ${s.issues.join('; ')}`).join('\n'));
fs.writeFileSync('status_rebuild.txt', B.needsRebuild.map(s => `${s.slug} — ${s.reason}`).join('\n'));
fs.writeFileSync('status_not_built.txt', B.notBuilt.map(s => `${s.slug} — [${s.category}]`).join('\n'));
if (unrouted.length) fs.writeFileSync('status_unrouted.txt', unrouted.join('\n'));

console.log(header);
console.log('\nRebuild reasons:');
const byReason = {};
for (const r of B.needsRebuild) { const k = r.reason.replace(/\([^)]*\)/, '').trim(); byReason[k] = (byReason[k] || 0) + 1; }
for (const [k, v] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) console.log(`  ${v}\t${k}`);
console.log('\nPolish issues:');
const byIssue = {};
for (const r of B.needsPolish) for (const i of r.issues) byIssue[i] = (byIssue[i] || 0) + 1;
for (const [k, v] of Object.entries(byIssue).sort((a, b) => b[1] - a[1])) console.log(`  ${v}\t${k}`);
console.log(`\nIntegrity: dupes=${duplicateSlugs} unrouted=${unrouted.length} brokenMap=${brokenMap.length}`);
