const fs = require('fs');
const code = fs.readFileSync('src/data/developers/tools.ts', 'utf8');
const match = code.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s);
const imports = match[1].split(',').map(i=>i.trim().replace(/^Lucide/,'').replace(/Icon$/,'')).filter(i=>i);
console.log('Developers unique icons:', new Set(imports).size);
console.log('Developers total imports:', imports.length);
