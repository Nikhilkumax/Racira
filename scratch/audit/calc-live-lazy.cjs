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
const live = nonStub.filter((e) => e.status === "live");

const lz = fs.readFileSync(path.join(ROOT, "src/app/calculator/lazyComponents.tsx"), "utf8");
const lazyKeys = new Set([...lz.matchAll(/^\s*"([^"]+)":\s*\(\) => import/gm)].map((m) => m[1]));

const missing = live.filter((e) => !lazyKeys.has(e.slug));

// component files
const compDir = path.join(ROOT, "src/domains/calculator/components");
const compFiles = fs.readdirSync(compDir).filter((f) => /\.(tsx|ts)$/.test(f));

// norm: lowercase alnum, strip "calculator" suffix and common inflections
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const results = [];
for (const t of missing) {
  const slugNorm = norm(t.slug).replace(/calculator$/, "");
  // 1. exact file name match (strip extension, strip trailing Calculator)
  let file = compFiles.find((f) => norm(f.replace(/\.(tsx|ts)$/, "")).replace(/calculator$/, "") === slugNorm);
  // 2. fuzzy: contains
  if (!file) {
    file = compFiles.find((f) => {
      const fn = norm(f.replace(/\.(tsx|ts)$/, "")).replace(/calculator$/, "");
      return fn.includes(slugNorm) || slugNorm.includes(fn);
    });
  }
  results.push({ slug: t.slug, name: t.name, file: file || "!! NO FILE !!" });
}

for (const r of results) {
  console.log(`"${r.slug}": () => import("@/domains/calculator/components/${r.file.replace(/\.(tsx|ts)$/, "")}"),`);
}
console.log("\nTOTAL:", results.length, "| no-file:", results.filter((r) => r.file === "!! NO FILE !!").length);
