const fs = require('fs');
const code = fs.readFileSync('src/data/games/games.ts', 'utf8');

// Strip out imports so we can eval it
let cleanCode = code.replace(/import.*?from.*?;/gs, '');
// Strip export keywords
cleanCode = cleanCode.replace(/export type.*?;/gs, '');
cleanCode = cleanCode.replace(/export const /g, 'const ');

// Remove type annotations
cleanCode = cleanCode.replace(/: GameCategory\[\] /g, '');
cleanCode = cleanCode.replace(/LucideIcon/g, 'null');
// Extract the CATEGORIES array
const match = cleanCode.match(/const CATEGORIES = (\[.*\]);/s);

try {
    const CATEGORIES = eval(match[1]);
    let total = 0;
    CATEGORIES.forEach(c => {
        Object.values(c.subcategories).forEach(sub => total += sub.length);
    });
    console.log('Total games:', total);
    console.log('Categories:', CATEGORIES.length);
    
    let subcatCount = 0;
    CATEGORIES.forEach(c => {
        subcatCount += Object.keys(c.subcategories).length;
    });
    console.log('Subcategories:', subcatCount);
} catch (e) {
    console.log(e);
}
