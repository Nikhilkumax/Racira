const fs = require('fs');
const glob = require('glob');
const lucide = require('lucide-react');

const files = [
  ...glob.sync('src/domains/*/registry.ts'),
  ...glob.sync('src/data/*/tools.ts')
];

let globalDuplicates = {};

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  // Match icon assignments like icon: DatabaseZap or icon: "DatabaseZap" (if inferred? No, they should be statically imported components).
  // Actually, we can just look at `import { ... } from "lucide-react";` block to get all icons used in that file!
  const importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s);
  
  if (!importMatch) continue;
  
  const icons = importMatch[1].split(',')
    .map(i => i.trim().split(/\s+as\s+/)[0]) // handle `Icon as Something` just in case
    .filter(i => i.length > 0 && i !== 'LucideIcon' && i !== 'createLucideIcon' && i !== 'inferIcon');
    
  const aliasStripped = {};
  const duplicates = [];
  
  for (const icon of icons) {
    let stripped = icon.replace(/Icon$/, '').replace(/^Lucide/, '');
    if (aliasStripped[stripped]) {
      duplicates.push({ a: aliasStripped[stripped], b: icon, stripped });
    } else {
      aliasStripped[stripped] = icon;
    }
  }
  
  if (duplicates.length > 0) {
    globalDuplicates[file] = duplicates;
  }
}

console.log(JSON.stringify(globalDuplicates, null, 2));
