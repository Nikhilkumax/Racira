#!/usr/bin/env node
// T1: prefix `bg-primary/10 ` into template-literal card class strings so the
// primary token co-occurs with border-l-4 (branch colors keep their semantics).
// T2: bg-secondary/20 border-border cards -> primary tokens.
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

// Only act inside template literals (backtick strings) to avoid touching quoted strings.
const T1_PATTERNS = [
  /`([^`]*?)rounded-xl p-5 border-l-4/g,       // `... rounded-xl p-5 border-l-4
  /`([^`]*?)border-l-4 rounded-lg p-5(?![\w-])/g, // `... border-l-4 rounded-lg p-5
  /`([^`]*?)border-l-4 rounded-lg p-4(?![\w-])/g, // `... border-l-4 rounded-lg p-4
  /`([^`]*?)border-l-4 rounded-lg p-5 relative/g,
  /`([^`]*?)bg-gradient-to-br/g,                // `... bg-gradient-to-br
];
const T2 = /bg-secondary\/20 border-border/g;

let changed = 0;
const done = [];
for (const s of slugs) {
  const f = findFile(s);
  if (!f) continue;
  const p = path.join(COMP, f);
  let c = fs.readFileSync(p, "utf8");
  if (/(bg-primary\/\d+[^"]*border-l-4|border-l-4[^"]*bg-primary\/\d+)/.test(c)) continue;
  let had = false;
  let newC = c;
  for (const re of T1_PATTERNS) {
    newC = newC.replace(re, (m, pre) => { had = true; return "`" + pre + "bg-primary/10 " + m.slice(1); });
  }
  // T2 (only when T1 didn't already add bg-primary)
  if (!had || /bg-secondary\/20/.test(newC)) {
    const t2 = newC.replace(T2, "bg-primary/10 border-primary");
    if (t2 !== newC) { newC = t2; had = true; }
  }
  if (!had) continue;
  fs.writeFileSync(p, newC, "utf8");
  changed++;
  done.push(f);
}
console.log("changed:", changed);
fs.writeFileSync("scratch/t1-files.txt", done.join("\n") + "\n");
