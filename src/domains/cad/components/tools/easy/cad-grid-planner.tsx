"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt, fmtTrim } from "./ui";

/**
 * CAD Grid Planner — plans the construction grid for a drawing space: major
 * spacing, the snap sub-division per major cell, line counts and intersection
 * points, so the grid can be built exactly in the CAD tool of choice.
 */
export default function CadGridPlanner() {
  const [w, setW] = useState("297");
  const [h, setH] = useState("210");
  const [sp, setSp] = useState("10");
  const [div, setDiv] = useState("4");

  const W = parseFloat(w);
  const H = parseFloat(h);
  const S = parseFloat(sp);
  const V = parseFloat(div);

  const valid = Number.isFinite(W) && Number.isFinite(H) && Number.isFinite(S) && W > 0 && H > 0 && S > 0;

  const cols = valid ? Math.floor(W / S) + 1 : NaN;
  const rows = valid ? Math.floor(H / S) + 1 : NaN;
  const cellsX = valid ? Math.floor(W / S) : NaN;
  const cellsY = valid ? Math.floor(H / S) : NaN;
  const minor = valid ? S / V : NaN;
  const minorCols = valid ? Math.floor(W / minor) + 1 : NaN;
  const minorRows = valid ? Math.floor(H / minor) + 1 : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Drawing space & grid</PanelTitle>
        <FormGrid>
          <Num name="width" label="Space width" unit="mm" value={w} onChange={setW} />
          <Num name="height" label="Space height" unit="mm" value={h} onChange={setH} />
          <Num name="spacing" label="Major spacing" unit="mm" value={sp} onChange={setSp} />
          <Sel
            name="div"
            label="Snap sub-divisions per cell"
            value={div}
            onChange={setDiv}
            options={["2", "4", "5", "10"].map((d) => ({ value: d, label: `${d} (minor step ${(S / parseFloat(d)).toFixed(2)} mm)` }))}
          />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The minor step is the snap resolution: spacing ÷ sub-divisions. A 10 mm grid divided by 4 snaps
          to 2.5 mm — the drafting default that keeps ordinate dimensions tidy. Reference lines usually sit
          on major-grid intersections, so keep features on major coordinates where possible.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Grid totals</PanelTitle>
        <ResBox>
          <Res name="minor" label="Minor (snap) step" value={valid ? `${fmtTrim(minor, 3)} mm` : "—"} />
          <Res name="cols" label="Major vertical lines" value={valid ? fmtTrim(cols, 0) : "—"} />
          <Res name="rows" label="Major horizontal lines" value={valid ? fmtTrim(rows, 0) : "—"} />
          <Res name="points" label="Major intersections" value={valid ? fmtTrim(cols * rows, 0) : "—"} />
          <Res name="cells" label="Major cells (X × Y)" value={valid ? `${fmtTrim(cellsX, 0)} × ${fmtTrim(cellsY, 0)}` : "—"} />
          <Res name="minor-lines" label="Minor grid lines (V × H)" value={valid ? `${fmtTrim(minorCols, 0)} × ${fmtTrim(minorRows, 0)}` : "—"} />
        </ResBox>

        {valid && (
          <div className="mt-4">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full rounded-md border border-border bg-background"
              role="img"
              aria-label="Major grid preview"
            >
              {/* minor sub-division demo in the first cell */}
              {Array.from({ length: Math.floor(V) + 1 }, (_, i) => (
                <line key={`v${i}`} x1={i * minor} y1={0} x2={i * minor} y2={S} stroke="#cbd5e1" strokeWidth={0.35} strokeDasharray="0.8 0.8" />
              ))}
              {Array.from({ length: Math.floor(V) + 1 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={i * minor} x2={S} y2={i * minor} stroke="#cbd5e1" strokeWidth={0.35} strokeDasharray="0.8 0.8" />
              ))}
              {Array.from({ length: cols }, (_, i) => (
                <line key={`Mv${i}`} x1={i * S} y1={0} x2={i * S} y2={H} stroke="#64748b" strokeWidth={0.8} />
              ))}
              {Array.from({ length: rows }, (_, i) => (
                <line key={`Mh${i}`} x1={0} y1={i * S} x2={W} y2={i * S} stroke="#64748b" strokeWidth={0.8} />
              ))}
            </svg>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              {fmt(W, 0)} × {fmt(H, 0)} mm space · major {fmtTrim(S, 3)} mm (solid) · minor detail (dashed) in the first cell
            </p>
          </div>
        )}
      </Panel>
    </CalcLayout>
  );
}
