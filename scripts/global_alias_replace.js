const fs = require('fs');
const glob = require('glob');
const lucide = require('lucide-react');

const allIcons = Object.keys(lucide).filter(k => 
  (typeof lucide[k] === 'object' || typeof lucide[k] === 'function') &&
  !k.endsWith('Icon') && !k.startsWith('Lucide')
);

// Remove some generic/bad ones
const bad = new Set(['CreditCard', 'Bitcoin', 'ActivitySquare', 'Angry', 'Annoyed', 'Banknote', 'Battery', 'Beaker', 'Bean', 'Bell', 'Bike', 'Accessibility', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmCheck', 'Aa', 'Compass', 'createLucideIcon', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);
const goodIcons = allIcons.filter(i => !bad.has(i) && !i.includes('Arrow'));

const files = [
  ...glob.sync('src/domains/*/registry.ts'),
  ...glob.sync('src/data/*/tools.ts')
];

let totalIssuesFixed = 0;

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let iconsList = [...goodIcons];
  
  const importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s);
  if (!importMatch) continue;
  
  const usedIcons = importMatch[1].split(',')
    .map(i => i.trim().split(/\s+as\s+/)[0])
    .filter(i => i.length > 0 && i !== 'LucideIcon' && i !== 'createLucideIcon' && i !== 'inferIcon');
    
  const seenStripped = new Set();
  const replacements = [];
  
  for (const icon of usedIcons) {
    let stripped = icon.replace(/^Lucide/, '').replace(/Icon$/, '');
    
    if (seenStripped.has(stripped)) {
      const fresh = iconsList.shift();
      replacements.push({ old: icon, new: fresh });
      seenStripped.add(fresh); // Also track the new one!
    } else if (icon !== stripped) {
      // It's just an alias, rename it to the stripped version
      seenStripped.add(stripped);
      replacements.push({ old: icon, new: stripped });
    } else {
      seenStripped.add(stripped);
    }
    iconsList = iconsList.filter(i => i !== stripped);
  }

  if (replacements.length > 0) {
    totalIssuesFixed += replacements.length;
    for (const {old, new: newIcon} of replacements) {
      code = code.replace(new RegExp(`\\b${old}\\b`, 'g'), newIcon);
    }
    
    // Now rebuild the import statement
    const newImports = Array.from(seenStripped).sort();
    code = code.replace(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["']/s, `import { ${newImports.join(', ')} } from "lucide-react"`);
    
    fs.writeFileSync(file, code);
    console.log(`Fixed ${replacements.length} issues in ${file}`);
  }
}

console.log('Total alias issues fixed across all domains:', totalIssuesFixed);
