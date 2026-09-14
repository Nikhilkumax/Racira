"use client";

import { useState } from "react";
import { Btn, CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

type Vtx = { x: string; y: string };

/**
 * Perimeter Calculator — polygons (closed, via vertices), rectangles and
 * circles. Polygon perimeter closes back to the first vertex.
 */
export default function PerimeterCalculator() {
  const [mode, setMode] = useState("rect");
  const [unit, setUnit] = useState("mm");
  const [w, setW] = useState("100");
  const [h, setH] = useState("50");
  const [r, setR] = useState("25");
  const [vtx, setVtx] = useState<Vtx[]>([
    { x: "0", y: "0" },
    { x: "30", y: "0" },
    { x: "0", y: "40" },
  ]);

  let perimeter = NaN;
  let edges = 0;
  if (mode === "rect") {
    const wv = parseFloat(w), hv = parseFloat(h);
    if (Number.isFinite(wv) && Number.isFinite(hv) && wv >= 0 && hv >= 0) {
      perimeter = 2 * (wv + hv);
      edges = 4;
    }
  } else if (mode === "circle") {
    const rv = parseFloat(r);
    if (Number.isFinite(rv) && rv >= 0) {
      perimeter = 2 * Math.PI * rv;
      edges = 0;
    }
  } else {
    const pts = vtx.map((v) => ({ x: parseFloat(v.x), y: parseFloat(v.y) }));
    if (pts.length >= 3 && pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))) {
      let sum = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        sum += Math.hypot(b.x - a.x, b.y - a.y);
      }
      perimeter = sum;
      edges = pts.length;
    }
  }

  const setV = (i: number, k: "x" | "y", v: string) =>
    setVtx((rows) => rows.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const addV = () => setVtx((rows) => [...rows, { x: "0", y: "0" }]);
  const rmV = () => setVtx((rows) => (rows.length > 3 ? rows.slice(0, -1) : rows));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Shape</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="mode"
            label="Shape"
            value={mode}
            onChange={setMode}
            options={[
              { value: "rect", label: "Rectangle" },
              { value: "circle", label: "Circle" },
              { value: "poly", label: "Polygon (vertices)" },
            ]}
          />
          {mode === "rect" && (
            <FormGrid>
              <Num name="w" label="Width" unit={unit} value={w} onChange={setW} />
              <Num name="h" label="Height" unit={unit} value={h} onChange={setH} />
            </FormGrid>
          )}
          {mode === "circle" && <Num name="r" label="Radius" unit={unit} value={r} onChange={setR} />}
          {mode === "poly" && (
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
          )}
          {mode !== "poly" && (
            <Sel
              name="unit"
              label="Unit"
              value={unit}
              onChange={setUnit}
              options={["mm", "cm", "m", "in", "ft"].map((u) => ({ value: u, label: u }))}
            />
          )}
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res
            name="perim"
            label={mode === "circle" ? "Circumference" : "Perimeter"}
            value={Number.isFinite(perimeter) ? `${fmt(perimeter)} ${unit}` : "—"}
          />
          <Res
            name="edges"
            label={mode === "circle" ? "Boundary" : "Sides counted"}
            value={mode === "circle" ? "Curved" : edges ? String(edges) : "—"}
          />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {mode === "poly"
            ? "The polygon is closed automatically: the last vertex connects back to the first."
            : mode === "circle"
              ? "Circumference = 2πr."
              : "Perimeter = 2 × (width + height)."}
        </p>
      </Panel>
    </CalcLayout>
  );
}
