"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

/**
 * Via Current Capacity Calculator — IPC-2221 external-conductor current model
 * applied to the plated barrel of a via:
 *   I = 0.048 · ΔT^0.44 · A^0.725   (A in mil², I in A)
 * Plating cross-section A = annulus of the drilled hole, π·(d+t)·t.
 * Internal layers carry ~half (use the internal coefficient 0.024).
 */
const PLATING: Record<string, number> = {
  "18 µm (0.5 oz)": 0.018,
  "25 µm (0.7 oz)": 0.025,
  "35 µm (1 oz)": 0.035,
};

export default function ViaCurrentCapacityCalculator() {
  const [drill, setDrill] = useState("0.6");
  const [plating, setPlating] = useState("25 µm (0.7 oz)");
  const [rise, setRise] = useState("10");
  const [layer, setLayer] = useState("external");

  const d = parseFloat(drill);
  const t = PLATING[plating];
  const dt = parseFloat(rise);
  const valid = Number.isFinite(d) && d > 0 && Number.isFinite(dt) && dt > 0;

  // Plating cross-section (mm²) → mil²; then IPC-2221 external formula.
  const annulusMm2 = valid ? Math.PI * (Math.pow(d / 2 + t, 2) - Math.pow(d / 2, 2)) : NaN;
  const annulusMil2 = valid ? annulusMm2 * 1550 : NaN;
  const coeff = layer === "internal" ? 0.024 : 0.048;
  const amps = valid ? coeff * Math.pow(dt, 0.44) * Math.pow(annulusMil2, 0.725) : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Via geometry</PanelTitle>
        <FormGrid>
          <Num name="drill" label="Finished drill diameter" unit="mm" value={drill} onChange={setDrill} />
          <Num name="rise" label="Allowed temp rise ΔT" unit="°C" value={rise} onChange={setRise} />
        </FormGrid>
        <div className="mt-3 space-y-3">
          <Sel name="plating" label="Plated copper thickness" value={plating} onChange={setPlating} options={Object.keys(PLATING).map((p) => ({ value: p, label: p }))} />
          <Sel
            name="layer"
            label="Via location"
            value={layer}
            onChange={setLayer}
            options={[
              { value: "external", label: "External layer(s)" },
              { value: "internal", label: "Internal layer only" },
            ]}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Current model: I = k · ΔT^0.44 · A^0.725 per IPC-2221, applied to the plated barrel annulus (not the drill
          hole area). Internal conductors use k = 0.024 (≈ half of external 0.048). The result is a guidance value,
          not a pass/fail limit.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="area" label="Plating cross-section" value={valid ? `${fmt(annulusMm2, 4)} mm² (${fmt(annulusMil2, 1)} mil²)` : "—"} />
          <Res name="amp" label="Recommended max current" value={valid ? `${fmt(amps, 3)} A` : "—"} />
          <Res name="rule" label="Rule of thumb" value={valid ? "≈ 1 A per 25–30 mil² of plating at ΔT 10 °C" : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Many designs derate vias further for DC bias reliability and use multiple parallel vias for high current.
          For critical supplies, put two or more vias in parallel and keep the connecting traces ≥ the via capacity.
        </p>
      </Panel>
    </CalcLayout>
  );
}
