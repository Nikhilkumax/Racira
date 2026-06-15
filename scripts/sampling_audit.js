const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DB_DIR = path.join(ROOT, 'calculator-database');
const REG_DIR = path.join(ROOT, 'src/data/calculators');
const SLUG_PAGE = path.join(ROOT, 'src/app/calculator/[slug]/page.tsx');
const SITEMAP_PAGE = path.join(ROOT, 'src/app/sitemap.ts');

const DB_FILES = ['finance','business','health','math','science','engineering',
  'technology','environment','everyday-life','transportation','construction','education'];

let dbAll = [];
for (const f of DB_FILES) {
  const raw = JSON.parse(fs.readFileSync(path.join(DB_DIR, `${f}.json`), 'utf8'));
  let arr = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw.subcategories) {
    for (const sub of Object.values(raw.subcategories)) {
      if (sub && Array.isArray(sub.calculators)) arr.push(...sub.calculators);
    }
  } else if (raw.calculators) {
    arr = raw.calculators;
  }
  dbAll.push(...arr.map(c => ({ ...c, _file: f })));
}

let regAll = [];
for (const f of DB_FILES) {
  const text = fs.readFileSync(path.join(REG_DIR, `${f}.ts`), 'utf8');
  const matches = [...text.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
  matches.forEach((slug) => regAll.push(slug));
}

const slugText = fs.readFileSync(SLUG_PAGE, 'utf8');
const routeKeys = [...slugText.matchAll(/"([^"]+)":\s*\(\)\s*=>/g)].map(m => m[1]);
const builtRouteSet = new Set(routeKeys);

const sitemapText = fs.readFileSync(SITEMAP_PAGE, 'utf8');

// Shuffle and pick 50
const shuffled = dbAll.sort(() => 0.5 - Math.random());
const sample = shuffled.slice(0, 50);

const lines = [];
lines.push('# Phase 2 — Random Calculator Sampling Audit\n');
lines.push(`Generated: ${new Date().toISOString()}\n`);

lines.push('| ID | Slug | Category | DB | Registry | Built Match | Route Exists | Format |');
lines.push('|----|------|----------|----|----------|-------------|--------------|--------|');

let passed = 0;

sample.forEach((calc, i) => {
  const slug = calc.slug;
  const inDb = true; // We sourced from DB
  const inReg = regAll.includes(slug);
  const isBuiltDb = !!calc.isBuilt;
  const inRouteSet = builtRouteSet.has(slug);
  const builtMatch = isBuiltDb === inRouteSet;
  const isAlphaNum = /^[a-z0-9\-]+$/.test(slug);

  const status = inReg && builtMatch && isAlphaNum ? '✅' : '❌';
  if (status === '✅') passed++;

  lines.push(`| ${i + 1} | \`${slug}\` | ${calc.category} | ✅ | ${inReg ? '✅' : '❌'} | ${builtMatch ? '✅' : '❌'} | ${inRouteSet ? 'Yes' : 'No'} | ${isAlphaNum ? '✅' : '❌'} |`);
});

lines.push('\n## Summary');
lines.push(`- **Sample Size:** 50`);
lines.push(`- **Passed Checks:** ${passed}/50`);
lines.push(`- **Sitemap Inclusion Check:** ` + (sitemapText.includes('calculatorRegistry.map(') ? '✅ Verified (Dynamic Array Mapping)' : '❌ Failed'));
lines.push(`- **Status:** ${passed === 50 ? '✅ READY FOR PRODUCTION' : '❌ FAILED AUDIT'}`);

const OUT = path.join(ROOT, 'final_calculator_sampling_audit.md');
fs.writeFileSync(OUT, lines.join('\n'));
console.log(`\n✅ Sampling Audit complete → ${OUT}`);
