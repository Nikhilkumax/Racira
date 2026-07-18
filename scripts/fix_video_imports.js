const fs = require('fs');
const file = 'src/data/video/tools.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove all imports from lucide-react
code = code.replace(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["'];?\s*/g, '');

const allLucide = Object.keys(require('lucide-react'));
const used = new Set();
const matches = code.matchAll(/([A-Z][a-zA-Z0-9]+)/g);
for (const m of matches) {
  if (allLucide.includes(m[1]) && m[1] !== 'Tool' && m[1] !== 'ToolStatus') {
    used.add(m[1]);
  }
}

const imports = `import { ${Array.from(used).sort().join(', ')} } from "lucide-react";\n\n`;
fs.writeFileSync(file, imports + code);
