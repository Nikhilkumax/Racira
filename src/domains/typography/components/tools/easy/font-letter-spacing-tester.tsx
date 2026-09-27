"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS, WEIGHTS } from "../fonts";

const SAMPLE = "Tracking changes the colour of type on the page.";

/**
 * Font Letter Spacing Tester — a tracking sweep in em (scale-independent, the
 * right unit for responsive type) with the equivalent px values for the chosen
 * size. Uppercase and small text generally want positive tracking; display
 * sizes usually want slightly negative.
 */
export default function FontLetterSpacingTester() {
  const [fontName, setFontName] = useState("Space Grotesk");
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState("24");
  const [weight, setWeight] = useState("500");
  const [step, setStep] = useState("0.01");
  const [count, setCount] = useState("7");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(120, Math.max(10, parseFloat(size) || 24));
  const w = parseFloat(weight) || 400;
  const s = Math.min(0.1, Math.max(0.002, parseFloat(step) || 0.01));
  const n = Math.min(12, Math.max(3, Math.round(parseFloat(count) || 7)));
  const values = Array.from({ length: n }, (_, i) => +(i * s).toFixed(4));

  const rows = values.map((v) => [
    `${fmtTrim(v, 4)}em`,
    `${fmtTrim(v * px, 3)}px`,
    `${fmtTrim(1 + v, 4)}×`,
    `${fmtTrim(text.length * v * px, 2)}px`,
  ]);

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
          <TextInput name="text" label="Sample text" value={text} onChange={setText} />
          <SliderNum name="size" label="Type size" unit="px" value={size} onChange={setSize} min={10} max={120} step={1} />
          <Sel
            name="weight"
            label="Weight"
            value={weight}
            onChange={setWeight}
            options={WEIGHTS.map((v) => ({ value: String(v), label: String(v) }))}
          />
          <SliderNum name="step" label="Tracking step" unit="em" value={step} onChange={setStep} min={0.002} max={0.05} step={0.001} />
          <SliderNum name="count" label="Steps rendered" value={count} onChange={setCount} min={3} max={12} step={1} />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Tracking sweep</PanelTitle>
          <div className="space-y-3">
            {values.map((v) => (
              <div key={v} className="flex items-start gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="w-24 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {fmtTrim(v, 4)}em
                </span>
                <span
                  className="min-w-0 flex-1 break-words text-foreground"
                  style={{ fontFamily: font.stack, fontSize: `${px}px`, fontWeight: w, letterSpacing: `${v}em` }}
                >
                  {text || SAMPLE}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelTitle>Converted values</PanelTitle>
          <RefTable
            cols={["em", `px @ ${fmtTrim(px, 2)}px`, "ratio", "added width (full string)"]}
            rows={rows}
            note="em is the unit to author: it scales with font-size, so one declaration holds at every breakpoint."
            minWidth={380}
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
