const fs = require('fs');
const path = require('path');
const dir = 'src/domains/calculator/registry';

const slugs = ['average-revenue-per-user', 'bonded-warehouse', 'break-bulk', 'burn-rate'];

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.ts')) continue;
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  let updated = false;

  const lines = content.split('\n');
  let newLines = [];
  let currentSlug = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const match = line.match(/slug:\s*["']([^"']+)["']/);
    if (match) {
      currentSlug = match[1];
    }
    
    if (line.includes('status:') && currentSlug) {
      let isMatch = false;
      for (const s of slugs) {
        if (currentSlug.includes(s)) isMatch = true;
      }
      
      if (isMatch && line.includes('soon')) {
        newLines.push(line.replace(/soon/g, 'live'));
        console.log(`Updated ${currentSlug} to live in ${file}`);
        updated = true;
        currentSlug = null;
        continue;
      }
    }
    
    newLines.push(line);
  }
  
  if (updated) {
    fs.writeFileSync(p, newLines.join('\n'));
  }
}
