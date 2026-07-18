const fs = require('fs');
let c = fs.readFileSync('src/data/productivity/tools.ts', 'utf8');
const used = new Set([...c.matchAll(/icon:\s*([A-Za-z0-9_]+)/g)].map(m => m[1]));
c = c.replace(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["']/s, `import { ${Array.from(used).sort().join(', ')} } from "lucide-react"`);
fs.writeFileSync('src/data/productivity/tools.ts', c);
