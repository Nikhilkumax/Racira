"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "Drop caps are the typographic equivalent of a heavy door: they hold a paragraph open and invite the reader in. The size of the letter is measured in lines of body text, and the surrounding lines must indent far enough to clear it.";

/**
 * Drop Cap Generator — emits two implementations. `initial-letter` is the
 * direct property (Safari and Chromium support it; the value is the number of
 * lines the cap spans, with an optional sink). The float/line-height version is
 * the portable fallback and is what most production stylesheets still carry.
 */
export default function DropCapGenerator() {
  const [fontName, setFontName] = useState("Playfair Display");
  const [text, setText] = useState(SAMPLE);
  const [lines, setLines] = useState("3");
  const [size, setSize] = useState("16");
  const [leading, setLeading] = useState("1.6");
  const [color, setColor] = useState("#111111");
  const [method, setMethod] = useState("initial-letter");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const n = Math.min(5, Math.max(2, Math.round(parseFloat(lines) || 3)));
  const px = Math.max(12, parseFloat(size) || 16);
  const lh = Math.min(2.2, Math.max(1.2, parseFloat(leading) || 1.6));

  /* float technique: cap font-size such that cap-height fills n line boxes.
     Cap height ≈ 0.7em for most serif faces, so size ≈ n × lineBox / 0.7. */
  const lineBox = px * lh;
  const floatSize = (n * lineBox) / 0.7;
  const floatHeight = floatSize * 0.7;
  const paddedLines = Math.ceil(floatHeight / lineBox);

  const css =
    method === "initial-letter"
      ? `.drop-cap::first-letter {
  font-family: ${font.stack};
  font-weight: 600;
  color: ${color};
  initial-letter: ${n};
  margin-right: 0.06em;
}`
      : `.drop-cap::first-letter {
  font-family: ${font.stack};
  font-weight: 600;
  color: ${color};
  float: left;
  font-size: ${fmtTrim(floatSize / px, 4)}em; /* ${fmtTrim(floatSize, 1)}px */
  line-height: ${fmtTrim(lineBox / floatSize, 4)};
  margin-right: 0.08em;
  margin-top: ${fmtTrim((floatHeight - lineBox) / floatSize, 4)}em;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Drop cap</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="font"
            label="Cap face"
            value={fontName}
            onChange={setFontName}
            options={FONTS.filter((f) => f.kind !== "mono").map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
          />
          <SliderNum name="lines" label="Lines spanned" value={lines} onChange={setLines} min={2} max={5} step={1} />
          <SliderNum name="size" label="Body size" unit="px" value={size} onChange={setSize} min={12} max={24} step={1} />
          <SliderNum name="leading" label="Body line height" unit="×" value={leading} onChange={setLeading} min={1.2} max={2.2} step={0.05} />
          <Sel
            name="method"
            label="Technique"
            value={method}
            onChange={setMethod}
            options={[
              { value: "initial-letter", label: "initial-letter (modern)" },
              { value: "float", label: "float + font-size (portable)" },
            ]}
          />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cap colour
            </span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background"
            />
          </label>
          <TextArea name="text" label="Paragraph" value={text} onChange={setText} rows={4} />
        </div>
        <ResBox>
          <Res name="lines" label="Sink" value={`${n} line${n === 1 ? "" : "s"}`} />
          <Res name="capSize" label="Cap font size (float method)" value={`${fmtTrim(floatSize, 1)}px / ${fmtTrim(floatSize / px, 2)}em`} />
          <Res name="clear" label="Indent needed" value={`≈ ${fmtTrim(floatSize * 0.75, 1)}px`} />
          <Res name="lines" label="Lines cleared" value={`${paddedLines} line boxes`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p
            data-testid="dropcap-preview"
            className="text-foreground"
            style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: lh }}
          >
            <span
              style={{
                float: "left",
                fontFamily: font.stack,
                fontWeight: 600,
                color,
                fontSize: `${floatSize}px`,
                lineHeight: 0.86,
                marginRight: "0.08em",
                marginTop: `${(floatHeight - lineBox) / 2}px`,
              }}
            >
              {(text.trim() || SAMPLE).charAt(0)}
            </span>
            {(text.trim() || SAMPLE).slice(1)}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Drop caps fail in three ways worth checking here: a float whose cap-height does not land on a line boundary;
            a first line short enough to wrap *under* the cap; and a translucent colour that reads darker where it
            overlaps the indent.
          </p>
        </Panel>
        <CodeOut code={css} testid="dropcap-css" />
      </div>
    </CalcLayout>
  );
}
