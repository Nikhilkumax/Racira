const fs = require('fs');
const path = require('path');

const COMPS_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'components');
const files = fs.readdirSync(COMPS_DIR).filter(f => f.endsWith('.tsx'));

const rebuildList = [];

files.forEach(file => {
    const origSlug = file.replace('.tsx', '');
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
        rebuildList.push({ file, reasons: rebuildReasons });
    }
});

console.log("Next 4 to Rebuild:");
console.log(rebuildList.slice(0, 4));
