import fs from "fs";

const lazy = fs.readFileSync("src/app/calculator/lazyComponents.tsx", "utf8");

function findFile(slug) {
  const esc = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`"${esc}":\\s*\\(\\)\\s*=>\\s*import\\(\\"[^\\"]*/([^\\"]+)\\"`);
  const m = lazy.match(re);
  return m ? m[1] + ".tsx" : null;
}

for (const slug of ["tidal-prediction-calculator", "transformer-calculator"]) {
  const f = findFile(slug);
  const c = fs.readFileSync(`src/domains/calculator/components/${f}`, "utf8");
  console.log(`== ${slug} -> ${f} (${(Buffer.byteLength(c) / 1024).toFixed(1)} KB)`);
  const checks = [
    [/bg-primary\/10/, "bg-primary/10"],
    [/border-l-4/, "border-l-4"],
    [/\bborder-primary\b/, "border-primary"],
    [/from\s+["']recharts["']/, "recharts import"],
    [/>\s*Calculate\s*</, ">Calculate< button"],
    [/handleCalculate/, "handleCalculate"],
  ];
  for (const [re, name] of checks) console.log(`   ${name}: ${re.test(c)}`);
}

console.log("adsense _test slug:");
console.log("  _test wired:", /"adsense-revenue-calculator_test"/.test(lazy));
console.log("  plain wired:", /"adsense-revenue-calculator"\s*:/.test(lazy));
