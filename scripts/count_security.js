const fs = require('fs');
const text = fs.readFileSync('src/domains/security/registry.ts', 'utf8');
const count = [...text.matchAll(/\[".+?",\s*".+?"(?:,\s*true)?\]/g)].length;
console.log('Count:', count);
