"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, FormGrid, Num, Panel, PanelTitle, RefTable, Res, ResBox, fmtTrim } from "../ui";

/**
 * Baseline Grid Calculator — locks a type block to a vertical rhythm.
 *
 *   baseline unit = body size × body line-height
 *   line rows     = round(size × line-height ÷ baseline unit)
 *   snapped LH    = rows × baseline unit ÷ size
 *
 * Any element whose line box is a whole number of baseline units sits back on
 * the grid; margins are then multiples of that unit.
 */
export default function BaselineGridCalculator() {
  const [baseSize, setBaseSize] = useState("16");
  const [baseLh, setBaseLh] = useState("1.5");
  const [headingSize, setHeadingSize] = useState("40");
  const [headingLh, setHeadingLh] = useState("1.2");
  const [root, setRoot] = useState("16");

  const bs = parseFloat(baseSize);
  const bl = parseFloat(baseLh);
  const hs = parseFloat(headingSize);
  const hl = parseFloat(headingLh);
  const r = parseFloat(root) || 16;
  const valid = [bs, bl, hs, hl].every(Number.isFinite) && bs > 0 && bl > 0 && hs > 0 && hl > 0;

  const unit = valid ? bs * bl : NaN;
  const headingBox = valid ? hs * hl : NaN;
  const rows = valid ? Math.max(1, Math.round(headingBox / unit)) : NaN;
  const snappedLh = valid ? (rows * unit) / hs : NaN;

  const css =
    valid
      ? [
          ":root {",
          `  --baseline: ${fmtTrim(unit, 3)}px; /* ${fmtTrim(bs, 2)}px × ${fmtTrim(bl, 3)} */`,
          `  --root-size: ${fmtTrim(r, 2)}px;`,
          "}",
          "",
          "body {",
          `  font-size: ${fmtTrim(bs, 3)}px;`,
          `  line-height: ${fmtTrim(bl, 3)}; /* ${fmtTrim(unit, 3)}px */`,
          "}",
          "",
          `h1 {`,
          `  font-size: ${fmtTrim(hs, 3)}px;`,
          `  line-height: ${fmtTrim(snappedLh, 4)}; /* snapped to ${rows} × ${fmtTrim(unit, 3)}px */`,
          "  margin-block: " + `${fmtTrim(unit * 2, 3)}px ${fmtTrim(unit, 3)}px;`,
          "}",
          "",
          "/* Spacing steps: each is a whole baseline multiple */",
        ].join("\n")
      : "";

  const spacingRows = valid
    ? Array.from({ length: 8 }, (_, i) => {
        const n = i + 1;
        return [`${n} × baseline`, `${fmtTrim(unit * n, 3)}px`, `${fmtTrim((unit * n) / r, 4)}rem`, `--space-${n}`];
      })
    : [];

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Grid</PanelTitle>
        <FormGrid>
          <Num name="baseSize" label="Body font size" unit="px" value={baseSize} onChange={setBaseSize} step={0.5} />
          <Num name="baseLh" label="Body line-height" value={baseLh} onChange={setBaseLh} step={0.01} />
          <Num name="headingSize" label="Heading font size" unit="px" value={headingSize} onChange={setHeadingSize} />
          <Num name="headingLh" label="Heading line-height" value={headingLh} onChange={setHeadingLh} step={0.01} />
          <Num name="root" label="Root size" unit="px" value={root} onChange={setRoot} />
        </FormGrid>
        <ResBox>
          <Res name="unit" label="Baseline unit" value={valid ? `${fmtTrim(unit, 3)}px (${fmtTrim(unit / r, 4)}rem)` : "—"} />
          <Res name="rows" label="Heading occupies" value={valid ? `${rows} baseline rows` : "—"} />
          <Res name="snapped" label="Snapped heading line-height" value={valid ? fmtTrim(snappedLh, 4) : "—"} />
          <Res name="box" label="Heading line box" value={valid ? `${fmtTrim(headingBox, 3)}px → ${fmtTrim(rows * unit, 3)}px` : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The heading&apos;s natural line box is rounded UP to whole baseline rows, then converted back into a unitless
          line-height — that keeps its baseline on the grid without changing the font size.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Spacing steps</PanelTitle>
          <RefTable
            cols={["Step", "px", "rem", "Token"]}
            rows={spacingRows}
            minWidth={380}
            note="Use these multiples for margins/padding inside the typeset block — anything off-multiple breaks the rhythm."
          />
        </Panel>
        <CodeOut code={css || "/* enter valid sizes */"} title="Grid CSS" testid="baseline-css" />
      </div>
    </CalcLayout>
  );
}
