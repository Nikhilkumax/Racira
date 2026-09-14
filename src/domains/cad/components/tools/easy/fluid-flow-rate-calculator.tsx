"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, fmt } from "./ui";

/**
 * Fluid Flow Rate Calculator — volumetric flow from pipe ID and mean velocity.
 *   A = π·d²/4 (d in m), Q = v·A
 */
export default function FluidFlowRateCalculator() {
  const [dia, setDia] = useState("50"); // mm
  const [vel, setVel] = useState("2"); // m/s

  const dM = parseFloat(dia) / 1000;
  const v = parseFloat(vel);
  const valid = Number.isFinite(dM) && dM > 0 && Number.isFinite(v) && v >= 0;

  const area = valid ? (Math.PI * dM * dM) / 4 : NaN; // m²
  const q = valid ? v * area : NaN; // m³/s
  const m3h = valid ? q * 3600 : NaN;
  const lmin = valid ? q * 60000 : NaN;
  const ls = valid ? q * 1000 : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Pipe & flow</PanelTitle>
        <FormGrid>
          <Num name="dia" label="Internal diameter" unit="mm" value={dia} onChange={setDia} />
          <Num name="vel" label="Mean velocity" unit="m/s" value={vel} onChange={setVel} />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Flow = velocity × cross-section area (Q = v·A). Design velocities: water 1–3 m/s, open drains ~0.6 m/s
          minimum to stay self-cleaning, compressed air 6–15 m/s.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="area" label="Cross-section area" value={valid ? `${fmt(area, 6)} m²` : "—"} />
          <Res name="q" label="Flow rate" value={valid ? `${fmt(q, 6)} m³/s` : "—"} />
          <Res name="m3h" label="Volumetric flow" value={valid ? `${fmt(m3h, 3)} m³/h` : "—"} />
          <Res name="lmin" label="Volumetric flow" value={valid ? `${fmt(lmin, 3)} L/min` : "—"} />
          <Res name="ls" label="Volumetric flow" value={valid ? `${fmt(ls, 3)} L/s` : "—"} />
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}
