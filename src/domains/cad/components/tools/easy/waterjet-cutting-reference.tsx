"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmtTrim } from "./ui";

/** Reference traverse speed (mm/min) at 10 mm thickness, 4100 bar, 340 g/min abrasive. */
const VREF: Record<string, { v10: number; note: string }> = {
  "Mild steel": { v10: 120, note: "Clean edge with no HAZ — the default reason to choose waterjet over laser above ~20 mm." },
  "Stainless steel": { v10: 100, note: "Slower than mild: work hardening resists the jet. Fine features need the slow end." },
  Aluminium: { v10: 210, note: "Cuts nearly twice as fast as steel at the same thickness." },
  Titanium: { v10: 65, note: "Slow traverse and fresh abrasive — titanium work-hardens and sparks under a stalled jet." },
  Granite: { v10: 55, note: "Abrasive does the cutting; keep the jet moving to avoid washout at entry." },
  Glass: { v10: 90, note: "Start outside the part: entry pierce will crack glass. Laminated glass needs a slower first pass." },
};

/** Abrasive flow (g/min) and quality factor on traverse speed. */
const ABRASIVE: Record<string, number> = { "240 g/min": 0.78, "340 g/min": 1.0, "450 g/min": 1.16 };

/**
 * Waterjet Cutting Reference — indicative traverse speed and settings for
 * abrasive waterjet cutting. Speed model: v(t) = v10 · (10/t)^0.75 scaled by
 * pump pressure and abrasive flow. Indicative only — jet performance varies
 * with orifice/nozzle wear and machine power.
 */
export default function WaterjetCuttingReference() {
  const [material, setMaterial] = useState("Mild steel");
  const [thick, setThick] = useState("10");
  const [pressure, setPressure] = useState("4100");
  const [abrasive, setAbrasive] = useState("340 g/min");
  const [quality, setQuality] = useState("standard");

  const t = parseFloat(thick);
  const P = parseFloat(pressure);
  const vref = VREF[material].v10;

  const valid = Number.isFinite(t) && t > 0 && Number.isFinite(P) && P > 0;

  const speed =
    valid ? vref * Math.pow(10 / t, 0.75) * Math.pow(P / 4100, 1.15) * ABRASIVE[abrasive] * (quality === "standard" ? 1 : quality === "premium" ? 0.5 : 1.4) : NaN;

  const qNote =
    quality === "premium"
      ? "Premium finish (taper-controlled, fine edge): slow the cut to ~50% — stack cutting or a second pass controls taper."
      : quality === "fast"
        ? "Fast / rough cut: taper tolerance opens up; save for edges that will be machined or hidden."
        : "Standard cut: top kerf ≈ bottom kerf + 0.1–0.3 mm taper depending on thickness.";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Part & machine</PanelTitle>
        <FormGrid>
          <Sel
            name="material"
            label="Material"
            value={material}
            onChange={setMaterial}
            options={Object.keys(VREF).map((m) => ({ value: m, label: m }))}
          />
          <Num name="thick" label="Thickness" unit="mm" value={thick} onChange={setThick} />
          <Sel
            name="pressure"
            label="Pump pressure"
            value={pressure}
            onChange={setPressure}
            options={[
              { value: "3000", label: "3000 bar (~44 kpsi)" },
              { value: "4100", label: "4100 bar (~60 kpsi)" },
            ]}
          />
          <Sel
            name="abrasive"
            label="Abrasive flow"
            value={abrasive}
            onChange={setAbrasive}
            options={Object.keys(ABRASIVE).map((a) => ({ value: a, label: a }))}
          />
          <Sel
            name="quality"
            label="Edge quality"
            value={quality}
            onChange={setQuality}
            options={[
              { value: "fast", label: "Fast / rough" },
              { value: "standard", label: "Standard cut" },
              { value: "premium", label: "Premium finish" },
            ]}
          />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Model: traverse speed ∝ v₁₀ · (10/t)^0.75 · (P/4100)^1.15 · abrasive flow. v₁₀ is the
          reference speed for a 10 mm part at 4100 bar with 340 g/min of 80-mesh garnet.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Indicative settings</PanelTitle>
        <ResBox>
          <Res name="speed" label="Traverse speed" value={valid ? `${fmtTrim(speed, 0)} mm/min` : "—"} />
          <Res name="kerf" label="Kerf (top)" value="~1.0 mm" />
          <Res name="abrasive" label="Abrasive consumption" value={abrasive} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {valid ? VREF[material].note : ""} {qNote} Waterjet parts have no heat-affected zone, so the
          CAD model needs no allowance for distortion — only for the kerf and taper.
        </p>
      </Panel>
    </CalcLayout>
  );
}
