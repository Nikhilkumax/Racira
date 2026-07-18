const fs = require('fs');
const glob = require('glob');
const lucide = require('lucide-react');

const allCanonicalIcons = Object.keys(lucide).filter(k => 
  (typeof lucide[k] === 'object' || typeof lucide[k] === 'function') &&
  !k.endsWith('Icon') && !k.startsWith('Lucide')
);

const bad = new Set(['CreditCard', 'Bitcoin', 'ActivitySquare', 'Angry', 'Annoyed', 'Banknote', 'Battery', 'Beaker', 'Bean', 'Bell', 'Bike', 'Accessibility', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmCheck', 'Aa', 'Compass', 'createLucideIcon', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);
const goodIcons = allCanonicalIcons.filter(i => !bad.has(i) && !i.includes('Arrow'));

const files = [
  ...glob.sync('src/domains/*/registry.ts'),
  ...glob.sync('src/data/*/tools.ts')
];

function getSemanticIcon(toolName, availableIcons) {
  let kw = [];
  const n = toolName.toLowerCase();
  
  if (n.includes('time') || n.includes('schedule') || n.includes('date')) kw.push('calendar', 'clock', 'hourglass', 'timer', 'watch');
  if (n.includes('task') || n.includes('action') || n.includes('checklist')) kw.push('check', 'list', 'clipboard');
  if (n.includes('json') || n.includes('xml') || n.includes('code') || n.includes('format')) kw.push('code', 'braces', 'terminal');
  if (n.includes('color') || n.includes('palette')) kw.push('palette', 'brush', 'paint');
  if (n.includes('image') || n.includes('photo')) kw.push('image', 'camera', 'picture');
  if (n.includes('text') || n.includes('word') || n.includes('write')) kw.push('file', 'type', 'pen', 'edit');
  if (n.includes('security') || n.includes('hash') || n.includes('crypto')) kw.push('shield', 'lock', 'key', 'fingerprint');
  if (n.includes('seo') || n.includes('search') || n.includes('meta')) kw.push('search', 'globe', 'linechart');
  if (n.includes('network') || n.includes('ip') || n.includes('dns')) kw.push('network', 'globe', 'server');
  if (n.includes('data') || n.includes('sql') || n.includes('base')) kw.push('database', 'table', 'server');

  for (const k of kw) {
    for (const icon of availableIcons) {
      if (icon.toLowerCase().includes(k)) {
        return icon;
      }
    }
  }
  
  // Fallback
  return availableIcons[0];
}

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let iconsList = [...goodIcons];
  
  // Parse all used tools and their current icons. 
  // Tools are defined in tuples or objects. We can just regex for the tool names and icons.
  // Actually, we just need to replace the imports and the icon references.
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
      // Find the tool name that uses this icon
      const toolMatch = code.match(new RegExp(`\\["([^"]+)",\\s*${icon}\\b`, 'i')) || 
                        code.match(new RegExp(`\\["([^"]+)",[^,]+,\\s*${icon}\\b`, 'i')) || 
                        code.match(new RegExp(`name:\\s*"([^"]+)".*?icon:\\s*${icon}\\b`, 'is'));
      
      const toolName = toolMatch ? toolMatch[1] : '';
      
      // Filter out icons already used in this file
      const available = iconsList.filter(i => !seenStripped.has(i));
      const fresh = getSemanticIcon(toolName, available);
      
      replacements.push({ old: icon, new: fresh, toolName });
      seenStripped.add(fresh);
    } else if (icon !== stripped) {
      seenStripped.add(stripped);
      replacements.push({ old: icon, new: stripped, toolName: 'ALIAS' });
    } else {
      seenStripped.add(stripped);
    }
  }

  if (replacements.length > 0) {
    for (const {old, new: newIcon} of replacements) {
      code = code.replace(new RegExp(`\\b${old}\\b`, 'g'), newIcon);
    }
    
    const newImports = Array.from(seenStripped).sort();
    
    // Fix SEO Map conflict
    if (file.includes('seo') && newImports.includes('Map')) {
        newImports.splice(newImports.indexOf('Map'), 1);
        newImports.push('Map as MapIcon');
        code = code.replace(/icon:\s*Map\b/g, 'icon: MapIcon');
        code = code.replace(/,\s*Map\s*\]/g, ', MapIcon]');
    }
    
    code = code.replace(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["']/s, `import { ${newImports.join(', ')} } from "lucide-react"`);
    
    fs.writeFileSync(file, code);
    
    // Just log the semantic replacements, not the simple alias strips
    const semanticReps = replacements.filter(r => r.toolName !== 'ALIAS');
    if (semanticReps.length > 0) {
        console.log(`\n--- ${file} ---`);
        console.log(semanticReps.map(r => `${r.toolName} : ${r.old} -> ${r.new}`).join('\n'));
    }
  }
}
