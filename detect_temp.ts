import fs from 'fs';
import path from 'path';
import { calculatorRegistry } from './src/domains/calculator/registry';

const COMPS_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'components');
const APPROVED_PATH = path.join(COMPS_DIR, '_approved.json');
const DB_PATH = path.join(__dirname, 'Calculator_Database_Final.json');

const approvedData = JSON.parse(fs.readFileSync(APPROVED_PATH, 'utf-8'));
const approvedSlugs = new Set(approvedData.approved);

const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
let dbCount = 0;
for (const cat in dbData) {
    for (const sub in dbData[cat]) {
        if (Array.isArray(dbData[cat][sub])) {
            dbCount += dbData[cat][sub].length;
        }
    }
}

const buckets = {
    KEEP: [] as string[],
    POLISH: [] as string[],
    REBUILD: [] as string[],
    CREATE: [] as string[]
};

const registryMap = new Map();
const registryByNorm = new Map();
calculatorRegistry.forEach(c => {
    registryMap.set(c.slug, c);
    registryByNorm.set(c.slug.toLowerCase().replace(/[^a-z0-9]/g, ''), c);
});

const files = fs.readdirSync(COMPS_DIR).filter(f => f.endsWith('.tsx'));
const fileNormSlugs = new Set();

files.forEach(file => {
    const origSlug = file.replace('.tsx', '');
    const normSlug = origSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    fileNormSlugs.add(normSlug);
    
    const fullPath = path.join(COMPS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const stat = fs.statSync(fullPath);
    
    const regItem = registryByNorm.get(normSlug);
    const isBuilt = regItem ? regItem.status === 'live' : false;
    
    // Check if in approved list AND isBuilt
    if (approvedSlugs.has(origSlug) && isBuilt) {
        buckets.KEEP.push(origSlug);
        return;
    }

    let rebuildReasons = [];
    if (!isBuilt) rebuildReasons.push('isBuilt: false in registry');
    if (stat.size < 8000) rebuildReasons.push('File < 8KB');
    if (!content.includes('recharts')) rebuildReasons.push('No Recharts chart');
    if (!content.match(/Calculate/i)) rebuildReasons.push('No Calculate button');
    if (content.includes('fetch(') || content.includes('axios')) rebuildReasons.push('Live API call');
    if (!content.includes('Advanced Options') && !content.includes('Professional Mode')) rebuildReasons.push('No tiered input system');
    
    if (rebuildReasons.length > 0) {
        buckets.REBUILD.push(origSlug);
        return;
    }
    
    let polishReasons = [];
    const seoMatch = content.match(/<section[^>]*>(.*?)<\/section>/is);
    if (!seoMatch || seoMatch[1].split(/\s+/).length < 200) {
        polishReasons.push('SEO under 400 words');
    }
    if (!content.includes('text-2xl font-bold mb-3')) polishReasons.push('H2 className not exact');
    if (!content.includes('>Calculate<') && !content.includes('="Calculate"')) polishReasons.push('Calculate button label not exactly Calculate');

    if (polishReasons.length > 0) {
        buckets.POLISH.push(`${origSlug} — ${polishReasons[0]}`);
    } else {
        buckets.KEEP.push(origSlug);
    }
});

registryMap.forEach((c, slug) => {
    const normSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!fileNormSlugs.has(normSlug)) {
        buckets.CREATE.push(slug);
    }
});

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`RACIRA CALCULATOR — DETECT RESULTS`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Database entries total:          ${dbCount}`);
console.log(`Files in /src/calculators:        ${files.length}`);
console.log(`Approved (exempt):                  ${approvedSlugs.size}`);
console.log(`─────────────────────────────────────────────────────`);
console.log(`✅ Keep:     ${buckets.KEEP.length}`);
console.log(`🟠 Polish:   ${buckets.POLISH.length}`);
console.log(`🔴 Rebuild:  ${buckets.REBUILD.length}`);
console.log(`🟡 Create:   ${buckets.CREATE.length}`);
console.log(`─────────────────────────────────────────────────────`);
console.log(`Total work:  ${buckets.POLISH.length + buckets.REBUILD.length + buckets.CREATE.length}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`🟠 POLISH LIST:`);
buckets.POLISH.forEach(p => console.log(`  • ${p}`));
