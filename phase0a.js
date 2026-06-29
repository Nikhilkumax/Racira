const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/calculators');
if (!fs.existsSync(dir)) {
  console.log('Directory not found:', dir);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let fixAChanged = 0;
const fixAVariants = new Set();
let fixBChanged = 0;
const fixBVariants = new Set();
let fixCChanged = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix A: Button label
  content = content.replace(/(<button[^>]*>)([\s\S]*?)(<\/button>)/gi, (match, p1, p2, p3) => {
    const label = p2.trim();
    if (!label || label === 'Calculate') return match;
    
    // Identifies the primary action button
    const isCalcButton = p1.includes('onClick={handleCalculate}') || 
                         (p1.includes('type="submit"') && !p1.includes('variant="outline"')) ||
                         (p1.includes('bg-primary') && p1.includes('text-primary-foreground') && /calculate|compute|submit|get results/i.test(label));

    if (isCalcButton && !p1.includes('Print') && !label.toLowerCase().includes('print')) {
      fixAVariants.add(label.replace(/<[^>]+>/g, '').trim() || label);
      return p1 + 'Calculate' + p3;
    }
    return match;
  });

  if (originalContent !== content) {
    fixAChanged++;
    originalContent = content;
  }

  // Fix B: H2 className
  let bChanged = false;
  content = content.replace(/<h2\s+className="([^"]+)"[^>]*>/g, (match, p1) => {
    if (p1 !== 'text-2xl font-bold mb-3') {
      fixBVariants.add(p1);
      bChanged = true;
      return `<h2 className="text-2xl font-bold mb-3">`;
    }
    return match;
  });
  content = content.replace(/<h2>/g, () => {
    fixBVariants.add('(no className)');
    bChanged = true;
    return `<h2 className="text-2xl font-bold mb-3">`;
  });
  if (bChanged) {
    fixBChanged++;
    originalContent = content;
  }

  // Fix C: Subtitle under H1
  let cChanged = false;
  // Safer regex for Fix C: 
  // It looks for </h1>, then optional spaces, then <p...> or <span...>, then a grid div.
  // To avoid swallowing too much if the grid div is far away, we make it non-greedy, 
  // but we should ensure there are no other <divs> in between.
  // Actually, "Finds any <p> or <span> element appearing immediately after an <h1> and before the two-column calculator grid"
  // Let's replace </h1> \s* <p[^>]*>[\s\S]*?</p> \s* <div className="grid
  content = content.replace(/(<\/h1>\s*)<(p|span)[^>]*>[\s\S]*?<\/\2>(\s*<div[^>]*className="[^"]*grid)/g, (match, p1, p2, p3) => {
    cChanged = true;
    return p1 + p3;
  });
  if (cChanged) {
    fixCChanged++;
  }

  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('GLOBAL FIX COMPLETE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Fix A (button labels):    ${fixAChanged} files changed`);
console.log(`Fix B (H2 classNames):    ${fixBChanged} files changed`);
console.log(`Fix C (subtitle lines):   ${fixCChanged} files changed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
