"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextArea } from "../ui";
import { DEFAULT_SAMPLE, FONTS, WEIGHTS } from "../fonts";

/**
 * Custom Text Font Preview — same previewer core as Font Previewer, but
 * optimised for pasting real copy (a headline, a product name, a paragraph)
 * and reading the CSS it would take to reproduce the rendering.
 */
export default function CustomTextFontPreview() {
  const [fontName, setFontName] = useState("Fraunces");
  const [text, setText] = useState("Racira Fonts — type tools that respect your time.");
  const [size, setSize] = useState("32");
  const [weight, setWeight] = useState("500");
  const [tracking, setTracking] = useState("0");
  const [leading, setLeading] = useState("1.2");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(200, Math.max(8, parseFloat(size) || 32));
  const w = parseFloat(weight) || 400;
  const ls = parseFloat(tracking) || 0;
  const lh = Math.min(3, Math.max(0.8, parseFloat(leading) || 1.2));
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const css = `.custom-preview {
  font-family: ${font.stack};
  font-size: ${px}px;
  font-weight: ${w};
  letter-spacing: ${ls}em;
  line-height: ${lh};
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Copy & settings</PanelTitle>
        <Sel
          name="font"
          label="Font family"
          value={fontName}
          onChange={setFontName}
          options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
        />
        <div className="mt-3 space-y-3">
          <TextArea name="text" label="Your text" value={text} onChange={setText} rows={4} placeholder={DEFAULT_SAMPLE} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={8} max={120} step={1} />
          <Sel
            name="weight"
            label="Weight"
            value={weight}
            onChange={setWeight}
            options={WEIGHTS.map((n) => ({ value: String(n), label: String(n) }))}
          />
          <SliderNum name="tracking" label="Letter spacing" unit="em" value={tracking} onChange={setTracking} min={-0.1} max={0.4} step={0.005} />
          <SliderNum name="leading" label="Line height" unit="×" value={leading} onChange={setLeading} min={0.9} max={2.4} step={0.02} />
        </div>
        <ResBox>
          <Res name="family" label="Family kind" value={font.kind} />
          <Res name="words" label="Words" value={String(words)} />
          <Res name="chars" label="Characters" value={String(text.length)} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div
            data-testid="custom-preview"
            style={{ fontFamily: font.stack, fontSize: `${px}px`, fontWeight: w, letterSpacing: `${ls}em`, lineHeight: lh }}
            className="break-words text-foreground"
          >
            {text.trim() || DEFAULT_SAMPLE}
          </div>
        </Panel>
        <CodeOut code={css} testid="custom-preview-css" />
      </div>
    </CalcLayout>
  );
}
