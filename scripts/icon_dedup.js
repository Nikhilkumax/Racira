/**
 * icon_dedup.js — Full within-category icon duplication check.
 * Usage: node scripts/icon_dedup.js <domain>
 * Supported domains: audio, cad (and any with inline { name, slug } registry format)
 */
const fs = require('fs');

const REGISTRY = process.argv[2] || 'audio';
const iconMapText = fs.readFileSync('src/components/shared/icon-map.ts', 'utf8');

// Parse overrides map — last write wins (matches JS runtime behavior for duplicate keys)
const overridesMatch = iconMapText.match(/const OVERRIDES: Record<string, string> = \{([\s\S]*?)\};/);
const overrides = {};
if (overridesMatch) {
  overridesMatch[1].split('\n').forEach(line => {
    const m = line.match(/"([^"]+)":\s*"([^"]+)"/);
    if (m) overrides[m[1]] = m[2];
  });
}

// Resolve icon for a given tool name+slug using overrides then heuristics
function resolveIcon(name, slug) {
  if (overrides[slug]) return overrides[slug];
  if (/time|timer|clock/i.test(name)) return 'Clock';
  if (/schedule|calendar/i.test(name)) return 'Calendar';
  if (/convert/i.test(name)) return 'RefreshCw';
  if (/compress|optimiz/i.test(name)) return 'Minimize2';
  if (/crop/i.test(name)) return 'Crop';
  if (/resize|scale|extend|canvas/i.test(name)) return 'Maximize';
  if (/rotate/i.test(name)) return 'RotateCw';
  if (/flip/i.test(name)) return 'FlipHorizontal';
  if (/background|remove|eraser/i.test(name)) return 'Eraser';
  if (/enhance|sharp/i.test(name)) return 'Sparkles';
  if (/color|hue|saturation/i.test(name)) return 'Sliders';
  if (/grayscale|palette/i.test(name)) return 'Palette';
  if (/watermark|batch/i.test(name)) return 'Layers';
  if (/metadata|exif|info/i.test(name)) return 'FileSearch';
  if (/compare/i.test(name)) return 'GitCompare';
  if (/blur|editor/i.test(name)) return 'Brush';
  if (/image/i.test(name)) return 'Image';
  return 'Workflow';
}

const registryText = fs.readFileSync(`src/domains/${REGISTRY}/registry.ts`, 'utf8');
const tools = [];

// PATTERN A: Audio-style — export const categories with { name: "Cat", tools: [ { name, slug, ... } ] }
// Parse each category block: name: "...", \n  tools: [...]
const audioCatPattern = /name:\s*"([^"]+)",\s*\n\s*tools:\s*\[([\s\S]*?)\n\s*\],/g;
const audioCatBlocks = [...registryText.matchAll(audioCatPattern)];

if (audioCatBlocks.length > 0) {
  audioCatBlocks.forEach(cb => {
    const catName = cb[1];
    const body = cb[2];
    const toolMatches = [...body.matchAll(/name: "([^"]+)", slug: "([^"]+)"/g)];
    toolMatches.forEach(t => tools.push({ category: catName, name: t[1], slug: t[2], icon: resolveIcon(t[1], t[2]) }));
  });
} else {
  // PATTERN B: cat("Title", [...]) or buildCat("Title", [...]) style
  const cadCatPattern = /(?:cat|buildCat)\("([^"]+)",\s*\[([\s\S]*?)\]\)/g;
  const cadCatBlocks = [...registryText.matchAll(cadCatPattern)];
  const slugify = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  cadCatBlocks.forEach(cb => {
    const catName = cb[1];
    const body = cb[2];
    // We need to parse def("Name", "Desc") OR ["Name", "Desc"]
    // Pattern matches: def("Name", "Desc") or ["Name", "Desc"]
    const pairs = [...body.matchAll(/(?:def\(|\[)\s*"([^"]+)"\s*,\s*"([^"]+)"/g)];
    pairs.forEach(p => {
      const name = p[1];
      const slug = slugify(name);
      tools.push({ category: catName, name, slug, icon: resolveIcon(name, slug) });
    });
  });
}

// Sweep
const GEOMETRIC = ['Star', 'Circle', 'Square', 'Hexagon', 'Octagon', 'Triangle'];
let geometricCount = 0, workflowCount = 0;

const byCategory = {};
tools.forEach(t => {
  if (!byCategory[t.category]) byCategory[t.category] = [];
  byCategory[t.category].push(t);
  if (GEOMETRIC.includes(t.icon)) geometricCount++;
  if (t.icon === 'Workflow') workflowCount++;
});

const dupePairs = [];
Object.entries(byCategory).forEach(([cat, catTools]) => {
  const iconMap = {};
  catTools.forEach(t => {
    if (!iconMap[t.icon]) iconMap[t.icon] = [];
    iconMap[t.icon].push(t.name);
  });
  Object.entries(iconMap).forEach(([icon, names]) => {
    if (names.length > 1) dupePairs.push({ category: cat, icon, tools: names });
  });
});

console.log(`\n=== FULL ICON DEDUP CHECK: ${REGISTRY.toUpperCase()} ===`);
console.log(`Total tools: ${tools.length}`);
console.log(`Workflow fallbacks: ${workflowCount}`);
console.log(`Geometric fallbacks (non-semantic): ${geometricCount}`);
console.log(`Within-category icon duplicates: ${dupePairs.length} group(s)\n`);
dupePairs.forEach(d => {
  console.log(`  [${d.category}] icon=${d.icon}`);
  d.tools.forEach(t => console.log(`    - ${t}`));
});
