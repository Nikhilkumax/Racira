/**
 * Dispatcher Coverage Check
 * 
 * Asserts that every registry slug with status "live" has a matching
 * `case` statement in processFiles that returns a real result (not
 * coming-soon). This catches the root cause behind merge, pdf-to-image,
 * pdf-to-text, protect, and unlock — five instances of the same bug.
 * 
 * Run: npx tsx scratch/dispatcher-coverage-check.ts
 */

import { readFileSync } from "fs";

const registrySrc = readFileSync("src/domains/pdf/registry/tools.ts", "utf8");
const dispatcherSrc = readFileSync("src/lib/pdf/pdf-tools.ts", "utf8");

// Extract all live slugs from registry
const liveSlugs: string[] = [];
const slugRegex = /slug:\s*["']([^"']+)["']/g;
const statusRegex = /status:\s*["'](\w+)["']/g;

// Parse registry entries: find each tool object and extract slug + status
const toolEntries = registrySrc.match(/\{[^}]*slug:\s*["'][^"']+["'][^}]*\}/g) || [];
for (const entry of toolEntries) {
  const slugMatch = entry.match(/slug:\s*["']([^"']+)["']/);
  const statusMatch = entry.match(/status:\s*["'](\w+)["']/);
  if (slugMatch && statusMatch && statusMatch[1] === "live") {
    liveSlugs.push(slugMatch[1]);
  }
}

console.log(`Found ${liveSlugs.length} live slugs in registry`);

// Slugs dispatched through usePdfEditor, not processFiles — exempt from this check
const editorSlugs = new Set(["split", "delete-pages", "organize-pages", "rotate", "add-text", "headers-footers", "add-watermark", "crop-pages"]);

// For each live slug, check if processFiles has a case that returns something real
const missing: string[] = [];
const comingSoon: string[] = [];

for (const slug of liveSlugs) {
  // Skip editor-dispatched tools — they work via usePdfEditor, not processFiles
  if (editorSlugs.has(slug)) continue;

  const casePattern = `case "${slug}"`;
  const idx = dispatcherSrc.indexOf(casePattern);
  
  if (idx === -1) {
    missing.push(slug);
    continue;
  }
  
  // Check the case body (up to next case label) for coming-soon
  const nextCaseIdx = dispatcherSrc.indexOf('\n    case "', idx + casePattern.length);
  const endIdx = nextCaseIdx !== -1 ? nextCaseIdx : Math.min(dispatcherSrc.length, idx + 1000);
  const caseBody = dispatcherSrc.substring(idx, endIdx);
  if (caseBody.includes('coming-soon')) {
    comingSoon.push(slug);
  }
}

console.log(`\n=== Results ===`);
console.log(`Live slugs with working case: ${liveSlugs.length - missing.length - comingSoon.length}`);
console.log(`Live slugs MISSING from dispatcher: ${missing.length}`);
console.log(`Live slugs returning coming-soon: ${comingSoon.length}`);

if (missing.length > 0) {
  console.log(`\n❌ MISSING (no case in processFiles):`);
  missing.forEach(s => console.log(`  - ${s}`));
}

if (comingSoon.length > 0) {
  console.log(`\n⚠️  COMING-SOON (case exists but returns coming-soon):`);
  comingSoon.forEach(s => console.log(`  - ${s}`));
}

if (missing.length === 0 && comingSoon.length === 0) {
  console.log(`\n✅ All live slugs have working dispatcher cases.`);
}

// Also check for case statements that don't match any registry slug
const caseRegex = /case\s+"([^"]+)"/g;
const allCases = new Set<string>();
let m;
while ((m = caseRegex.exec(dispatcherSrc)) !== null) {
  allCases.add(m[1]);
}

const registrySlugs = new Set(toolEntries.map(e => {
  const slugMatch = e.match(/slug:\s*["']([^"']+)["']/);
  return slugMatch ? slugMatch[1] : null;
}).filter(Boolean));

const orphanCases = [...allCases].filter(c => !registrySlugs.has(c));
if (orphanCases.length > 0) {
  console.log(`\nℹ️  Orphan cases (in dispatcher but not in registry): ${orphanCases.length}`);
  orphanCases.forEach(s => console.log(`  - ${s}`));
}

process.exit(missing.length > 0 || comingSoon.length > 0 ? 1 : 0);
