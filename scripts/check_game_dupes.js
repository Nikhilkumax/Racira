const fs = require('fs');
const code = fs.readFileSync('src/data/games/games.ts', 'utf8');
const importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s);
const imports = importMatch[1].split(',').map(i => i.trim()).filter(i => i && i !== 'type LucideIcon');
const duplicates = new Set();
const seen = new Set();
imports.forEach(i => {
  const base = i.replace(/^Lucide/, '').replace(/Icon$/, '');
  if (seen.has(base)) duplicates.add(base);
  seen.add(base);
});
console.log('Total unique semantic icons:', imports.length);
console.log('Duplicates found:', duplicates.size > 0 ? Array.from(duplicates) : 'None');
