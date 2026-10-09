// Verify batch components against the Gold Standard checklist (structure only).
// Usage: node _scripts/verify-batch.js <file1.tsx> <file2.tsx> ...
const fs = require("fs");
const path = require("path");

const DIR = "src/domains/calculator/components";
const files = process.argv.slice(2);
let allOk = true;
for (const f of files) {
  const p = path.join(DIR, f);
  const s = fs.readFileSync(p, "utf8");
  const checks = {
    size8k: fs.statSync(p).size > 8192,
    calculateBtn: /<button[^>]*>\s*Calculate\s*<\/button>/s.test(s),
    noUseEffect: !/useEffect/.test(s),
    noReadOnly: !/readOnly/.test(s),
    noDisabled: !/\bdisabled\b/.test(s),
    primaryCard: s.includes("bg-primary/10 border-l-4 border-primary rounded-lg p-5"),
    statBar: s.includes("flex items-center justify-between px-4 py-3 bg-secondary/30"),
    breakdown: s.includes("Summary Statistics") && s.includes("divide-y divide-border/50"),
    grid: s.includes("grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]"),
    leftPanel: s.includes("card-calculator flex flex-col gap-3 !p-4"),
    advanced: s.includes("Advanced Options") && s.includes("bg-secondary/20 border border-border mt-3"),
    reset: /aria-label="Reset"/.test(s) && /setResults\(compute/.test(s),
    noChart: !/recharts/.test(s),
    onEnter: (s.match(/onEnter=\{runCalculate\}/g) || []).length >= 2,
  };
  // SEO: exactly 3 H2s with the exact class, word count 500-1000
  const h2s = (s.match(/<h2 className="text-2xl font-bold mb-3">/g) || []).length;
  const secStart = s.indexOf('<section className="prose-finance text-[15.75px]">');
  const secEnd = s.indexOf("</section>", secStart);
  const prose = secStart !== -1 && secEnd !== -1 ? s.slice(secStart, secEnd) : "";
  const words = prose
    .replace(/<[^>]+>/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/\{[^}]*\}/g, " ")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
  checks.seoH2x3 = h2s === 3;
  checks.seoWords = words >= 500 && words <= 1000;

  const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  const ok = failed.length === 0;
  if (!ok) allOk = false;
  console.log(`${ok ? "PASS" : "FAIL"} ${f}  (${(fs.statSync(p).size / 1024).toFixed(1)} KB, SEO ${words} words)${ok ? "" : " — failed: " + failed.join(", ")}`);
}
console.log(allOk ? "\nALL STRUCTURAL CHECKS PASS" : "\nSOME CHECKS FAILED");
process.exit(allOk ? 0 : 1);
