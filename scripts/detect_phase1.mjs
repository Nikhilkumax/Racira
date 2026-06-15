import fs from 'fs';
import path from 'path';

const registryDir = path.join(process.cwd(), 'src', 'data', 'calculators');
const calculatorsDir = path.join(process.cwd(), 'src', 'calculators');

let databaseEntriesTotal = 0;
let filesInSrcCalculators = 0;
let keep = 0;
let rebuild = 0;
let create = 0;

function slugToPascal(slug) {
    return slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + '.tsx';
}

let registryData = [];

if (fs.existsSync(registryDir)) {
    const registryFiles = fs.readdirSync(registryDir).filter(f => f.endsWith('.ts'));
    for (const file of registryFiles) {
        const content = fs.readFileSync(path.join(registryDir, file), 'utf8');
        const matches = content.matchAll(/slug:\s*"([^"]+)",[^}]+isBuilt:\s*(true|false)/g);
        for (const match of matches) {
            const slug = match[1];
            const isBuilt = match[2] === 'true';
            
            const catMatch = content.match(new RegExp(`slug:\\s*"${slug}",[^{]*category:\\s*"([^"]+)"`));
            const category = catMatch ? catMatch[1] : '';
            
            registryData.push({ slug, isBuilt, category });
        }
    }
}
databaseEntriesTotal = registryData.length;

const fileStats = {};

for (const data of registryData) {
    const fileName = slugToPascal(data.slug);
    const filePath = path.join(calculatorsDir, fileName);
    
    if (fs.existsSync(filePath)) {
        filesInSrcCalculators++;
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;
        
        let pass = true;
        
        if (sizeKB < 8) pass = false;
        if (!data.isBuilt) pass = false;
        if (content.includes('Value A') || content.includes('Value B')) pass = false; 
        if (!content.includes('recharts') && !content.includes('Recharts')) pass = false;
        if (content.split(/\s+/).length < 1500) pass = false;
        
        fileStats[data.slug] = pass ? 'KEEP' : 'REBUILD';
        
        if (pass) {
            keep++;
        } else {
            rebuild++;
        }
    } else {
        create++;
        fileStats[data.slug] = 'CREATE';
    }
}

const totalWork = rebuild + create;

const output = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RACIRA CALCULATOR — DETECT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Database entries total:     ${databaseEntriesTotal.toString().padStart(5)}
Files in /src/calculators:   ${filesInSrcCalculators.toString().padStart(5)}
────────────────────────────────────────
✅ Keep (pass all checks):     ${keep.toString().padStart(5)}
🔴 Rebuild (file exists, fails checks): ${rebuild.toString().padStart(5)}
🟡 Create (in DB, no file exists): ${create.toString().padStart(5)}
────────────────────────────────────────
Total work:                 ${totalWork.toString().padStart(5)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

console.log(output);

const workList = registryData.map(d => ({
    ...d,
    action: fileStats[d.slug]
})).filter(d => d.action !== 'KEEP');

const categoryPriority = {
    'FINANCE': 1,
    'BUSINESS': 1,
    'HEALTH': 2,
    'MATH': 3,
    'SCIENCE': 3,
    'ENGINEERING': 3,
    'TECHNOLOGY': 4,
    'ENVIRONMENT': 4,
    'EVERYDAY_LIFE': 4,
    'TRANSPORTATION': 4,
    'CONSTRUCTION': 4,
    'EDUCATION': 4
};

workList.sort((a, b) => {
    if (a.action === 'REBUILD' && b.action !== 'REBUILD') return -1;
    if (a.action !== 'REBUILD' && b.action === 'REBUILD') return 1;
    
    const pA = categoryPriority[a.category] || 99;
    const pB = categoryPriority[b.category] || 99;
    if (pA !== pB) return pA - pB;
    
    return a.slug.localeCompare(b.slug);
});

fs.writeFileSync('work_list.json', JSON.stringify(workList, null, 2));
