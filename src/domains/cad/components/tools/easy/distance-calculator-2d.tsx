"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

/**
 * Distance Calculator (2D) — straight-line distance, deltas and bearing between
 * two points. d = √(Δx² + Δy²), angle measured from the +X axis.
 */
export default function DistanceCalculator2D() {
  const [unit, setUnit] = useState("mm");
  const [x1, setX1] = useState("0");
  const [y1, setY1] = useState("0");
  const [x2, setX2] = useState("30");
  const [y2, setY2] = useState("40");

  const p1 = { x: parseFloat(x1), y: parseFloat(y1) };
  const p2 = { x: parseFloat(x2), y: parseFloat(y2) };
  const valid = [p1.x, p1.y, p2.x, p2.y].every(Number.isFinite);

  const dx = valid ? p2.x - p1.x : NaN;
  const dy = valid ? p2.y - p1.y : NaN;
  const dist = valid ? Math.hypot(dx, dy) : NaN;
  let angle = valid ? (Math.atan2(dy, dx) * 180) / Math.PI : NaN;
  if (Number.isFinite(angle) && angle < 0) angle += 360;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Points</PanelTitle>
        <FormGrid>
          <Num name="x1" label="Point 1 · X" unit={unit} value={x1} onChange={setX1} />
          <Num name="y1" label="Point 1 · Y" unit={unit} value={y1} onChange={setY1} />
          <Num name="x2" label="Point 2 · X" unit={unit} value={x2} onChange={setX2} />
          <Num name="y2" label="Point 2 · Y" unit={unit} value={y2} onChange={setY2} />
        </FormGrid>
        <Sel
          name="unit"
          label="Unit"
          value={unit}
          onChange={setUnit}
          options={["mm", "cm", "m", "in", "ft"].map((u) => ({ value: u, label: u }))}
        />
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="dist" label="Distance" value={valid ? `${fmt(dist)} ${unit}` : "—"} />
          <Res name="dx" label="Δx (x2 − x1)" value={valid ? `${fmt(dx)} ${unit}` : "—"} />
          <Res name="dy" label="Δy (y2 − y1)" value={valid ? `${fmt(dy)} ${unit}` : "—"} />
          <Res name="angle" label="Bearing from +X axis" value={valid ? `${fmt(angle)}°` : "—"} />
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}
