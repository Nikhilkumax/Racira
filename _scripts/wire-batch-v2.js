// Wire a build batch (v2). Usage: node _scripts/wire-batch-v2.js batch.json
// batch.json = [{ "slug": "...", "description": "..." }, ...]
// Per slug: registry entry gets real description, status "live", isBuilt:true,
// indexable removed; lazyComponents route inserted; component name appended to
// _approved.json (approved + slugs). Read-only post-check at the end.
const fs = require("fs");
const path = require("path");

const COMPONENTS_DIR = "src/domains/calculator/components";
const REGISTRY_DIR = "src/domains/calculator/registry";
const LAZY_FILE = "src/app/calculator/lazyComponents.tsx";
const APPROVED_FILE = "src/domains/calculator/components/_approved.json";

const batchFile = process.argv[2];
if (!batchFile) throw new Error("Pass batch JSON file");
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
if (!Array.isArray(batch) || !batch.length) throw new Error("Empty batch");

function pascal(slug) {
  return slug.split(/[^a-zA-Z0-9]+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}
function resolveFile(slug, override) {
  if (override) {
    const f = override.endsWith(".tsx") ? override : override + ".tsx";
    if (fs.existsSync(path.join(COMPONENTS_DIR, f))) return f;
  }
  const p = pascal(slug);
  for (const c of [p, p + "Calculator", p + "Calc", p + "Full", p + "CalculatorFull"]) {
    if (fs.existsSync(path.join(COMPONENTS_DIR, c + ".tsx"))) return c + ".tsx";
  }
  return null;
}
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// ---- 1) registry flip ----
let flipped = 0;
const registryFiles = fs.readdirSync(REGISTRY_DIR).filter((f) => f.endsWith(".ts"));
for (const item of batch) {
  const { slug, description } = item;
  let done = false;
  for (const rf of registryFiles) {
    const p = path.join(REGISTRY_DIR, rf);
    let content = fs.readFileSync(p, "utf8");
    const lines = content.split(/\r?\n/);
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes(`slug: "${slug}"`)) continue;
      let line = lines[i];
      if (!/status:\s*"soon"/.test(line) && !/status:\s*"live"/.test(line)) throw new Error("No status for " + slug);
      if (/status:\s*"live"/.test(line)) { console.log("  already live (skip): " + slug); done = true; break; }
      if (description) line = line.replace(/description:\s*"(?:[^"\\]|\\.)*"/, `description: "${esc(description)}"`);
      line = line.replace(/status:\s*"soon"/, 'status: "live"');
      line = line.replace(/,\s*indexable:\s*false/, "");
      line = line.replace(/\s*\},\s*$/, ", isBuilt: true },");
      lines[i] = line;
      changed = true;
      done = true;
      break;
    }
    if (changed) { fs.writeFileSync(p, lines.join(content.includes("\r\n") ? "\r\n" : "\n"), "utf8"); flipped++; }
    if (done) break;
  }
  if (!done) throw new Error("Registry entry not found for " + slug);
}
console.log("Registry: flipped " + flipped + " to live");

// ---- 2) lazyComponents insert ----
let lazy = fs.readFileSync(LAZY_FILE, "utf8");
const eol = lazy.includes("\r\n") ? "\r\n" : "\n";
const marker = "// Lazily create dynamic() wrappers";
const markerIdx = lazy.indexOf(marker);
if (markerIdx === -1) throw new Error("Marker comment not found in " + LAZY_FILE);
const closeIdx = lazy.lastIndexOf("};", markerIdx);
if (closeIdx === -1) throw new Error("Map closer not found");
const routes = [];
for (const item of batch) {
  const { slug } = item;
  if (new RegExp(`"${slug}":\\s*\\(\\s*\\)\\s*=>\\s*import\\(`).test(lazy)) continue;
  const file = resolveFile(slug, item.file);
  if (!file) throw new Error("No component file for " + slug);
  routes.push(`  "${slug}": () => import("@/domains/calculator/components/${file.replace(/\.tsx$/, "")}"),`);
}
if (routes.length) {
  const insertAt = closeIdx;
  lazy = lazy.slice(0, insertAt) + routes.join(eol) + eol + lazy.slice(insertAt);
  // remove a possible duplicate blank handling: ensure exactly one newline before closer
  lazy = lazy.replace(new RegExp(`(${routes[routes.length - 1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})${eol}`, "g"), "$1" + eol);
  fs.writeFileSync(LAZY_FILE, lazy, "utf8");
}
console.log("lazyComponents: added " + routes.length + " routes");

// ---- 3) _approved.json ----
const appr = JSON.parse(fs.readFileSync(APPROVED_FILE, "utf8"));
let addA = 0, addS = 0;
for (const item of batch) {
  const { slug } = item;
  const file = resolveFile(slug, item.file);
  const name = file.replace(/\.tsx$/, "");
  if (!appr.approved.includes(name)) { appr.approved.push(name); addA++; }
  if (!appr.slugs) appr.slugs = [];
  if (!appr.slugs.includes(name)) { appr.slugs.push(name); addS++; }
}
if (addA || addS) fs.writeFileSync(APPROVED_FILE, JSON.stringify(appr, null, 2) + "\n", "utf8");
console.log("_approved.json: +" + addA + " approved, +" + addS + " slugs");

// ---- 4) post-check ----
const regFiles = fs.readdirSync(REGISTRY_DIR).filter((f) => f.endsWith(".ts"));
let ok = 0;
for (const { slug } of batch) {
  const wired = new RegExp(`"${slug}":\\s*\\(\\s*\\)\\s*=>\\s*import\\("([^"]+)"\\)`).exec(fs.readFileSync(LAZY_FILE, "utf8"));
  const fileOk = wired && fs.existsSync(path.join(COMPONENTS_DIR, wired[1].split("/").pop() + ".tsx"));
  let regLive = false;
  for (const rf of regFiles) {
    const c = fs.readFileSync(path.join(REGISTRY_DIR, rf), "utf8");
    const idx = c.indexOf(`slug: "${slug}"`);
    if (idx !== -1) {
      const next = c.indexOf("{ slug:", idx + 5);
      const block = c.slice(idx, next === -1 ? c.length : next);
      regLive = /status:\s*"live"/.test(block) && /isBuilt:\s*true/.test(block) && !/indexable/.test(block);
    }
  }
  if (wired && fileOk && regLive) ok++; else console.log("  FAILED: " + slug + " wired=" + !!wired + " file=" + !!fileOk + " regLive=" + regLive);
}
console.log("Post-check: " + ok + "/" + batch.length + " fully wired+live");
if (ok !== batch.length) process.exit(1);
