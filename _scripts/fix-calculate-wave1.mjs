// Wave 1: add a Calculate button + handleCalculate to pattern-A calculators.
// Pattern A = files with `const [results, setResults] = useState<X>(calcFn(DEFAULTS))`,
// `handleChange`, and a Reset-only button row (`<div className="flex gap-2.5 mt-4|2">`).
// These are complete live-compute calculators; we add an explicit Calculate button
// (calling the same pure calc fn) so they match the site-wide convention and pass scan.

import fs from "fs";
import path from "path";

const DIR = "src/domains/calculator/components";

const files = [
  "BitcoinMiningCalculator.tsx",
  "BaristaFireCalculator.tsx",
  "BackdoorRothIraCalculator.tsx",
  "AssetCoverageRatioCalculator.tsx",
  "CoolingSystemCalculator.tsx",
  "DifferentialCalculator.tsx",
  "DynoCalculator.tsx",
  "Election83bCalculator.tsx",
  "EmissionsTestCalculator.tsx",
  "FleetFuelCostCalculator.tsx",
  "DriverCostPerMileCalculator.tsx",
  "FleetDepreciationCalculator.tsx",
  "BreakEvenMileageCalculator.tsx",
  "CommercialVehicleLoadCalculator.tsx",
  "BatteryLifeCalculator.tsx",
  "HorsepowerCalculator.tsx",
  "GearRatioCalculator.tsx",
  "BrakeHorsepowerCalculator.tsx",
  "DragCoefficientCalculator.tsx",
  "BrakingDistanceCalculator.tsx",
  "AmtCalculator.tsx",
  "AngelInvestmentReturnCalculator.tsx",
  "AltitudeCalculator.tsx",
  "BlackScholesCalculator.tsx",
  "Plan529Calculator.tsx",
];

const CALC_FN_RE = /useState<[^>]*>\(\s*(\w+)\(DEFAULTS\)\)/;

function transform(content) {
  const orig = content;
  const out = [];
  let log = [];

  // 1. calc fn name
  const m = content.match(CALC_FN_RE);
  if (!m) return { ok: false, reason: "no useState(calcFn(DEFAULTS))" };
  const calcFn = m[1];

  // 2. insert handleCalculate before handleReset
  const insert = `  const handleCalculate = () => {
    const r = ${calcFn}(inputs);
    if (!r.isError) setResults(r);
  };

`;
  if (!content.includes("handleCalculate")) {
    const idx = content.indexOf("  const handleReset = () => {");
    if (idx === -1) return { ok: false, reason: "no handleReset" };
    content = content.slice(0, idx) + insert + content.slice(idx);
    log.push("inserted handleCalculate");
  } else {
    log.push("handleCalculate already present");
  }

  // 3. replace Reset-only button row with Calculate + Reset
  const rowRe =
    /<div className="flex gap-2\.5 mt-(?:4|2)">\s*<button type="button" onClick=\{handleReset\} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">\s*<RotateCcw className="h-4 w-4" \/> Reset\s*<\/button>\s*<\/div>/;
  const rowReplacement = `<div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>`;
  const r2 = content.match(rowRe);
  if (!r2) return { ok: false, reason: "no Reset-only button row", calcFn, partial: content !== orig };
  content = content.replace(rowRe, rowReplacement);
  log.push("replaced button row");

  return { ok: true, content, log, calcFn };
}

let ok = 0, fail = 0;
for (const f of files) {
  const p = path.join(DIR, f);
  const src = fs.readFileSync(p, "utf8");
  const r = transform(src);
  if (r.ok) {
    fs.writeFileSync(p, r.content);
    console.log(`✅ ${f} (${r.calcFn}) ${r.log.join(", ")}`);
    ok++;
  } else {
    console.log(`❌ ${f} — ${r.reason}${r.partial ? " (PARTIAL — skipped write)" : ""}`);
    fail++;
  }
}
console.log(`\nDone: ${ok} ok, ${fail} failed.`);
