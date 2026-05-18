// Script to remove duplicate "Calculate" buttons from all calculator files
// The pattern is: original btn-calculate button, then a second button with 
// hover:scale-[1.02] active:scale-[0.98] class containing Calculator icon

const fs = require('fs');
const path = require('path');

const calcDir = path.join(__dirname, 'src', 'calculators');
const files = fs.readdirSync(calcDir).filter(f => f.endsWith('.tsx'));

let fixedCount = 0;
let errorFiles = [];

for (const file of files) {
  const filePath = path.join(calcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern: The duplicate button block looks like this (with variations):
  // \r\n              <button\r\n                onClick={handleCalculate}\r\n                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"\r\n              >\r\n                <Calculator className="h-4 w-4" />\r\n                Calculate\r\n              </button>
  // followed by the reset button inline

  // Strategy: Find and remove the duplicate button block
  // The duplicate always contains "hover:scale-[1.02] active:scale-[0.98]"
  
  // Pattern 1: Standalone duplicate button (most common pattern)
  // Matches from the newline before <button to </button> including the hover:scale pattern
  const regex1 = /\s*<button\s*\n?\s*onClick=\{handleCalculate\}\s*\n?\s*className="flex-1 bg-primary text-primary-foreground hover:bg-primary\/90 font-bold py-3 px-8 rounded-xl transition-all hover:scale-\[1\.02\] active:scale-\[0\.98\] flex items-center justify-center gap-2"\s*\n?\s*>\s*\n?\s*<Calculator className="h-4 w-4" \/>\s*\n?\s*Calculate\s*\n?\s*<\/button>/g;

  content = content.replace(regex1, '');

  // Also handle \r\n line endings
  const regex2 = /\s*<button\r?\n?\s*onClick=\{handleCalculate\}\r?\n?\s*className="flex-1 bg-primary text-primary-foreground hover:bg-primary\/90 font-bold py-3 px-8 rounded-xl transition-all hover:scale-\[1\.02\] active:scale-\[0\.98\] flex items-center justify-center gap-2"\r?\n?\s*>\r?\n?\s*<Calculator className="h-4 w-4" \/>\r?\n?\s*Calculate\r?\n?\s*<\/button>/g;
  
  content = content.replace(regex2, '');

  // Also handle the pattern where it's on fewer lines (compressed)
  const regex3 = /\s*<button\s+onClick=\{handleCalculate\}\s+className="flex-1 bg-primary[^"]*hover:scale-\[1\.02\][^"]*"[^>]*>[^<]*<Calculator[^/]*\/>[^<]*Calculate[^<]*<\/button>/g;
  
  content = content.replace(regex3, '');

  // Now also remove unused Calculator import if it's no longer used in the file
  // But only if Calculator is not used elsewhere in the file
  if (content !== original) {
    // Check if Calculator icon is used elsewhere in the file (besides the import)
    const withoutImport = content.replace(/import.*Calculator.*lucide-react.*/, '');
    if (!withoutImport.includes('<Calculator')) {
      // Remove Calculator from the import
      // Pattern: , Calculator
      content = content.replace(/, Calculator(?=[\s,}])/g, (match, offset) => {
        // Only remove if it's in an import statement (first 500 chars)
        if (offset < 500) return '';
        return match;
      });
      // Pattern: Calculator, 
      content = content.replace(/Calculator, /g, (match, offset) => {
        if (offset < 500) return '';
        return match;
      });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✓ Fixed: ${file}`);
  }
}

console.log(`\nDone! Fixed ${fixedCount} files.`);
if (errorFiles.length > 0) {
  console.log('Errors:', errorFiles);
}
