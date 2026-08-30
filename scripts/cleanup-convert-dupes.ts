import { readFileSync, writeFileSync } from 'fs';

const file = 'src/domains/pdf/registry/tool-seo.ts';
let content = readFileSync(file, 'utf-8');
const lines = content.split('\n');

// Remove first set of Convert from PDF consts (lines 1534-2050)
// and the stray semicolons between sets
const firstStart = 1532; // blank line before first set
const firstEnd = 2053;   // includes stray semicolons after

// Verify: line 1534 should be "const seoPdfToBmp", line 2055 should also be
console.log(`Line 1534: "${lines[1533]}"`);
console.log(`Line 2055: "${lines[2054]}"`);

// Remove lines 1533 (first blank) through 2054 (inclusive - the second blank/stray)
const cleaned = [
  ...lines.slice(0, 1533),
  ...lines.slice(2054),
];

// Now find and remove the duplicate explicitSeo block
// Find "/* ── Convert from PDF batch ── */" in explicitSeo - should appear twice
const explicitStart = cleaned.findIndex((l, i) => l.includes('/* ── Convert from PDF batch ── */') && i > cleaned.indexOf('explicitSeo'));
console.log(`First explicitSeo Convert block starts at line: ${explicitStart + 1}`);

const explicitSecond = cleaned.indexOf('/* ── Convert from PDF batch ── */', explicitStart + 1);
console.log(`Second explicitSeo Convert block starts at line: ${explicitSecond + 1}`);

// Remove from first occurrence to just before the second one
const secondBlockEnd = cleaned.findIndex((l, i) => i > explicitSecond && l.includes('/* ── Organize PDF batch ── */'));
console.log(`Organize block starts at line: ${secondBlockEnd + 1}`);

// Remove the first Convert from PDF block in explicitSeo (lines explicitStart to secondBlockEnd - 1)
// Keep from explicitStart, remove the duplicate lines, keep second block
const final = [
  ...cleaned.slice(0, explicitStart),
  ...cleaned.slice(explicitSecond, secondBlockEnd),
  ...cleaned.slice(secondBlockEnd),
];

writeFileSync(file, final.join('\n'));
console.log(`Final file: ${final.length} lines (was ${lines.length})`);
