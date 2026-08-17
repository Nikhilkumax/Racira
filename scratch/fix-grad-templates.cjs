#!/usr/bin/env node
// T3: for the remaining gradient-template headline cards, prefix
// `bg-primary/10 border-l-4 ` right after the opening backtick of the
// className template. Anchored to the backtick so nested ${...} matches are
// impossible (a backtick cannot occur inside the expression before the anchor).
const fs = require("fs");

const targets = {
  // file -> the className template opening that is the headline card
  "NpvCalculator.tsx": ["`bg-gradient-to-br", "`bg-primary/10 border-l-4 bg-gradient-to-br"],
  "NetWorthTrackerCalc.tsx": ["`bg-gradient-to-br", "`bg-primary/10 border-l-4 bg-gradient-to-br"],
  "PaybackPeriodCalculator.tsx": ["`bg-gradient-to-br", "`bg-primary/10 border-l-4 bg-gradient-to-br"],
  "RealEstateCalculatorFull.tsx": ["`bg-gradient-to-br", "`bg-primary/10 border-l-4 bg-gradient-to-br"],
  "ViscerialFatCalculator.tsx": ["`bg-gradient-to-br", "`bg-primary/10 border-l-4 bg-gradient-to-br"],
  "VatCalculator.tsx": ["`bg-gradient-to-br", "`bg-primary/10 border-l-4 bg-gradient-to-br"],
  "PValueCalculator.tsx": ["`border rounded-xl p-5 text-center", "`bg-primary/10 border-l-4 border rounded-xl p-5 text-center"],
};

for (const [f, [from, to]] of Object.entries(targets)) {
  const p = "src/domains/calculator/components/" + f;
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes(from)) { console.log(f, "PATTERN NOT FOUND"); continue; }
  // replace only the FIRST occurrence (headline card)
  const idx = c.indexOf(from);
  c = c.slice(0, idx) + to + c.slice(idx + from.length);
  fs.writeFileSync(p, c, "utf8");
  console.log("fixed:", f);
}
