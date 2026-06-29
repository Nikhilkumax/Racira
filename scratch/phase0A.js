const fs = require('fs');
const path = require('path');

const calculatorsDir = path.join(__dirname, '../src/calculators');
const files = fs.readdirSync(calculatorsDir).filter(f => f.endsWith('.tsx'));

let fixAChanged = 0;
let fixBChanged = 0;
let fixCChanged = 0;

let labelVariantsReplaced = new Set();
let classVariantsReplaced = new Set();

for (const file of files) {
  const filePath = path.join(calculatorsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix A: Button label
  let startIndex = 0;
  while (true) {
    let btnStart = content.indexOf('<button', startIndex);
    let BtnStart = content.indexOf('<Button', startIndex);
    
    let start = -1;
    let tag = 'button';
    if (btnStart !== -1 && BtnStart !== -1) {
      if (btnStart < BtnStart) { start = btnStart; tag = 'button'; }
      else { start = BtnStart; tag = 'Button'; }
    } else if (btnStart !== -1) {
      start = btnStart; tag = 'button';
    } else if (BtnStart !== -1) {
      start = BtnStart; tag = 'Button';
    } else {
      break;
    }

    let openBraces = 0;
    let inQuotes = null;
    let tagEnd = -1;
    
    for (let i = start + tag.length + 1; i < content.length; i++) {
      let char = content[i];
      if (inQuotes) {
        if (char === '\\') i++; // escape char
        else if (char === inQuotes) inQuotes = null;
      } else {
        if (char === '"' || char === "'") inQuotes = char;
        else if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
        else if (char === '>' && openBraces === 0) {
          tagEnd = i;
          break;
        }
      }
    }

    if (tagEnd === -1) {
      startIndex = start + 1;
      continue;
    }

    let endTag = `</${tag}>`;
    let closeIndex = content.indexOf(endTag, tagEnd + 1);
    if (closeIndex === -1) {
      startIndex = tagEnd + 1;
      continue;
    }

    let attrs = content.substring(start + tag.length + 1, tagEnd);
    let inner = content.substring(tagEnd + 1, closeIndex);
    let innerLower = inner.trim().toLowerCase();
    
    // Check if it's the calculate button
    if (!innerLower.includes('print') && !innerLower.includes('reset') && !attrs.includes('RotateCcw') && !attrs.includes('Printer')) {
      if (innerLower.includes('calculate') || innerLower.includes('compute') || innerLower.includes('submit') || innerLower.includes('get result') || innerLower === 'calc' || inner.includes('<Calculator')) {
        if (inner.trim() !== 'Calculate') {
           labelVariantsReplaced.add(inner.trim());
           let newInner = 'Calculate';
           content = content.substring(0, tagEnd + 1) + newInner + content.substring(closeIndex);
           // After changing length, adjust loop
           startIndex = start + tag.length + 1;
           continue; 
        }
      }
    }
    
    startIndex = start + tag.length + 1;
  }

  // Fix B: H2 className
  content = content.replace(/<h2([^>]*)className=(["'])(.*?)\2([^>]*)>/gi, (match, before, quote, className, after) => {
      if (className !== "text-2xl font-bold mb-3") {
           classVariantsReplaced.add(className);
           return `<h2${before}className="text-2xl font-bold mb-3"${after}>`;
      }
      return match;
  });

  // Fix C: Subtitle under H1
  content = content.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)\s*<(p|span)[^>]*>[\s\S]*?<\/\2>/gi, '$1');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    
    // Check what changed for counting
    let temp = originalContent;
    let changedA = false, changedB = false, changedC = false;
    
    // We can just rely on the sets and a simplified check
    if (originalContent.replace(/<h2([^>]*)className=(["'])(.*?)\2([^>]*)>/gi, 'XX') !== content.replace(/<h2([^>]*)className=(["'])(.*?)\2([^>]*)>/gi, 'XX')) {
       changedB = true;
    }
    if (originalContent.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)\s*<(p|span)[^>]*>[\s\S]*?<\/\2>/gi, '$1') !== originalContent) {
       changedC = true;
    }
    // A changed if content is different but not just B or C
    let onlyBandCChanged = originalContent
      .replace(/<h2([^>]*)className=(["'])(.*?)\2([^>]*)>/gi, (match, before, quote, className, after) => {
          if (className !== "text-2xl font-bold mb-3") return `<h2${before}className="text-2xl font-bold mb-3"${after}>`;
          return match;
      })
      .replace(/(<h1[^>]*>[\s\S]*?<\/h1>)\s*<(p|span)[^>]*>[\s\S]*?<\/\2>/gi, '$1');
      
    if (content !== onlyBandCChanged) {
       changedA = true;
    }
    
    if (changedA) fixAChanged++;
    if (changedB) fixBChanged++;
    if (changedC) fixCChanged++;
  }
}

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`GLOBAL FIX COMPLETE`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Fix A (button labels):    ${fixAChanged} files changed`);
console.log(`Fix B (H2 classNames):    ${fixBChanged} files changed`);
console.log(`Fix C (subtitle lines):   ${fixCChanged} files changed`);
console.log(`\nVariants replaced in Fix A:`);
for (let v of labelVariantsReplaced) console.log("  - " + v);
console.log(`\nVariants replaced in Fix B:`);
for (let v of classVariantsReplaced) console.log("  - " + v);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
