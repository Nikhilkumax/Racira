#!/usr/bin/env node
// Pass A: swap `bg-gradient-to-br from-X/10 to-X/5 border border-X/20` headline
// cards to the gold-standard `bg-primary/10 border-l-4 border-primary` card.
// Only touches files flagged "missing primary result card" that contain the
// exact gradient class. Verifies each edit is a pure class swap.
const fs = require("fs");
const path = require("path");
const COMP = "src/domains/calculator/components";

const lines = fs.readFileSync("status_rebuild.txt", "utf8").split("\n").filter(Boolean)
  .filter((l) => l.includes("missing primary result card"));
const slugs = lines.map((l) => l.split("\t")[0]);

const scanSrc = fs.readFileSync("scratch/scan-phase1.cjs", "utf8");
const am = scanSrc.match(/const ALIASES = \{[\s\S]*?\n\};/);
const ALIASES = eval("(" + am[0].replace(/^const ALIASES = /, "").replace(/;$/, "") + ")");
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

const GRAD = /bg-gradient-to-br from-[a-z0-9-]+\/10 to-[a-z0-9-]+\/5 border border-[a-z0-9-]+\/20/;
let changed = 0, skipped = [];
for (const s of slugs) {
  const f = findFile(s);
  if (!f) continue;
  const p = path.join(COMP, f);
  let c = fs.readFileSync(p, "utf8");
  if (!GRAD.test(c)) { skipped.push(f); continue; }
  if (c.indexOf("bg-primary/10 border-l-4") !== -1) { skipped.push(f + " (already primary)"); continue; }
  c = c.replace(GRAD, "bg-primary/10 border-l-4 border-primary");
  fs.writeFileSync(p, c, "utf8");
  changed++;
}
console.log("changed:", changed, "| skipped:", skipped.length, skipped.slice(0, 5));
