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

const domains = {
  "3d": "src/domains/3d/registry.ts",
  animator: "src/domains/animator/registry.ts",
  audio: "src/domains/audio/registry.ts",
  cad: "src/domains/cad/registry.ts",
  calculator: "src/domains/calculator/registry.ts",
  colors: "src/domains/colors/registry.ts",
  design: "src/domains/design/registry.ts",
  developers: "src/domains/developers/registry.ts",
  image: "src/domains/image/registry.ts",
  pdf: "src/domains/pdf/registry/tools.ts",
  photo: "src/domains/photo/registry.ts",
  productivity: "src/domains/productivity/registry.ts",
  seo: "src/domains/seo/registry.ts",
  typography: "src/domains/typography/registry.ts",
  video: "src/domains/video/registry.ts",
  voice: "src/domains/voice/registry.ts",
  writing: "src/domains/writing/registry.ts",
};

for (const [name, file] of Object.entries(domains)) {
  try {
    const mod = load(path.join(ROOT, file));
    let tools = [];
    for (const key of ["allTools", "ALL_TOOLS", "tools", "TOOLS", "TOOL_BY_SLUG"]) {
      if (mod[key]) {
        if (key === "TOOL_BY_SLUG" || key === "TOOL_BY_SLUG_MAP") tools = [...mod[key].values()];
        else tools = mod[key];
        break;
      }
    }
    // Some registries expose via categories with .tools
    if (!tools.length) {
      const cats = mod.categories || mod.CATEGORIES || mod.cat;
      if (cats) tools = cats.flatMap((c) => c.tools || []);
    }
    if (!tools.length && mod.toolsByCategory) {
      tools = Object.values(mod.toolsByCategory()).flat();
    }
    const live = tools.filter((t) => (t.status || "") === "live");
    const soon = tools.filter((t) => (t.status || "") !== "live");
    console.log(
      name.padEnd(12),
      "tools:", String(tools.length).padStart(5),
      " live:", String(live.length).padStart(4),
      " soon:", String(soon.length).padStart(5),
      " withComponent:", String(tools.filter((t) => !!t.component).length).padStart(4)
    );
  } catch (e) {
    console.log(name.padEnd(12), "ERROR:", e.message.slice(0, 80));
  }
}

// games (separate structure)
try {
  const mod = load(path.join(ROOT, "src/domains/games/registry.ts"));
  const games = mod.CATEGORIES.flatMap((c) => c.subcategories.flatMap((s) => s.games.map((g) => ({ name: g, slug: mod.slugify(g) }))));
  const liveSrc = fs.readFileSync(path.join(ROOT, "src/lib/tools/gameLiveSlugs.ts"), "utf8");
  const liveSlugs = new Set([...liveSrc.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
  console.log("games".padEnd(12), "tools:", String(games.length).padStart(5), " live:", String(games.filter((g) => liveSlugs.has(g.slug)).length).padStart(4), " soon:", String(games.filter((g) => !liveSlugs.has(g.slug)).length).padStart(5));
} catch (e) {
  console.log("games ERROR:", e.message.slice(0, 80));
}
