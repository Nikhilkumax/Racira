const fs = require('fs');
console.log(fs.readFileSync('src/domains/colors/registry.ts', 'utf8').match(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["']/s)[0]);
