#!/usr/bin/env node
// Approve the 🟢 Live / Not Approved bucket: resolve each slug to its component
// file name and append to _approved.json (deduped, sorted).
const fs = require("fs");
const path = require("path");

const COMP = "src/domains/calculator/components";

// Pull the ALIASES map from the read-only scan script so resolution is identical.
const scanSrc = fs.readFileSync("scratch/scan-phase1.cjs", "utf8");
const aliasMatch = scanSrc.match(/const ALIASES = \{[\s\S]*?\n\};/);
if (!aliasMatch) throw new Error("ALIASES block not found in scan-phase1.cjs");
const ALIASES = eval("(" + aliasMatch[0].replace(/^const ALIASES = /, "").replace(/;$/, "") + ")");

const slugs = fs.readFileSync("status_live_not_approved.txt", "utf8")
  .split("\n").map((s) => s.trim()).filter(Boolean);

const fileNames = fs.readdirSync(COMP).filter((f) => f.endsWith(".tsx"));
const fileInfo = new Map(fileNames.map((f) => [f, true]));

function pascal(s) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}
function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
const normToFile = new Map();
for (const f of fileNames) {
  const n = norm(f.replace(/\.tsx$/, ""));
  if (!normToFile.has(n)) normToFile.set(n, f);
}
function findFile(slug) {
  if (ALIASES[slug] && fileInfo.has(ALIASES[slug])) return ALIASES[slug];
  const p1 = pascal(slug) + ".tsx";
  if (fileInfo.has(p1)) return p1;
  const p2 = pascal(slug) + "Calculator.tsx";
  if (fileInfo.has(p2)) return p2;
  const n = norm(slug);
  if (normToFile.has(n)) return normToFile.get(n);
  if (normToFile.has(n + "calculator")) return normToFile.get(n + "calculator");
  return null;
}

const resolved = [];
const unresolved = [];
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
for (const name of resolved) {
  if (!existing.has(name)) {
    existing.add(name);
    added.push(name);
  }
}
obj.approved = Array.from(existing).sort((a, b) => a.localeCompare(b));

let out = JSON.stringify(obj, null, 2) + "\n";
if (hasBom) out = "\uFEFF" + out;
fs.writeFileSync(path.join(COMP, "_approved.json"), out, "utf8");

console.log("slugs:", slugs.length);
console.log("resolved to files:", resolved.length);
console.log("added:", added.length);
console.log("unresolved:", unresolved.length, unresolved);
console.log("new total approved:", obj.approved.length);
