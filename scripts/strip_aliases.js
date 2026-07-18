const fs = require('fs');
const glob = require('glob');

const files = [
  ...glob.sync('src/domains/*/registry.ts'),
  ...glob.sync('src/data/*/tools.ts')
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  const importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s);
  if (!importMatch) continue;
  
  const originalImports = importMatch[1].split(',').map(i => i.trim()).filter(i => i);
  const usedIcons = originalImports.map(i => i.split(/\s+as\s+/)[0]).filter(i => i !== 'LucideIcon' && i !== 'createLucideIcon' && i !== 'inferIcon');
  
  let replacements = [];
  const finalImports = new Set();
  if (originalImports.includes('LucideIcon')) finalImports.add('LucideIcon');
  if (originalImports.includes('createLucideIcon')) finalImports.add('createLucideIcon');
  if (originalImports.includes('inferIcon')) finalImports.add('inferIcon');
  
  for (const icon of usedIcons) {
      let stripped = icon.replace(/^Lucide/, '').replace(/Icon$/, '');
      if (stripped !== icon) {
          replacements.push({ old: icon, new: stripped });
      }
      finalImports.add(stripped);
  }
  
  if (replacements.length > 0) {
      for (const {old, new: newIcon} of replacements) {
          code = code.replace(new RegExp(`\\b${old}\\b`, 'g'), newIcon);
      }
      
      const newImports = Array.from(finalImports).sort();
      
      // Fix SEO Map conflict
      if (file.includes('seo') && newImports.includes('Map')) {
          newImports.splice(newImports.indexOf('Map'), 1);
          newImports.push('Map as MapIcon');
          code = code.replace(/icon:\s*Map\b/g, 'icon: MapIcon');
          code = code.replace(/,\s*Map\s*\]/g, ', MapIcon]');
      }
      
      code = code.replace(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["']/s, `import { ${newImports.join(', ')} } from "lucide-react"`);
      
      fs.writeFileSync(file, code);
      console.log(`Stripped aliases in ${file}`);
  }
}
