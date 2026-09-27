"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

/**
 * Stylistic axes, scored 0–5 from the catalogue's classification and the
 * designer-facing attributes commonly used to describe a face. Reference values
 * are approximations used for comparison, not font metadata.
 */
const PROFILES: Record<string, number[]> = {
  //      serif, contrast, width, weight, warmth
  Inter: [0, 1, 3, 3, 2],
  Fraunces: [5, 4, 3, 3, 4],
  "Playfair Display": [5, 5, 2, 3, 2],
  Lora: [5, 3, 3, 3, 4],
  "Source Serif 4": [5, 3, 3, 3, 3],
  Merriweather: [5, 3, 3, 4, 3],
  "Space Grotesk": [0, 2, 3, 3, 2],
  "DM Sans": [0, 1, 3, 3, 3],
  Manrope: [0, 1, 3, 3, 3],
  Poppins: [0, 1, 4, 3, 2],
  "JetBrains Mono": [0, 1, 2, 3, 1],
  "Bebas Neue": [0, 2, 1, 5, 1],
  "Roboto Slab": [5, 1, 3, 5, 2],
};

const AXES = ["Serif character", "Stroke contrast", "Width", "Weight", "Warmth"];

/**
 * Font Style Contrast Analyzer — scores two faces on five stylistic axes and
 * reports the difference as a profile rather than a single verdict. Pairings
 * work when they differ on one or two axes deliberately; they fail when they
 * differ on none (indistinguishable) or on all five (no shared language).
 */
export default function FontStyleContrastAnalyzer() {
  const [a, setA] = useState("Playfair Display");
  const [b, setB] = useState("Inter");
  const [text, setText] = useState("Two voices, one page");
  const [role, setRole] = useState("head-body");
  const [size, setSize] = useState("32");

  const pa = PROFILES[a] ?? PROFILES.Inter;
  const pb = PROFILES[b] ?? PROFILES.Inter;
  const diffs = AXES.map((axis, i) => ({ axis, a: pa[i], b: pb[i], d: Math.abs(pa[i] - pb[i]) }));
  const total = diffs.reduce((n, x) => n + x.d, 0);
  const maxTotal = AXES.length * 5;
  const score = Math.round((total / maxTotal) * 100);
  const verdict =
    total === 0
      ? "identical profiles — the pairing will read as a mistake"
      : total <= 3
        ? "subtle contrast — harmonious, needs weight or size to separate roles"
        : total <= 8
          ? "clear contrast — the usual working range for a pairing"
          : "extreme contrast — strong voice clash, use intentionally";

  const fa = FONTS.find((f) => f.name === a) ?? FONTS[2];
  const fb = FONTS.find((f) => f.name === b) ?? FONTS[0];
  const px = Math.min(96, Math.max(16, parseFloat(size) || 32));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Faces</PanelTitle>
        <Sel name="a" label="Face A (headings)" value={a} onChange={setA} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
        <div className="mt-3 space-y-3">
          <Sel name="b" label="Face B (body)" value={b} onChange={setB} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
          <TextInput name="text" label="Sample" value={text} onChange={setText} />
          <SliderNum name="size" label="Sample size" unit="px" value={size} onChange={setSize} min={16} max={96} step={2} />
          <Sel
            name="role"
            label="Pairing role"
            value={role}
            onChange={setRole}
            options={[
              { value: "head-body", label: "Heading + body" },
              { value: "ui-editorial", label: "UI + editorial" },
              { value: "display-text", label: "Display + text" },
            ]}
          />
        </div>
        <ResBox>
          <Res name="score" label="Contrast score" value={`${score} / 100`} />
          <Res name="verdict" label="Verdict" value={verdict} />
          <Res name="advice" label="Suggested separation" value={total <= 3 ? "differentiate by colour or weight instead" : "keep the two faces as they are and set sizes on a shared scale"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Shift the model</PanelTitle>
          <RefTable
            cols={["Axis", "Face A", "Face B", "Difference"]}
            rows={diffs.map((d) => [
              d.axis,
              "▮".repeat(d.a) || "·",
              "▮".repeat(d.b) || "·",
              `${d.d} / 5`,
            ])}
            minWidth={460}
            note="Scores are reference profiles for comparison, not font metadata: 0 is neutral and 5 is a strong expression of the axis."
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Role context: <span className="font-mono">{role}</span> — heading/body pairings tolerate more contrast than a UI/editorial split, where similarity aids continuity.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Rendered pair</PanelTitle>
          <h3 data-testid="style-contrast-head" style={{ fontFamily: fa.stack, fontSize: `${px}px`, lineHeight: 1.15, fontWeight: 700 }} className="text-foreground">
            {text || "Face A"}
          </h3>
          <p style={{ fontFamily: fb.stack, fontSize: `${Math.round(px * 0.5)}px`, lineHeight: 1.6 }} className="mt-2 text-foreground/90">
            {text || "Face B"} set at {Math.round(px * 0.5)}px — the ratio that usually accompanies this pairing ({fmtTrim(px / (px * 0.5), 2)}×).
          </p>
        </Panel>
      </div>
    </CalcLayout>
  );
}
