"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, SliderNum, fmtTrim } from "../ui";

interface Row {
  step: number;
  minPx: number;
  maxPx: number;
  preferredRemVw: string;
  clamp: string;
}

const VW_REM = 0.25; // 4vw expressed in rem terms per 100vw at a 16px root

/**
 * CSS Fluid Typography Builder — derives the slope/intercept pair for each step
 * of a scale so type grows linearly between two viewports:
 *
 *   slope     = (max − min) / (maxVw − minVw)
 *   intercept = min − slope × minVw
 *   size      = clamp(min, intercept + slope × 100vw, max)
 *
 * The intercept is expressed in rem and the slope in vw so the ramp respects
 * user font-size settings (a 100%-scale user zooms, and rem grows with it).
 */
export default function CssFluidTypographyBuilder() {
  const [base, setBase] = useState("16");
  const [ratio, setRatio] = useState("1.25");
  const [mobileVw, setMobileVw] = useState("360");
  const [desktopVw, setDesktopVw] = useState("1440");
  const [steps, setSteps] = useState("5");
  const [minScale, setMinScale] = useState("0.8");

  const b = Math.max(10, parseFloat(base) || 16);
  const r = Math.max(1.05, parseFloat(ratio) || 1.25);
  const vwMin = Math.max(200, parseFloat(mobileVw) || 360);
  const vwMax = Math.max(vwMin + 100, parseFloat(desktopVw) || 1440);
  const n = Math.min(7, Math.max(2, Math.round(parseFloat(steps) || 5)));
  const scale = Math.min(1, Math.max(0.5, parseFloat(minScale) || 0.8));

  const rows: Row[] = Array.from({ length: n }, (_, i) => {
    const step = n - 1 - i;
    const maxPx = b * r ** step;
    const minPx = maxPx * scale;
    const slope = (maxPx - minPx) / (vwMax - vwMin); // px per 1px of viewport width
    const intercept = minPx - slope * vwMin;
    const slopeVw = slope * 100; // px per 100vw → convert to vw units below
    const preferredRem = intercept / 16;
    const preferredVw = slopeVw / 16;
    const clamp = `clamp(${fmtTrim(minPx / 16, 4)}rem, ${fmtTrim(preferredRem, 4)}rem + ${fmtTrim(preferredVw, 4)}vw, ${fmtTrim(maxPx / 16, 4)}rem)`;
    return { step, minPx, maxPx, preferredRemVw: `${fmtTrim(preferredRem, 4)}rem + ${fmtTrim(preferredVw, 4)}vw`, clamp };
  });

  const tableRows = rows.map((row) => [
    `+${row.step}${row.step === 0 ? " (base)" : ""}`,
    `${fmtTrim(row.minPx, 2)}px`,
    `${fmtTrim(row.maxPx, 2)}px`,
    row.preferredRemVw,
    <code key="c" className="font-mono text-[11px]">
      {row.clamp}
    </code>,
  ]);

  const css = `.fluid-type {
${rows.map((row, i) => `  --step-${n - 1 - i}: ${row.clamp};`).join("\n")}
}\n\n${rows.map((row, i) => `.step-${n - 1 - i} { font-size: var(--step-${n - 1 - i}); }`).join("\n")}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Viewports & scale</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="base" label="Base (min step) size" unit="px" value={base} onChange={setBase} min={12} max={24} step={1} />
          <SliderNum name="ratio" label="Ratio" value={ratio} onChange={setRatio} min={1.05} max={1.6} step={0.005} />
          <SliderNum name="mob" label="Mobile viewport" unit="px" value={mobileVw} onChange={setMobileVw} min={280} max={640} step={10} />
          <SliderNum name="desk" label="Desktop viewport" unit="px" value={desktopVw} onChange={setDesktopVw} min={900} max={2200} step={20} />
          <SliderNum name="steps" label="Steps" value={steps} onChange={setSteps} min={2} max={7} step={1} />
          <SliderNum name="scale" label="Mobile ÷ desktop" unit="×" value={minScale} onChange={setMinScale} min={0.5} max={1} step={0.01} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The mobile–desktop ratio is {fmtTrim(scale, 2)}× and the ramp covers {fmtTrim(vwMax - vwMin, 0)}px of viewport
          width — below {fmtTrim(vwMin, 0)}px every step is held at its minimum, above {fmtTrim(vwMax, 0)}px at its maximum.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Steps</PanelTitle>
          <RefTable
            cols={["Step", "Min", "Max", "Preferred term", "clamp()"]}
            rows={tableRows}
            minWidth={680}
            note={`${VW_REM}rem-per-vw constant used only for the readout; the clamp itself is exact.`}
          />
        </Panel>
        <Panel>
          <PanelTitle>Rendered ramp (resize the window)</PanelTitle>
          <div className="space-y-2">
            {rows.map((row) => (
              <p
                key={row.step}
                className="text-foreground"
                style={{ fontSize: `clamp(${row.minPx}px, ${row.preferredRemVw.replace("rem", "rem").replace(" + ", " + ")}, ${row.maxPx}px)` }}
              >
                +{row.step} — fluid step from {fmtTrim(row.minPx, 1)}px to {fmtTrim(row.maxPx, 1)}px
              </p>
            ))}
          </div>
        </Panel>
        <CodeOut code={css} title="Fluid scale tokens" testid="fluid-css" />
      </div>
    </CalcLayout>
  );
}
