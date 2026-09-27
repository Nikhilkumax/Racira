"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, FormGrid, Num, Panel, PanelTitle, RefTable, Res, ResBox, fmtTrim } from "../ui";

/**
 * CSS Clamp Calculator — the same two-point line as the fluid scale builder,
 * with the preference term shown at the ends and in the middle of the range.
 *
 *   slope     = (maxSize − minSize) / (maxVw − minVw)
 *   intercept = minSize − slope × minVw
 *   clamp(minSize, intercept + slope × 100vw, maxSize)
 */
export default function CssClampCalculator() {
  const [minSize, setMinSize] = useState("16");
  const [maxSize, setMaxSize] = useState("22");
  const [minVw, setMinVw] = useState("360");
  const [maxVw, setMaxVw] = useState("1440");
  const [root, setRoot] = useState("16");

  const smin = parseFloat(minSize);
  const smax = parseFloat(maxSize);
  const vmin = parseFloat(minVw);
  const vmax = parseFloat(maxVw);
  const r = parseFloat(root) || 16;
  const valid = [smin, smax, vmin, vmax, r].every(Number.isFinite) && vmax > vmin && smax >= smin && smin > 0;

  const slope = valid ? (smax - smin) / (vmax - vmin) : NaN;
  const intercept = valid ? smin - slope * vmin : NaN;
  const slopeVw = valid ? slope * 100 : NaN;

  const clamp = valid
    ? `clamp(${fmtTrim(smin / r, 4)}rem, ${fmtTrim(intercept / r, 4)}rem + ${fmtTrim(slopeVw, 4)}vw, ${fmtTrim(smax / r, 4)}rem)`
    : "";
  const pxClamp = valid ? `clamp(${fmtTrim(smin, 3)}px, ${fmtTrim(intercept, 3)}px + ${fmtTrim(slopeVw, 4)}vw, ${fmtTrim(smax, 3)}px)` : "";

  const sampleRows = valid
    ? [0, 0.25, 0.5, 0.75, 1].map((t) => {
        const vw = vmin + (vmax - vmin) * t;
        const linear = intercept + slope * vw;
        const actual = Math.min(smax, Math.max(smin, linear));
        return [`${fmtTrim(vw, 0)}px`, `${fmtTrim(linear, 2)}px`, `${fmtTrim(actual, 2)}px`, t === 0 || t === 1 ? "pinned" : "fluid"];
      })
    : [];

  const css = [
    ":root {",
    `  --fluid-size: ${clamp};`,
    "}",
    "",
    "/* px fallback for very old browsers */",
    `.fluid-text {`,
    `  font-size: ${fmtTrim((smin + smax) / 2, 2)}px;`,
    `  font-size: ${clamp};`,
    "}",
  ].join("\n");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Endpoints</PanelTitle>
        <FormGrid>
          <Num name="minSize" label="Min font size" unit="px" value={minSize} onChange={setMinSize} step={0.5} />
          <Num name="maxSize" label="Max font size" unit="px" value={maxSize} onChange={setMaxSize} step={0.5} />
          <Num name="minVw" label="Min viewport" unit="px" value={minVw} onChange={setMinVw} />
          <Num name="maxVw" label="Max viewport" unit="px" value={maxVw} onChange={setMaxVw} />
          <Num name="root" label="Root size" unit="px" value={root} onChange={setRoot} />
        </FormGrid>
        <ResBox>
          <Res name="slope" label="Slope" value={valid ? `${fmtTrim(slope, 6)} px/px (${fmtTrim(slopeVw, 4)}vw per 100vw)` : "—"} />
          <Res name="intercept" label="Intercept" value={valid ? `${fmtTrim(intercept, 3)}px` : "—"} />
          <Res name="preferred" label="Preferred term" value={valid ? `${fmtTrim(intercept / r, 4)}rem + ${fmtTrim(slopeVw, 4)}vw` : "—"} />
          <Res name="delta" label="Growth across range" value={valid ? `${fmtTrim(smax - smin, 2)}px` : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The clamp lower/upper bounds are what make this safe: the preferred term only applies between the two viewport
          endpoints.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Behaviour</PanelTitle>
          <RefTable
            cols={["Viewport", "Linear value", "Rendered", "Mode"]}
            rows={sampleRows}
            minWidth={380}
            note="Rendered = clamp(min, linear, max): outside the endpoints the value pins to the bounds."
          />
        </Panel>
        <CodeOut code={valid ? css : "/* enter valid endpoints */"} title="CSS" testid="clamp-css" />
        {valid && <CodeOut code={pxClamp} title="px variant (no rem)" testid="clamp-px" />}
      </div>
    </CalcLayout>
  );
}
