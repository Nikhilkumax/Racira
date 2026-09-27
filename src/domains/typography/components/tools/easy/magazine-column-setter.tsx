"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Row, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const LOREM =
  "Magazine setting works to a grid: the number of columns is fixed by the page size, the gutter is part of that grid, and the body baseline sits on a multiple of the grid unit. Every element — a headline, a caption, a picture — occupies whole columns and whole baseline units, which is what makes a spread feel deliberate even when it is busy.";

/**
 * Magazine Column Setter — lays out a magazine-style page on a baseline grid:
 * column count and gutter define the horizontal grid; the baseline unit defines
 * the vertical one. The readout checks the two things that break first in
 * production — a column narrow enough to hyphenate badly, and a baseline unit
 * that does not divide the text-block height.
 */
export default function MagazineColumnSetter() {
  const [fontName, setFontName] = useState("Lora");
  const [headFont, setHeadFont] = useState("Bebas Neue");
  const [text, setText] = useState(LOREM);
  const [columns, setColumns] = useState("3");
  const [gutter, setGutter] = useState("5");
  const [bodyPt, setBodyPt] = useState("9.5");
  const [leading, setLeading] = useState("12.5");
  const [jump, setJump] = useState("Continued on page 42");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const headFamily = FONTS.find((f) => f.name === headFont) ?? FONTS[10];
  const cols = Math.min(5, Math.max(1, Math.round(parseFloat(columns) || 3)));
  const g = Math.min(12, Math.max(0, parseFloat(gutter) || 5));
  const bp = Math.max(6, parseFloat(bodyPt) || 9.5);
  const lead = Math.max(8, parseFloat(leading) || 12.5);

  /* A4 width 210mm, 15mm margins each side → 180mm text width */
  const textWidth = 180;
  const colWidth = (textWidth - (cols - 1) * g) / cols;
  const chars = Math.round((colWidth / 25.4) * 72 / (bp * 0.5));
  const baselineRatio = lead / bp;

  const css = `.magazine {
  font-family: ${font.stack};
  font-size: ${bp}pt;
  line-height: ${lead}pt;          /* ${fmtTrim(baselineRatio, 3)}× the type size */
  columns: ${cols};
  column-gap: ${g}mm;
  hyphens: auto;
  text-align: justify;
}

.magazine h2 {
  font-family: ${headFamily.stack};
  font-size: ${fmtTrim(bp * 3.2, 2)}pt;
  line-height: ${fmtTrim(lead * 3, 2)}pt;   /* 3 baseline units */
  margin: 0 0 ${fmtTrim(lead * 1.5, 2)}pt;
  letter-spacing: 0.01em;
}

.magazine .jump-head {
  font-size: ${fmtTrim(bp * 0.9, 2)}pt;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Grid</PanelTitle>
        <div className="space-y-3">
          <Sel name="font" label="Body face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <Sel name="head" label="Headline face" value={headFont} onChange={setHeadFont} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <SliderNum name="cols" label="Columns" value={columns} onChange={setColumns} min={1} max={5} step={1} />
          <SliderNum name="gutter" label="Gutter" unit="mm" value={gutter} onChange={setGutter} min={0} max={12} step={0.5} />
          <SliderNum name="body" label="Body size" unit="pt" value={bodyPt} onChange={setBodyPt} min={6} max={14} step={0.25} />
          <SliderNum name="lead" label="Leading" unit="pt" value={leading} onChange={setLeading} min={8} max={20} step={0.25} />
          <Row label="Jump head">
            <Sel
              name="jump"
              label=""
              value={jump}
              onChange={setJump}
              options={[
                { value: "Continued on page 42", label: "“Continued on page 42”" },
                { value: "Turn to page 42", label: "“Turn to page 42”" },
                { value: "", label: "No jump head" },
              ]}
            />
          </Row>
          <TextArea name="text" label="Body copy" value={text} onChange={setText} rows={4} />
        </div>
        <ResBox>
          <Res name="colwidth" label="Column width" value={`${fmtTrim(colWidth, 1)}mm ≈ ${chars} chars`} />
          <Res name="chars" label="Chars/line check" value={chars < 30 ? "very narrow — hyphens essential" : chars > 60 ? "wide for a magazine column" : "30–60 band"} />
          <Res name="baseline" label="Baseline unit" value={`${fmtTrim(lead, 2)}pt (${fmtTrim(baselineRatio, 3)}× type size)`} />
          <Res name="headUnits" label="Headline block" value={`${fmtTrim((lead * 3) / lead, 0)} baseline units`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Spread preview</PanelTitle>
          <div className="rounded-lg border border-border bg-white p-4 text-black">
            <h3 style={{ fontFamily: headFamily.stack, fontSize: `${bp * 3.2}pt`, lineHeight: 1.05, letterSpacing: "0.01em" }}>
              THE COLUMN IS THE UNIT
            </h3>
            <div
              data-testid="magazine-preview"
              style={{
                fontFamily: font.stack,
                fontSize: `${bp}pt`,
                lineHeight: `${lead}pt`,
                columnCount: cols,
                columnGap: `${g}mm`,
                textAlign: "justify",
                hyphens: "auto",
              }}
            >
              <p>{text || LOREM}</p>
              <p className="mt-2">
                A second paragraph fills the grid so the column bottoms can be compared — a magazine spread balances columns
                to within a line or two, and the jump head closes the story.
              </p>
            </div>
            {jump && (
              <p
                className="mt-3 border-t border-black/20 pt-2 uppercase"
                style={{ fontFamily: font.stack, fontSize: `${bp * 0.9}pt`, letterSpacing: "0.08em" }}
              >
                {jump}
              </p>
            )}
          </div>
        </Panel>
        <CodeOut code={css} testid="magazine-css" />
      </div>
    </CalcLayout>
  );
}
