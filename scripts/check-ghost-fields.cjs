/**
 * Ghost-field + dead-value checker.
 * For each target component: parse the inputs interface, then count how many
 * times each field is referenced outside the interface/DEFAULTS block.
 * A field only referenced in state plumbing (setInputs/value=) never reaches
 * the calculation, which violates the NO GHOST FIELDS rule.
 */
const fs = require("fs");
const path = require("path");

const COMP = path.join(__dirname, "../src/domains/calculator/components");
const targets = process.argv.slice(2);

for (const name of targets) {
  const file = path.join(COMP, name + ".tsx");
  if (!fs.existsSync(file)) {
    console.log(`\n### ${name}: FILE MISSING`);
    continue;
  }
  const text = fs.readFileSync(file, "utf8");

  // the inputs interface = first interface whose name ends in Inputs
  const im = text.match(/interface\s+(\w*Inputs)\s*\{([\s\S]*?)\n\}/);
  if (!im) {
    console.log(`\n### ${name}: no *Inputs interface found`);
    continue;
  }
  const fields = [...im[2].matchAll(/^\s*(\w+)\s*[?]?:/gm)].map((m) => m[1]);

  // isolate the pure calculation function body
  const cm = text.match(/export function calculate\w*\([\s\S]*?\n\}/);
  const calcBody = cm ? cm[0] : "";

  // isolate the result interface to spot computed-but-unrendered values
  const rm = text.match(/interface\s+(\w*Result)\s*\{([\s\S]*?)\n\}/);
  const resultFields = rm
    ? [...rm[2].matchAll(/^\s*(\w+)\s*[?]?:/gm)].map((m) => m[1])
    : [];

  const jsxStart = text.indexOf("return (");
  const jsx = jsxStart > -1 ? text.slice(jsxStart) : "";

  const ghosts = fields.filter((f) => {
    if (f === "proMode") return false; // gates a section, checked separately
    const re = new RegExp(`(?:i|inputs|prev|p)\\.${f}\\b`, "g");
    return !(calcBody.match(re) || []).length;
  });

  const deadResults = resultFields.filter((f) => {
    const re = new RegExp(`result\\.${f}\\b`, "g");
    return !(jsx.match(re) || []).length;
  });

  console.log(`\n### ${name}`);
  console.log(`  input fields (${fields.length}): ${fields.join(", ")}`);
  console.log(`  GHOST (not read by calc): ${ghosts.length ? ghosts.join(", ") : "none"}`);
  console.log(
    `  DEAD result values (never rendered): ${deadResults.length ? deadResults.join(", ") : "none"}`
  );
  console.log(`  size: ${(Buffer.byteLength(text) / 1024).toFixed(1)}KB`);
}
