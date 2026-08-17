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

// ---- audio ----
try {
  const audio = load(path.join(ROOT, "src/domains/audio/registry.ts"));
  const impl = load(path.join(ROOT, "src/domains/audio/components/tools/implemented.ts"));
  const live = [];
  for (const c of audio.categories) for (const t of c.tools) if (t.status === "live") live.push(t.slug);
  const miss = live.filter((s) => !impl.hasAudioToolImplementation(s));
  console.log("audio live:", live.length, "without impl:", JSON.stringify(miss));
} catch (e) {
  console.log("audio ERR", e.message);
}

// ---- 3d ----
try {
  const d = load(path.join(ROOT, "src/domains/3d/registry.ts"));
  const items = d.TOOLS_BY_SLUG ? [...d.TOOLS_BY_SLUG.values()] : d.tools || d.CATEGORIES?.flatMap((c) => c.tools) || [];
  const live = items.filter((t) => t.status === "live");
  console.log("3d live:", live.length, live.map((t) => t.slug).join(", "));
} catch (e) {
  console.log("3d ERR", e.message);
}

// ---- games ----
try {
  const g = load(path.join(ROOT, "src/lib/tools/gameLiveSlugs.ts"));
  console.log("games live:", g.GAME_LIVE_SLUGS.length);
} catch (e) {
  console.log("games ERR", e.message);
}
