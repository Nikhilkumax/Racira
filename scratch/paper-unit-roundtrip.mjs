// Unit round-trip check for the Scale Paper Tool display units.
// Mirrors mmToUnit/unitToMm (both go through the single mmPerUnit factor),
// so passing here means the on-page conversions are consistent too.
// Run: node scratch/paper-unit-roundtrip.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(
  "src/domains/cad/components/tools/easy/scale-paper-tool.tsx",
  "utf8",
);

// Pull the DISPLAY_UNITS table out of the TSX so the check can never drift
// from the shipped factors.
const tableStart = src.indexOf("export const DISPLAY_UNITS");
const open = src.indexOf("[", tableStart);
let depth = 0, end = -1;
for (let i = open; i < src.length; i++) {
  if (src[i] === "[") depth++;
  else if (src[i] === "]") { depth--; if (depth === 0) { end = i; break; } }
}
const units = eval(src.slice(open, end + 1));
console.log(`units parsed: ${units.length}\n`);

let failures = 0;
const fmtTrim = (n, d = 3) => (Number.isFinite(n) ? String(+n.toFixed(d)) : "—");

// Mirror of unitDecimals() in the component: half a displayed step must stay
// under 5 μm, clamped to [2, 6].
const unitDecimals = (unit, mmPerUnit) =>
  Math.min(6, Math.max(2, Math.ceil(Math.log10(mmPerUnit / 0.005))));

// Sample sizes span the catalog: A4, A0, 4A0, 2R, and a custom odd size.
for (const u of units) {
  let worst = { label: "", err: 0 };
  for (const mm of [210, 297, 841, 1682, 63.5, 127.3]) {
    // UI round trip: mm -> unit -> (displayed with unitDecimals in the field) -> mm
    const dp = unitDecimals(u.value, u.mmPerUnit);
    const halfStep = 0.5 * Math.pow(10, -dp) * u.mmPerUnit; // max error a displayed value can carry
    if (halfStep > 0.005) { failures++; console.log(`  FAIL  ${u.label}: displayed step too coarse (half-step ${halfStep} mm)`); }
    const shown = Number(fmtTrim(mm / u.mmPerUnit, dp));
    const back = shown * u.mmPerUnit;
    const err = Math.abs(back - mm);
    if (err > worst.err) worst = { label: `${mm} mm → ${fmtTrim(mm / u.mmPerUnit, dp)} ${u.value} → ${fmtTrim(back, dp)} mm`, err };
    if (err > halfStep * 1.01 + 1e-9) { failures++; console.log(`  FAIL  ${u.label}: ${mm} mm → back = ${back} (err ${err} > half-step ${halfStep})`); }
  }
  console.log(`  ok    ${u.label.padEnd(28)} worst err ${worst.err.toExponential(2)}  dp=${unitDecimals(u.value, u.mmPerUnit)}  (${worst.label})`);
}

console.log(failures ? `\n${failures} FAILURE(S)\n` : "\nall units round-trip within half a displayed step (≤ 5 μm)\n");
process.exit(failures ? 1 : 0);
