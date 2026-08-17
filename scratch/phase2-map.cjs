#!/usr/bin/env node
// Phase 2 helper: maps registry slugs -> component files and dumps the three action lists
// with file names, mirroring the Phase 1 scan logic (pascal + normalized + aliases).
const fs = require("fs");
const path = require("path");

const COMP = "src/domains/calculator/components";
const REG = "src/domains/calculator/registry";

const ALIASES = {
  "0-60-mph-acceleration-estimator": "AccelerationEstimatorCalculator.tsx",
  "0-60-mph-calculator": "ZeroSixtyCalculator.tsx",
  "baseball-fielding-percentage-calculator": "BaseballFieldingCalculator.tsx",
  "baseball-slugging-percentage-calculator": "BaseballSluggingCalculator.tsx",
  "cd-calculator": "CdCalculatorFull.tsx",
  "cold-wallet-key-entropy-calculator": "ColdWalletEntropyCalculator.tsx",
  "lifetime-value-calculator": "CustomerLifetimeValueCalculator.tsx",
  "home-loan-emi-calculator-india": "HomeLoanEmiIndia.tsx",
  "loan-deferment-interest-accumulation-calculator": "LoanDefermentInterestCalculator.tsx",
  "loan-to-cost-ltc-ratio-calculator": "LoanToCostRatioCalculator.tsx",
  "meatless-monday-impact-calculator": "MeatlessDietImpactCalculator.tsx",
  "net-worth-tracker": "NetWorthTrackerCalc.tsx",
  "net-present-value-calculator": "NpvCalculator.tsx",
  "real-estate-calculator": "RealEstateCalculatorFull.tsx",
  "relative-energy-deficiency-in-sport-red-s-risk-score-calculator": "RedSRiskScoreCalculator.tsx",
  "ssl-certificate-cost-calculator": "SslCostCalculator.tsx",
  "tea-steeping-time-calculator": "TeaSteepingCalculator.tsx",
  "tennis-first-serve-percentage-calculator": "TennisFirstServeCalculator.tsx",
  "turkey-roasting-time-calculator": "TurkeyRoastingCalculator.tsx",
  "visceral-fat-calculator": "ViscerialFatCalculator.tsx",
  "457(b)-plan-calculator": "Four57bPlanCalculator.tsx",
  "403(b)-growth-calculator": "Four03bGrowthCalculator.tsx",
  "401k-calculator": "Four01kGrowthCalculator.tsx",
  "15-year-vs-30-year-mortgage-comparison": "FifteenVsThirtyMortgageCalculator.tsx",
  "1-3-5-daily-task-prioritization-calculator": "OneThreeFiveCalculator.tsx",
  "domain-name-valuation-calculator": "DomainValuationCalculator.tsx",
  "power-supply-calculator": "PsuCalculator.tsx",
  "3d-print-time-calculator": "ThreeDPrintTimeCalculator.tsx",
  "horsepower-to-kilowatts-calculator": "HpToKwCalculator.tsx",
  "pixel-density-calculator": "PpiCalculator.tsx",
  "quarter-to-semester-credit-conversion-calculator": "QuarterToSemesterCreditCalculator.tsx",
  "mean-time-between-failures-mtbf-calculator": "MtbfCalculator.tsx",
  "hydraulic-retention-time-hrt-calculator": "HydraulicRetentionTimeCalculator.tsx",
  "laundry-loads-per-month-cost-calculator": "LaundryLoadsCostCalculator.tsx",
  "hourly-freelance-rate-to-annual-income-calculator": "HourlyFreelanceToAnnualIncomeCalculator.tsx",
  "5-year-ownership-cost-calculator": "FiveYearOwnershipCostCalculator.tsx",
  "10-year-ownership-cost-calculator": "TenYearOwnershipCostCalculator.tsx",
  "10-year-averaging-distribution-calculator": "TenYearAveragingDistributionCalculator.tsx",
  "fha-mortgage-insurance-premium-mip-calculator": "FhaMipCalculator.tsx",
  "freelancer-tax-calculator": "FreelanceTaxCalculator.tsx",
};

const registry = new Map();
for (const f of fs.readdirSync(REG).filter((f) => f.endsWith(".ts"))) {
  const text = fs.readFileSync(path.join(REG, f), "utf8");
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = slugRe.exec(text))) {
    const next = text.indexOf("slug:", m.index + m[0].length);
    const end = next === -1 ? text.length : next;
    const chunk = text.slice(m.index, end);
    const status = (chunk.match(/status:\s*"(live|soon)"/) || [])[1] || "";
    const category = (chunk.match(/category:\s*"([^"]+)"/) || [])[1] || "UNKNOWN";
    const name = (chunk.match(/name:\s*"([^"]+)"/) || [])[1] || m[1];
    if (!registry.has(m[1])) registry.set(m[1], { slug: m[1], name, category, status });
  }
}

const approvedRaw = fs.readFileSync(path.join(COMP, "_approved.json"), "utf8").replace(/^\uFEFF/, "");
const approved = new Set(JSON.parse(approvedRaw).approved);

const fileNames = fs.readdirSync(COMP).filter((f) => f.endsWith(".tsx"));
const fileInfo = new Map();
for (const f of fileNames) {
  const content = fs.readFileSync(path.join(COMP, f), "utf8");
  fileInfo.set(f, { f, content, size: Buffer.byteLength(content, "utf8") });
}

const STUBS = ['"Value A"', '"Value B"', "Coming Soon", "This calculator is planned", "planned for a future", "Back to Calculators"];

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

// ---- same bucketing as Phase 1 ----
const liveNotApproved = [];
const polish = [];
const rebuild = [];
for (const entry of registry.values()) {
  const file = findFile(entry.slug);
  if (!file) continue; // not built - not in this scope
  const fi = fileInfo.get(file);
  const base = file.replace(/\.tsx$/, "");
  const isApproved = approved.has(base);
  const hasStubs = STUBS.some((s) => fi.content.includes(s));
  const core = [];
  if (hasStubs) core.push("stub placeholder");
  if (fi.size < 8192) core.push("file < 8KB");
  if (!/recharts/i.test(fi.content)) core.push("no Recharts import");
  if (!/Calculate/.test(fi.content)) core.push("no Calculate button");
  if (!/bg-primary/.test(fi.content)) core.push("missing primary result card");

  if (isApproved && entry.status === "live" && !hasStubs) continue;
  if (entry.status === "soon") { rebuild.push({ ...entry, file, reason: "registry status 'soon'" }); continue; }
  if (core.length) { rebuild.push({ ...entry, file, reason: core.join(", ") }); continue; }
  const issues = [];
  if (/Calculate/.test(fi.content) && !/>\s*Calculate\s*</.test(fi.content)) issues.push("button label not exactly Calculate");
  const h1 = fi.content.match(/<h1[^>]*>[\s\S]{0,400}?<\/h1>/);
  if (h1) {
    const after = fi.content.slice(h1.index + h1[0].length, h1.index + h1[0].length + 300);
    if (/<p[ >]/.test(after)) issues.push("subtitle under H1");
  }
  if (/Advanced Options/i.test(fi.content) && !/text-xs\s+uppercase/.test(fi.content)) issues.push("Advanced Options not grouped");
  if (/(?:useState|defaultValue)\s*\(\s*0\s*\)/.test(fi.content) || /defaultValue\s*=\s*"0"/.test(fi.content) || /value\s*=\s*\{\s*0\s*\}/.test(fi.content)) issues.push("default value 0");
  if (issues.length) polish.push({ ...entry, file, issues });
  else liveNotApproved.push({ ...entry, file });
}

// liveNotApproved: no surface issues at all (per Phase 1 scan) -> approval only
fs.writeFileSync(
  "scratch/phase2-live.txt",
  liveNotApproved.map((e) => `${e.slug}\t${e.file}`).sort((a, b) => a.localeCompare(b)).join("\n") + "\n"
);
fs.writeFileSync(
  "scratch/phase2-polish.txt",
  polish.map((e) => `${e.slug}\t${e.file}\t${e.issues.join(" | ")}`).sort((a, b) => a.localeCompare(b)).join("\n") + "\n"
);
fs.writeFileSync(
  "scratch/phase2-rebuild.txt",
  rebuild.map((e) => `${e.slug}\t${e.file}\t${e.reason}`).sort((a, b) => a.localeCompare(b)).join("\n") + "\n"
);

console.log("live-not-approved:", liveNotApproved.length);
console.log("polish:", polish.length);
console.log("rebuild:", rebuild.length);
console.log("polish issue breakdown:");
const pc = {};
for (const p of polish) for (const i of p.issues) pc[i] = (pc[i] || 0) + 1;
Object.entries(pc).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log("  ", v, k));
