const fs = require('fs');
const path = require('path');
const dir = 'src/domains/calculator/registry';

function updateSlugStatus(targetSlug) {
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.ts')) continue;
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes(targetSlug)) {
      const regex = new RegExp(`(slug:\\s*["']${targetSlug}["'][^}]*status:\\s*["'])soon(["'])`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `$1live$2`);
        fs.writeFileSync(p, content);
        console.log(`Updated ${targetSlug} to live in ${file}`);
      }
    }
  }
}

updateSlugStatus('angle-converter-advanced');
updateSlugStatus('anova-calculator');
updateSlugStatus('antilog-calculator');
updateSlugStatus('ap-score-calculator');
