"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "Readable setting is a balance: too tight and ascenders collide with descenders on the next line; too loose and the eye loses the thread back to the start of the line. The right value depends on type size, measure and the face's x-height.";

/**
 * Font Line Height Tester — the same paragraph repeated at a sweep of
 * line-height values. Body text below ~1.3 usually reads cramped, and the
 * line-box height readout shows how many pixels each step adds.
 */
export default function FontLineHeightTester() {
  const [fontName, setFontName] = useState("Inter");
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState("16");
  const [step, setStep] = useState("0.1");
  const [min, setMin] = useState("1");
  const [count, setCount] = useState("7");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(72, Math.max(8, parseFloat(size) || 16));
  const s = Math.min(0.5, Math.max(0.05, parseFloat(step) || 0.1));
  const start = Math.min(3, Math.max(0.5, parseFloat(min) || 1));
  const n = Math.min(12, Math.max(2, Math.round(parseFloat(count) || 7)));
  const values = Array.from({ length: n }, (_, i) => +(start + i * s).toFixed(3));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Settings</PanelTitle>
        <Sel
          name="font"
          label="Font family"
          value={fontName}
          onChange={setFontName}
          options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
        />
        <div className="mt-3 space-y-3">
          <SliderNum name="size" label="Type size" unit="px" value={size} onChange={setSize} min={10} max={40} step={1} />
          <SliderNum name="min" label="Starting line height" unit="×" value={min} onChange={setMin} min={0.9} max={2} step={0.05} />
          <SliderNum name="step" label="Step" unit="×" value={step} onChange={setStep} min={0.05} max={0.4} step={0.01} />
          <SliderNum name="count" label="Steps rendered" value={count} onChange={setCount} min={2} max={12} step={1} />
          <TextArea name="text" label="Paragraph" value={text} onChange={setText} rows={3} />
        </div>
        <ResBox>
          <Res name="px" label="Line box at ×1" value={`${fmtTrim(px, 2)}px`} />
          <Res name="range" label="Sweep range" value={`${fmtTrim(values[0], 2)}× – ${fmtTrim(values[values.length - 1], 2)}×`} />
          <Res
            name="box"
            label="Box height at last step"
            value={`${fmtTrim(px * values[values.length - 1], 1)}px`}
          />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Line height sweep</PanelTitle>
        <div className="space-y-4">
          {values.map((lh) => (
            <div key={lh} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
              <div className="mb-1.5 flex items-center gap-3">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  line-height: {fmtTrim(lh, 3)}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    lh < 1.3
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : lh <= 1.7
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                  }`}
                >
                  {lh < 1.3 ? "tight" : lh <= 1.7 ? "body range" : "airy"}
                </span>
              </div>
              <p
                style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: lh }}
                className="text-foreground"
              >
                {text || SAMPLE}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Typical body text sits between 1.4 and 1.6; long measures push toward the upper end, short measures toward the
          lower. Headings are a separate decision — display sizes often want 1.05–1.2.
        </p>
      </Panel>
    </CalcLayout>
  );
}
