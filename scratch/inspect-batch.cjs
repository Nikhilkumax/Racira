#!/usr/bin/env node
// Usage: node scratch/inspect-batch.cjs < sluglist.txt
// Prints, per resolved file: card-pattern lines + registry status.
const fs = require("fs");
const path = require("path");

const COMP = "src/domains/calculator/components";
const REG = "src/domains/calculator/registry";
const scanSrc = fs.readFileSync("scratch/scan-phase1.cjs", "utf8");
const am = scanSrc.match(/const ALIASES = \{[\s\S]*?\n\};/);
const ALIASES = eval("(" + am[0].replace(/^const ALIASES = /, "").replace(/;$/, "") + ")");

const slugs = fs.readFileSync(process.argv[2], "utf8").split("\n").map((s) => s.trim().split("\t")[0]).filter(Boolean);

const fileNames = fs.readdirSync(COMP).filter((f) => f.endsWith(".tsx"));
const fileInfo = new Map(fileNames.map((f) => [f, true]));
function pascal(s) { return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(""); }
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ""); }
const normToFile = new Map();
for (const f of fileNames) { const n = norm(f.replace(/\.tsx$/, "")); if (!normToFile.has(n)) normToFile.set(n, f); }
function findFile(slug) {
  if (ALIASES[slug] && fileInfo.has(ALIASES[slug])) return ALIASES[slug];
  if (fileInfo.has(pascal(slug) + ".tsx")) return pascal(slug) + ".tsx";
  if (fileInfo.has(pascal(slug) + "Calculator.tsx")) return pascal(slug) + "Calculator.tsx";
  const n = norm(slug);
  if (normToFile.has(n)) return normToFile.get(n);
  if (normToFile.has(n + "calculator")) return normToFile.get(n + "calculator");
  return null;
}

// registry status map
const statusMap = new Map();
for (const f of fs.readdirSync(REG).filter((f) => f.endsWith(".ts"))) {
  const text = fs.readFileSync(path.join(REG, f), "utf8");
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = slugRe.exec(text))) {
    const next = text.indexOf("slug:", m.index + m[0].length);
    const chunk = text.slice(m.index, next === -1 ? text.length : next);
    const status = (chunk.match(/status:\s*"(live|soon)"/) || [])[1] || "";
    if (!statusMap.has(m[1])) statusMap.set(m[1], status);
  }
}

const CARD = /border-l-4|bg-primary\/|bg-gradient|bg-green|bg-red|bg-emerald|bg-amber|bg-blue|bg-teal|bg-rose|bg-orange|text-4xl font|text-5xl font|text-6xl font/;
for (const s of slugs) {
  const f = findFile(s);
  if (!f) { console.log("=== " + s + " -> NO FILE ==="); continue; }
  const c = fs.readFileSync(path.join(COMP, f), "utf8");
  console.log("=== " + f + "  [registry: " + (statusMap.get(s) || "?") + ", " + c.length + "B] ===");
  const lines = c.split("\n");
  lines.forEach((l, i) => {
    if (CARD.test(l) && !/h1 className/.test(l)) console.log("  " + (i + 1) + ": " + l.trim().slice(0, 160));
  });
}
