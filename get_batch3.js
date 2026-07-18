const fs = require('fs');
const path = require('path');
const COMPS_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'components');
const REGISTRY_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'registry');

const registryData = [];
for (const file of fs.readdirSync(REGISTRY_DIR)) {
  if (!file.endsWith('.ts')) continue;
  const content = fs.readFileSync(path.join(REGISTRY_DIR, file), 'utf8');
  // Simple substring matching since regex failed
  const lines = content.split('\n');
  let currentSlug = null;
  let currentCategory = null;
  
  for (const line of lines) {
    if (line.includes('slug:')) {
      const match = line.match(/slug:\s*["']([^"']+)["']/);
      if (match) currentSlug = match[1];
    }
    if (line.includes('category:')) {
      const match = line.match(/category:\s*["']([^"']+)["']/);
      if (match) currentCategory = match[1];
    }
    if (currentSlug && currentCategory) {
      registryData.push({ slug: currentSlug, category: currentCategory });
      currentSlug = null;
      currentCategory = null;
    }
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
        else {
            // some slugs don't have -calculator
            const regEntry2 = registryData.find(r => r.slug.replace('-calculator', '') === slugMatch.replace('-calculator', ''));
            if (regEntry2) cat = regEntry2.category;
        }
        
        rebuildList.push({ file, reasons: rebuildReasons, category: cat.toUpperCase() });
    }
});

const approved = JSON.parse(fs.readFileSync(path.join(COMPS_DIR, '_approved.json'), 'utf8')).approved;

const filteredList = rebuildList.filter(r => !approved.includes(r.file.replace('.tsx', '')));

const categoryPriority = {
    'FINANCE': 1,
    'BUSINESS': 1,
    'HEALTH': 2,
    'MATH': 3,
    'SCIENCE': 3,
    'ENGINEERING': 3,
    'TECHNOLOGY': 4,
    'ENVIRONMENT': 4,
    'EVERYDAY-LIFE': 4,
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
