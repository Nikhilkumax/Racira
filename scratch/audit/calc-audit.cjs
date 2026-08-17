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

function load(modulePath) {
  if (cache.has(modulePath)) return cache.get(modulePath);
  const src = fs.readFileSync(modulePath, "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      isolatedModules: true,
    },
  }).outputText;
  const mod = { exports: {} };
  cache.set(modulePath, mod.exports);
  const fn = new Function("require", "module", "exports", "__filename", "__dirname", out);
  const lr = (r) => {
    const res = resolveModule(r, modulePath);
    if (res) return load(res);
    return require(r);
  };
  fn(lr, mod, mod.exports, modulePath, path.dirname(modulePath));
  return mod.exports;
}

const { calculatorRegistry } = load(path.join(ROOT, "src/domains/calculator/registry.ts"));
const stubSrc = fs.readFileSync(path.join(ROOT, "src/lib/tools/calculatorStubSlugs.ts"), "utf8");
const stubs = new Set([...stubSrc.matchAll(/"([^"]+)"/g)].map((m) => m[1]));

const seen = new Set();
const dedup = calculatorRegistry.filter((e) => (seen.has(e.slug) ? false : (seen.add(e.slug), true)));
const full = dedup.filter((e) => !stubs.has(e.slug));
const live = full.filter((e) => e.status === "live");
const soon = full.filter((e) => e.status !== "live");

console.log("== authoritative totals (deduped, stub-excluded) ==");
console.log("registry:", calculatorRegistry.length, "deduped:", dedup.length, "stubs:", dedup.length - full.length);
console.log("FULL scope:", full.length, "= live:", live.length, "+ soon:", soon.length);
console.log("sum check -> tiles must sum to", full.length);

const CAT_ORDER = ["FINANCE","BUSINESS","HEALTH","MATH","SCIENCE","ENGINEERING","TECHNOLOGY","ENVIRONMENT","EVERYDAY_LIFE","TRANSPORTATION","CONSTRUCTION","EDUCATION"];

console.log("\n== per-category (full scope) ==");
let sum = 0;
for (const c of CAT_ORDER) {
  const list = full.filter((e) => e.category === c);
  sum += list.length;
  console.log(c.padEnd(16), String(list.length).padStart(5), " live:", String(list.filter((e) => e.status === "live").length).padStart(4));
}
console.log("SUM:", sum, "(should equal", full.length + ")");
const uncat = full.filter((e) => !CAT_ORDER.includes(e.category));
console.log("uncategorized:", uncat.length);

console.log("\n== subcategory audit (full scope) ==");
// flag: count < 5; duplicate names across parents; suspicious parent fits
const subcats = new Map(); // "cat::sub" -> {cat, sub, count, liveCount}
for (const e of full) {
  const key = e.category + "::" + (e.subcategory || "General");
  if (!subcats.has(key)) subcats.set(key, { cat: e.category, sub: e.subcategory || "General", count: 0, liveCount: 0 });
  subcats.get(key).count++;
  if (e.status === "live") subcats.get(key).liveCount++;
}

// duplicate names across different parents
const nameToParents = new Map();
for (const { sub } of subcats.values()) {
  if (!nameToParents.has(sub)) nameToParents.set(sub, new Set());
  // handled below
}
for (const { cat, sub } of subcats.values()) {
  if (!nameToParents.has(sub)) nameToParents.set(sub, new Set());
  nameToParents.get(sub).add(cat);
}
const dupNames = [...nameToParents.entries()].filter(([, parents]) => parents.size > 1);

console.log("--- subcategories with count < 5 (likely over-fragmentation) ---");
for (const { cat, sub, count, liveCount } of [...subcats.values()].sort((a, b) => a.count - b.count)) {
  if (count < 5) console.log(`  ${cat.padEnd(16)} ${String(count).padStart(4)} (live ${liveCount})  ${sub}`);
}
console.log("--- duplicate subcategory names across parents ---");
for (const [name, parents] of dupNames) {
  const parentsList = [...parents];
  console.log(`  "${name}": ${parentsList.join(", ")}`);
}
console.log("--- total subcategories:", subcats.size);
