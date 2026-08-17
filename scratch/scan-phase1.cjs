#!/usr/bin/env node
// READ-ONLY PHASE 1 STATUS SCAN — original rules. No writes to source/registry/approved.
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

const approvedList = [];
const liveNotApproved = [];
const polish = [];
const rebuild = [];
const notBuilt = [];
const unknown = [];

for (const entry of registry.values()) {
  const file = findFile(entry.slug);
  if (!file) {
    notBuilt.push(entry);
    continue;
  }
  const fi = fileInfo.get(file);
  const base = file.replace(/\.tsx$/, "");
  const isApproved = approved.has(base);
  const hasStubs = STUBS.some((s) => fi.content.includes(s));

  // Bucket 1: APPROVED & COMPLETE
  if (isApproved && entry.status === "live" && !hasStubs) {
    approvedList.push({ ...entry, file });
    continue;
  }

  // Core checks
  const core = [];
  if (hasStubs) core.push("stub placeholder");
  if (fi.size < 8192) core.push(`file < 8KB (${(fi.size / 1024).toFixed(1)}KB)`);
  if (!/recharts/i.test(fi.content)) core.push("no Recharts import");
  if (!/>\s*Calculate\s*</.test(fi.content)) core.push("no Calculate button");
  // Primary result card: needs the primary color token AND left border in a card
  if (!/(bg-primary\/\d+[^"]*border-l-4|border-l-4[^"]*bg-primary\/\d+)/.test(fi.content)) core.push("missing primary result card");

  // Bucket 4: NEEDS REBUILD
  if (entry.status === "soon") { rebuild.push({ ...entry, file, reason: "registry status: soon" }); continue; }
  if (core.length) { rebuild.push({ ...entry, file, reason: core.join(", ") }); continue; }

  // Bucket 3: NEEDS POLISH — surface items only
  const issues = [];
  if (!/>\s*Calculate\s*</.test(fi.content)) issues.push("button label not exactly Calculate");
  const h1 = fi.content.match(/<h1[^>]*>[\s\S]{0,400}?<\/h1>/);
  if (h1) {
    const after = fi.content.slice(h1.index + h1[0].length, h1.index + h1[0].length + 300);
    if (/<p[ >]/.test(after)) issues.push("subtitle under H1");
  }
  if (/Advanced Options/i.test(fi.content) && !/text-xs\s+uppercase/.test(fi.content)) issues.push("Advanced Options not grouped");
  if (/(?:useState|defaultValue)\s*\(\s*0\s*\)/.test(fi.content) || /defaultValue\s*=\s*"0"/.test(fi.content)) issues.push("default value 0");
  if (issues.length) polish.push({ ...entry, file, issues: issues.slice(0, 5) });
  // Bucket 2: LIVE / NOT APPROVED
  else liveNotApproved.push({ ...entry, file });
}

const byName = (a, b) => (a.name || a.slug).localeCompare(b.name || b.slug);
approvedList.sort(byName);
liveNotApproved.sort(byName);
polish.sort(byName);
rebuild.sort(byName);
notBuilt.sort((a, b) => a.slug.localeCompare(b.slug));

const fmt = (n) => n.toLocaleString("en-US");
const action = liveNotApproved.length + polish.length + rebuild.length + notBuilt.length;

const S = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
let report = `\n${S}\nRACIRA CALCULATOR — STATUS REPORT\nGenerated: ${new Date().toLocaleString()}\n${S}\n`;
report += `Total registry entries:        ${fmt(registry.size)}\n`;
report += `Total component files:         ${fmt(fileNames.length)}\n`;
report += `Approved (_approved.json):      ${fmt(approved.size)}\n`;
report += `─────────────────────────────────────────────────────\n`;
report += `✅ Approved & Complete:          ${fmt(approvedList.length)}\n`;
report += `🟢 Live / Not Approved:          ${fmt(liveNotApproved.length)}\n`;
report += `🟠 Needs Polish:                 ${fmt(polish.length)}\n`;
report += `🔴 Needs Rebuild:                ${fmt(rebuild.length)}\n`;
report += `🟡 Not Built:                    ${fmt(notBuilt.length)}\n`;
report += `─────────────────────────────────────────────────────\n`;
report += `Total action needed:             ${fmt(action)}\n${S}\n`;

report += `\n🟢 LIVE / NOT APPROVED (${fmt(liveNotApproved.length)})\n`;
for (const e of liveNotApproved) report += `  • ${e.file.replace(/\.tsx$/, "")}\n`;

report += `\n🟠 NEEDS POLISH (${fmt(polish.length)})\n`;
for (const e of polish) report += `  • ${e.file.replace(/\.tsx$/, "")} — ${e.issues.join(", ")}\n`;

report += `\n🔴 NEEDS REBUILD (${fmt(rebuild.length)})\n`;
for (const e of rebuild) report += `  • ${e.file.replace(/\.tsx$/, "")} — ${e.reason}\n`;

report += `\n🟡 NOT BUILT (${fmt(notBuilt.length)})\n`;
for (const e of notBuilt) report += `  • ${e.slug} — [${e.category}]\n`;

if (unknown.length) {
  report += `\nUNKNOWN (${unknown.length})\n`;
  for (const e of unknown) report += `  • ${e.slug} — ${e.error}\n`;
}

fs.writeFileSync("status_report.md", report);
fs.writeFileSync("status_live_not_approved.txt", liveNotApproved.map((e) => e.slug).sort().join("\n") + "\n");
fs.writeFileSync("status_polish.txt", polish.map((e) => `${e.slug}\t${e.issues.join(" | ")}`).sort().join("\n") + "\n");
fs.writeFileSync("status_rebuild.txt", rebuild.map((e) => `${e.slug}\t${e.reason}`).sort().join("\n") + "\n");
fs.writeFileSync("status_not_built.txt", notBuilt.map((e) => `${e.slug}\t${e.category}`).sort().join("\n") + "\n");

console.log(report);
console.log("saved: status_report.md, status_live_not_approved.txt, status_polish.txt, status_rebuild.txt, status_not_built.txt");
