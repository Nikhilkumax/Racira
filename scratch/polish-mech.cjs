#!/usr/bin/env node
// Mechanical polish fixes:
//  A) Remove {/* DISCLAIMER */} banner blocks between H1 and the grid (banned above grid).
//  B) Add a Calculate button to auto-calc files missing one (37 files), label exactly "Calculate".
const fs = require("fs");
const path = require("path");
const COMP = "src/domains/calculator/components";

const polish = fs
  .readFileSync("scratch/phase2-polish.txt", "utf8")
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    const [slug, file, issues] = l.split("\t");
    return { slug, file, issues };
  });

const CALC_BTN =
  '              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>\n';

// calcFn per file for the useEffect-based files (no existing handler)
const HANDLER_FNS = {
  OdometerCorrectionCalculator: "calculateCorrection",
  Plan529Calculator: "calculate529",
  RadiatorSizeCalculator: "calculateRadiator",
  SafeFollowingDistanceCalculator: "calculateFollowing",
  TireDiameterCalculator: "calculateDiameter",
  TireLoadIndexCalculator: "calculateLoadIndex",
  TirePressureCalculator: "calculateTirePressure",
  TowingCapacityCalculator: "calculateTowing",
  TransmissionRatioCalculator: "calculateSpeed",
  VehicleWeightCalculator: "calculateWeight",
  WheelHorsepowerCalculator: "calculateWHP",
};

let bannerRemoved = 0;
let calcAdded = 0;
let special = [];

for (const { slug, file, issues } of polish) {
  const p = path.join(COMP, file);
  let c = fs.readFileSync(p, "utf8");
  let changed = false;

  // ---- A) banner removal ----
  if (issues.includes("subtitle under H1")) {
    // Banner pattern: {/* * DISCLAIMER */} followed by <div className="max-w-[1280px] mb-6 bg-...">...</div>
    const bannerRe =
      /\s*\{\/\*[^*]*DISCLAIMER[^*]*\*\/\}\s*<div className="max-w-\[1280px\] mb-6[^"]*"[^>]*>[\s\S]*?<\/div>\s*/g;
    const before = c;
    c = c.replace(bannerRe, "\n");
    if (c !== before) {
      bannerRemoved++;
      changed = true;
    }
  }

  // ---- B) Calculate button ----
  if (issues.includes("button label not exactly Calculate")) {
    if (file === "VaccinationScheduleCalculator.tsx") {
      const before = c;
      c = c.replace("> Generate Timeline <", ">Calculate<").replace("Generate Timeline", "Calculate");
      if (c !== before) {
        calcAdded++;
        changed = true;
      }
      special.push(file + ": label Generate Timeline -> Calculate");
      fs.writeFileSync(p, c);
      continue;
    }
    // 1) ensure a handler exists for the useEffect-based files
    if (HANDLER_FNS[file.replace(/\.tsx$/, "")]) {
      const fn = HANDLER_FNS[file.replace(/\.tsx$/, "")];
      if (!/const handleCalculate = \(\) => \{/.test(c)) {
        const snippet = `\n  const handleCalculate = () => {\n    const r = ${fn}(inputs);\n    if (!r.isError) setResults(r);\n  };\n`;
        const anchor = "  const handleReset = () => {";
        if (c.includes(anchor)) {
          c = c.replace(anchor, snippet.trimStart() + "\n" + anchor);
          special.push(file + ": added handleCalculate using " + fn);
        } else {
          special.push(file + ": NO handleReset anchor — handler NOT added");
        }
      }
    }
    // 2) insert Calculate button before the reset button
    const anchorBtn = '<button type="button" onClick={handleReset} className="w-full';
    if (c.includes(anchorBtn)) {
      c = c.replace(anchorBtn, CALC_BTN + '              <button type="button" onClick={handleReset} className="flex-1');
      calcAdded++;
      changed = true;
    } else if (!c.includes(">Calculate</button>")) {
      special.push(file + ": no reset-button anchor found");
    }
  }

  if (changed) fs.writeFileSync(p, c);
}

console.log("banners removed:", bannerRemoved);
console.log("calculate buttons added:", calcAdded);
console.log("--- specials ---");
special.forEach((s) => console.log("  ", s));
