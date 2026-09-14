"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

/**
 * Arc Length Calculator — arc geometry from radius + included angle.
 *   arc  = r·θ            (θ in radians)
 *   chord = 2r·sin(θ/2)
 *   sagitta = r·(1 − cos(θ/2))
 *   sector area = ½·r²·θ
 */
export default function ArcLengthCalculator() {
  const [unit, setUnit] = useState("mm");
  const [r, setR] = useState("50");
  const [deg, setDeg] = useState("60");

  const rv = parseFloat(r);
  const aDeg = parseFloat(deg);
  const valid = Number.isFinite(rv) && rv > 0 && Number.isFinite(aDeg) && aDeg > 0 && aDeg <= 360;
  const rad = valid ? (aDeg * Math.PI) / 180 : NaN;

  const arc = valid ? rv * rad : NaN;
  const chord = valid ? 2 * rv * Math.sin(rad / 2) : NaN;
  const sag = valid ? rv * (1 - Math.cos(rad / 2)) : NaN;
  const sector = valid ? 0.5 * rv * rv * rad : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Arc</PanelTitle>
        <FormGrid>
          <Num name="r" label="Radius" unit={unit} value={r} onChange={setR} />
          <Num name="deg" label="Included angle" unit="°" value={deg} onChange={setDeg} />
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
          <Res name="arc" label="Arc length" value={valid ? `${fmt(arc)} ${unit}` : "—"} />
          <Res name="chord" label="Chord length" value={valid ? `${fmt(chord)} ${unit}` : "—"} />
          <Res name="sag" label="Sagitta (bow height)" value={valid ? `${fmt(sag)} ${unit}` : "—"} />
          <Res name="sector" label="Sector area" value={valid ? `${fmt(sector)} ${unit}²` : "—"} />
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}
