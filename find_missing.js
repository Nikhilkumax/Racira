const fs = require('fs');
const path = require('path');
const dir = 'src/domains/calculator/registry';
const files = fs.readdirSync(dir);
const liveSlugs = [];
for (const file of files) {
  if (!file.endsWith('.ts')) continue;
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  // Match both slug: "..." and status: "live" or status: "soon"
  // Wait, let's just find everything.
  const regex = /slug:\s*["']([^"']+)["'][^}]*status:\s*["'](live|soon)["']/g;
  const matches = [...content.matchAll(regex)];
  for (const match of matches) {
    if (match[2] === 'live') {
      liveSlugs.push(match[1]);
    }
  }
}
console.log('Total live slugs:', liveSlugs.length);

const calcDir = path.join(__dirname, 'src/domains/calculator/components');
const missingFiles = [];
for (const slug of liveSlugs) {
  const compName = slug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Calculator';
  const filePath = path.join(calcDir, compName + '.tsx');
  if (!fs.existsSync(filePath)) {
    missingFiles.push(compName);
  }
}
console.log('Missing files for live slugs:', missingFiles.length);
if (missingFiles.length > 0) console.log(missingFiles.slice(0, 5));
