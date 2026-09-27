"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "Legibility is a property of the whole setting rather than of any single value: size, measure, leading, weight and the face's own x-height interact, and a paragraph can pass each rule while still being hard to read.";

interface Criterion {
  name: string;
  weight: number;
  score: number; // 0–1
  detail: string;
}

/**
 * Body Text Legibility Grader — grades a body-text specification on the five
 * criteria that actually govern how a paragraph reads. Each criterion is scored
 * from a measured value, and the composite is weighted: measure and leading
 * matter more than weight, and a face's x-height changes the size that is
 * actually needed.
 */
export default function BodyTextLegibilityGrader() {
  const [fontName, setFontName] = useState("Source Serif 4");
  const [size, setSize] = useState("18");
  const [measure, setMeasure] = useState("66");
  const [leading, setLeading] = useState("1.6");
  const [weight, setWeight] = useState("400");
  const [text, setText] = useState(SAMPLE);

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[3];
  const px = Math.min(32, Math.max(12, parseFloat(size) || 18));
  const cm = Math.max(20, parseFloat(measure) || 66);
  const lh = Math.min(2.4, Math.max(1, parseFloat(leading) || 1.6));
  const w = parseFloat(weight) || 400;

  const scoreMeasure = cm >= 45 && cm <= 80 ? 1 : cm < 45 ? Math.max(0, (cm - 25) / 20) : Math.max(0, 1 - (cm - 80) / 40);
  const scoreLeading = lh >= 1.45 && lh <= 1.8 ? 1 : lh < 1.45 ? Math.max(0, (lh - 1) / 0.45) : Math.max(0, 1 - (lh - 1.8) / 0.6);
  const sizeFloor = font.kind === "serif" ? 17 : 16;
  const scoreSize = px >= sizeFloor + 2 ? 1 : px >= sizeFloor ? 0.8 : Math.max(0, (px - 12) / (sizeFloor - 12));
  const scoreWeight = w >= 400 && w <= 600 ? 1 : w < 400 ? 0.6 : 0.85;
  const scoreSpacing = lh * px >= 24 ? 1 : 0.6;

  const criteria: Criterion[] = [
    { name: "Measure", weight: 0.3, score: scoreMeasure, detail: `${fmtTrim(cm, 0)}ch — the 45–80 band is where the return sweep works` },
    { name: "Leading", weight: 0.25, score: scoreLeading, detail: `${fmtTrim(lh, 2)}× (${fmtTrim(lh * px, 1)}px box) — 1.45–1.8 for body text` },
    { name: "Size", weight: 0.2, score: scoreSize, detail: `${fmtTrim(px, 0)}px in a ${font.kind} face — the ${font.kind === "serif" ? "serif" : "sans"} floor is ${sizeFloor}px before adjustment` },
    { name: "Weight", weight: 0.15, score: scoreWeight, detail: `${w} — 400–600 reads well at body sizes` },
    { name: "Line box height", weight: 0.1, score: scoreSpacing, detail: `${fmtTrim(lh * px, 1)}px box — ≥24px avoids crowding at body sizes` },
  ];

  const composite = criteria.reduce((n, c) => n + c.score * c.weight, 0);
  const grade = composite >= 0.92 ? "A" : composite >= 0.82 ? "B" : composite >= 0.7 ? "C" : composite >= 0.55 ? "D" : "F";
  const lines = Math.round(text.length / Math.max(1, cm * 1.5)) + 1;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Body text specification</PanelTitle>
        <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
        <div className="mt-3 space-y-3">
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={32} step={1} />
          <SliderNum name="measure" label="Measure" unit="ch" value={measure} onChange={setMeasure} min={20} max={140} step={1} />
          <SliderNum name="leading" label="Line height" unit="×" value={leading} onChange={setLeading} min={1} max={2.4} step={0.05} />
          <SliderNum name="weight" label="Weight" value={weight} onChange={setWeight} min={300} max={800} step={100} />
          <TextArea name="text" label="Sample paragraph" value={text} onChange={setText} rows={4} />
        </div>
        <ResBox>
          <Res name="composite" label="Weighted score" value={`${fmtTrim(composite * 100, 1)} / 100`} />
          <Res name="grade" label="Grade" value={grade} />
          <Res name="weakest" label="Weakest criterion" value={criteria.reduce((a, c) => (c.score < a.score ? c : a)).name} />
          <Res name="lines" label="Approximate lines at this measure" value={String(lines)} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Criteria</PanelTitle>
          <RefTable
            cols={["Criterion", "Weight", "Score", "Detail"]}
            rows={criteria.map((c) => [
              c.name,
              `${fmtTrim(c.weight * 100, 0)}%`,
              `${fmtTrim(c.score * 100, 0)}/100`,
              c.detail,
            ])}
            minWidth={620}
            note="Scores are shaped curves, not thresholds: each criterion falls away from its comfortable range rather than passing or failing abruptly."
          />
          <div className="mt-3">
            <RefTable
              cols={["Grade", "Weighted score", "Reading experience"]}
              rows={[
                ["A", "≥ 92", "comfortable for long-form reading"],
                ["B", "≥ 82", "good; the weak criterion is worth fixing"],
                ["C", "≥ 70", "readable but effortful over long passages"],
                ["D", "≥ 55", "tiring — at least two criteria are off"],
                ["F", "< 55", "not a body-text setting"],
              ]}
              minWidth={480}
            />
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Graded paragraph</PanelTitle>
          <p
            data-testid="legibility-preview"
            className="text-foreground"
            style={{ fontFamily: font.stack, fontSize: `${px}px`, fontWeight: w, lineHeight: lh, maxWidth: `${cm}ch` }}
          >
            {text || SAMPLE}
          </p>
        </Panel>
      </div>
    </CalcLayout>
  );
}
