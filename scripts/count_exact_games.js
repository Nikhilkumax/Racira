const fs = require('fs');
const code = fs.readFileSync('src/data/games/games.ts', 'utf8');

// Match every string inside a subcategories block.
let inSubcategories = false;
let count = 0;
const lines = code.split('\n');
for (const line of lines) {
    if (line.includes('subcategories: {')) {
        inSubcategories = true;
    }
    if (inSubcategories && line.includes('},')) {
        inSubcategories = false;
    }
    if (inSubcategories && line.match(/"([^"]+)"/)) {
        // If it's a subcategory key, skip it
        if (line.includes(': [')) continue;
        
        // Count all strings that are array elements
        const strings = line.match(/"([^"]+)"/g);
        if (strings) {
            count += strings.length;
        }
    }
}
console.log('Total games:', count);
