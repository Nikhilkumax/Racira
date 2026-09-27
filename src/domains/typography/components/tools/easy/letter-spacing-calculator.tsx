"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, FormGrid, Num, Panel, PanelTitle, RefTable, Res, ResBox, Sel, fmtTrim } from "../ui";

/**
 * Letter Spacing Calculator — tracking maths + a size/case starting table.
 *
 *   em  = px / font-size
 *   px  = em × font-size
 *   px per 1000 em units (design-tool "tracking") = em × 1000
 *
 * Recommended tracking follows the usual optical logic: small text needs
 * positive tracking, display sizes need negative; uppercase needs the most.
 */
const BANDS = [
  { size: "10–12px", body: "+0.02em", caps: "+0.08em", display: "+0.01em" },
  { size: "13–16px", body: "0em", caps: "+0.06em", display: "−0.01em" },
  { size: "17–24px", body: "−0.01em", caps: "+0.04em", display: "−0.02em" },
  { size: "25–40px", body: "−0.015em", caps: "+0.02em", display: "−0.02em" },
  { size: "41px+", body: "−0.02em", caps: "0em", display: "−0.03em" },
];

export default function LetterSpacingCalculator() {
  const [size, setSize] = useState("16");
  const [mode, setMode] = useState("em");
  const [value, setValue] = useState("0.0");
  const [category, setCategory] = useState("body");

  const s = parseFloat(size);
  const v = parseFloat(value);
  const valid = Number.isFinite(s) && s > 0 && Number.isFinite(v);

  const em = valid ? (mode === "em" ? v : v / s) : NaN;
  const px = valid ? (mode === "px" ? v : v * s) : NaN;
  const tracking = valid ? em * 1000 : NaN;

  const band =
    s <= 12 ? BANDS[0] : s <= 16 ? BANDS[1] : s <= 24 ? BANDS[2] : s <= 40 ? BANDS[3] : BANDS[4];
  const recommended = category === "caps" ? band.caps : category === "display" ? band.display : band.body;

  const css =
    valid
      ? [`font-size: ${fmtTrim(s, 3)}px;`, `letter-spacing: ${fmtTrim(em, 5)}em; /* ${fmtTrim(px, 4)}px */`].join("\n")
      : "";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Tracking</PanelTitle>
        <FormGrid>
          <Num name="size" label="Font size" unit="px" value={size} onChange={setSize} step={0.5} />
          <Sel
            name="mode"
            label="Input unit"
            value={mode}
            onChange={setMode}
            options={[
              { value: "em", label: "em (relative)" },
              { value: "px", label: "px (absolute)" },
            ]}
          />
          <Num name="value" label={mode === "em" ? "Letter spacing (em)" : "Letter spacing (px)"} value={value} onChange={setValue} step={0.001} />
          <Sel
            name="category"
            label="Text role"
            value={category}
            onChange={setCategory}
            options={[
              { value: "body", label: "Body / sentence case" },
              { value: "caps", label: "Uppercase / small caps" },
              { value: "display", label: "Display heading" },
            ]}
          />
        </FormGrid>
        <ResBox>
          <Res name="em" label="In em" value={valid ? fmtTrim(em, 5) : "—"} />
          <Res name="px" label="In px" value={valid ? `${fmtTrim(px, 4)}px` : "—"} />
          <Res name="tracking" label="Design-tool tracking" value={valid ? fmtTrim(tracking, 2) : "—"} />
          <Res name="recommended" label="Recommended for this size/role" value={`${recommended} (${fmtTrim(parseFloat(recommended.replace("−", "-").replace("em", "")) * s, 3)}px)`} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Design-tool tracking is thousandths of an em — Figma/CSS convention: tracking 20 = 0.02em.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Starting points by size</PanelTitle>
          <RefTable
            cols={["Size band", "Body", "Uppercase", "Display"]}
            rows={BANDS.map((b) => [b.size, b.body, b.caps, b.display])}
            minWidth={380}
            note="Optical rules of thumb — check against the real typeface, since x-height and fit differ per family."
          />
        </Panel>
        <CodeOut code={css || "/* enter a size and a value */"} title="CSS" testid="letter-spacing-css" />
      </div>
    </CalcLayout>
  );
}
