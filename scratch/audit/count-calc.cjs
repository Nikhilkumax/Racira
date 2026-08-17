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
  const wrapper = new Function("require", "module", "exports", "__filename", "__dirname", out);
  const localRequire = (req) => {
    const resolved = resolveModule(req, modulePath);
    if (resolved) return load(resolved);
    return require(req);
  };
  wrapper(localRequire, mod, mod.exports, modulePath, path.dirname(modulePath));
  return mod.exports;
}

const { calculatorRegistry } = load(path.join(ROOT, "src/domains/calculator/registry.ts"));
const stubSrc = fs.readFileSync(path.join(ROOT, "src/lib/tools/calculatorStubSlugs.ts"), "utf8");
const stubs = new Set([...stubSrc.matchAll(/"([^"]+)"/g)].map((m) => m[1]));

const seen = new Set();
const dedup = calculatorRegistry.filter((e) => (seen.has(e.slug) ? false : (seen.add(e.slug), true)));

const nonStub = dedup.filter((e) => !stubs.has(e.slug));
console.log("registry.length:", calculatorRegistry.length);
console.log("deduped:", dedup.length);
console.log("  live:", dedup.filter((e) => e.status === "live").length, " soon:", dedup.filter((e) => e.status === "soon").length);
console.log("stub-tagged entries:", dedup.filter((e) => stubs.has(e.slug)).length);
console.log("NON-STUB total:", nonStub.length, "= live:", nonStub.filter((e) => e.status === "live").length, "+ soon:", nonStub.filter((e) => e.status === "soon").length);

const CAT_ORDER = ["FINANCE","BUSINESS","HEALTH","MATH","SCIENCE","ENGINEERING","TECHNOLOGY","ENVIRONMENT","EVERYDAY_LIFE","TRANSPORTATION","CONSTRUCTION","EDUCATION"];
console.log("\nper-category (non-stub):");
for (const c of CAT_ORDER) {
  const list = nonStub.filter((e) => e.category === c);
  console.log(c.padEnd(16), "total:", String(list.length).padStart(5), " live:", String(list.filter((e) => e.status === "live").length).padStart(4), " soon:", list.length - list.filter((e) => e.status === "live").length);
}
console.log("uncategorized:", nonStub.filter((e) => !CAT_ORDER.includes(e.category)).length);

// subcategory totals (non-stub) for the homepage cards
const subCounts = new Map();
for (const e of nonStub) {
  const key = e.category + "::" + (e.subcategory || "General");
  subCounts.set(key, (subCounts.get(key) || 0) + 1);
}
console.log("\nsubcategories with counts (top 20):");
[...subCounts.entries()].slice(0, 20).forEach(([k, v]) => console.log("  ", k, v));
