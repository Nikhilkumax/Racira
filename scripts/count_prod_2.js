const ts = require('typescript');
const fs = require('fs');
const text = fs.readFileSync('src/data/productivity/tools.ts', 'utf8');

// The file exports TOTAL_TOOLS, let's just log it!
const match = text.match(/export const TOTAL_TOOLS = ([0-9]+);/);
if (match) {
  console.log('Total tools in productivity:', match[1]);
} else {
  console.log('Could not find TOTAL_TOOLS');
}
