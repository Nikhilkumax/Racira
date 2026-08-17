#!/usr/bin/env node
// Phase 2 gap check (definitive): status=live registry entries vs lazyComponents.tsx
// wiring. Read-only against source.
const fs = require("fs");
const path = require("path");

const REG = "src/domains/calculator/registry";
const COMP = "src/domains/calculator/components";
const LAZY = "src/app/calculator/lazyComponents.tsx";

const registry = new Map();
for (const f of fs.readdirSync(REG).filter((f) => f.endsWith(".ts"))) {
  const text = fs.readFileSync(path.join(REG, f), "utf8");
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = slugRe.exec(text))) {
    const next = text.indexOf("slug:", m.index + m[0].length);
    const end = next === -1 ? text.length : next;
    const chunk = text.slice(m.index, end);
    const status = (chunk.match(/status:\s*"(live|soon)"/) || [])[1] || "";
    const category = (chunk.match(/category:\s*"([^"]+)"/) || [])[1] || "UNKNOWN";
    const name = (chunk.match(/name:\s*"([^"]+)"/) || [])[1] || m[1];
    if (!registry.has(m[1])) registry.set(m[1], { slug: m[1], name, category, status });
  }
}

// Parse lazyComponents.tsx: slug -> imported module path
const lazySrc = fs.readFileSync(LAZY, "utf8");
const wired = new Map();
const re = /^\s*"([^"]+)":\s*\(\)\s*=>\s*import\(["']@\/([^"']+)["']\)/gm;
let mm;
while ((mm = re.exec(lazySrc))) wired.set(mm[1], mm[2]);

const fileExists = (modulePath) => {
  try {
    fs.accessSync(path.join(process.cwd(), "src", modulePath.replace("domains/", "domains/")), fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

const live = [...registry.values()].filter((e) => e.status === "live");
const missing = [];
const broken = [];
const ok = [];
for (const e of live) {
  const mod = wired.get(e.slug);
  if (!mod) { missing.push(e); continue; }
  if (!fileExists(mod)) { broken.push({ ...e, mod }); continue; }
  ok.push(e);
}

console.log(`status=live entries: ${live.length}`);
console.log(`  ✅ wired + file exists: ${ok.length}`);
console.log(`  ❌ not wired in lazyComponents: ${missing.length}`);
console.log(`  ⚠️  wired but file missing: ${broken.length}`);

if (missing.length) {
  console.log("\nNOT WIRED (live slug, no lazyComponents entry):");
  for (const e of missing) console.log(`  ${e.slug}\t${e.name}`);
}
if (broken.length) {
  console.log("\nWIRED BUT BROKEN:");
  for (const e of broken) console.log(`  ${e.slug}\t${e.name}\t-> ${e.mod}`);
}
