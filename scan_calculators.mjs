// Racira Calculator Status Scanner
// Phase 1: Read-only scan — categorizes every calculator into 5 buckets

import fs from 'fs';
import path from 'path';

const ROOT = 'c:/Racira/racira-nextjs';
const COMPONENTS_DIR = path.join(ROOT, 'src/domains/calculator/components');
const REGISTRY_DIR = path.join(ROOT, 'src/domains/calculator/registry');
const APPROVED_FILE = path.join(COMPONENTS_DIR, '_approved.json');

// ─── 1. Parse _approved.json ─────────────────────────────────────────────
const approvedData = JSON.parse(fs.readFileSync(APPROVED_FILE, 'utf8'));
// Normalize: strip .tsx suffix if present, deduplicate
const approvedSet = new Set(
  approvedData.approved.map(s => s.replace(/\.tsx$/, ''))
);
// Also merge slugs array if present
if (approvedData.slugs) {
  approvedData.slugs.forEach(s => approvedSet.add(s.replace(/\.tsx$/, '')));
}

// ─── 2. Parse registry files ─────────────────────────────────────────────
// We'll extract slug, name, status, category from each registry .ts file
const registryFiles = fs.readdirSync(REGISTRY_DIR).filter(f => f.endsWith('.ts'));

const SLUG_RE = /slug:\s*["'`]([^"'`]+)["'`]/;
const NAME_RE = /name:\s*["'`]([^"'`]+)["'`]/;
const STATUS_RE = /status:\s*["'`](live|soon)["'`]/;
const CATEGORY_RE = /category:\s*["'`]([^"'`]+)["'`]/;

const registryEntries = [];
const seenSlugs = new Set();

for (const file of registryFiles) {
  const content = fs.readFileSync(path.join(REGISTRY_DIR, file), 'utf8');
  // Split by opening brace of each object in the array
  // Each calculator entry looks like { slug: "...", name: "...", ... }
  const blocks = content.split(/\{(?=[^}]*slug:)/g);
  
  for (const block of blocks) {
    const slugMatch = block.match(SLUG_RE);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    
    const nameMatch = block.match(NAME_RE);
    const statusMatch = block.match(STATUS_RE);
    const categoryMatch = block.match(CATEGORY_RE);
    
    registryEntries.push({
      slug,
      name: nameMatch ? nameMatch[1] : slug,
      status: statusMatch ? statusMatch[1] : 'unknown',
      category: categoryMatch ? categoryMatch[1] : file.replace('.ts', ''),
      registryFile: file
    });
  }
}

// ─── 3. List component files ─────────────────────────────────────────────
const componentFiles = fs.readdirSync(COMPONENTS_DIR)
  .filter(f => f.endsWith('.tsx'))
  .map(f => f.replace('.tsx', ''));
const componentFileSet = new Set(componentFiles);
const componentFileSizes = {};
for (const f of componentFiles) {
  const stat = fs.statSync(path.join(COMPONENTS_DIR, f + '.tsx'));
  componentFileSizes[f] = stat.size;
}

// ─── 4. Stub patterns ───────────────────────────────────────────────────
const STUB_PATTERNS = [
  '"Value A"',
  "'Value A'",
  '"Value B"',
  "'Value B'",
  '"Coming Soon"',
  "'Coming Soon'",
  '"This calculator is planned"',
  "'This calculator is planned'",
  '"planned for a future"',
  "'planned for a future'",
  '"Back to Calculators"',
  "'Back to Calculators'",
];

function getStubPatterns(content) {
  const found = [];
  for (const pat of STUB_PATTERNS) {
    if (content.includes(pat)) found.push(pat);
  }
  return found;
}

function hasRechartsImport(content) {
  return content.includes('recharts') || content.includes('Recharts');
}

function hasCalculateButton(content) {
  // Check for a Calculate button in various forms
  return content.includes('Calculate') || content.includes('calculate');
}

function hasCalculateButtonExact(content) {
  // Check if the button label is exactly "Calculate"
  // Look for patterns like >Calculate< or "Calculate" near button
  return />\s*Calculate\s*</.test(content) || /['"]Calculate['"]/.test(content);
}

function hasPrimaryResultCard(content) {
  return content.includes('bg-primary/10') || 
         content.includes('border-l-4') ||
         content.includes('border-primary');
}

// ─── 5. Slug to component file mapping ──────────────────────────────────
// Registry slugs are kebab-case, component files are PascalCase
// We need to build a mapping

function slugToComponentName(slug) {
  // Convert kebab-case to PascalCase
  return slug.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
}

// Build a lowercase map of component files for case-insensitive matching
const componentFileLower = {};
for (const f of componentFiles) {
  componentFileLower[f.toLowerCase()] = f;
}

function findComponentFile(slug) {
  // Direct match with PascalCase conversion
  const pascalCase = slugToComponentName(slug);
  if (componentFileSet.has(pascalCase)) return pascalCase;
  
  // Try direct slug match (some components may use slug directly)
  if (componentFileSet.has(slug)) return slug;
  
  // Case-insensitive match
  const lower = pascalCase.toLowerCase();
  if (componentFileLower[lower]) return componentFileLower[lower];
  
  return null;
}

// ─── 6. Categorize each calculator ──────────────────────────────────────

const buckets = {
  approved_complete: [],    // ✅
  live_not_approved: [],    // 🟢
  needs_polish: [],         // 🟠
  needs_rebuild: [],        // 🔴
  not_built: [],            // 🟡
};

for (const entry of registryEntries) {
  const componentName = findComponentFile(entry.slug);
  
  // 🟡 NOT BUILT — no matching file
  if (!componentName) {
    buckets.not_built.push({
      slug: entry.slug,
      name: entry.name,
      category: entry.category,
      status: entry.status,
      reason: 'File missing entirely'
    });
    continue;
  }
  
  const filePath = path.join(COMPONENTS_DIR, componentName + '.tsx');
  const content = fs.readFileSync(filePath, 'utf8');
  const fileSize = componentFileSizes[componentName];
  
  // Core checks
  const stubPatterns = getStubPatterns(content);
  const hasStubs = stubPatterns.length > 0;
  const hasRecharts = hasRechartsImport(content);
  const hasCalcBtn = hasCalculateButton(content);
  const isSmall = fileSize < 8192; // 8KB
  const isLive = entry.status === 'live';
  const isSoon = entry.status === 'soon';
  const isApproved = approvedSet.has(componentName) || approvedSet.has(entry.slug);
  
  // 🔴 NEEDS REBUILD — fails core checks
  const coreFailures = [];
  if (hasStubs) coreFailures.push(`stub placeholder (${stubPatterns[0]})`);
  if (isSmall) coreFailures.push(`file < 8KB (${(fileSize/1024).toFixed(1)}KB)`);
  if (!hasRecharts) coreFailures.push('no Recharts import');
  if (!hasCalcBtn) coreFailures.push('no Calculate button');
  if (isSoon) coreFailures.push('status: "soon" in registry');
  if (!hasPrimaryResultCard(content)) coreFailures.push('missing Primary Result Card pattern');
  
  if (coreFailures.length > 0) {
    buckets.needs_rebuild.push({
      slug: entry.slug,
      name: entry.name,
      componentName,
      category: entry.category,
      status: entry.status,
      fileSize,
      reason: coreFailures[0],
      allReasons: coreFailures
    });
    continue;
  }
  
  // At this point: file exists, no stubs, has Recharts, has Calculate, file > 8KB, status live
  // Check surface items for Polish
  const polishIssues = [];
  
  if (!hasCalculateButtonExact(content)) {
    polishIssues.push('Calculate button label may not be exactly "Calculate"');
  }
  
  // Check for subtitle under H1
  if (/<h1[^>]*>[\s\S]*?<\/h1>[\s\S]*?<p[^>]*class[^>]*text-muted/.test(content) ||
      /<h1[^>]*>[\s\S]*?<\/h1>\s*<p/.test(content)) {
    // This is a rough check - could have false positives
    // polishIssues.push('possible subtitle under H1');
  }
  
  if (polishIssues.length > 0 && !isApproved) {
    buckets.needs_polish.push({
      slug: entry.slug,
      name: entry.name,
      componentName,
      category: entry.category,
      status: entry.status,
      fileSize,
      issues: polishIssues
    });
    continue;
  }
  
  // ✅ APPROVED & COMPLETE vs 🟢 LIVE / NOT APPROVED
  if (isApproved) {
    buckets.approved_complete.push({
      slug: entry.slug,
      name: entry.name,
      componentName,
      category: entry.category,
      status: entry.status,
      fileSize
    });
  } else {
    buckets.live_not_approved.push({
      slug: entry.slug,
      name: entry.name,
      componentName,
      category: entry.category,
      status: entry.status,
      fileSize
    });
  }
}

// ─── 7. Generate report ─────────────────────────────────────────────────

const totalRegistry = registryEntries.length;
const totalComponents = componentFiles.length;
const totalApproved = approvedSet.size;
const totalAction = buckets.live_not_approved.length + buckets.needs_polish.length + 
                    buckets.needs_rebuild.length + buckets.not_built.length;

function pad(str, len) {
  return String(str).padStart(len);
}

let report = '';

report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total registry entries:      ${pad(totalRegistry.toLocaleString(), 6)}
Total component files:       ${pad(totalComponents.toLocaleString(), 6)}
Approved (_approved.json):   ${pad(totalApproved.toLocaleString(), 6)}
─────────────────────────────────────────────────────
✅ Approved & Complete:      ${pad(buckets.approved_complete.length.toLocaleString(), 6)}
🟢 Live / Not Approved:      ${pad(buckets.live_not_approved.length.toLocaleString(), 6)}
🟠 Needs Polish:             ${pad(buckets.needs_polish.length.toLocaleString(), 6)}
🔴 Needs Rebuild:            ${pad(buckets.needs_rebuild.length.toLocaleString(), 6)}
🟡 Not Built:                ${pad(buckets.not_built.length.toLocaleString(), 6)}
─────────────────────────────────────────────────────
Total action needed:         ${pad(totalAction.toLocaleString(), 6)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

if (buckets.live_not_approved.length > 0) {
  report += `\n🟢 LIVE / NOT APPROVED (${buckets.live_not_approved.length})\n`;
  for (const c of buckets.live_not_approved) {
    report += `  • ${c.name}\n`;
  }
}

if (buckets.needs_polish.length > 0) {
  report += `\n🟠 NEEDS POLISH (${buckets.needs_polish.length})\n`;
  for (const c of buckets.needs_polish) {
    report += `  • ${c.name} — ${c.issues.join(', ')}\n`;
  }
}

if (buckets.needs_rebuild.length > 0) {
  report += `\n🔴 NEEDS REBUILD (${buckets.needs_rebuild.length})\n`;
  for (const c of buckets.needs_rebuild) {
    report += `  • ${c.name} — ${c.reason}\n`;
  }
}

if (buckets.not_built.length > 0) {
  report += `\n🟡 NOT BUILT (${buckets.not_built.length})\n`;
  for (const c of buckets.not_built) {
    report += `  • ${c.slug} — [${c.category}]\n`;
  }
}

// Output to console
console.log(report);

// ─── 8. Save status files ────────────────────────────────────────────────

fs.writeFileSync(path.join(ROOT, 'status_report.md'), report, 'utf8');

fs.writeFileSync(
  path.join(ROOT, 'status_live_not_approved.txt'),
  buckets.live_not_approved.map(c => c.slug).join('\n') + '\n',
  'utf8'
);

fs.writeFileSync(
  path.join(ROOT, 'status_polish.txt'),
  buckets.needs_polish.map(c => `${c.slug} — ${c.issues.join(', ')}`).join('\n') + '\n',
  'utf8'
);

fs.writeFileSync(
  path.join(ROOT, 'status_rebuild.txt'),
  buckets.needs_rebuild.map(c => `${c.slug} — ${c.reason}`).join('\n') + '\n',
  'utf8'
);

fs.writeFileSync(
  path.join(ROOT, 'status_not_built.txt'),
  buckets.not_built.map(c => `${c.slug} — ${c.category}`).join('\n') + '\n',
  'utf8'
);

console.log('\n✅ Status files saved to project root:');
console.log('  • status_report.md');
console.log('  • status_live_not_approved.txt');
console.log('  • status_polish.txt');
console.log('  • status_rebuild.txt');
console.log('  • status_not_built.txt');
