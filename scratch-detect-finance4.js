const fs = require('fs');
const path = require('path');
const COMPS_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'components');
const regFiles = fs.readdirSync(path.join(__dirname, 'src/domains/calculator/registry')).filter(f => f.endsWith('.ts'));

let financeSlugs = new Set();
regFiles.forEach(rf => {
  const c = fs.readFileSync(path.join(__dirname, 'src/domains/calculator/registry', rf), 'utf8');
  if (c.includes('\"FINANCE\"') || c.includes('category: \"FINANCE\"')) {
    const lines = c.split('\n');
    lines.forEach(l => {
      const match = l.match(/slug:\s*\"([^\"]+)\"/);
      if (match) financeSlugs.add(match[1].toLowerCase().replace(/[^a-z0-9]/g, ''));
    });
  }
});

const files = fs.readdirSync(COMPS_DIR).filter(f => f.endsWith('.tsx'));
const financeRebuild = [];

files.forEach(file => {
    const normSlug = file.replace('.tsx', '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!financeSlugs.has(normSlug)) return;

    const fullPath = path.join(COMPS_DIR, file);
    const stat = fs.statSync(fullPath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    let rebuildReasons = [];
    if (stat.size < 8000) rebuildReasons.push('File < 8KB');
    if (!content.includes('recharts')) rebuildReasons.push('No Recharts chart');
    if (!content.match(/Calculate/i)) rebuildReasons.push('No Calculate button');
    if (content.includes('fetch(') || content.includes('axios')) rebuildReasons.push('Live API call');
    if (!content.includes('Advanced Options') && !content.includes('Professional Mode')) rebuildReasons.push('No tiered input system');
    
    if (rebuildReasons.length > 0) {
        financeRebuild.push(file); if(!global.rm) global.rm = {}; rebuildReasons.forEach(r => global.rm[r] = (global.rm[r] || 0) + 1);
    }
});
console.log('Finance Rebuilds:');
console.log(financeRebuild.length);

console.log(global.rm);