"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, SliderNum, TextArea, fmtTrim } from "../ui";

/**
 * Dyslexia Font Simulator — a side-by-side of "typical" browser defaults and
 * a dyslexia-friendlier setting set, with the CSS that produces the
 * adjustment. The adjustments are the accepted British Dyslexia Association
 * style guidance: larger sans text, generous tracking, wide leading, short
 * measure, left-aligned, dark-on-light (never pure black/white).
 */
const DEFAULT_TEXT =
  "Reading a long paragraph should feel effortless. When letterforms crowd together or lines run wide, the eye loses its place and the reader spends effort on navigation instead of meaning.";

export default function DyslexiaFontSimulator() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [size, setSize] = useState("19");
  const [lineHeight, setLineHeight] = useState("1.8");
  const [letterSpacing, setLetterSpacing] = useState("0.12");
  const [wordSpacing, setWordSpacing] = useState("0.16");
  const [measure, setMeasure] = useState("60");
  const [weight, setWeight] = useState("450");
  const [on, setOn] = useState(true);

  const css = [
    `.dyslexia-friendly {`,
    `  font-family: "Atkinson Hyperlegible", Verdana, Tahoma, sans-serif;`,
    `  font-size: ${size}px;`,
    `  font-weight: ${weight};`,
    `  line-height: ${lineHeight};`,
    `  letter-spacing: ${letterSpacing}em;`,
    `  word-spacing: ${wordSpacing}em;`,
    `  max-width: ${measure}ch;`,
    `  text-align: left; /* never justify */`,
    `  color: #1c1c1c;`,
    `  background: #faf8f3; /* off-white, not pure white */`,
    `}`,
  ].join("\n");

  const adjusted = {
    fontSize: `${size}px`,
    lineHeight,
    letterSpacing: `${letterSpacing}em`,
    wordSpacing: `${wordSpacing}em`,
    fontWeight: parseFloat(weight) || 400,
    maxWidth: `${measure}ch`,
    textAlign: "left" as const,
  };

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Adjustments</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="size" label="Font size" unit="px" value={size} onChange={setSize} min={14} max={26} step={1} />
          <SliderNum name="lineHeight" label="Line height" value={lineHeight} onChange={setLineHeight} min={1.2} max={2.4} step={0.05} />
          <SliderNum name="letterSpacing" label="Letter spacing" unit="em" value={letterSpacing} onChange={setLetterSpacing} min={0} max={0.3} step={0.01} />
          <SliderNum name="wordSpacing" label="Word spacing" unit="em" value={wordSpacing} onChange={setWordSpacing} min={0} max={0.4} step={0.01} />
          <SliderNum name="measure" label="Max measure" unit="ch" value={measure} onChange={setMeasure} min={30} max={90} step={1} />
          <SliderNum name="weight" label="Font weight" value={weight} onChange={setWeight} min={300} max={700} step={50} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="accent-primary" />
          Apply adjustments to the right pane
        </label>
        <ResBox>
          <Res name="chars" label="Characters per line" value={`${fmtTrim(parseFloat(measure), 0)}ch target`} />
          <Res name="wl" label="Effective reading width" value={`${fmtTrim((parseFloat(size) || 0) * parseFloat(measure) / 16, 0)}rem`} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The right-hand pane is a comparison view, not a claim that a font cures dyslexia — the adjustable spacing and
          larger size are the parts backed by readability guidance.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Sample</PanelTitle>
          <TextArea name="text" label="Your text" value={text} onChange={setText} rows={4} />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Browser defaults (16px / 1.2)
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.2 }} className="text-foreground">
                {text}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-[#faf8f3] p-4">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {on ? "Dyslexia-friendly settings" : "Adjustments off — toggle above"}
              </div>
              <p style={{ ...(on ? adjusted : { fontSize: 16, lineHeight: 1.2 }), color: "#1c1c1c" }}>{text}</p>
            </div>
          </div>
        </Panel>
        <CodeOut code={css} title="CSS" testid="dyslexia-css" />
      </div>
    </CalcLayout>
  );
}
