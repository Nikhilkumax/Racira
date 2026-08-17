const ts = require("typescript");
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const cache = new Map();

function resolveAsFile(p) {
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  for (const ext of [".ts", ".tsx", ".js", ".jsx", ".json"]) {
    if (fs.existsSync(p + ext)) return p + ext;
  }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
    for (const idx of ["index.ts", "index.tsx", "index.js", "index.jsx"]) {
      const f = path.join(p, idx);
      if (fs.existsSync(f)) return f;
    }
  }
  throw new Error("Cannot resolve " + p);
}
function resolveModule(req, fromFile) {
  if (req.startsWith("@/")) return resolveAsFile(path.join(ROOT, "src", req.slice(2)));
  if (req.startsWith(".")) return resolveAsFile(path.resolve(path.dirname(fromFile), req));
  return null;
}
function load(mp) {
  if (cache.has(mp)) return cache.get(mp);
  const src = fs.readFileSync(mp, "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX, isolatedModules: true },
  }).outputText;
  const mod = { exports: {} };
  cache.set(mp, mod.exports);
  const fn = new Function("require", "module", "exports", "__filename", "__dirname", out);
  const lr = (r) => { const res = resolveModule(r, mp); if (res) return load(res); return require(r); };
  fn(lr, mod, mod.exports, mp, path.dirname(mp));
  return mod.exports;
}

const { calculatorRegistry } = load(path.join(ROOT, "src/domains/calculator/registry.ts"));

// duplicates by slug
const bySlug = new Map();
for (const e of calculatorRegistry) {
  if (!bySlug.has(e.slug)) bySlug.set(e.slug, []);
  bySlug.get(e.slug).push(e);
}
console.log("== duplicate slugs ==");
for (const [slug, list] of bySlug) {
  if (list.length > 1) {
    console.log(`  ${slug} x${list.length}:`, list.map((e) => `${e.name} [${e.category}/${e.subcategory || "General"} ${e.status}]`).join(" | "));
  }
}

const stubSrc = fs.readFileSync(path.join(ROOT, "src/lib/tools/calculatorStubSlugs.ts"), "utf8");
const stubs = new Set([...stubSrc.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
const full = calculatorRegistry.filter((e) => !stubs.has(e.slug));

const targets = [
  ["FINANCE", "Savings & CDs"],
  ["TECHNOLOGY", "Hardware & Peripherals"],
  ["TECHNOLOGY", "Science & Physics"],
  ["TECHNOLOGY", "3D Printing & CAD"],
  ["EVERYDAY_LIFE", "Automotive & Vehicles"],
  ["FINANCE", "Business & Corporate"],
];
console.log("\n== flagged subcategory tools ==");
for (const [cat, sub] of targets) {
  const list = full.filter((e) => e.category === cat && (e.subcategory || "General") === sub);
  console.log(`\n--- ${cat} / ${sub} (${list.length}) ---`);
  for (const e of list) console.log(`  ${e.slug}  [${e.status}] ${e.name}`);
}

// context: what related subcategories exist in SCIENCE / ENGINEERING / TRANSPORTATION / TECHNOLOGY
console.log("\n== SCIENCE subcategories ==");
const sci = new Map();
for (const e of full.filter((x) => x.category === "SCIENCE")) {
  const s = e.subcategory || "General";
  sci.set(s, (sci.get(s) || 0) + 1);
}
for (const [s, c] of [...sci.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(c).padStart(4)}  ${s}`);
console.log("\n== ENGINEERING subcategories ==");
const eng = new Map();
for (const e of full.filter((x) => x.category === "ENGINEERING")) {
  const s = e.subcategory || "General";
  eng.set(s, (eng.get(s) || 0) + 1);
}
for (const [s, c] of [...eng.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(c).padStart(4)}  ${s}`);
console.log("\n== TECHNOLOGY subcategories ==");
const tec = new Map();
for (const e of full.filter((x) => x.category === "TECHNOLOGY")) {
  const s = e.subcategory || "General";
  tec.set(s, (tec.get(s) || 0) + 1);
}
for (const [s, c] of [...tec.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(c).padStart(4)}  ${s}`);
console.log("\n== TRANSPORTATION subcategories ==");
const tra = new Map();
for (const e of full.filter((x) => x.category === "TRANSPORTATION")) {
  const s = e.subcategory || "General";
  tra.set(s, (tra.get(s) || 0) + 1);
}
for (const [s, c] of [...tra.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(c).padStart(4)}  ${s}`);
console.log("\n== FINANCE subcategories (first 20) ==");
const fin = new Map();
for (const e of full.filter((x) => x.category === "FINANCE")) {
  const s = e.subcategory || "General";
  fin.set(s, (fin.get(s) || 0) + 1);
}
for (const [s, c] of [...fin.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${String(c).padStart(4)}  ${s}`);
