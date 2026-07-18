const fs = require('fs');
const path = require('path');
const stubs = fs.readFileSync('stub_list.txt', 'utf8').split('\n').filter(Boolean);
const dir = 'src/domains/calculator/registry';
const files = fs.readdirSync(dir);

let filesModified = 0;
let totalModifications = 0;

for (const file of files) {
  if (!file.endsWith('.ts')) continue;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const stub of stubs) {
    const slug = stub.replace('Calculator', '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    
    // Find the definition block for this slug and replace its status
    // regex to match slug: "slug" or slug: "slug-calculator" up to status: "live"
    const regex = new RegExp(`(slug:\\s*['"](?:${slug}|${slug}-calculator)['"][^}]*status:\\s*['"])live(['"])`, 's');
    
    if (content.match(regex)) {
      content = content.replace(regex, '$1soon$2');
      totalModifications++;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
  }
}

console.log(`Modified ${filesModified} files.`);
console.log(`Flipped ${totalModifications} statuses from live to soon.`);
