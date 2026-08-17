// Read-only AdSense qualification audit. No writes to src/.
const fs = require('fs');
const path = require('path');
const ROOT = 'c:/Racira/racira-nextjs';
const SRC = path.join(ROOT, 'src');

function walk(dir, out = []) {
  let ents = [];
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next') continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const allFiles = walk(SRC);
const rel = p => path.relative(ROOT, p).replace(/\\/g, '/');

// ---------- 1. Stub fingerprints across every component file ----------
const STUB_VALUE_AB = /Value B \(if needed\)/;
const TODO_RE = /\b(TODO|FIXME|PLACEHOLDER)\b/;

const stubValueAB = [];
const todoFiles = [];
for (const f of allFiles) {
  const s = fs.readFileSync(f, 'utf8');
  if (STUB_VALUE_AB.test(s)) stubValueAB.push(rel(f));
  if (TODO_RE.test(s)) todoFiles.push(rel(f));
}

console.log('=== GLOBAL STUB FINGERPRINTS ===');
console.log('Files with "Value A"/"Value B (if needed)" stub shell:', stubValueAB.length);
console.log('Files with TODO/FIXME/PLACEHOLDER:', todoFiles.length);

// ---------- 2. Calculator domain: registry vs lazyComponents map ----------
const lazyPath = path.join(SRC, 'app/calculator/lazyComponents.tsx');
const lazySrc = fs.readFileSync(lazyPath, 'utf8');
const lazyMap = new Map(); // slug -> import path
const lazyRe = /"([^"]+)":\s*\(\)\s*=>\s*import\("([^"]+)"\)/g;
let m;
while ((m = lazyRe.exec(lazySrc))) lazyMap.set(m[1], m[2]);
console.log('calculator lazyComponents entries:', lazyMap.size);

// parse calculator registry files for slug + status
const calcRegDir = path.join(SRC, 'domains/calculator/registry');
const calcEntries = [];
for (const f of fs.readdirSync(calcRegDir)) {
  const s = fs.readFileSync(path.join(calcRegDir, f), 'utf8');
  const re = /\{\s*slug:\s*"([^"]+)"[\s\S]*?status:\s*"(live|soon)"/g;
  let mm;
  while ((mm = re.exec(s))) calcEntries.push({ slug: mm[1], status: mm[2], file: f });
}
console.log('calculator registry entries parsed:', calcEntries.length);
fs.writeFileSync(path.join(ROOT, 'scratch/_calc.json'), JSON.stringify({ calcEntries, lazy: [...lazyMap] }, null, 0));
fs.writeFileSync(path.join(ROOT, 'scratch/_stubs.json'), JSON.stringify({ stubValueAB, todoFiles }, null, 0));
console.log('wrote scratch/_calc.json + scratch/_stubs.json');
