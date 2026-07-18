const fs = require('fs');
const path = require('path');
const COMPS_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'components');
const REGISTRY_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'registry');

const registryData = [];
for (const file of fs.readdirSync(REGISTRY_DIR)) {
  if (!file.endsWith('.ts')) continue;
  const content = fs.readFileSync(path.join(REGISTRY_DIR, file), 'utf8');
  const matches = [...content.matchAll(/slug:\s*["']([^"']+)["'][^}]*category:\s*["']([^"']+)["']/g)];
  for (const m of matches) {
    registryData.push({ slug: m[1], category: m[2] });
  }
}

const files = fs.readdirSync(COMPS_DIR).filter(f => f.endsWith('.tsx'));
const rebuildList = [];

files.forEach(file => {
    const fullPath = path.join(COMPS_DIR, file);
    const stat = fs.statSync(fullPath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    let rebuildReasons = [];
    if (content.includes('Value A') || content.includes('Value B')) {
        rebuildReasons.push('Stub Placeholder Detected');
    }
    if (stat.size < 8000) rebuildReasons.push('File < 8KB');
    if (!content.includes('recharts')) rebuildReasons.push('No Recharts chart');
    if (!content.match(/Calculate/i)) rebuildReasons.push('No Calculate button');
    if (content.includes('fetch(') || content.includes('axios')) rebuildReasons.push('Live API call');
    if (!content.includes('Advanced Options') && !content.includes('Professional Mode')) rebuildReasons.push('No tiered input system');
    
    if (rebuildReasons.length > 0) {
        const slugMatch = file.replace('Calculator.tsx', '').replace('.tsx', '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        let cat = 'UNKNOWN';
        const regEntry = registryData.find(r => r.slug === slugMatch || r.slug === slugMatch + '-calculator');
        if (regEntry) cat = regEntry.category;
        
        rebuildList.push({ file, reasons: rebuildReasons, category: cat });
    }
});

const approved = JSON.parse(fs.readFileSync(path.join(COMPS_DIR, '_approved.json'), 'utf8')).approved;
const newlyApproved = ['AngleConverterAdvanced', 'AnovaCalculator', 'AntilogCalculator', 'ApScoreCalculator'];
const allApproved = [...approved, ...newlyApproved];

const filteredList = rebuildList.filter(r => !allApproved.includes(r.file.replace('.tsx', '')));

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

filteredList.sort((a, b) => {
    const pA = categoryPriority[a.category] || 99;
    const pB = categoryPriority[b.category] || 99;
    if (pA !== pB) return pA - pB;
    return a.file.localeCompare(b.file);
});

console.log(filteredList.slice(0, 4).map(f => f.file).join('\n'));
