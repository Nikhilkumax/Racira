const fs = require("fs");
const path = require("path");

const DIR = "src/domains/calculator/components";

function verify(slug, fileName) {
  const p = path.join(DIR, fileName);
  if (!fs.existsSync(p)) return { ok: false, issues: ["FILE MISSING"] };
  const c = fs.readFileSync(p, "utf8");
  const size = Buffer.byteLength(c, "utf8");
  const issues = [];
  if (c.includes("Value A") || c.includes("Value B")) issues.push("stub placeholder");
  if (size < 8192) issues.push(`file < 8KB (${(size/1024).toFixed(1)}KB)`);
  if (!/recharts/.test(c)) issues.push("no Recharts import");
  if (!/>\s*Calculate\s*</.test(c)) issues.push("no Calculate button");
  if (/Coming Soon|This calculator is planned|planned for a future|Back to Calculators/.test(c)) issues.push("Coming Soon UI");
  if (!/bg-primary\/10\s+border-l-4\s+border-primary/.test(c)) issues.push("missing primary result card");
  return { ok: issues.length === 0, issues, size: (size/1024).toFixed(1) };
}

const list = fs.readFileSync("scratch/phase2-rebuild.txt", "utf8").split("\n").filter(Boolean);
let cleared = [];
let remaining = [];
for (const line of list) {
  const [slug, file] = line.split("\t");
  const v = verify(slug, file);
  if (v.ok) cleared.push(slug); else remaining.push(line);
}

console.log("CLEARED:", cleared.length);
console.log(cleared.join("\n"));
fs.writeFileSync("scratch/phase2-rebuild.txt", remaining.join("\n") + (remaining.length ? "\n" : ""));
console.log("REMAINING:", remaining.length);
