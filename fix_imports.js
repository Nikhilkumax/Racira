const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix syntax error
content = content.replace(/"Estimate how many "Earths" are needed/g, '"Estimate how many \\"Earths\\" are needed');

// Find all unique icons used
const iconRegex = /\bicon:\s*([A-Za-z0-9_]+)/g;
const icons = new Set();
let match;
while ((match = iconRegex.exec(content)) !== null) {
  icons.add(match[1]);
}

// Add the ones from getCategoryIcon
const catIcons = ['DollarSign', 'Heart', 'Calculator', 'Atom', 'Clock', 'HardHat', 'Trophy', 'Leaf', 'Cpu', 'GraduationCap', 'ArrowLeftRight', 'Car'];
catIcons.forEach(i => icons.add(i));

const sortedIcons = Array.from(icons).sort();

// Replace the imports
const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+"lucide-react";/);
if (importMatch) {
  const newImport = `import {\n  ${sortedIcons.join(', ')}\n} from "lucide-react";`;
  content = content.replace(importMatch[0], newImport);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error and updated lucide imports. Added ' + sortedIcons.length + ' icons.');
