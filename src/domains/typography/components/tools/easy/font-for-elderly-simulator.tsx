"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE = "Presbyopia reduces the eye's ability to focus at close range, so small text appears blurred even with good contrast.";

/**
 * Font for Elderly Simulator — two effects dominate reading for older users:
 * reduced accommodation (blur that grows with proximity, i.e. small sizes) and
 * a narrowing pupil that lowers retinal illuminance (as if contrast were
 * reduced ~30%). The preview applies both, and the readout recommends the
 * minimum size, weight and contrast that recover most of the loss.
 */
export default function FontForElderlySimulator() {
  const [fontName, setFontName] = useState("Source Serif 4");
  const [size, setSize] = useState("16");
  const [weight, setWeight] = useState("400");
  const [contrast, setContrast] = useState("10");
  const [text, setText] = useState(SAMPLE);
  const [blur, setBlur] = useState("1.2");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(40, Math.max(12, parseFloat(size) || 16));
  const w = parseFloat(weight) || 400;
  const cr = Math.max(1, parseFloat(contrast) || 10);
  const b = Math.min(3, Math.max(0, parseFloat(blur) || 1.2));

  /* Blur radius in px tracks how much accommodation is lost: perceived blur
     scales inversely with type size, so smaller text looks worse. */
  const effectiveBlur = (b * (16 / px)).toFixed(2);

  const recommendations = [
    { setting: "Minimum body size", current: `${fmtTrim(px, 0)}px`, target: "18px (19–20px preferred)" },
    { setting: "Minimum weight", current: String(w), target: "400 at 18px, 500 below that" },
    { setting: "Text contrast", current: `${fmtTrim(cr, 1)}:1`, target: "7:1 or better; 12:1+ for long reading" },
    { setting: "Line height", current: "1.5 (typical)", target: "1.6–1.8" },
    { setting: "Paragraph spacing", current: "1em", target: "1.2–1.5em so paragraphs separate at a glance" },
  ];

  const css = `.elder-friendly {
  font-family: ${font.stack};
  font-size: max(1.125rem, ${(px / 16).toFixed(4)}rem); /* ≥18px */
  font-weight: ${Math.max(400, w)};
  line-height: 1.7;
  letter-spacing: 0.01em;
  color: #111;      /* ≥7:1 on a light surface */
  max-width: 68ch;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Type settings</PanelTitle>
        <Sel
          name="font"
          label="Font family"
          value={fontName}
          onChange={setFontName}
          options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
        />
        <div className="mt-3 space-y-3">
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={40} step={1} />
          <SliderNum name="weight" label="Weight" value={weight} onChange={setWeight} min={300} max={700} step={100} />
          <SliderNum name="contrast" label="Contrast" unit=":1" value={contrast} onChange={setContrast} min={1} max={21} step={0.5} />
          <SliderNum name="blur" label="Simulated acuity loss" unit="px" value={blur} onChange={setBlur} min={0} max={3} step={0.1} />
          <TextInput name="text" label="Sample text" value={text} onChange={setText} />
        </div>
        <ResBox>
          <Res name="effective" label="Effective blur at this size" value={`${effectiveBlur}px`} />
          <Res name="aaa" label="AAA body contrast (7:1)" value={cr >= 7 ? "passes" : "fails"} />
          <Res name="sizeCheck" label="Size check" value={px >= 18 ? "at or above 18px" : "below 18px — raise it"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Simulated reading experience</PanelTitle>
          <div className="rounded-lg border border-border bg-white p-4">
            <p
              data-testid="elderly-preview"
              style={{
                fontFamily: font.stack,
                fontSize: `${px}px`,
                fontWeight: w,
                lineHeight: 1.6,
                filter: `blur(${effectiveBlur}px) contrast(${Math.min(1, 0.45 + cr / 40).toFixed(2)})`,
                color: "#111111",
              }}
            >
              {text || SAMPLE}
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            As size grows, the same acuity loss blurs proportionally less — which is why raising size is the single most
            effective change, ahead of weight or even contrast.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Recommended settings</PanelTitle>
          <RefTable
            cols={["Setting", "Current", "Target"]}
            rows={recommendations.map((r) => [r.setting, r.current, r.target])}
            minWidth={520}
          />
        </Panel>
        <CodeOut code={css} testid="elderly-css" />
      </div>
    </CalcLayout>
  );
}
