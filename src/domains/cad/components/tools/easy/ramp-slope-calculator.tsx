"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

/**
 * Ramp Slope Calculator — slope from rise and run, in %, ratio and degrees,
 * with ADA/IBC accessibility checks (max 1:12, landings ≤ 30 in rise).
 */
export default function RampSlopeCalculator() {
  const [unit, setUnit] = useState("mm");
  const [rise, setRise] = useState("300");
  const [run, setRun] = useState("3600");

  const r = parseFloat(rise);
  const n = parseFloat(run);
  const valid = Number.isFinite(r) && Number.isFinite(n) && r >= 0 && n > 0;

  const pct = valid ? (r / n) * 100 : NaN;
  const ratio = valid ? n / r : NaN;
  const angle = valid ? Math.atan(r / n) * (180 / Math.PI) : NaN;

  // ADA 2010 / IBC: max 1:12 (8.333…%) — steeper only with exceptions;
  // rest platform required at least every 30 in (760 mm) of rise.
  const ada = valid ? pct <= 100 / 12 + 1e-9 : false;
  const needLanding = valid ? r > 762 : false; // > 30 in (762 mm) rise

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Ramp</PanelTitle>
        <FormGrid>
          <Num name="rise" label="Vertical rise" unit={unit} value={rise} onChange={setRise} />
          <Num name="run" label="Horizontal run" unit={unit} value={run} onChange={setRun} />
        </FormGrid>
        <div className="mt-3">
          <Sel
            name="unit"
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={["mm", "cm", "m", "in", "ft"].map((u) => ({ value: u, label: u }))}
          />
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="pct" label="Slope" value={valid ? `${fmt(pct, 2)} %` : "—"} />
          <Res name="ratio" label="Run : rise ratio" value={valid ? `1 : ${fmt(ratio, 2)}` : r === 0 ? "0 (level)" : "—"} />
          <Res name="angle" label="Angle" value={valid ? `${fmt(angle, 2)}°` : "—"} />
          <Res name="ada" label="Accessibility (max 1:12)" value={valid ? (ada ? "Meets 1:12 ✓" : "Exceeds 1:12 ✗") : "—"} />
          <Res name="landing" label="Intermediate landing" value={valid ? (needLanding ? `Required (rise > 30 in / 762 ${unit === "in" || unit === "ft" ? "in" : "mm"})` : "Not required") : "—"} />
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}
