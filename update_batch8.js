const fs = require('fs'), path = require('path');
const dir = 'src/domains/calculator/registry';
const slugs = ['current-ratio', 'customer-acquisition-cost', 'customs-clearance', 'ddp-vs-exw'];

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.ts')) continue;
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  let updated = false;
  let currentSlug = null;
  const newLines = content.split('\n').map(line => {
    const m = line.match(/slug:\s*["']([^"']+)["']/);
    if (m) currentSlug = m[1];
    if (line.includes('status:') && currentSlug) {
      const isMatch = slugs.some(s => currentSlug.includes(s));
      if (isMatch && line.includes('soon')) {
        console.log(`Updated ${currentSlug} in ${file}`);
        updated = true; currentSlug = null;
        return line.replace('soon', 'live');
      }
    }
    return line;
  });
  if (updated) fs.writeFileSync(p, newLines.join('\n'));
}
