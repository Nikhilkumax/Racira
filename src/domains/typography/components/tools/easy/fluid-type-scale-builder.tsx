"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, FormGrid, Num, Panel, PanelTitle, RefTable, Res, ResBox, fmtTrim } from "../ui";

/**
 * Fluid Type Scale Builder — turns a min/max design pair into clamp() CSS.
 *
 *   slope      = (maxSize − minSize) / (maxVw − minVw)      [px per px]
 *   intercept  = minSize − slope × minVw                    [px]
 *   preferred  = intercept + slope × 100vw
 *   clamp      = clamp(minSize, preferred, maxSize)
 *
 * The whole scale is derived by multiplying the body min/max by the ratio, so
 * every step shares one viewport range and one slope.
 */
const RATIOS = [
  { value: "1.125", label: "1.125 — Major second" },
  { value: "1.2", label: "1.200 — Minor third" },
  { value: "1.25", label: "1.250 — Major third" },
  { value: "1.333", label: "1.333 — Perfect fourth" },
  { value: "1.5", label: "1.500 — Perfect fifth" },
];

const STEPS = [
  { key: "h1", label: "h1", step: 3 },
  { key: "h2", label: "h2", step: 2 },
  { key: "h3", label: "h3", step: 1 },
  { key: "body", label: "body", step: 0 },
  { key: "small", label: "small", step: -1 },
];

export default function FluidTypeScaleBuilder() {
  const [minVw, setMinVw] = useState("360");
  const [maxVw, setMaxVw] = useState("1440");
  const [minSize, setMinSize] = useState("15");
  const [maxSize, setMaxSize] = useState("18");
  const [root, setRoot] = useState("16");
  const [ratio, setRatio] = useState("1.25");

  const vMin = parseFloat(minVw);
  const vMax = parseFloat(maxVw);
  const sMin = parseFloat(minSize);
  const sMax = parseFloat(maxSize);
  const r = parseFloat(root) || 16;
  const q = parseFloat(ratio);
  const valid = [vMin, vMax, sMin, sMax, r, q].every(Number.isFinite) && vMax > vMin && sMax > sMin && sMin > 0;

  const slopePx = valid ? (sMax - sMin) / (vMax - vMin) : NaN;
  const interceptPx = valid ? sMin - slopePx * vMin : NaN;
  const preferredVw = valid ? slopePx * 100 : NaN;

  const clampFor = (sizeMin: number, sizeMax: number) => {
    const slope = (sizeMax - sizeMin) / (vMax - vMin);
    const intercept = sizeMin - slope * vMin;
    return `clamp(${fmtTrim(sizeMin / r, 4)}rem, ${fmtTrim(intercept / r, 4)}rem + ${fmtTrim(slope * 100, 4)}vw, ${fmtTrim(sizeMax / r, 4)}rem)`;
  };

  const rows = STEPS.map(({ label, step }) => {
    const lo = valid ? sMin * q ** step : NaN;
    const hi = valid ? sMax * q ** step : NaN;
    return [
      label,
      valid ? `${fmtTrim(lo, 2)} – ${fmtTrim(hi, 2)}px` : "—",
      valid ? `${step >= 0 ? "+" : ""}${step}` : "—",
      valid ? clampFor(lo, hi) : "—",
    ];
  });

  const css = valid
    ? [
        ":root {",
        ...STEPS.map(({ key, step }) => {
          const lo = sMin * q ** step;
          const hi = sMax * q ** step;
          return `  --font-size-${key}: ${clampFor(lo, hi)};`;
        }),
        "}",
        "",
        "/* Preview pair: " + `${vMin}px → ${vMax}px viewport, ${sMin}px → ${sMax}px body` + " */",
      ].join("\n")
    : "";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Design pair</PanelTitle>
        <FormGrid>
          <Num name="minVw" label="Min viewport" unit="px" value={minVw} onChange={setMinVw} />
          <Num name="maxVw" label="Max viewport" unit="px" value={maxVw} onChange={setMaxVw} />
          <Num name="minSize" label="Min body size" unit="px" value={minSize} onChange={setMinSize} step={0.5} />
          <Num name="maxSize" label="Max body size" unit="px" value={maxSize} onChange={setMaxSize} step={0.5} />
          <Num name="root" label="Root size" unit="px" value={root} onChange={setRoot} />
          <Num name="ratio" label="Scale ratio" value={ratio} onChange={setRatio} step={0.001} />
        </FormGrid>
        <ResBox>
          <Res name="slope" label="Slope" value={valid ? `${fmtTrim(preferredVw, 4)}vw per 100vw (${fmtTrim(slopePx, 5)} px/px)` : "—"} />
          <Res name="intercept" label="Intercept" value={valid ? `${fmtTrim(interceptPx, 4)}px` : "—"} />
          <Res name="pref" label="Preferred term" value={valid ? `${fmtTrim(interceptPx / r, 4)}rem + ${fmtTrim(preferredVw, 4)}vw` : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The preferred term is the straight line through your two design points: below the min viewport the font pins to the
          min size, above the max viewport it pins to the max size.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Fluid scale</PanelTitle>
          <RefTable
            cols={["Role", "Size range", "Step", "clamp()"]}
            rows={rows}
            minWidth={560}
            note="Every step is the body pair multiplied by ratio^step — one slope, one viewport range."
          />
        </Panel>
        <CodeOut code={css || "/* enter a valid viewport/size pair */"} title="CSS variables" testid="fluid-scale-css" />
      </div>
    </CalcLayout>
  );
}
