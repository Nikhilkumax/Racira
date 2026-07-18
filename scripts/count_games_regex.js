const fs = require('fs');
const code = fs.readFileSync('src/data/games/games.ts', 'utf8');

const matches = [...code.matchAll(/^\s+"([^"]+)",?$/gm)];
console.log('Total string entries:', matches.length);

const categories = [...code.matchAll(/name:\s*"([^"]+)"/g)];
console.log('Categories:', categories.length);

const subcats = [...code.matchAll(/^\s+"([^"]+)":\s*\[/gm)];
console.log('Subcategories:', subcats.length);
