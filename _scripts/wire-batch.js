// Wire a build batch: slugs passed as argv become live (registry flip), get a
// lazyComponents route, and are appended to _approved.json (approved + slugs).
// Usage: node _scripts/wire-batch.js slug1 slug2 ...
const fs = require("fs");
const path = require("path");

const COMPONENTS_DIR = "src/domains/calculator/components";
const REGISTRY_FILES = fs.readdirSync("src/domains/calculator/registry").filter((f) => f.endsWith(".ts"));
const LAZY_FILE = "src/app/calculator/lazyComponents.tsx";
const APPROVED_FILE = "src/domains/calculator/components/_approved.json";

const slugs = process.argv.slice(2);
if (!slugs.length) throw new Error("Pass at least one slug");

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

// 1) Registry flips (any registry file, block-scoped)
let flippedTotal = 0;
for (const rf of REGISTRY_FILES) {
  const p = path.join("src/domains/calculator/registry", rf);
  let content = fs.readFileSync(p, "utf8");
  let changed = false;
  for (const slug of slugs) {
    const start = content.indexOf('slug: "' + slug + '"');
    if (start === -1) continue;
    let end = content.indexOf("{ slug:", start + 4);
    if (end === -1) end = content.length;
    const block = content.slice(start, end);
    const st = (block.match(/status:\s*"(\w+)"/) || [])[1];
    if (!st) throw new Error("No status token for " + slug + " in " + rf);
    if (st === "live") {
      console.log("  already live (skip flip): " + slug);
      continue;
    }
    if (st !== "soon") throw new Error("Unexpected status " + st + " for " + slug);
    const firstSoon = block.indexOf('status: "soon"');
    content = content.slice(0, start + firstSoon) + 'status: "live"' + content.slice(start + firstSoon + 'status: "soon"'.length);
    changed = true;
    flippedTotal++;
  }
  if (changed) fs.writeFileSync(p, content, "utf8");
}
console.log("Registry: flipped " + flippedTotal + " to live");

// 2) lazyComponents insert
let lazy = fs.readFileSync(LAZY_FILE, "utf8");
const eol = lazy.includes("\r\n") ? "\r\n" : "\n";
const closeIdx = lazy.indexOf("};");
if (closeIdx === -1) throw new Error("Could not find closing '};' in " + LAZY_FILE);
let addedLazy = 0;
const lines = [];
for (const slug of Object.keys(mapping).sort()) {
  const re = new RegExp('"' + slug + '":\\s*\\(\\s*\\)\\s*=>\\s*import\\(');
  if (re.test(lazy)) continue;
  lines.push('  "' + slug + '": () => import("@/domains/calculator/components/' + mapping[slug].replace(/\.tsx$/, "") + '"),');
  addedLazy++;
}
if (lines.length) {
  lazy = lazy.slice(0, closeIdx) + lines.join(eol) + eol + lazy.slice(closeIdx);
  fs.writeFileSync(LAZY_FILE, lazy, "utf8");
}
console.log("lazyComponents: added " + addedLazy + " routes");

// 3) _approved.json append (approved + slugs)
const raw = fs.readFileSync(APPROVED_FILE, "utf8");
const appr = JSON.parse(raw);
const names = Object.values(mapping).map((f) => f.replace(/\.tsx$/, ""));
let addA = 0;
let addS = 0;
for (const n of names) {
  if (!appr.approved.includes(n)) { appr.approved.push(n); addA++; }
  if (!appr.slugs.includes(n)) { appr.slugs.push(n); addS++; }
}
if (addA || addS) {
  fs.writeFileSync(APPROVED_FILE, JSON.stringify(appr, null, 2).replace(/\n/g, eol) + eol, "utf8");
}
console.log("_approved.json: +" + addA + " approved, +" + addS + " slugs");

// Post-check
let lazy2 = fs.readFileSync(LAZY_FILE, "utf8");
let ok = 0;
for (const slug of Object.keys(mapping)) {
  const entry = new RegExp('"' + slug + '":\\s*\\(\\)\\s*=>\\s*import\\("([^"]+)"\\)').exec(lazy2);
  const fileOk = entry && fs.existsSync(path.join(COMPONENTS_DIR, entry[1].split("/").pop() + ".tsx"));
  if (entry && fileOk) ok++;
  else console.log("  FAILED route for " + slug);
}
console.log("Post-check: " + ok + "/" + Object.keys(mapping).length + " wired");
if (ok !== Object.keys(mapping).length) process.exit(1);
