const fs = require('fs');
const lucide = require('lucide-react');
const glob = require('glob');

const allIcons = Object.keys(lucide).filter(k => 
  (typeof lucide[k] === 'object' || typeof lucide[k] === 'function') &&
  !k.endsWith('Icon') && !k.startsWith('Lucide')
);

// Remove some generic/bad ones
const bad = new Set(['CreditCard', 'Bitcoin', 'ActivitySquare', 'Angry', 'Annoyed', 'Banknote', 'Battery', 'Beaker', 'Bean', 'Bell', 'Bike', 'Accessibility', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmCheck', 'Aa', 'Compass', 'createLucideIcon', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);
const goodIcons = allIcons.filter(i => !bad.has(i) && !i.includes('Arrow'));

function fixDomain(file) {
  let code = fs.readFileSync(file, 'utf8');
  let iconsList = [...goodIcons];
  
  // Find all used icons in this file
  const usedMatches = [...code.matchAll(/icon:\s*([A-Za-z0-9_]+)/g)];
  const used = new Set();
  const duplicatesToReplace = [];
  
  for (const match of usedMatches) {
    const icon = match[1];
    let stripped = icon.replace(/^Lucide/, '').replace(/Icon$/, '');
    
    // We want to force it to use a completely fresh icon from the pool if it's a duplicate alias
    if (used.has(stripped)) {
      // Pick a fresh icon
      const newIcon = iconsList.shift();
      duplicatesToReplace.push({ old: icon, new: newIcon });
    } else if (icon.startsWith('Lucide') || icon.endsWith('Icon')) {
      // Just rename it to the stripped version, as long as it's not used
      used.add(stripped);
      duplicatesToReplace.push({ old: icon, new: stripped });
    } else {
      used.add(stripped);
    }
    
    // Remove from available list
    iconsList = iconsList.filter(i => i !== stripped);
  }

  // Also replace the visual duplicate calendars in Productivity
  if (file.includes('productivity')) {
      const calReplacements = {
          'Calendar1': 'LayoutTemplate',
          'CalendarCheck': 'CheckSquare',
          'CalendarCheck2': 'SquareDashed',
          'CalendarClock': 'Hourglass',
          'CalendarCog': 'Settings2',
          'CalendarDays': 'ListOrdered'
      };
      for (const [old, newI] of Object.entries(calReplacements)) {
          if (code.includes(old)) {
              duplicatesToReplace.push({ old, new: newI });
          }
      }
  }

  let finalIconsToImport = new Set(Array.from(used));

  // Do replacements
  for (const {old, new: newIcon} of duplicatesToReplace) {
    // Replace in tuple
    code = code.replace(new RegExp(`icon:\\s*${old}\\b`, 'g'), `icon: ${newIcon}`);
    finalIconsToImport.delete(old.replace(/^Lucide/, '').replace(/Icon$/, '')); // Might be deleted if it was just an alias
    finalIconsToImport.add(newIcon);
  }

  // Update import statement
  if (duplicatesToReplace.length > 0) {
      // Gather all icons actually in the file now
      const actualUsed = new Set([...code.matchAll(/icon:\s*([A-Za-z0-9_]+)/g)].map(m => m[1]));
      code = code.replace(/import \{.*?\} from "lucide-react";/s, `import { ${Array.from(actualUsed).join(', ')} } from "lucide-react";`);
      fs.writeFileSync(file, code);
      console.log(`Fixed ${duplicatesToReplace.length} issues in ${file}`);
  } else {
      console.log(`Clean: ${file}`);
  }
}

fixDomain('src/data/productivity/tools.ts');
fixDomain('src/data/developers/tools.ts');

