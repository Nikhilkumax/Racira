const fs = require('fs');
const path = require('path');
const dir = 'src/domains/calculator/registry';

const slugs = ['angel', 'annual-recurring', 'annual-salary', 'asset-turnover'];

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
    
    // Check if line has a slug
    const match = line.match(/slug:\s*["']([^"']+)["']/);
    if (match) {
      currentSlug = match[1];
    }
    
    // Check if line has status and we have a matching currentSlug
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
        continue; // skip pushing original line
      }
    }
    
    newLines.push(line);
  }
  
  if (updated) {
    fs.writeFileSync(p, newLines.join('\n'));
  }
}
