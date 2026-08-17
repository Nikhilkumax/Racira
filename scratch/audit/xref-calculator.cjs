const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");

const dir = path.join(ROOT, "src", "domains", "calculator", "registry");
const registry = new Map();
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts")) continue;
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  const re = /slug:\s*"([^"]+)",[\s\S]*?status:\s*"(live|soon)"/g;
  let m;
  while ((m = re.exec(src))) registry.set(m[1], m[2]);
}

const lazySrc = fs.readFileSync(path.join(ROOT, "src", "app", "calculator", "lazyComponents.tsx"), "utf8");
const lazySlugs = new Set();
const lre = /^\s+"([a-z0-9-]+)": \(\) => import/gm;
let m;
while ((m = lre.exec(lazySrc))) lazySlugs.add(m[1]);

let live = 0, soon = 0;
for (const s of registry.values()) (s === "live" ? live++ : soon++);
const liveMissing = [...registry.entries()].filter(([s, st]) => st === "live" && !lazySlugs.has(s));
const lazyNotInReg = [...lazySlugs].filter(s => !registry.has(s));

console.log("registry total:", registry.size, "| live:", live, "| soon:", soon);
console.log("lazyComponents (imports):", lazySlugs.size);
console.log("LIVE-tagged but NO component wired -> renders ComingSoon stub:", liveMissing.length);
console.log("component wired but slug not in registry (unreachable):", lazyNotInReg.length);

// Which live slugs' component files contain Value A/B stub markers
const compDir = path.join(ROOT, "src", "domains", "calculator", "components");
const valueABFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d)) {
    const p = path.join(d, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (e.endsWith(".tsx")) {
      const c = fs.readFileSync(p, "utf8");
      if (/Value A|Value B/.test(c)) valueABFiles.push(p);
    }
  }
})(compDir);
console.log("component files containing 'Value A'/'Value B':", valueABFiles.length);

// Map lazy slug -> component path, then count how many of those are stub files and their registry status
const importRe = /^\s+"([a-z0-9-]+)": \(\) => import\("([^"]+)"\)/gm;
const slugToPath = new Map();
while ((m = importRe.exec(lazySrc))) slugToPath.set(m[1], m[2]);
const stubPaths = new Set(valueABFiles.map(p => path.resolve(p)));
let stubLive = 0, stubSoon = 0, stubUnknown = 0;
for (const [slug, imp] of slugToPath) {
  const base = imp.replace("@/", path.join(ROOT, "src") + "/");
  const p = path.resolve(base + ".tsx");
  if (stubPaths.has(p)) {
    const st = registry.get(slug);
    if (st === "live") stubLive++; else if (st === "soon") stubSoon++; else stubUnknown++;
  }
}
console.log("Stub-marker components by registry status -> live:", stubLive, "soon:", stubSoon, "unregistered:", stubUnknown);
console.log("Stub components that are ALSO live-tagged and wired (worst case: 'live' but renders stub UI):", stubLive);
