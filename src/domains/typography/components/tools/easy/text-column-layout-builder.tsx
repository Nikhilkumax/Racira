"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "Columns divide a wide measure into readable slices. The rules that keep a multi-column block readable are steady: keep the column width between 40 and 75 characters, keep the gutter proportional to the type size, and avoid a column that ends with a single stranded word. In CSS this is a width-driven layout: declare column-width and the browser fits as many columns as the container allows, or declare column-count and give up control of the width.";

/**
 * Text Column Layout Builder — emits a CSS multi-column block from either a
 * column count or a target column width (the two mutually exclusive modes), with
 * gutter, rule and balance controls. The readout estimates column width in
 * characters so the 40–75ch band can be checked against the container.
 */
export default function TextColumnLayoutBuilder() {
  const [fontName, setFontName] = useState("Source Serif 4");
  const [text, setText] = useState(SAMPLE);
  const [mode, setMode] = useState("width");
  const [columns, setColumns] = useState("2");
  const [colWidth, setColWidth] = useState("26");
  const [gutter, setGutter] = useState("2");
  const [rule, setRule] = useState("none");
  const [fill, setFill] = useState("balance");
  const [container, setContainer] = useState("900");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const n = Math.min(6, Math.max(1, Math.round(parseFloat(columns) || 2)));
  const cw = Math.min(60, Math.max(10, parseFloat(colWidth) || 26));
  const g = Math.min(8, Math.max(0, parseFloat(gutter) || 2));
  const c = Math.max(240, parseFloat(container) || 900);
  const effCols = mode === "count" ? n : Math.max(1, Math.floor((c + g * 16) / (cw * 16 + g * 16)));
  const effWidth = mode === "count" ? (c - (n - 1) * g * 16) / n : cw * 16;
  const chars = Math.round(effWidth / (16 * 0.5));

  const css = `.columns {
  font-family: ${font.stack};
  font-size: 1rem;
  line-height: 1.6;
  columns: ${mode === "count" ? `${n}` : `${cw}rem`};
  column-gap: ${g}rem;
  ${rule === "none" ? "" : `column-rule: 1px ${rule} var(--border);\n  `}column-fill: ${fill};
  widows: 2;
  orphans: 2;
  hyphens: auto;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Column model</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="mode"
            label="Sizing mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "width", label: "column-width (browser fits columns)" },
              { value: "count", label: "column-count (fixed number)" },
            ]}
          />
          {mode === "count" ? (
            <SliderNum name="cols" label="Column count" value={columns} onChange={setColumns} min={1} max={6} step={1} />
          ) : (
            <SliderNum name="cw" label="Column width" unit="rem" value={colWidth} onChange={setColWidth} min={10} max={60} step={1} />
          )}
          <SliderNum name="gutter" label="Column gap" unit="rem" value={gutter} onChange={setGutter} min={0} max={8} step={0.25} />
          <Sel
            name="rule"
            label="Column rule"
            value={rule}
            onChange={setRule}
            options={[
              { value: "none", label: "none" },
              { value: "solid", label: "1px solid" },
              { value: "dashed", label: "1px dashed" },
              { value: "dotted", label: "1px dotted" },
            ]}
          />
          <Sel
            name="fill"
            label="column-fill"
            value={fill}
            onChange={setFill}
            options={[
              { value: "balance", label: "balance (equal heights)" },
              { value: "auto", label: "auto (fills in order)" },
            ]}
          />
          <SliderNum name="container" label="Container width" unit="px" value={container} onChange={setContainer} min={240} max={1400} step={20} />
          <Sel name="font" label="Text face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <TextArea name="text" label="Text" value={text} onChange={setText} rows={4} />
        </div>
        <ResBox>
          <Res name="cols" label="Resulting columns" value={String(effCols)} />
          <Res name="width" label="Effective column width" value={`${fmtTrim(effWidth, 1)}px`} />
          <Res
            name="chars"
            label="≈ characters per column"
            value={`≈ ${chars} (${chars < 40 ? "too narrow" : chars > 75 ? "too wide" : "in the 40–75 band"})`}
          />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div
            data-testid="columns-preview"
            style={{
              fontFamily: font.stack,
              fontSize: "16px",
              lineHeight: 1.6,
              columnCount: mode === "count" ? n : undefined,
              columnWidth: mode === "width" ? `${cw}rem` : undefined,
              columnGap: `${g}rem`,
              columnRule: rule === "none" ? undefined : `1px ${rule} currentColor`,
              columnFill: fill as "balance",
              hyphens: "auto",
              maxWidth: `${c}px`,
            }}
            className="text-foreground/90 [&>p]:mb-3 [&>p]:break-inside-avoid"
          >
            <p>{text || SAMPLE}</p>
            <p>
              The second paragraph shows the break behaviour between columns — headings and figures should use
              break-inside: avoid so they are never split across a column boundary.
            </p>
          </div>
        </Panel>
        <CodeOut code={css} testid="columns-css" />
        <Panel>
          <PanelTitle>Multi-column gotchas</PanelTitle>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>· Column balance is a layout guess: the browser aims for equal heights but the last column can still be slightly different.</li>
            <li>· An element with break-inside: avoid larger than the column creates overflow rather than a split — prefer avoiding tall blocks.</li>
            <li>· Columns cannot be reflowed by the page's grid: the container must be wide enough for the whole set.</li>
            <li>· Print stylesheets should keep column-gap and rule sizes in physical units when the output is fixed-size paper.</li>
          </ul>
        </Panel>
      </div>
    </CalcLayout>
  );
}
