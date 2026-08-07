/**
 * Read-only calculator status scan.
 * Buckets every registry entry into: approved-complete, live-not-approved,
 * needs-polish, needs-rebuild, not-built. Writes status_*.txt + status_report.md.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REG_DIR = path.join(ROOT, "src/domains/calculator/registry");
const COMP_DIR = path.join(ROOT, "src/domains/calculator/components");
const LAZY = path.join(ROOT, "src/app/calculator/lazyComponents.tsx");

const STUBS = [
  '"Value A"',
  '"Value B"',
  "Coming Soon",
  "This calculator is planned",
  "planned for a future",
  "Back to Calculators",
];

function readRegistry() {
  const out = [];
  for (const f of fs.readdirSync(REG_DIR).filter((x) => x.endsWith(".ts"))) {
    const text = fs.readFileSync(path.join(REG_DIR, f), "utf8");
    for (const line of text.split("\n")) {
      const slug = line.match(/slug:\s*"([^"]+)"/);
      if (!slug) continue;
      const name = line.match(/name:\s*"([^"]*)"/);
      const cat = line.match(/category:\s*"([^"]*)"/);
      const st = line.match(/status:\s*"([^"]*)"/);
      out.push({
        slug: slug[1],
        name: name ? name[1] : slug[1],
        category: cat ? cat[1] : "UNKNOWN",
        status: st ? st[1] : "unknown",
        source: f,
      });
    }
  }
  return out;
}

function readLazyMap() {
  const text = fs.readFileSync(LAZY, "utf8");
  const map = {};
  const re =
    /"([^"]+)":\s*\(\)\s*=>\s*import\("@\/domains\/calculator\/components\/([^"]+)"\)/g;
  let m;
  while ((m = re.exec(text))) map[m[1]] = m[2];
  return map;
}

function pascalFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

const cache = new Map();
function inspect(componentName) {
  if (cache.has(componentName)) return cache.get(componentName);
  const file = path.join(COMP_DIR, componentName + ".tsx");
  let info = { exists: false };
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, "utf8");
    const size = Buffer.byteLength(text);
    info = {
      exists: true,
      size,
      stub: STUBS.filter((s) => text.includes(s)),
      recharts: /from\s+"recharts"/.test(text),
      calcButton: /Calculate/.test(text),
      exactCalcLabel: />\s*Calculate\s*</.test(text),
      primaryCard: /border-l-4\s+border-primary/.test(text),
      subtitle: hasSubtitle(text),
      grouped: /uppercase tracking-wide text-muted-foreground/.test(text),
      advanced: /Advanced Options/.test(text),
      gridCols2: /grid-cols-2 gap-3/.test(text),
    };
  }
  cache.set(componentName, info);
  return info;
}

function hasSubtitle(text) {
  // a <p> immediately following the <h1> block counts as a subtitle
  const m = text.match(/<h1[\s\S]{0,400}?<\/h1>\s*\n?\s*<p[^>]*>/);
  return !!m;
}

function resolveComponent(entry, lazyMap) {
  if (lazyMap[entry.slug]) return lazyMap[entry.slug].split("/").pop();
  const guess = pascalFromSlug(entry.slug);
  if (fs.existsSync(path.join(COMP_DIR, guess + ".tsx"))) return guess;
  return null;
}

module.exports = {
  readRegistry,
  readLazyMap,
  resolveComponent,
  inspect,
  pascalFromSlug,
  COMP_DIR,
  ROOT,
};
