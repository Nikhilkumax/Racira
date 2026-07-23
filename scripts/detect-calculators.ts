const fs = require('fs');
const path = require('path');

const COMPONENT_DIR = path.join(__dirname, '../src/domains/calculator/components');
const REGISTRY_DIR = path.join(__dirname, '../src/domains/calculator/registry');
const APPROVED_PATH = path.join(COMPONENT_DIR, '_approved.json');
const DB_PATH = path.join(__dirname, '../Calculator_Database_Final.json');

// 1. Read _approved.json
const approvedData = JSON.parse(fs.readFileSync(APPROVED_PATH, 'utf-8'));
const approvedSet = new Set(approvedData.approved);

// 2. Read all files in /src/domains/calculator/components/
const componentFiles = fs.readdirSync(COMPONENT_DIR).filter((f: string) => f.endsWith('.tsx'));
const componentSet = new Set(componentFiles.map((f: string) => f.replace('.tsx', '')));

// 3. Read registry files to get slugs and statuses
const registrySlugs = new Map<string, { status: string, name: string }>();
const registryFiles = fs.readdirSync(REGISTRY_DIR).filter(f => f.endsWith('.ts'));

for (const file of registryFiles) {
  const content = fs.readFileSync(path.join(REGISTRY_DIR, file), 'utf-8');
  const regex = /slug:\s*["']([^"']+)["'][^}]*status:\s*["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    registrySlugs.set(match[1], { status: match[2], name: match[1] });
  }
}

// 4. Count DB entries
const dbContent = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
let dbCount = 0;
for (const cat in dbContent) {
  for (const sub in dbContent[cat]) {
    dbCount += dbContent[cat][sub].length;
  }
}

const KEEP = [];
const POLISH = [];
const REBUILD = [];
const CREATE = [];

function analyzeComponent(file: string, slug: string, status: string) {
  const compPath = path.join(COMPONENT_DIR, file);
  const content = fs.readFileSync(compPath, 'utf-8');
  const size = fs.statSync(compPath).size;

  if (status !== 'live') return { bucket: 'REBUILD', reason: 'isBuilt: false in registry' };
  if (size < 8000) return { bucket: 'REBUILD', reason: 'File < 8KB' };

  if (!content.includes('Recharts') && !content.includes('recharts')) return { bucket: 'REBUILD', reason: 'No Recharts chart' };

  const hasCalculate = content.includes('Calculate') || content.includes('calculate');
  if (!hasCalculate) return { bucket: 'REBUILD', reason: 'No Calculate button' };

  if (content.includes('fetch(') || content.includes('axios')) return { bucket: 'REBUILD', reason: 'Live API call' };

  const seoMatch = content.match(/<section[^>]*>(.*?)<\/section>/is);
  let seoWords = 0;
  if (seoMatch) {
    seoWords = seoMatch[1].replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  }

  if (seoWords > 0 && seoWords < 100) return { bucket: 'REBUILD', reason: 'SEO under 100 words' };

  let polishReasons = [];
  if (seoWords > 0 && seoWords < 400) polishReasons.push('SEO under 400 words');
  if (!content.includes('text-2xl font-bold mb-3')) polishReasons.push('H2 className not text-2xl font-bold mb-3');
  if (!content.includes('>Calculate<') && !content.includes('value="Calculate"')) {
    polishReasons.push('Calculate button label not exactly Calculate');
  }

  if (polishReasons.length > 0) return { bucket: 'POLISH', reason: polishReasons.join(', ') };

  return { bucket: 'KEEP' };
}

for (const comp of componentSet) {
  if (comp.includes('_') || comp === 'index') continue;

  const slug = comp.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  let regInfo = registrySlugs.get(slug);
  if (!regInfo) {
    // Some manual overrides might exist, let's try direct matches too
    const manualMatch = Array.from(registrySlugs.entries()).find(([s]) => s.replace(/-/g, '') === comp.toLowerCase());
    if (manualMatch) regInfo = manualMatch[1];
    else regInfo = { status: 'soon', name: comp };
  }

  if (approvedSet.has(comp) && regInfo.status === 'live') {
    KEEP.push(comp);
    continue;
  }

  const analysis = analyzeComponent(comp + '.tsx', slug, regInfo.status);

  if (analysis.bucket === 'KEEP') KEEP.push(comp);
  else if (analysis.bucket === 'POLISH') POLISH.push({ name: comp, reason: analysis.reason });
  else REBUILD.push({ name: comp, reason: analysis.reason });
}

for (const [slug, info] of registrySlugs.entries()) {
  const compName = slug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  let found = componentSet.has(compName);
  if (!found) {
    const manualMatch = Array.from(componentSet).find(c => c.toLowerCase() === slug.replace(/-/g, ''));
    if (manualMatch) found = true;
  }
  if (!found) {
    CREATE.push(compName);
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('RACIRA CALCULATOR — DETECT RESULTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Database entries total:          ${dbCount.toString().padStart(6)}`);
console.log(`Files in /src/calculators:        ${componentSet.size.toString().padStart(5)}`);
console.log(`Approved (exempt):                  ${approvedSet.size.toString().padStart(3)}`);
console.log('─────────────────────────────────────────────────────');
console.log(`✅ Keep:     ${KEEP.length.toString().padStart(3)}`);
console.log(`🟠 Polish:   ${POLISH.length.toString().padStart(3)}`);
console.log(`🔴 Rebuild:  ${REBUILD.length.toString().padStart(3)}`);
console.log(`🟡 Create:   ${CREATE.length.toString().padStart(3)}`);
console.log('─────────────────────────────────────────────────────');
console.log(`Total work:  ${(POLISH.length + REBUILD.length + CREATE.length).toString().padStart(3)}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🟠 POLISH LIST:');
for (const p of POLISH) {
  console.log(`  • ${p.name} — ${p.reason}`);
}
console.log('🔴 REBUILD LIST:');
for (const r of REBUILD) {
  console.log(`  • ${r.name} — ${r.reason}`);
}
