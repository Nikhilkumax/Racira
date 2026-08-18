const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, 'src/domains/calculator/components');
const REGISTRY_DIR = path.join(__dirname, 'src/domains/calculator/registry');
const APPROVED_FILE = path.join(COMPONENTS_DIR, '_approved.json');

const STUB_PATTERNS = ['Value A', 'Value B', 'Coming Soon', 'This calculator is planned', 'planned for a future', 'Back to Calculators'];

function slugToPascal(slug) {
  return slug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

// Read approved list
const approvedData = JSON.parse(fs.readFileSync(APPROVED_FILE, 'utf8'));
const approvedSet = new Set(approvedData.approved.map(s => s.replace(/\.tsx$/, '')));

// Read all registry entries
const registryFiles = fs.readdirSync(REGISTRY_DIR).filter(f => f.endsWith('.ts'));
const registryEntries = [];
for (const file of registryFiles) {
  const content = fs.readFileSync(path.join(REGISTRY_DIR, file), 'utf8');
  const re = /slug:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?category:\s*["']([^"']+)["'][\s\S]*?status:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    registryEntries.push({ slug: m[1], name: m[2], category: m[3], status: m[4], sourceFile: file });
  }
}

// Component files on disk
const componentFileNames = fs.readdirSync(COMPONENTS_DIR)
  .filter(f => f.endsWith('.tsx') && !f.startsWith('_'))
  .map(f => f.replace('.tsx', ''));
const componentSet = new Set(componentFileNames);

function findFile(slug) {
  const pascal = slugToPascal(slug);
  if (componentSet.has(pascal)) return pascal;
  if (componentSet.has(slug)) return slug;
  return null;
}

function analyzeFile(fileName) {
  const filePath = path.join(COMPONENTS_DIR, fileName + '.tsx');
  if (!fs.existsSync(filePath)) return { exists: false };
  const content = fs.readFileSync(filePath, 'utf8');
  const size = fs.statSync(filePath).size;
  
  // Subtitle detection: look for a <p> or <span> that comes RIGHT AFTER </h1>
  // within ~100 chars and contains calculator/tool/estimate/comprehensive text
  const h1End = content.indexOf('</h1>');
  let hasSubtitle = false;
  if (h1End > -1) {
    const afterH1 = content.substring(h1End + 5, h1End + 300);
    // Match <p> or <span> with text content directly after h1
    const subtitleMatch = afterH1.match(/^\s*<(p|span|div)[^>]*class[^>]*text-muted[^>]*>([\s\S]{10,200}?)<\/\1>/i);
    if (subtitleMatch && /calculator|comprehensive|professional|estimate|tool|features/i.test(subtitleMatch[2])) {
      hasSubtitle = true;
    }
  }
  
  return {
    exists: true, size,
    sizeKB: (size / 1024).toFixed(1),
    stubPatterns: STUB_PATTERNS.filter(p => content.includes(p)),
    hasRecharts: /from\s*["']recharts["']/.test(content),
    hasCalcBtn: /<button[^>]*>[\s\S]*?Calculate[\s\S]*?<\/button>/i.test(content),
    hasPrimaryCard: /bg-primary\/10/.test(content) || /border-l-4\s+border-primary/.test(content),
    hasAdvOptions: /Advanced Options/.test(content),
    hasSubGroups: /text-xs\s+uppercase\s+tracking-wide/.test(content),
    hasSubtitle,
  };
}

// Buckets
const buckets = { approved: [], liveNotApproved: [], polish: [], rebuild: [], notBuilt: [] };
const seenSlugs = new Set();
const matchedComponents = new Set();

for (const entry of registryEntries) {
  if (seenSlugs.has(entry.slug)) continue;
  seenSlugs.add(entry.slug);

  const pascal = slugToPascal(entry.slug);
  const isApproved = approvedSet.has(entry.slug) || approvedSet.has(pascal);

  const fileName = findFile(entry.slug);
  if (!fileName) {
    buckets.notBuilt.push({ slug: entry.slug, name: entry.name, category: entry.category, status: entry.status });
    continue;
  }

  matchedComponents.add(fileName);
  const a = analyzeFile(fileName);
  if (!a.exists) {
    buckets.notBuilt.push({ slug: entry.slug, name: entry.name, category: entry.category, status: entry.status });
    continue;
  }

  // Core checks
  const core = [];
  if (a.stubPatterns.length) core.push(`stub placeholder (${a.stubPatterns.join(', ')})`);
  if (a.size < 8192) core.push(`file < 8KB (${a.sizeKB}KB)`);
  if (!a.hasRecharts) core.push('no Recharts import');
  if (!a.hasCalcBtn) core.push('no Calculate button');
  if (!a.hasPrimaryCard) core.push('missing Primary Result Card');
  if (entry.status === 'soon') core.push('status: "soon"');

  if (core.length) {
    buckets.rebuild.push({ slug: entry.slug, name: entry.name, category: entry.category, fileName, reason: core.join('; ') });
    continue;
  }

  // Surface checks
  const surface = [];
  if (a.hasSubtitle) surface.push('subtitle under H1');
  if (a.hasAdvOptions && !a.hasSubGroups) surface.push('Advanced Options inputs not grouped into labeled sub-sections');

  if (surface.length) {
    buckets.polish.push({ slug: entry.slug, name: entry.name, category: entry.category, fileName, issues: surface });
    continue;
  }

  if (!isApproved) {
    buckets.liveNotApproved.push({ slug: entry.slug, name: entry.name, category: entry.category, fileName });
  } else {
    buckets.approved.push({ slug: entry.slug, name: entry.name, category: entry.category, fileName });
  }
}

const orphanComponents = componentFileNames.filter(f => !matchedComponents.has(f));
const uniqueSlugs = [...new Set(registryEntries.map(e => e.slug))];

// Build report
let R = '';
R += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
R += 'RACIRA CALCULATOR — STATUS REPORT\n';
R += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
R += `Total registry entries (unique):  ${uniqueSlugs.length}\n`;
R += `Total component files (.tsx):     ${componentFileNames.length}\n`;
R += `Approved (_approved.json):         ${approvedSet.size}\n`;
R += '─────────────────────────────────────────────────────\n';
R += `✅ Approved & Complete:          ${buckets.approved.length}\n`;
R += `🟢 Live / Not Approved:          ${buckets.liveNotApproved.length}\n`;
R += `🟠 Needs Polish:                 ${buckets.polish.length}\n`;
R += `🔴 Needs Rebuild:                ${buckets.rebuild.length}\n`;
R += `🟡 Not Built:                    ${buckets.notBuilt.length}\n`;
R += '─────────────────────────────────────────────────────\n';
R += `Total action needed:             ${buckets.liveNotApproved.length + buckets.polish.length + buckets.rebuild.length + buckets.notBuilt.length}\n`;
R += `Orphan component files:          ${orphanComponents.length}\n`;
R += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

if (buckets.liveNotApproved.length) {
  R += `\n🟢 LIVE / NOT APPROVED (${buckets.liveNotApproved.length})\n`;
  buckets.liveNotApproved.forEach(c => R += `  • ${c.name} — [${c.category}]\n`);
}

if (buckets.polish.length) {
  R += `\n🟠 NEEDS POLISH (${buckets.polish.length})\n`;
  buckets.polish.forEach(c => R += `  • ${c.name} — ${c.issues.join('; ')}\n`);
}

if (buckets.rebuild.length) {
  R += `\n🔴 NEEDS REBUILD (${buckets.rebuild.length})\n`;
  buckets.rebuild.forEach(c => R += `  • ${c.name} — ${c.reason}\n`);
}

if (buckets.notBuilt.length) {
  R += `\n🟡 NOT BUILT (${buckets.notBuilt.length})\n`;
  buckets.notBuilt.slice(0, 200).forEach(c => R += `  • ${c.slug} — [${c.category}]\n`);
  if (buckets.notBuilt.length > 200) R += `  ... and ${buckets.notBuilt.length - 200} more\n`;
}

if (orphanComponents.length) {
  R += `\n📎 ORPHAN COMPONENTS (${orphanComponents.length})\n`;
  orphanComponents.slice(0, 30).forEach(c => R += `  • ${c}\n`);
  if (orphanComponents.length > 30) R += `  ... and ${orphanComponents.length - 30} more\n`;
}

console.log(R);

// Save files
fs.writeFileSync(path.join(__dirname, 'status_report.md'), R);
fs.writeFileSync(path.join(__dirname, 'status_live_not_approved.txt'), buckets.liveNotApproved.map(c => c.slug).join('\n'));
fs.writeFileSync(path.join(__dirname, 'status_polish.txt'), buckets.polish.map(c => `${c.slug} — ${c.issues.join('; ')}`).join('\n'));
fs.writeFileSync(path.join(__dirname, 'status_rebuild.txt'), buckets.rebuild.map(c => `${c.slug} — ${c.reason}`).join('\n'));
fs.writeFileSync(path.join(__dirname, 'status_not_built.txt'), buckets.notBuilt.map(c => `${c.slug} — [${c.category}]`).join('\n'));

console.log('\n✅ Files saved: status_report.md, status_live_not_approved.txt, status_polish.txt, status_rebuild.txt, status_not_built.txt');
