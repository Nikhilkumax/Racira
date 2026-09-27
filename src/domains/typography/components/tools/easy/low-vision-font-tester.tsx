"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "Low vision often reduces contrast sensitivity as well as acuity. Type that is crisp for one reader may blur for another: thinner strokes disappear first, then fine details inside letters, then the whole outline.";

type Condition = "blur" | "glare" | "contrast" | "none";

const CONDITIONS: { value: Condition; label: string; filter: string; note: string }[] = [
  { value: "none", label: "Unaffected (reference)", filter: "none", note: "The baseline rendering the design was made against." },
  { value: "blur", label: "Reduced acuity (2px blur)", filter: "blur(2px)", note: "Fine hairlines dissolve; stroke weight and x-height keep letters apart." },
  { value: "glare", label: "Glare / cataract (halation)", filter: "blur(0.6px) brightness(1.25) contrast(0.75)", note: "Light spreads; low-contrast pairs collapse." },
  { value: "contrast", label: "Reduced contrast sensitivity", filter: "contrast(0.45)", note: "Everything moves toward mid-grey — the failure mode of light-grey text." },
];

/**
 * Low Vision Font Tester — applies the three visual conditions low-vision
 * readers most often describe (acuity loss, glare and reduced contrast
 * sensitivity) to the same sample, then grades the type setup behind it. The
 * grade combines size, weight, contrast and measure, because a design can pass
 * any single check and still fail in combination.
 */
export default function LowVisionFontTester() {
  const [fontName, setFontName] = useState("Inter");
  const [size, setSize] = useState("16");
  const [weight, setWeight] = useState("400");
  const [contrast, setContrast] = useState("12");
  const [measure, setMeasure] = useState("66");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(48, Math.max(12, parseFloat(size) || 16));
  const w = parseFloat(weight) || 400;
  const cr = Math.max(1, parseFloat(contrast) || 12);
  const cm = Math.max(30, parseFloat(measure) || 66);

  const checks = [
    { name: "Size", pass: px >= 18, detail: px >= 18 ? "≥18px large-text threshold" : `${px}px — below the often-cited 18px large threshold` },
    { name: "Weight", pass: w >= 500, detail: w >= 500 ? "≥500 gives stroke mass that survives blur" : `${w} — thin strokes dissolve first` },
    { name: "Contrast", pass: cr >= 7, detail: cr >= 7 ? "≥7:1 meets AAA body contrast" : `${cr.toFixed(1)}:1 — below AAA body text (7:1)` },
    { name: "Line length", pass: cm <= 75, detail: cm <= 75 ? `${cm}ch within the 45–75 band` : `${cm}ch — long lines increase tracking loss` },
  ];
  const passed = checks.filter((c) => c.pass).length;

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
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={48} step={1} />
          <SliderNum name="weight" label="Weight" value={weight} onChange={setWeight} min={300} max={700} step={100} />
          <SliderNum name="contrast" label="Text/background contrast" unit=":1" value={contrast} onChange={setContrast} min={1} max={21} step={0.5} />
          <SliderNum name="measure" label="Measure" unit="ch" value={measure} onChange={setMeasure} min={30} max={110} step={1} />
        </div>
        <ResBox>
          <Res name="passed" label="Checks passed" value={`${passed} / ${checks.length}`} />
          <Res name="family" label="Family classification" value={font.kind} />
          <Res name="grade" label="Grade" value={passed === 4 ? "A — robust" : passed === 3 ? "B — one weak point" : passed === 2 ? "C — fix before shipping" : "D — multiple failures"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Simulated conditions</PanelTitle>
          <div className="space-y-4">
            {CONDITIONS.map((c) => (
              <div key={c.value}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{c.label}</span>
                </div>
                <p
                  style={{
                    fontFamily: font.stack,
                    fontSize: `${px}px`,
                    fontWeight: w,
                    lineHeight: 1.6,
                    maxWidth: `${cm}ch`,
                    filter: c.filter,
                  }}
                  className="break-words text-foreground"
                >
                  {SAMPLE}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{c.note}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Checks</PanelTitle>
          <RefTable
            cols={["Check", "Result", "Detail"]}
            rows={checks.map((c) => [c.name, c.pass ? "pass" : "fail", c.detail])}
            minWidth={520}
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
