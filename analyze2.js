const fs = require('fs');
const path = require('path');

const dir = 'src/domains/calculator/components';
const d = require('./work_list.json');
const approved = JSON.parse(fs.readFileSync(path.join(dir, '_approved.json'), 'utf8')).approved;

const tsxFiles = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
console.log('Total .tsx files:', tsxFiles.length);

// Build a map of slug -> filename
function slugToFilename(slug) {
  const name = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  return pascal + '.tsx';
}

// Check a file for Gold Standard compliance
function checkFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const checks = {
    hasUseClient: content.includes('"use client"'),
    hasAny: /\bany\b/.test(content),
    hasUseEffect: /useEffect/.test(content),
    hasCalculateBtn: /['"]Calculate['"]/.test(content),
    hasRecharts: /from ["']recharts["']/.test(content),
    hasChart: /Chart/.test(content),
    hasSummaryStats: /Summary Stat/i.test(content),
    hasBreakdownTable: /Breakdown|Pay Breakdown|<table/i.test(content),
    hasPrimaryCard: /border-l-4 border-primary|bg-primary\/10/i.test(content),
    has3StatBar: /grid grid-cols-3/i.test(content),
    hasDefaults: /DEFAULTS/.test(content),
    hasState: /useState/.test(content),
    hasReset: /Reset|RotateCcw|reset/i.test(content),
    hasAdvancedToggle: /Advanced|showAdvanced/i.test(content),
    hasPopularCalculators: /PopularCalculators/.test(content),
    hasFaq: /FAQSection/.test(content),
    noSubtitleUnderH1: true, // hard to check programmatically
  };
  
  // Check for subtitle under H1 (look for h1 followed by another line that's a paragraph or h2 close to h1)
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  let hasSubtitleAfterH1 = false;
  if (h1Match) {
    const afterH1 = content.slice(content.indexOf(h1Match[0]) + h1Match[0].length, content.indexOf(h1Match[0]) + h1Match[0].length + 500);
    // Check if there's a p tag or h2/h3 immediately after h1 before the grid
    if (afterH1.match(/^\s*<p\b/i) || afterH1.match(/^\s*<h2\b/i) || afterH1.match(/^\s*<h3\b/i)) {
      // But some p tags might be part of SEO section, check if it's within 5 lines
      hasSubtitleAfterH1 = true;
    }
  }
  
  checks.hasSubtitleUnderH1 = hasSubtitleAfterH1;
  
  // Count result component types
  const resultComponentCount = [
    checks.hasPrimaryCard,
    checks.has3StatBar,
    checks.hasBreakdownTable,
    checks.hasChart,
    checks.hasSummaryStats
  ].filter(x => x).length;
  
  return { checks, resultComponentCount };
}

let totalExisting = 0;
let fullyCompliant = 0;
let needsPolish = 0;
let needsRebuild = 0;
let missingFile = 0;
let missingList = [];

for (const item of d) {
  const f = slugToFilename(item.slug);
  const filepath = path.join(dir, f);
  if (!fs.existsSync(filepath)) {
    missingFile++;
    missingList.push(item.slug);
    continue;
  }
  totalExisting++;
  
  const { checks, resultComponentCount } = checkFile(filepath);
  
  // Gold Standard check: no 'any', has useEffect, has Calculate btn, has chart, has all 5 result components, has no subtitle
  const isGoldStandard = 
    !checks.hasAny &&
    checks.hasUseEffect &&
    checks.hasCalculateBtn &&
    checks.hasRecharts &&
    checks.hasChart &&
    checks.hasSummaryStats &&
    checks.hasBreakdownTable &&
    checks.hasPrimaryCard &&
    checks.has3StatBar &&
    checks.hasDefaults &&
    checks.hasReset &&
    !checks.hasSubtitleUnderH1 &&
    resultComponentCount >= 5;
  
  if (isGoldStandard) {
    fullyCompliant++;
  } else if (item.action === 'REBUILD') {
    needsRebuild++;
  } else {
    // File exists but not Gold Standard - check if it's a surface issue (polish) or deeper problem (rebuild)
    needsRebuild++;
  }
}

console.log('\n=== ANALYSIS ===');
console.log('Total calculators in work_list:', d.length);
console.log('With existing files:', totalExisting);
console.log('Missing files (need CREATE):', missingFile);
console.log('Fully Gold Standard compliant (no changes):', fullyCompliant);
console.log('Existing but need work (polish or rebuild):', needsRebuild);
console.log('Need rebuild (REBUILD action):', d.filter(x => x.action === 'REBUILD').length);
console.log('Need create (CREATE action):', d.filter(x => x.action === 'CREATE').length);
