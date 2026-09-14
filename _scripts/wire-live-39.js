// WIRE 39 APPROVED CALCULATORS LIVE
// 1) finance.ts:   status: "soon" -> "live" for the 39 target slugs (block-scoped)
// 2) lazyComponents.tsx: insert "slug": () => import(...) entries before the map closes
const fs = require("fs");
const path = require("path");

const COMPONENTS_DIR = "src/domains/calculator/components";
const REGISTRY_FILE = "src/domains/calculator/registry/finance.ts";
const LAZY_FILE = "src/app/calculator/lazyComponents.tsx";

// Read target slugs from the phase-1 rebuild list (status "soon" in registry)
const slugs = fs
  .readFileSync("status_rebuild.txt", "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => l.split(" — ")[0]);
if (slugs.length !== 39) throw new Error("Expected 39 slugs, got " + slugs.length);

// Resolve slug -> component file base (candidates in the same order the scan used)
function pascal(slug) {
  return slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}
function resolveFile(slug) {
  const p = pascal(slug);
  for (const c of [p, p + "Calculator", p + "Calc", p + "Full", p + "CalculatorFull"]) {
    if (fs.existsSync(path.join(COMPONENTS_DIR, c + ".tsx"))) return c + ".tsx";
  }
  return null;
}

const mapping = {};
for (const slug of slugs) {
  const file = resolveFile(slug);
  if (!file) throw new Error("No component file for " + slug);
  mapping[slug] = file;
}
console.log("Resolved " + Object.keys(mapping).length + " slug->file mappings");

// ---------------------------------------------------------------- 1) registry flip
let reg = fs.readFileSync(REGISTRY_FILE, "utf8");
let flipped = 0;
for (const slug of slugs) {
  const start = reg.indexOf('slug: "' + slug + '"');
  if (start === -1) throw new Error("Slug not found in " + REGISTRY_FILE + ": " + slug);
  // entry block ends at the next '{ slug:' or EOF
  let end = reg.indexOf("{ slug:", start + 4);
  if (end === -1) end = reg.length;
  const block = reg.slice(start, end);
  const statusMatch = block.match(/status:\s*"(\w+)"/);
  if (!statusMatch) throw new Error("No status token in block for " + slug);
  if (statusMatch[1] !== "soon") throw new Error("Expected status soon for " + slug + ", got " + statusMatch[1]);
  const firstSoon = block.indexOf('status: "soon"');
  if (firstSoon === -1) throw new Error("No status soon literal for " + slug);
  reg = reg.slice(0, start + firstSoon) + 'status: "live"' + reg.slice(start + firstSoon + 'status: "soon"'.length);
  flipped++;
}
fs.writeFileSync(REGISTRY_FILE, reg, "utf8");
console.log("Registry: flipped " + flipped + " entries to live in " + REGISTRY_FILE);

// ---------------------------------------------------------------- 2) lazyComponents insert
let lazy = fs.readFileSync(LAZY_FILE, "utf8");
const eol = lazy.includes("\r\n") ? "\r\n" : "\n";
const closeIdx = lazy.indexOf("};");
if (closeIdx === -1) throw new Error("Could not find closing '};' in " + LAZY_FILE);
const lines = Object.keys(mapping)
  .sort()
  .map((slug) => '  "' + slug + '": () => import("@/domains/calculator/components/' + mapping[slug].replace(/\.tsx$/, "") + '"),');
const insertText = lines.join(eol) + eol;
lazy = lazy.slice(0, closeIdx) + insertText + lazy.slice(closeIdx);
fs.writeFileSync(LAZY_FILE, lazy, "utf8");
console.log("lazyComponents: inserted " + lines.length + " route entries");

// ---------------------------------------------------------------- post-checks
let reg2 = fs.readFileSync(REGISTRY_FILE, "utf8");
let lazy2 = fs.readFileSync(LAZY_FILE, "utf8");
const soonCount = [...reg2.matchAll(/status:\s*"soon"/g)].length;
const ok = [];
for (const slug of slugs) {
  const start = reg2.indexOf('slug: "' + slug + '"');
  let end = reg2.indexOf("{ slug:", start + 4);
  if (end === -1) end = reg2.length;
  const st = (reg2.slice(start, end).match(/status:\s*"(\w+)"/) || [])[1];
  const entry = new RegExp('"' + slug + '":\\s*\\(\\)\\s*=>\\s*import\\("([^"]+)"\\)').exec(lazy2);
  const fileOk = entry && fs.existsSync(path.join(COMPONENTS_DIR, entry[1].split("/").pop() + ".tsx"));
  ok.push({ slug, status: st, lazy: !!entry, fileOk });
}
const bad = ok.filter((o) => o.status !== "live" || !o.lazy || !o.fileOk);
console.log("Post-check: " + (ok.length - bad.length) + "/" + ok.length + " fully wired; remaining soon-tokens in finance.ts: " + soonCount);
if (bad.length) {
  console.log("FAILED:");
  for (const b of bad) console.log("  " + JSON.stringify(b));
  process.exit(1);
}
console.log("All 39 slugs: status=live, lazy route present, target file exists ✓");
