"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "../easy/ui";

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Coordinate Input Tool — Cartesian ↔ Polar conversion.
 *   Cartesian mode: (x, y) → r = √(x²+y²), θ = atan2(y, x) normalised to
 *   0–360° (and the signed −180…180 equivalent).
 *   Polar mode: (r, θ) → x = r·cos θ, y = r·sin θ.
 */
export default function CoordinateInputTool() {
  const [mode, setMode] = useState("cart");
  const [unit, setUnit] = useState("mm");
  const [x, setX] = useState("30");
  const [y, setY] = useState("40");
  const [r, setR] = useState("50");
  const [theta, setTheta] = useState("53.13");

  const xv = parseFloat(x);
  const yv = parseFloat(y);
  const rv = parseFloat(r);
  const tv = parseFloat(theta);

  const cartOk = Number.isFinite(xv) && Number.isFinite(yv);
  const polOk = Number.isFinite(rv) && Number.isFinite(tv);

  const rOut = cartOk ? Math.hypot(xv, yv) : NaN;
  const thetaOut = cartOk ? norm360((Math.atan2(yv, xv) * 180) / Math.PI) : NaN;
  const thetaSigned = cartOk
    ? ((Math.atan2(yv, xv) * 180) / Math.PI + 540) % 360 - 180
    : NaN;
  const xOut = polOk ? rv * Math.cos((tv * Math.PI) / 180) : NaN;
  const yOut = polOk ? rv * Math.sin((tv * Math.PI) / 180) : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Input</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="mode"
            label="Conversion"
            value={mode}
            onChange={setMode}
            options={[
              { value: "cart", label: "Cartesian (x, y) → Polar (r, θ)" },
              { value: "polar", label: "Polar (r, θ) → Cartesian (x, y)" },
            ]}
          />
          {mode === "cart" ? (
            <FormGrid>
              <Num name="x" label="X" unit={unit} value={x} onChange={setX} />
              <Num name="y" label="Y" unit={unit} value={y} onChange={setY} />
            </FormGrid>
          ) : (
            <FormGrid>
              <Num name="r" label="Radius r" unit={unit} value={r} onChange={setR} />
              <Num name="theta" label="Angle θ" unit="°" value={theta} onChange={setTheta} />
            </FormGrid>
          )}
          <Sel
            name="unit"
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={["mm", "cm", "m", "in", "ft"].map((u) => ({ value: u, label: u }))}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The classic check: (30, 40) must give r = 50 and θ = 53.13°; entering r = 50 with
          θ = 53.13° must return (30, 40).
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          {mode === "cart" ? (
            <>
              <Res name="r" label="Radius r" value={cartOk ? `${fmt(rOut)} ${unit}` : "—"} />
              <Res name="theta" label="Angle θ (0–360°)" value={cartOk ? `${fmt(thetaOut)}°` : "—"} />
              <Res name="signed" label="Angle θ (−180…180°)" value={cartOk ? `${fmt(thetaSigned)}°` : "—"} />
              <Res name="quadrant" label="Quadrant" value={cartOk ? (xv >= 0 && yv >= 0 ? "I" : xv < 0 && yv >= 0 ? "II" : xv < 0 ? "III" : "IV") : "—"} />
            </>
          ) : (
            <>
              <Res name="x" label="X" value={polOk ? `${fmt(xOut)} ${unit}` : "—"} />
              <Res name="y" label="Y" value={polOk ? `${fmt(yOut)} ${unit}` : "—"} />
            </>
          )}
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}