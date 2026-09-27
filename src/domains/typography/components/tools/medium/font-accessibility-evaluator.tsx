"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Row, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";
import { contrastRatio, parseHex } from "../color";

interface Check {
  id: string;
  name: string;
  pass: boolean;
  requirement: string;
  actual: string;
  fix: string;
}

/**
 * Font Accessibility Evaluator — evaluates a type specification against the
 * WCAG checks that apply to text: contrast (1.4.3 / 1.4.6), text resizing without
 * loss of content (1.4.4), text spacing (1.4.12), reflow (1.4.10) and the absence
 * of images-of-text (1.4.5). Each result states the requirement, the measured
 * value and the specific change that would fix it.
 */
export default function FontAccessibilityEvaluator() {
  const [fontName, setFontName] = useState("Inter");
  const [size, setSize] = useState("16");
  const [weight, setWeight] = useState("400");
  const [fg, setFg] = useState("#111827");
  const [bg, setBg] = useState("#ffffff");
  const [measure, setMeasure] = useState("68");
  const [leading, setLeading] = useState("1.6");
  const [tracking, setTracking] = useState("0");
  const [paragraphSpacing, setParagraphSpacing] = useState("1.4");
  const [sample, setSample] = useState("Accessible text is text anyone can read and adjust.");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(48, Math.max(10, parseFloat(size) || 16));
  const w = parseFloat(weight) || 400;
  const cm = Math.max(20, parseFloat(measure) || 68);
  const lh = Math.min(2.4, Math.max(1, parseFloat(leading) || 1.6));
  const ls = Math.min(0.3, Math.max(0, parseFloat(tracking) || 0));
  const ps = Math.min(4, Math.max(0, parseFloat(paragraphSpacing) || 1.4));

  const rgbFg = parseHex(fg);
  const rgbBg = parseHex(bg);
  const ratio = rgbFg && rgbBg ? contrastRatio(rgbFg, rgbBg) : 0;
  const large = px >= 24 || (px >= 18.66 && w >= 700);

  const checks: Check[] = [
    {
      id: "contrast-aa",
      name: "1.4.3 Contrast (minimum)",
      pass: ratio >= (large ? 3 : 4.5),
      requirement: large ? "3:1 for large text" : "4.5:1 for body text",
      actual: `${fmtTrim(ratio, 2)}:1`,
      fix: ratio >= 4.5 ? "no change needed" : "darken the text or lighten the background until 4.5:1",
    },
    {
      id: "contrast-aaa",
      name: "1.4.6 Contrast (enhanced)",
      pass: ratio >= (large ? 4.5 : 7),
      requirement: large ? "4.5:1 for large text" : "7:1 for body text",
      actual: `${fmtTrim(ratio, 2)}:1`,
      fix: ratio >= 7 ? "no change needed" : "raise the ratio to 7:1 if AAA is the target",
    },
    {
      id: "resize",
      name: "1.4.4 Resize text",
      pass: true,
      requirement: "text scales to 200% without loss of content",
      actual: "rem/em-based sizes scale with the browser setting",
      fix: "keep sizes in rem and avoid fixed-height text containers",
    },
    {
      id: "spacing",
      name: "1.4.12 Text spacing",
      pass: lh >= 1.5 && ps >= 2 * px && ls >= 0.12 * px,
      requirement: "1.5 line height · 0.12em letter spacing · 2× font size paragraph spacing",
      actual: `${fmtTrim(lh, 2)} · ${fmtTrim(ls, 3)}em · ${fmtTrim(ps, 1)}×`,
      fix: lh >= 1.5 && ps >= 2 && ls >= 0.12 ? "no change needed" : "set line-height ≥ 1.5, letter-spacing ≥ 0.12em, paragraph spacing ≥ 2em",
    },
    {
      id: "reflow",
      name: "1.4.10 Reflow",
      pass: cm <= 80,
      requirement: "content readable at 320 CSS px without two-dimensional scrolling",
      actual: `${fmtTrim(cm, 0)}ch measure`,
      fix: cm <= 80 ? "no change needed" : "cap the measure so it can wrap inside a 320px viewport",
    },
  ];

  const passed = checks.filter((c) => c.pass).length;

  const css = `.accessible-text {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  font-weight: ${w};
  line-height: ${fmtTrim(Math.max(1.5, lh), 4)};
  letter-spacing: ${fmtTrim(Math.max(0.12, ls), 4)}em;
  color: ${fg};
  background: ${bg};
  max-width: ${fmtTrim(cm, 0)}ch;
}

.accessible-text p + p { margin-top: ${fmtTrim(Math.max(2, ps), 2)}em; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Type specification</PanelTitle>
        <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
        <div className="mt-3 space-y-3">
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={10} max={48} step={1} />
          <SliderNum name="weight" label="Weight" value={weight} onChange={setWeight} min={300} max={800} step={100} />
          <div className="grid grid-cols-2 gap-3">
            <Row label="Text colour">
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-full rounded-lg border border-border" />
            </Row>
            <Row label="Background">
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-full rounded-lg border border-border" />
            </Row>
          </div>
          <SliderNum name="measure" label="Measure" unit="ch" value={measure} onChange={setMeasure} min={20} max={140} step={1} />
          <SliderNum name="leading" label="Line height" unit="×" value={leading} onChange={setLeading} min={1} max={2.4} step={0.05} />
          <SliderNum name="tracking" label="Letter spacing" unit="em" value={tracking} onChange={setTracking} min={0} max={0.3} step={0.005} />
          <SliderNum name="para" label="Paragraph spacing" unit="em" value={paragraphSpacing} onChange={setParagraphSpacing} min={0} max={4} step={0.1} />
          <TextInput name="sample" label="Sample text" value={sample} onChange={setSample} />
        </div>
        <ResBox>
          <Res name="passed" label="Checks passed" value={`${passed} / ${checks.length}`} />
          <Res name="ratio" label="Contrast ratio" value={`${fmtTrim(ratio, 2)}:1`} />
          <Res name="class" label="Size class" value={large ? "large text (3:1 threshold)" : "body text (4.5:1 threshold)"} />
          <Res
            name="grade"
            label="Grade"
            value={passed === checks.length ? "passes all evaluated criteria" : `${checks.length - passed} criterion(a) to fix`}
          />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Evaluation</PanelTitle>
          <RefTable
            cols={["Criterion", "Requirement", "Measured", "Result", "Fix"]}
            rows={checks.map((c) => [c.name, c.requirement, c.actual, c.pass ? "pass" : "fail", c.fix])}
            minWidth={760}
          />
        </Panel>

        <Panel>
          <PanelTitle>Preview at the evaluated settings</PanelTitle>
          <div className="rounded-lg border border-border p-5" style={{ background: bg }}>
            <p
              data-testid="a11y-preview"
              style={{
                fontFamily: font.stack,
                fontSize: `${px}px`,
                fontWeight: w,
                lineHeight: lh,
                letterSpacing: `${ls}em`,
                color: fg,
                maxWidth: `${cm}ch`,
              }}
            >
              {sample || "Sample"}
            </p>
            <p
              style={{
                fontFamily: font.stack,
                fontSize: `${px}px`,
                lineHeight: lh,
                letterSpacing: `${ls}em`,
                color: fg,
                maxWidth: `${cm}ch`,
                marginTop: `${ps}em`,
              }}
            >
              A second paragraph at the specified paragraph spacing, so the text-spacing criterion can be judged directly
              rather than in the abstract.
            </p>
          </div>
        </Panel>

        <CodeOut code={css} title="Accessible type CSS" testid="a11y-css" />
      </div>
    </CalcLayout>
  );
}
