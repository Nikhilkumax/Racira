// Phase 3 reconciliation: classify the 207 HEAD stub slugs against the live build-status checks.
// Uses the same checks as status-scan.js: wired in lazyComponents.tsx, file exists, no stub
// placeholders, >8KB, recharts import, Calculate button, primary result card, status live.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// 1. Baseline: 207 slugs from HEAD
const headFile = execSync("git show HEAD:src/lib/tools/calculatorStubSlugs.ts", { encoding: "utf8" });
const stubSlugs = [...headFile.matchAll(/^\s*"([^"]+)",?\s*$/gm)].map((m) => m[1]);
console.log("Baseline stub slugs from HEAD:", stubSlugs.length);

// 2. lazyComponents wiring map
const lazy = fs.readFileSync("src/app/calculator/lazyComponents.tsx", "utf8");
const slugToFile = {};
const re = /"([^"]+)":\s*\(\)\s*=>\s*import\("[^"]*\/([^"]+)"\)/g;
let m;
while ((m = re.exec(lazy))) slugToFile[m[1]] = m[2] + ".tsx";

// 3. Registry info (status live/soon)
const registryDir = "src/domains/calculator/registry";
const registryEntries = [];
for (const rf of fs.readdirSync(registryDir).filter((f) => f.endsWith(".ts"))) {
  const c = fs.readFileSync(path.join(registryDir, rf), "utf8");
  const parts = c.split(/\{\s*slug:/);
  for (let i = 1; i < parts.length; i++) {
    const block = "{slug:" + parts[i];
    const slugM = block.match(/slug:\s*"([^"]+)"/);
    if (!slugM) continue;
    const statusM = block.match(/status:\s*"(\w+)"/);
    const nameM = block.match(/name:\s*"([^"]+)"/);
    registryEntries.push({ slug: slugM[1], status: statusM ? statusM[1] : "unknown", name: nameM ? nameM[1] : slugM[1] });
  }
}
const regBySlug = {};
for (const e of registryEntries) regBySlug[e.slug] = e;

// 4. Same content checks as status-scan.js
const STUB_RE = /(?:>|"|')Value A(?:<|"|')|(?:>|"|')Value B(?:<|"|')|placeholder="Value A"|placeholder="Value B"|Coming Soon|This calculator is planned|planned for a future|Back to Calculators/;
function extractButtonTexts(content) {
  const texts = [];
  const re = /<(?:button|Button)\b((?:[^>{]|\{[^}]*\})*)>([\s\S]*?)<\/(?:button|Button)>/gi;
  let m;
  while ((m = re.exec(content))) {
    let t = m[2].replace(/<[^>]*>/g, " ").replace(/\{[^}]*\}/g, " ").replace(/\s+/g, " ").trim();
    if (t) texts.push(t);
  }
  return texts;
}
function analyzeFile(content, status) {
  const sizeKB = Buffer.byteLength(content, "utf8") / 1024;
  const hasStub = STUB_RE.test(content);
  const hasRecharts = /from\s+["']recharts["']|import\(\s*["']recharts["']|require\(\s*["']recharts["']\)/.test(content);
  const hasPrimaryCard = /bg-primary\/10/.test(content) && /border-l-4/.test(content) && /\bborder-primary\b/.test(content);
  const btnTexts = extractButtonTexts(content);
  const hasCalculate = btnTexts.some((t) => /^calculat/i.test(t.trim()));
  const failures = [];
  if (hasStub) failures.push("stub placeholder");
  if (status !== "live") failures.push(`status "${status}"`);
  if (sizeKB < 8) failures.push(`file < 8KB (${sizeKB.toFixed(1)}KB)`);
  if (!hasRecharts) failures.push("no Recharts import");
  if (!hasCalculate) failures.push("no Calculate button");
  if (!hasPrimaryCard) failures.push("missing primary result card");
  return { failures, sizeKB };
}

// 5. Classify
const rows = [];
for (const slug of stubSlugs) {
  const file = slugToFile[slug] || null;
  const reg = regBySlug[slug] || null;
  let wired = !!file;
  let scanStatus = "not-tracked";
  let reason = "";

  if (!file) {
    scanStatus = "NOT WIRED";
    reason = "no lazyComponents entry";
    rows.push({ slug, wired: "no", scanStatus, decision: "KEEP", reason });
    continue;
  }

  const filePath = path.join("src/domains/calculator/components", file);
  if (!fs.existsSync(filePath)) {
    scanStatus = "FILE MISSING";
    reason = "lazy entry points to missing file";
    rows.push({ slug, wired: "yes", scanStatus, decision: "KEEP", reason });
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const status = reg ? reg.status : "unknown";
  const a = analyzeFile(content, status);

  if (a.failures.length > 0) {
    scanStatus = "NEEDS REBUILD";
    reason = a.failures.join(", ");
    rows.push({ slug, wired: "yes", scanStatus, decision: "KEEP", reason });
  } else {
    scanStatus = "APPROVED & COMPLETE";
    reason = "passes all core checks";
    rows.push({ slug, wired: "yes", scanStatus, decision: "REMOVE", reason });
  }
}

// 6. Report
const remove = rows.filter((r) => r.decision === "REMOVE");
const keep = rows.filter((r) => r.decision === "KEEP");
console.log(`\nREMOVE: ${remove.length} | KEEP: ${keep.length}`);
console.log("\n=== KEEP (stays in stub list) ===");
for (const r of keep) console.log(`${r.slug}\t wired=${r.wired}\t ${r.scanStatus}\t ${r.reason}`);
console.log("\n=== REMOVE (candidate for removal) ===");
for (const r of remove) console.log(`${r.slug}\t ${r.reason}`);

// 7. Persist results for diff step
fs.writeFileSync("_scripts/stub-reconcile-results.json", JSON.stringify({ remove, keep }, null, 2));
