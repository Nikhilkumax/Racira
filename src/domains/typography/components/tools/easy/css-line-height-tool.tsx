"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Row, Sel, SliderNum, fmtTrim } from "../ui";

const MODES = [
  { value: "unitless", label: "Unitless (recommended)" },
  { value: "rem", label: "rem" },
  { value: "px", label: "px" },
  { value: "percent", label: "percent" },
];

/**
 * CSS Line Height Tool — writes the line-height declarations for a whole scale
 * in the unit each situation wants. Unitless is the correct default: it
 * resolves against the element's own font-size, so nested elements inherit a
 * ratio rather than a fixed length. The table shows what each unit actually
 * computes to at the chosen size.
 */
export default function CssLineHeightTool() {
  const [body, setBody] = useState("16");
  const [bodyLh, setBodyLh] = useState("1.5");
  const [headLh, setHeadLh] = useState("1.2");
  const [displayLh, setDisplayLh] = useState("1.05");
  const [unit, setUnit] = useState("unitless");
  const [measure, setMeasure] = useState("66");

  const b = Math.max(10, parseFloat(body) || 16);
  const bl = Math.min(2.4, Math.max(1, parseFloat(bodyLh) || 1.5));
  const hl = Math.min(2, Math.max(1, parseFloat(headLh) || 1.2));
  const dl = Math.min(1.6, Math.max(0.9, parseFloat(displayLh) || 1.05));
  const cm = Math.max(30, parseFloat(measure) || 66);

  const roles = [
    { role: "Display", size: b * 3, lh: dl },
    { role: "H1", size: b * 2.25, lh: hl },
    { role: "H2", size: b * 1.75, lh: hl },
    { role: "H3", size: b * 1.375, lh: hl },
    { role: "Body", size: b, lh: bl },
    { role: "Caption", size: b * 0.8, lh: Math.max(1.35, bl - 0.1) },
  ];

  const fmtValue = (lh: number, size: number) => {
    if (unit === "rem") return `${fmtTrim(lh * size / 16, 4)}rem`;
    if (unit === "px") return `${fmtTrim(lh * size, 2)}px`;
    if (unit === "percent") return `${fmtTrim(lh * 100, 2)}%`;
    return fmtTrim(lh, 4);
  };

  const rows = roles.map((r) => [
    r.role,
    `${fmtTrim(r.size, 1)}px`,
    fmtTrim(r.lh, 3),
    fmtValue(r.lh, r.size),
    `${fmtTrim(r.lh * r.size, 2)}px box`,
  ]);

  const css = roles.map((r) => `.role-${r.role.toLowerCase()} { font-size: ${(r.size / 16).toFixed(4)}rem; line-height: ${fmtValue(r.lh, r.size)}; }`).join("\n");

  const charsPerLine = Math.round(cm / (b * 0.5));
  const boxHeight = bl * b;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Values</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="body" label="Body size" unit="px" value={body} onChange={setBody} min={12} max={24} step={1} />
          <SliderNum name="bodyLh" label="Body line height" unit="×" value={bodyLh} onChange={setBodyLh} min={1} max={2.2} step={0.05} />
          <SliderNum name="headLh" label="Heading line height" unit="×" value={headLh} onChange={setHeadLh} min={1} max={1.8} step={0.05} />
          <SliderNum name="displayLh" label="Display line height" unit="×" value={displayLh} onChange={setDisplayLh} min={0.9} max={1.4} step={0.01} />
          <Row label="Output unit">
            <Sel name="unit" label="" value={unit} onChange={setUnit} options={MODES} />
          </Row>
          <SliderNum name="measure" label="Measure (line length)" unit="ch" value={measure} onChange={setMeasure} min={30} max={110} step={1} />
        </div>
        <ResBox>
          <Res name="box" label="Body line box" value={`${fmtTrim(boxHeight, 2)}px`} />
          <Res name="chars" label={`Characters per ${fmtTrim(cm, 0)}ch line (@0.5em/char)`} value={`≈ ${charsPerLine}`} />
          <Res
            name="verdict"
            label="Measure check"
            value={cm < 45 ? "short — ragged right usually better" : cm > 80 ? "long — increase leading" : "comfortable 45–80ch band"}
          />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Computed rows</PanelTitle>
          <RefTable cols={["Role", "Size", "Ratio", `line-height (${unit})`, "Line box"]} rows={rows} minWidth={520} />
        </Panel>
        <Panel>
          <PanelTitle>Why unitless</PanelTitle>
          <p className="text-sm leading-relaxed text-foreground">
            A unitless value is inherited as a number and re-resolved against each element's font-size. A value in px or rem
            is inherited as a computed length — an <code className="font-mono text-xs">h3</code> inside a paragraph then
            receives the paragraph's line box, which is usually wrong.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Use rem only when the leading must stay proportional to the root rather than the element (rare), and px only when
            the line box must be an exact multiple of a baseline grid.
          </p>
        </Panel>
        <CodeOut code={css} title={`line-height in ${unit}`} testid="lineheight-css" />
      </div>
    </CalcLayout>
  );
}
