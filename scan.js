const fs = require('fs');
const path = require('path');

const componentsDir = 'src/domains/calculator/components';
const registryDir = 'src/domains/calculator/registry';
const approvedFile = 'src/domains/calculator/components/_approved.json';

const approvedRaw = fs.readFileSync(approvedFile, 'utf8');
const approved = JSON.parse(approvedRaw.replace(/^\uFEFF/, ''));
const approvedSet = new Set(approved.approved);

const stubPatterns = ['"Value A"', '"Value B"', '"Coming Soon"', '"This calculator is planned"', '"Back to Calculators"', '"planned for a future"'];

const tsxFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') && !f.includes('_test'));
const tsxFileSet = new Set(tsxFiles);

const slugToFile = {};
for (const f of tsxFiles) {
  slugToFile[f.replace('.tsx', '')] = f;
}

function slugToPascal(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function slugToPascalWithCalc(slug) {
  const pascal = slugToPascal(slug);
  if (pascal.endsWith('Calculator')) return pascal;
  return pascal + 'Calculator';
}

const registryFiles = fs.readdirSync(registryDir).filter(f => f.endsWith('.ts'));

const allEntries = [];

for (const rf of registryFiles) {
  const content = fs.readFileSync(path.join(registryDir, rf), 'utf8');
  const entries = content.split(/\{\s*slug:/);

  for (let i = 1; i < entries.length; i++) {
    const block = '{slug:' + entries[i];
    const slugMatch = block.match(/slug:\s*"([^"]+)"/);
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    const statusMatch = block.match(/status:\s*"(\w+)"/);
    const categoryMatch = block.match(/category:\s*"([^"]+)"/);
    const subcategoryMatch = block.match(/subcategory:\s*"([^"]+)"/);

    if (slugMatch) {
      allEntries.push({
        slug: slugMatch[1],
        name: nameMatch ? nameMatch[1] : '',
        status: statusMatch ? statusMatch[1] : 'unknown',
        category: categoryMatch ? categoryMatch[1] : '',
        subcategory: subcategoryMatch ? subcategoryMatch[1] : '',
        sourceFile: rf
      });
    }
  }
}

const buckets = {
  approvedComplete: [],
  liveNotApproved: [],
  needsPolish: [],
  needsRebuild: [],
  notBuilt: []
};

for (const entry of allEntries) {
  const { slug, name, status, category, subcategory } = entry;

  const pascalSlug = slugToPascal(slug);
  const pascalWithCalc = slugToPascalWithCalc(slug);

  const file = slugToFile[pascalSlug] || slugToFile[pascalWithCalc] || null;

  if (!file) {
    buckets.notBuilt.push({ slug, category: subcategory || category });
    continue;
  }

  const filePath = path.join(componentsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const fileSize = fs.statSync(filePath).size;
  const fileSizeKB = fileSize / 1024;

  const hasStub = stubPatterns.some(p => content.includes(p));
  const hasRecharts = /import.*recharts|from\s+['"]recharts['"]|require\(['"]recharts['"]\)/i.test(content);
  const hasCalculate = /Calculate/.test(content);
  const isApproved = approvedSet.has(pascalSlug) || approvedSet.has(pascalWithCalc);

  if (isApproved && status === 'live' && !hasStub && fileSizeKB >= 8 && hasRecharts && hasCalculate) {
    buckets.approvedComplete.push(slug);
    continue;
  }

  if (status === 'live' && !hasStub && fileSizeKB >= 8 && hasRecharts && hasCalculate) {
    if (!isApproved) {
      buckets.liveNotApproved.push(slug);
      continue;
    }
  }

  if (hasStub) {
    buckets.needsRebuild.push({ slug, reason: 'stub placeholder found' });
    continue;
  }

  if (fileSizeKB < 8) {
    buckets.needsRebuild.push({ slug, reason: `file < 8KB (${fileSizeKB.toFixed(1)}KB)` });
    continue;
  }

  if (!hasRecharts) {
    buckets.needsRebuild.push({ slug, reason: 'no Recharts import' });
    continue;
  }

  if (!hasCalculate) {
    buckets.needsRebuild.push({ slug, reason: 'no Calculate button' });
    continue;
  }

  if (content.includes('"Coming Soon"') || content.includes('"This calculator is planned"') || content.includes('"planned for a future"') || content.includes('"Back to Calculators"')) {
    buckets.needsRebuild.push({ slug, reason: 'Coming Soon / planned UI' });
    continue;
  }

  if (status === 'soon') {
    buckets.needsRebuild.push({ slug, reason: 'status: "soon" in registry' });
    continue;
  }

  const issues = [];
  if (!hasCalculate) issues.push('no Calculate button');
  if (content.includes('subtitle') || content.includes('Subtitle')) issues.push('subtitle under H1');

  buckets.needsPolish.push({ slug, issues: issues.length > 0 ? issues : ['minor surface issues'] });
}

const totalRegistry = allEntries.length;
const totalComponents = tsxFiles.length;
const totalApproved = approvedSet.size;

const report = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total registry entries:        ${totalRegistry.toLocaleString()}
Total component files:         ${totalComponents.toLocaleString()}
Approved (_approved.json):       ${totalApproved.toLocaleString()}
─────────────────────────────────────────────────────
✅ Approved & Complete:          ${buckets.approvedComplete.length.toLocaleString()}
🟢 Live / Not Approved:          ${buckets.liveNotApproved.length.toLocaleString()}
🟠 Needs Polish:                 ${buckets.needsPolish.length.toLocaleString()}
🔴 Needs Rebuild:                ${buckets.needsRebuild.length.toLocaleString()}
🟡 Not Built:                    ${buckets.notBuilt.length.toLocaleString()}
─────────────────────────────────────────────────────
Total action needed:             ${(buckets.liveNotApproved.length + buckets.needsPolish.length + buckets.needsRebuild.length + buckets.notBuilt.length).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 LIVE / NOT APPROVED (${buckets.liveNotApproved.length})
${buckets.liveNotApproved.map(s => `  • ${s}`).join('\n')}

🟠 NEEDS POLISH (${buckets.needsPolish.length})
${buckets.needsPolish.map(s => `  • ${s.slug} — ${s.issues.join(', ')}`).join('\n')}

🔴 NEEDS REBUILD (${buckets.needsRebuild.length})
${buckets.needsRebuild.map(s => `  • ${s.slug} — ${s.reason}`).join('\n')}

🟡 NOT BUILT (${buckets.notBuilt.length})
${buckets.notBuilt.map(s => `  • ${s.slug} — [${s.category}]`).join('\n')}
`;

fs.writeFileSync('status_report.md', report);
fs.writeFileSync('status_live_not_approved.txt', buckets.liveNotApproved.join('\n'));
fs.writeFileSync('status_polish.txt', buckets.needsPolish.map(s => `${s.slug} — ${s.issues.join('; ')}`).join('\n'));
fs.writeFileSync('status_rebuild.txt', buckets.needsRebuild.map(s => `${s.slug} — ${s.reason}`).join('\n'));
fs.writeFileSync('status_not_built.txt', buckets.notBuilt.map(s => `${s.slug} — [${s.category}]`).join('\n'));

console.log('Scan complete.');
console.log(`Total registry: ${totalRegistry}, Components: ${totalComponents}, Approved: ${totalApproved}`);
console.log(`✅ Approved & Complete: ${buckets.approvedComplete.length}`);
console.log(`🟢 Live / Not Approved: ${buckets.liveNotApproved.length}`);
console.log(`🟠 Needs Polish: ${buckets.needsPolish.length}`);
console.log(`🔴 Needs Rebuild: ${buckets.needsRebuild.length}`);
console.log(`🟡 Not Built: ${buckets.notBuilt.length}`);
