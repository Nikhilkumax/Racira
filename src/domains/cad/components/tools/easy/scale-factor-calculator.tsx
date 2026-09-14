"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmtTrim } from "./ui";

/**
 * Scale Factor Calculator — derives the drawing scale from a known real length
 * and its length on the drawing. factor = drawn / real, ratio 1:X = real / drawn.
 */
export default function ScaleFactorCalculator() {
  const [unit, setUnit] = useState("mm");
  const [drawn, setDrawn] = useState("50");
  const [real, setReal] = useState("2500");

  const d = parseFloat(drawn);
  const r = parseFloat(real);
  const valid = Number.isFinite(d) && Number.isFinite(r) && d > 0 && r > 0;

  const factor = valid ? d / r : NaN;
  const x = valid ? r / d : NaN;
  const percent = valid ? factor * 100 : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Known lengths</PanelTitle>
        <FormGrid>
          <Sel
            name="unit"
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={["mm", "cm", "m", "in", "ft"].map((u) => ({ value: u, label: u }))}
          />
          <div />
          <Num name="drawn" label="Length on drawing" unit={unit} value={drawn} onChange={setDrawn} />
          <Num name="real" label="Real-world length" unit={unit} value={real} onChange={setReal} />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Example: a 50 mm wall drawn to represent 2.5 m gives a 1:50 scale. A factor under 1 is a reduction
          scale; over 1 is an enlargement (e.g. a detail).
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="factor" label="Scale factor (drawn ÷ real)" value={valid ? fmtTrim(factor, 4) : "—"} />
          <Res name="ratio" label="Architect’s scale (1 : X)" value={valid ? `1:${fmtTrim(x, 3)}` : "—"} />
          <Res name="percent" label="Percent of full size" value={valid ? `${fmtTrim(percent, 2)}%` : "—"} />
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}
