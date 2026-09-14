"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, Res, ResBox, TextInput, fmtTrim } from "./ui";

/**
 * SMD Component Identifier — decodes the three common SMD resistor marking
 * schemes printed on the body of the part:
 *   • 3-digit (E24):  "472" → 47 × 10² = 4.7 kΩ
 *   • 4-digit (E96):  "1002" → 100 × 10² = 10 kΩ
 *   • EIA-96 (3-char): "01C" → 100 × 100 = 10 kΩ  (2 digits = E96 base, letter = ×10^m)
 */
const E96_BASE = [
  100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169,
  174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274, 280, 287, 294,
  301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511,
  523, 536, 549, 562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887,
  909, 931, 953, 976,
];
const MULT: Record<string, number> = {
  Z: 0.001, Y: 0.01, R: 0.01, X: 0.1, S: 0.1, A: 1, B: 10, C: 100, D: 1000, E: 10000, F: 100000,
};

function ohmsStr(v: number): string {
  if (v >= 1e6) return `${fmtTrim(v / 1e6, 2)} MΩ`;
  if (v >= 1000) return `${fmtTrim(v / 1000, 2)} kΩ`;
  if (v >= 1) return `${fmtTrim(v, 2)} Ω`;
  return `${fmtTrim(v * 1000, 2)} mΩ`;
}

type Decode =
  | { ok: true; value: string; scheme: string }
  | { ok: false; error: string };

function decode(code: string): Decode {
  const c = code.trim().toUpperCase();
  if (!c) return { ok: false, error: "Enter a marking code" };
  // EIA-96: exactly 2 digits + 1 letter (letter is not the R/S tolerance alone).
  if (/^\d{2}[A-Z]$/.test(c)) {
    const base = E96_BASE[parseInt(c.slice(0, 2), 10) - 1];
    const mult = MULT[c[2]];
    if (base === undefined) return { ok: false, error: `EIA-96 code “${c.slice(0, 2)}” out of range (01–96)` };
    if (mult === undefined) return { ok: false, error: `Unknown EIA-96 multiplier letter “${c[2]}”` };
    return { ok: true, value: ohmsStr(base * mult), scheme: "EIA-96 (2-digit + letter)" };
  }
  // 4-digit: 3 significant digits + power of ten.
  if (/^\d{4}$/.test(c)) {
    const sig = parseInt(c.slice(0, 3), 10);
    const pow = parseInt(c[3], 10);
    return { ok: true, value: ohmsStr(sig * Math.pow(10, pow)), scheme: "4-digit (E96)" };
  }
  // 3-digit: 2 significant digits + power of ten.
  if (/^\d{3}$/.test(c)) {
    const sig = parseInt(c.slice(0, 2), 10);
    const pow = parseInt(c[2], 10);
    return { ok: true, value: ohmsStr(sig * Math.pow(10, pow)), scheme: "3-digit (E24)" };
  }
  return {
    ok: false,
    error: "Not a recognized resistor marking — 3-digit (e.g. 472), 4-digit (e.g. 1002) or EIA-96 (e.g. 01C). Capacitor/inductor codes use other schemes.",
  };
}

export default function SmdComponentIdentifier() {
  const [code, setCode] = useState("472");
  const parsed = decode(code);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Marking code</PanelTitle>
        <TextInput name="code" label="SMD marking" value={code} onChange={setCode} placeholder="e.g. 472, 1002, 01C" />
        <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted-foreground">
          <p>3-digit: 47·10² = 4.7 kΩ. 4-digit: 100·10² = 10 kΩ. EIA-96: two digits from the E96 series × letter multiplier (A=×1, B=×10, C=×100 …).</p>
          <p className="text-muted-foreground/80">The same EIA-96 two-digit table also appears on SMD capacitors (value in pF) — the digit-to-value mapping is shared.</p>
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Decoded value</PanelTitle>
        <ResBox>
          <Res name="value" label="Resistance" value={parsed.ok ? parsed.value : "—"} />
          <Res name="scheme" label="Marking scheme" value={parsed.ok ? parsed.scheme : "—"} />
          {!parsed.ok && (
            <p data-testid="decode-error" className="py-2 text-xs font-medium text-destructive">{parsed.error}</p>
          )}
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}
