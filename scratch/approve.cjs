#!/usr/bin/env node
// Generic: append resolved component names for given slugs to _approved.json.
// Usage: node scratch/approve.cjs < sluglist.txt   (or pass file path as argv[2])
const fs = require("fs");
const path = require("path");

const COMP = "src/domains/calculator/components";
const scanSrc = fs.readFileSync("scratch/scan-phase1.cjs", "utf8");
const aliasMatch = scanSrc.match(/const ALIASES = \{[\s\S]*?\n\};/);
const ALIASES = eval("(" + aliasMatch[0].replace(/^const ALIASES = /, "").replace(/;$/, "") + ")");

const input = process.argv[2]
  ? fs.readFileSync(process.argv[2], "utf8")
  : fs.readFileSync(0, "utf8");
const slugs = input.split("\n").map((s) => s.trim()).filter(Boolean);

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

const resolved = [], unresolved = [];
for (const s of slugs) {
  const f = findFile(s);
  if (f) resolved.push(f.replace(/\.tsx$/, ""));
  else unresolved.push(s);
}

const raw = fs.readFileSync(path.join(COMP, "_approved.json"), "utf8");
const hasBom = raw.charCodeAt(0) === 0xfeff;
const obj = JSON.parse(raw.replace(/^\uFEFF/, ""));
const existing = new Set(obj.approved || []);
const added = [];
for (const name of resolved) { if (!existing.has(name)) { existing.add(name); added.push(name); } }
obj.approved = Array.from(existing).sort((a, b) => a.localeCompare(b));
let out = JSON.stringify(obj, null, 2) + "\n";
if (hasBom) out = "\uFEFF" + out;
fs.writeFileSync(path.join(COMP, "_approved.json"), out, "utf8");

console.log(`slugs: ${slugs.length} | resolved: ${resolved.length} | added: ${added.length} | unresolved: ${unresolved.length} ${unresolved.join(",")} | total: ${obj.approved.length}`);
