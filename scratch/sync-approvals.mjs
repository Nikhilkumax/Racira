// Reusable post-batch sync: 
//  1) ensures rebuilt slugs are recorded as COMPONENT NAMES in _approved.json (scan matches file names)
//  2) converts stale slug-style entries to component names
//  3) repairs + prunes calculatorStubSlugs.ts (the parallel generator writes it malformed)
// Usage: node scratch/sync-approvals.mjs slug1 slug2 ...
import fs from "fs";
import path from "path";

const root = process.cwd();
const APPROVED = path.join(root, "src/domains/calculator/components/_approved.json");
const LAZY = path.join(root, "src/app/calculator/lazyComponents.tsx");
const STUBS = path.join(root, "src/lib/tools/calculatorStubSlugs.ts");

// slug -> component name from lazyComponents.tsx
const lazySrc = fs.readFileSync(LAZY, "utf8");
const slugToComp = {};
for (const m of lazySrc.matchAll(/"([a-z0-9-]+)":\s*\(\)\s*=>\s*import\(["'][^"']*\/components\/([A-Za-z0-9]+)["']\)/g)) {
  slugToComp[m[1]] = m[2];
}

// ---- approvals ----
const raw = JSON.parse(fs.readFileSync(APPROVED, "utf8"));
const data = Array.isArray(raw) ? { approved: raw } : raw;
let approved = data.approved || [];
let changed = false;

const compSet = new Set(approved.filter(n => !n.includes("-")));
// convert slug-style entries to component names
const newApproved = [];
for (const n of approved) {
  if (!n.includes("-")) { newApproved.push(n); continue; }
  const comp = slugToComp[n];
  if (comp && !compSet.has(comp)) { compSet.add(comp); newApproved.push(comp); changed = true; }
  // drop unresolvable slug entries
  else if (!comp) { changed = true; }
}
approved = newApproved;

const wanted = process.argv.slice(2);
const added = [];
for (const slug of wanted) {
  const comp = slugToComp[slug];
  if (!comp) { console.warn(`  !! no component found for slug ${slug}`); continue; }
  if (!approved.includes(comp)) { approved.push(comp); added.push(comp); }
}

data.approved = approved;
if (Array.isArray(raw)) {
  fs.writeFileSync(APPROVED, JSON.stringify(approved, null, 2));
} else {
  fs.writeFileSync(APPROVED, JSON.stringify(data, null, 2));
}
console.log(`approved: ${approved.length} entries | added names: ${added.join(", ") || "none"}`);

// ---- stub slugs ----
const stubSrc = fs.readFileSync(STUBS, "utf8");
let fixed = stubSrc
  .replace(/string\[\\?"\]/, "string[]")   // generator writes string[\"] — repair
  .replace(/\]([^\]]*)\](\s*;\s*)$/m, "]$2") // generator writes ]] — repair tail
  .replace(/:\s*string\[\]\s*;/, ": string[] = [];"); // generator may emit bare declaration
if (fixed !== stubSrc) changed = true;
const open = fixed.indexOf("export const");
const eq = fixed.indexOf("=", open);
let slugs = [];
if (eq !== -1) {
  const bracket = fixed.indexOf("[", eq);
  const close = fixed.lastIndexOf("]");
  const body = fixed.slice(bracket + 1, close);
  slugs = body.split(",").map(s => s.trim().replace(/^"|"$/g, "")).filter(s => s.length > 0);
}
const before = slugs.length;
const present = slugs.filter(s => wanted.includes(s));
slugs = slugs.filter(s => !wanted.includes(s));
if (present.length) changed = true;
let out;
if (eq === -1) {
  // bare declaration — emit full statement with empty/remaining list
  out = fixed.trimEnd().replace(/;\s*$/, "") + " = [" + slugs.map(s => `"${s}"`).join(", ") + "];";
} else {
  const bracket = fixed.indexOf("[", eq);
  const close = fixed.lastIndexOf("]");
  out = fixed.slice(0, bracket) + "[" + slugs.map(s => `"${s}"`).join(", ") + "]" + fixed.slice(close + 1);
}
fs.writeFileSync(STUBS, out);
console.log(`stubs: ${before} -> ${slugs.length} | removed: ${present.join(", ") || "none"}`);
console.log(changed ? "sync complete (changes written)" : "no changes needed");
