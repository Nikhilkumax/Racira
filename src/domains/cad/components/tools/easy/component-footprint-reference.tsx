"use client";

import { RefTable } from "./ui";

/**
 * Component Footprint Reference — common SMD/THT package sizes and lead
 * pitches. Passive sizes are the exact metric equivalents of the imperial
 * codes; active pitches are the standard values.
 */

const PASSIVE: [string, string, string][] = [
  ["0402", "1.0 × 0.5", "0.6–0.7 pad length typical; fine for hand rework is hard"],
  ["0603", "1.6 × 0.8", "Most common small size; 0.9 × 0.8 pad typical"],
  ["0805", "2.0 × 1.25", "Easy to hand-solder; common for LEDs and larger caps"],
  ["1206", "3.2 × 1.6", "High-capacitance / higher-voltage parts"],
  ["1210", "3.2 × 2.5", "Big capacitors (up to ~100 µF in X5R)"],
  ["2512", "6.3 × 3.2", "Power / current-sense resistors (1 W class)"],
];

const ACTIVE: [string, string, string, string][] = [
  ["SOT-23", "3", "0.95", "Body ≈ 2.9 × 1.3 mm; the everyday small transistor / regulator"],
  ["SOT-223", "4", "2.3", "Tab carries current; thermal pad on PCB"],
  ["SOIC-8", "8", "1.27", "Body ≈ 4.9 × 3.9 mm (150 mil)"],
  ["SOIC-16", "16", "1.27", "Body ≈ 10 × 4 mm (300 mil for wide variant)"],
  ["TSSOP-8", "8", "0.65", "Fine pitch — needs solder paste stencil"],
  ["QFN", "8–64", "0.4–0.65", "Exposed pad underneath; via-in-pad for thermal"],
  ["DIP-8", "8", "2.54", "Through-hole classic; 0.3 in row spacing"],
  ["TO-92", "3", "1.27", "Through-hole transistor; leads on 0.05 in centers"],
  ["SOT-89", "4", "1.5", "SMD; large tab + 3 leads for medium power"],
];

export default function ComponentFootprintReference() {
  return (
    <div className="space-y-6">
      <RefTable
        title="Passive chip sizes (imperial code → metric body)"
        cols={["Code", "Body (mm)", "Notes"]}
        rows={PASSIVE.map((r) => r)}
        note="Pad sizes in a real design come from the IPC-7351 land-pattern calculator for the specific part — the code-to-metric body mapping here is exact, the pads are not."
      />
      <RefTable
        title="Active package pitches"
        cols={["Package", "Pins", "Lead pitch (mm)", "Notes"]}
        rows={ACTIVE.map((r) => r)}
      />
    </div>
  );
}
