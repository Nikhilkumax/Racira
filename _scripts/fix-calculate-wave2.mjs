// Wave 2: pattern-B calculators already define handleCalculate but only render a
// Reset button. Insert a primary "Calculate" button before the Reset button in the
// same flex row, and narrow the Reset button (w-full -> flex-1).

import fs from "fs";
import path from "path";

const DIR = "src/domains/calculator/components";

const files = [
  "DailyCalorieBurnCalculator.tsx",
  "BreastfeedingCalorieCalculator.tsx",
  "EllipticalCalorieCalculator.tsx",
  "CircuitTrainingCalorieCalculator.tsx",
  "DancingCalorieCalculator.tsx",
  "GymSessionCalorieBurnCalculator.tsx",
  "BoxingCalorieCalculator.tsx",
  "CrossFitWodCalorieCalculator.tsx",
  "HikingCalorieCalculator.tsx",
  "AthleteBmiCalculator.tsx",
  "HiitCalorieBurnCalculator.tsx",
  "FloorsClimbedCalorieCalculator.tsx",
  "CardioVsWeightsCalorieCalculator.tsx",
  "HotYogaCalorieCalculator.tsx",
  "CardioVsStrengthComparisonCalculator.tsx",
  "AlcoholCaloriesCalculator.tsx",
  "BodyFatNavyMethodCalculator.tsx",
  "BodyFatSkinfoldCalculator.tsx",
  "DeadSpaceFractionCalculator.tsx",
];

// Matches the reset <button ...> opening tag (non-greedy up to first '>').
const RESET_TAG_RE = /<button type="button" onClick=\{handleReset\}[^>]*?>/;

function transform(content) {
  if (!/handleCalculate/.test(content)) {
    return { ok: false, reason: "no handleCalculate" };
  }
  const m = content.match(RESET_TAG_RE);
  if (!m) return { ok: false, reason: "no Reset button tag" };

  const tag = m[0];
  const hClass = (tag.match(/h-\d+/) || ["h-11"])[0];

  // Narrow the reset button to share the row with Calculate.
  const narrowed = tag.replace(/\bw-full\b/, "flex-1");
  if (narrowed === tag) return { ok: false, reason: "reset button not w-full" };

  const calcBtn = `\n              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold ${hClass} transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">Calculate</button>`;

  const replaced = content.replace(tag, calcBtn + "\n" + narrowed);
  return { ok: true, content: replaced };
}

let ok = 0, fail = 0;
for (const f of files) {
  const p = path.join(DIR, f);
  const src = fs.readFileSync(p, "utf8");
  const r = transform(src);
  if (r.ok) {
    fs.writeFileSync(p, r.content);
    console.log(`✅ ${f}`);
    ok++;
  } else {
    console.log(`❌ ${f} — ${r.reason}`);
    fail++;
  }
}
console.log(`\nDone: ${ok} ok, ${fail} failed.`);
