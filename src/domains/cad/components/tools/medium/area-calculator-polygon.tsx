"use client";

import { useState } from "react";
import { Btn, CalcLayout, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "../easy/ui";

type Vtx = { x: string; y: string };

/**
 * Area Calculator (polygon) — shoelace formula over a closed vertex list:
 *   A = ½·|Σ(xi·y(i+1) − x(i+1)·yi)|
 * The sign of the raw shoelace sum gives the winding direction (CCW positive
 * in the standard CAD convention). Perimeter is reported as a free by-product.
 */
export default function AreaCalculatorPolygon() {
  const [unit, setUnit] = useState("mm");
  const [vtx, setVtx] = useState<Vtx[]>([
    { x: "0", y: "0" },
    { x: "30", y: "0" },
    { x: "0", y: "40" },
  ]);

  const pts = vtx.map((v) => ({ x: parseFloat(v.x), y: parseFloat(v.y) }));
  const valid = pts.length >= 3 && pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  let area = NaN;
  let orient = "—";
  let perim = NaN;
  if (valid) {
    let sum = 0;
    let per = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      sum += a.x * b.y - b.x * a.y;
      per += Math.hypot(b.x - a.x, b.y - a.y);
    }
    area = Math.abs(sum) / 2;
    orient = sum > 0 ? "CCW" : sum < 0 ? "CW" : "Degenerate";
    perim = per;
  }

  const setV = (i: number, k: "x" | "y", v: string) =>
    setVtx((rows) => rows.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const addV = () => setVtx((rows) => [...rows, { x: "0", y: "0" }]);
  const rmV = () => setVtx((rows) => (rows.length > 3 ? rows.slice(0, -1) : rows));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Polygon vertices</PanelTitle>
        <div className="space-y-1.5">
          {vtx.map((v, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
              <span className="w-14 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">V{i + 1}</span>
              <input
                data-testid={`in-px${i}`}
                type="number"
                inputMode="decimal"
                value={v.x}
                onChange={(e) => setV(i, "x", e.target.value)}
                placeholder="x"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                data-testid={`in-py${i}`}
                type="number"
                inputMode="decimal"
                value={v.y}
                onChange={(e) => setV(i, "y", e.target.value)}
                placeholder="y"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Btn kind="ghost" testid="add-vertex" onClick={addV}>+ Add vertex</Btn>
            {vtx.length > 3 && (
              <Btn kind="ghost" testid="rm-vertex" onClick={rmV}>− Remove</Btn>
            )}
          </div>
        </div>
        <div className="mt-3">
          <Sel
            name="unit"
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={["mm", "cm", "m", "in", "ft"].map((u) => ({ value: u, label: u }))}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The polygon is closed automatically — the last vertex connects back to the first. A triangle
          with vertices at (0,0), (30,0) and (0,40) must return an area of 600.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="area" label="Area" value={valid ? `${fmt(area)} ${unit}²` : "—"} />
          <Res name="perim" label="Perimeter" value={valid ? `${fmt(perim)} ${unit}` : "—"} />
          <Res
            name="orient"
            label="Winding (shoelace sign)"
            value={orient}
          />
          <Res name="verts" label="Vertices" value={valid ? String(pts.length) : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Area = ½ × |Σ(xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)|. The winding is the sign of the raw sum — positive is
          counter-clockwise in the standard CAD convention. A degenerate (zero-area) vertex order
          reports "Degenerate".
        </p>
      </Panel>
    </CalcLayout>
  );
}