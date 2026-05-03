const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace the broken sections
// Pattern: ]; followed by some comments and getCategories and finally || [
const pattern = /\];\s*\/\/ Helper functions\s*export const getCategories = \(\) => \{\s*const cats = new Map<string, CalculatorDef\[\]>\(\);\s*calculatorRegistry\.forEach\(c => \{\s*const list = cats\.get\(c\.category\) \|\| \[/g;

const cleaned = content.replace(pattern, '  ,');

fs.writeFileSync(file, cleaned, 'utf8');
console.log('Cleaned up intermediate array closures and broken helper functions.');
