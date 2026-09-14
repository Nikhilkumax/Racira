#!/usr/bin/env node
/**
 * developers-reconcile.mjs — Script-verified reconciliation of
 * data/developers/tools.ts vs domains/developers/registry.ts,
 * plus cross-reference against lib/developers/tools/*.tsx implementations.
 */
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");

// ── Parse the built sets from both files ──────────────────────────
function extractBuiltSet(content) {
  const m = content.match(/const built = new Set\(\[([^\]]+)\]/);
  if (!m) return new Set();
  return new Set(
    m[1]
      .split(",")
      .map((s) => s.trim().replace(/"/g, ""))
      .filter(Boolean)
  );
}

function extractGroups(content) {
  // Extract the groups object — entries are ["Name", "desc"] or ["Name", Icon, "desc"]
  const groups = {};
  let currentCategory = null;
  for (const line of content.split("\n")) {
    const catMatch = line.match(/^\s+"([^"]+)":\s*\[/);
    if (catMatch) {
      currentCategory = catMatch[1];
      groups[currentCategory] = [];
      continue;
    }
    if (currentCategory && line.includes("[")) {
      const nameMatch = line.match(/\["([^"]+)"/);
      if (nameMatch) {
        groups[currentCategory].push(nameMatch[1]);
      }
    }
    if (currentCategory && /^\s+\],/.test(line)) {
      currentCategory = null;
    }
  }
  return groups;
}

const dataContent = readFileSync(
  join(ROOT, "src/data/developers/tools.ts"),
  "utf8"
);
const domainsContent = readFileSync(
  join(ROOT, "src/domains/developers/registry.ts"),
  "utf8"
);

const dataBuilt = extractBuiltSet(dataContent);
const domainsBuilt = extractBuiltSet(domainsContent);

const dataGroups = extractGroups(dataContent);
const domainsGroups = extractGroups(domainsContent);

// ── slugify ──────────────────────────────────────────────────────
const toSlug = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ── Collect all tools from both registries ────────────────────────
const allDataTools = [];
for (const [cat, names] of Object.entries(dataGroups)) {
  for (const name of names) {
    allDataTools.push({ name, slug: toSlug(name), category: cat });
  }
}

const allDomainsTools = [];
for (const [cat, names] of Object.entries(domainsGroups)) {
  for (const name of names) {
    allDomainsTools.push({ name, slug: toSlug(name), category: cat });
  }
}

const dataMap = new Map(allDataTools.map((t) => [t.slug, t]));
const domainsMap = new Map(allDomainsTools.map((t) => [t.slug, t]));

// ── Diff ─────────────────────────────────────────────────────────
const inBoth = [];
const onlyData = [];
const onlyDomains = [];
const conflicts = [];

for (const [slug, d] of dataMap) {
  const r = domainsMap.get(slug);
  if (r) {
    if (d.category !== r.category || d.name !== r.name) {
      conflicts.push({
        slug,
        dataName: d.name,
        domainsName: r.name,
        dataCat: d.category,
        domainsCat: r.category,
      });
    } else {
      inBoth.push(slug);
    }
  } else {
    onlyData.push({ slug, name: d.name, category: d.category });
  }
}

for (const [slug, r] of domainsMap) {
  if (!dataMap.has(slug)) {
    onlyDomains.push({ slug, name: r.name, category: r.category });
  }
}

// ── Check which tools in domains built Set exist in lib/ ─────────
import { readdirSync } from "fs";

const libDir = join(ROOT, "src/lib/developers/tools");
const libFiles = readdirSync(libDir).filter(
  (f) => f.endsWith(".ts") || f.endsWith(".tsx")
);

// Read index.tsx to see what's actually registered
const indexContent = readFileSync(join(libDir, "index.tsx"), "utf8");

// Extract all export names that are imported and registered
const registeredImports = [];
for (const line of indexContent.split("\n")) {
  const m = line.match(
    /import\s*\{\s*(\w+)\s*\}\s*from\s*["']\.\/(\w+)["']/
  );
  if (m) {
    registeredImports.push({ exportName: m[1], file: m[2] });
  }
}

// ── Build tier analysis ──────────────────────────────────────────
const easyCategories = new Set([
  "JSON & Data",
  "Encoding",
  "Regex",
  "Markdown",
  "HTML",
  "Date & Time Dev Utilities",
  "Browser / Storage Utilities",
  "Browser API Testers",
  "Git & Dev Productivity",
  "Network / DevOps",
  "Web / SEO Dev",
]);

const mediumCategories = new Set([
  "CSS / Frontend",
  "JavaScript / TypeScript",
  "Database",
  "Config & Infrastructure",
  "AI / Modern Dev Utilities",
]);

const hardCategories = new Set(["Security", "Build & Bundle Tools"]);

function getTier(cat) {
  if (easyCategories.has(cat)) return "Easy";
  if (mediumCategories.has(cat)) return "Medium";
  if (hardCategories.has(cat)) return "Hard";
  return "Unknown";
}

// ── Output ───────────────────────────────────────────────────────
console.log("=== RECONCILIATION REPORT ===\n");

console.log(`data/developers/tools.ts: ${dataMap.size} tools, ${dataBuilt.size} in built Set`);
console.log(`domains/developers/registry.ts: ${domainsMap.size} tools, ${domainsBuilt.size} in built Set`);

// Count live/soon in domains
const domainsLive = [...domainsMap.values()].filter((t) =>
  domainsBuilt.has(toSlug(t.name))
).length;
const domainsSoon = domainsMap.size - domainsLive;

console.log(`\nDomains registry status: ${domainsLive} live, ${domainsSoon} soon`);

console.log(`\n--- OVERLAP ---`);
console.log(`In both registries (matching): ${inBoth.length}`);
console.log(`Conflicts: ${conflicts.length}`);
if (conflicts.length) {
  for (const c of conflicts) {
    console.log(`  ${c.slug}: data="${c.dataName}"(${c.dataCat}) vs domains="${c.domainsName}"(${c.domainsCat})`);
  }
}

console.log(`\nOnly in data/developers/tools.ts: ${onlyData.length}`);
for (const t of onlyData) {
  console.log(`  ${t.slug} (${t.name}) — ${t.category}`);
}

console.log(`\nOnly in domains/developers/registry.ts: ${onlyDomains.length}`);
for (const t of onlyDomains) {
  console.log(`  ${t.slug} (${t.name}) — ${t.category}`);
}

console.log(`\n--- IMPLEMENTATION STATUS ---`);
console.log(`lib/developers/tools/ files: ${libFiles.length}`);
console.log(`Registered exports in index.tsx: ${registeredImports.length}`);
for (const imp of registeredImports) {
  console.log(`  registerMany(${imp.exportName}) ← ./${imp.file}`);
}

// ── Cross-reference: domains built Set vs lib/ ───────────────────
console.log(`\n--- LIVE-FLAGGED vs IMPLEMENTED ---`);
let liveButUnimplemented = 0;
let implementedAndLive = 0;
let implementedButSoon = 0;

for (const slug of domainsBuilt) {
  // Check if slug is in domains registry
  const tool = domainsMap.get(slug);
  if (!tool) {
    console.log(`  ${slug}: in built Set but NOT in domains registry groups`);
    liveButUnimplemented++;
    continue;
  }
  // Check tier
  const tier = getTier(tool.category);
  console.log(`  ✓ ${slug} — ${tool.category} — ${tier}`);
  implementedAndLive++;
}

console.log(`\nLive but no implementation: ${liveButUnimplemented}`);
console.log(`Live with implementation: ${implementedAndLive}`);

// ── Category summary ─────────────────────────────────────────────
console.log(`\n--- CATEGORY SUMMARY ---`);
const catCounts = {};
for (const t of domainsMap.values()) {
  if (!catCounts[t.category]) catCounts[t.category] = { total: 0, live: 0 };
  catCounts[t.category].total++;
  if (domainsBuilt.has(toSlug(t.name))) catCounts[t.category].live++;
}

for (const [cat, counts] of Object.entries(catCounts)) {
  const tier = getTier(cat);
  console.log(
    `  ${cat}: ${counts.total} total, ${counts.live} live — ${tier}`
  );
}

// ── Tier breakdown for newly buildable ───────────────────────────
console.log(`\n--- TIER BREAKDOWN (for soon tools) ---`);
const tierCounts = { Easy: 0, Medium: 0, Hard: 0 };
for (const t of domainsMap.values()) {
  if (!domainsBuilt.has(toSlug(t.name))) {
    tierCounts[getTier(t.category)]++;
  }
}
console.log(`  Easy: ${tierCounts.Easy} tools to build`);
console.log(`  Medium: ${tierCounts.Medium} tools to build`);
console.log(`  Hard: ${tierCounts.Hard} tools to build`);
console.log(`  Total soon: ${tierCounts.Easy + tierCounts.Medium + tierCounts.Hard}`);
