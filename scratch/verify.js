const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Not available? We can use recursive reading.

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const complexFiles = [
  "src/app/audio/page.tsx",
  "src/app/productivity/page.tsx",
  "src/app/writing/page.tsx",
  "src/app/voice/page.tsx",
  "src/app/developers/page.tsx",
  "src/app/finance/page.tsx",
  "src/app/3d/page.tsx",
  "src/app/insight/page.tsx",
  "src/app/engineering/page.tsx",
  "src/app/security/page.tsx",
  "src/app/maps/page.tsx",
  "src/app/typography/page.tsx",
  "src/app/photo/page.tsx",
  "src/app/animator/page.tsx"
];

let allHeroBlocks = {};

console.log("=== CHECKING COMPLEX FILES ===");
for (let file of complexFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check "use client" position
    let useClientMatch = content.match(/["']use client["'];?/);
    if (useClientMatch) {
      if (useClientMatch.index > 0) {
        let before = content.substring(0, useClientMatch.index).trim();
        if (before.length > 0) {
          console.log(`[WARN] ${file}: 'use client' is not the first statement.`);
        }
      }
    }
    
    // Check duplicate Search imports
    let searchImports = (content.match(/Search/g) || []).length;
    let searchElements = (content.match(/<Search/g) || []).length;
    let inputs = (content.match(/<input/g) || []).length;
    
    // Check state variables
    let stateMatch = content.match(/const\s+\[(.*?),/);
    if (stateMatch) {
        let stateVar = stateMatch[1].trim();
        // Check if wired
        if (content.includes(`value={${stateVar}}`) || content.includes(`value={query}`) || content.includes(`value={q}`)) {
            // wired
        } else {
            console.log(`[WARN] ${file}: State variable might not be wired to search input.`);
        }
    }
  }
}

console.log("\n=== HERO EXTRACTION ===");
let pageFiles = [];
walkDir('src/app', (filepath) => {
  if (filepath.endsWith('page.tsx')) {
    pageFiles.push(filepath);
  }
});
pageFiles.push('src/domains/pdf/tools/Index.tsx');
pageFiles.push('src/domains/voice/components/tts-sections/TTSHero.tsx');

let heroDiffs = [];
for (let file of pageFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let start = content.indexOf('<section className="pt-12 pb-8 sm:pt-16 sm:pb-10">');
    if (start !== -1) {
        let end = content.indexOf('</section>', start) + '</section>'.length;
        heroDiffs.push({ file, content: content.substring(start, end) });
    }
}
fs.writeFileSync('scratch/hero_diffs.json', JSON.stringify(heroDiffs, null, 2));
console.log(`Extracted ${heroDiffs.length} heroes to scratch/hero_diffs.json`);

console.log("\n=== TOOL COUNTS CHECK ===");
// Run a quick scan of registry directories
let registries = [];
walkDir('src/data', (filepath) => {
    if (filepath.endsWith('tools.ts') || filepath.endsWith('index.ts') || filepath.endsWith('registry.ts')) {
        registries.push(filepath);
    }
});
walkDir('src/domains', (filepath) => {
    if (filepath.endsWith('registry/index.ts') || filepath.endsWith('registry.ts') || filepath.includes('registry') && filepath.endsWith('.ts')) {
        registries.push(filepath);
    }
});

fs.writeFileSync('scratch/registries.json', JSON.stringify(registries, null, 2));
console.log(`Found ${registries.length} potential registry files to inspect.`);
