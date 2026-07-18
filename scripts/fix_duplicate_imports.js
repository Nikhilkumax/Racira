const fs = require('fs');
const glob = require('glob');

const files = [
  ...glob.sync('src/domains/*/registry.ts'),
  ...glob.sync('src/data/*/tools.ts')
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  const importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s);
  if (!importMatch) continue;
  
  const originalImports = importMatch[1].split(',').map(i => i.trim()).filter(i => i);
  const uniqueImports = Array.from(new Set(originalImports)).sort();
  
  const newImports = `import { ${uniqueImports.join(', ')} } from "lucide-react"`;
  code = code.replace(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["']/s, newImports);
  
  fs.writeFileSync(file, code);
}
