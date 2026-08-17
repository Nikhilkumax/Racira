#!/usr/bin/env node
// Flip `status: "soon"` -> `status: "live"` for slugs that already have component files.
const fs = require("fs");
const path = require("path");
const REG = "src/domains/calculator/registry";

const lines = fs.readFileSync("scratch/phase2-rebuild.txt", "utf8").trim().split("\n").filter(Boolean);
const slugs = lines.filter((l) => l.includes("registry status 'soon'")).map((l) => l.split("\t")[0]);

let flipped = 0;
const missing = [];
for (const f of fs.readdirSync(REG).filter((f) => f.endsWith(".ts"))) {
  const p = path.join(REG, f);
  const c = fs.readFileSync(p, "utf8");
  const parts = [];
  let last = 0;
  for (const s of slugs) {
    const re = new RegExp('\\{\\s*slug: "' + s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"[\\s\\S]*?\\}');
    const m = c.match(re);
    if (m && m[0].includes('status: "soon"')) {
      const replaced = m[0].replace('status: "soon"', 'status: "live"');
      parts.push([m.index, m.index + m[0].length, replaced]);
      flipped++;
    } else {
      missing.push(s);
    }
  }
  if (!parts.length) continue;
  // apply replacements from the end to keep indices valid
  parts.sort((a, b) => b[0] - a[0]);
  let out = c;
  for (const [start, end, repl] of parts) {
    out = out.slice(0, start) + repl + out.slice(end);
  }
  fs.writeFileSync(p, out);
}
console.log("flipped:", flipped, "missing:", missing.length);
if (missing.length) console.log(missing.join("\n"));
