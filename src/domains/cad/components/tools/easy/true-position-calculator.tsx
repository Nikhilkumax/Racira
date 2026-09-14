"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, fmt } from "./ui";

/**
 * True Position Calculator — actual position diameter of a feature from its
 * measured X/Y deviation from true position:
 *   actual position Ø = 2·√(dx² + dy²)
 * Compared against the positional tolerance (a diameter) for pass/fail.
 */
export default function TruePositionCalculator() {
  const [dx, setDx] = useState("0.1");
  const [dy, setDy] = useState("0.2");
  const [tol, setTol] = useState("0.5");

  const dxv = parseFloat(dx);
  const dyv = parseFloat(dy);
  const tolv = parseFloat(tol);
  const valid = [dxv, dyv, tolv].every(Number.isFinite);

  const radial = valid ? Math.hypot(dxv, dyv) : NaN;
  const tp = valid ? 2 * radial : NaN;
  const pass = valid ? tp <= tolv : false;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Measured deviations from true position</PanelTitle>
        <FormGrid>
          <Num name="dx" label="ΔX (measured − basic)" unit="mm" value={dx} onChange={setDx} />
          <Num name="dy" label="ΔY (measured − basic)" unit="mm" value={dy} onChange={setDy} />
          <Num name="tol" label="Positional tolerance Ø" unit="mm" value={tol} onChange={setTol} />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Position Ø tolerance = 2 × radial deviation, e.g. 0.1 mm off in X and 0.2 mm off in Y is a Ø 0.447 mm
          actual position. (Ø 0.5 would allow ±0.25 per axis at best case.)
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          {/* Fixed 3 decimals: tolerance readouts keep significant trailing zeros (1.000 ≠ 1). */}
          <Res name="tp" label="Actual position (Ø)" value={valid ? `Ø ${fmt(tp, 3)} mm` : "—"} />
          <Res name="radial" label="Radial deviation" value={valid ? `${fmt(radial, 3)} mm` : "—"} />
          <Res
            name="status"
            label="Within tolerance?"
            value={valid ? (pass ? "PASS ✓" : "FAIL ✗") : "—"}
          />
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}
