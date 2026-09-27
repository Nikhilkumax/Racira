"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

/** Metric profiles used for the visualisation (reference values, 0–10). */
const METRICS: Record<string, { xHeight: number; width: number; contrast: number; weight: number; tone: number }> = {
  Inter: { xHeight: 7, width: 5, contrast: 2, weight: 6, tone: 5 },
  Fraunces: { xHeight: 6, width: 5, contrast: 8, weight: 6, tone: 8 },
  "Playfair Display": { xHeight: 6, width: 4, contrast: 9, weight: 6, tone: 4 },
  Lora: { xHeight: 7, width: 5, contrast: 5, weight: 6, tone: 8 },
  "Source Serif 4": { xHeight: 7, width: 5, contrast: 5, weight: 6, tone: 6 },
  Merriweather: { xHeight: 8, width: 6, contrast: 5, weight: 8, tone: 6 },
  "Space Grotesk": { xHeight: 7, width: 5, contrast: 3, weight: 6, tone: 5 },
  "DM Sans": { xHeight: 7, width: 5, contrast: 2, weight: 7, tone: 7 },
  Manrope: { xHeight: 7, width: 5, contrast: 2, weight: 7, tone: 6 },
  Poppins: { xHeight: 7, width: 6, contrast: 2, weight: 7, tone: 4 },
  "JetBrains Mono": { xHeight: 7, width: 6, contrast: 2, weight: 7, tone: 3 },
  "Bebas Neue": { xHeight: 9, width: 2, contrast: 2, weight: 9, tone: 2 },
  "Roboto Slab": { xHeight: 8, width: 5, contrast: 2, weight: 9, tone: 4 },
};

const AXES = [
  { key: "xHeight", label: "x-height" },
  { key: "width", label: "width" },
  { key: "contrast", label: "stroke contrast" },
  { key: "weight", label: "apparent weight" },
  { key: "tone", label: "warmth" },
] as const;

/**
 * Font Harmony Visualizer — plots two families against five shared metrics and
 * shows where they align and where they diverge. Harmony is not sameness: the
 * pairing usually needs the x-heights close (so the text sits on the same
 * optical line) and one or two deliberate divergences elsewhere.
 */
export default function FontHarmonyVisualizer() {
  const [a, setA] = useState("Lora");
  const [b, setB] = useState("DM Sans");
  const [heading, setHeading] = useState("Harmony is alignment plus contrast");
  const [body, setBody] = useState(
    "Two faces harmonise when they share a metric framework and differ deliberately on one or two axes; the visualiser states which of those conditions hold.",
  );
  const [headingSize, setHeadingSize] = useState("30");

  const ma = METRICS[a] ?? METRICS.Lora;
  const mb = METRICS[b] ?? METRICS["DM Sans"];
  const diffs = AXES.map((axis) => ({ label: axis.label, a: ma[axis.key], b: mb[axis.key], d: Math.abs(ma[axis.key] - mb[axis.key]) }));
  const xHeightDelta = Math.abs(ma.xHeight - mb.xHeight);
  const divisive = diffs.filter((d) => d.d >= 3).map((d) => d.label);
  const totalDiff = diffs.reduce((n, d) => n + d.d, 0);

  const shared = diffs.filter((d) => d.d <= 2).map((d) => d.label);
  const harmonyVerdict =
    xHeightDelta <= 1 && (divisive.length === 1 || divisive.length === 2)
      ? "harmonious — aligned metrics with deliberate contrast"
      : xHeightDelta > 1
        ? "x-heights disagree — set sizes by eye, not by number"
        : divisive.length === 0
          ? "too alike — no axis of separation"
          : "many divergences — check whether the pairing still shares a tone";

  const fa = FONTS.find((f) => f.name === a) ?? FONTS[3];
  const fb = FONTS.find((f) => f.name === b) ?? FONTS[7];
  const hs = Math.min(72, Math.max(16, parseFloat(headingSize) || 30));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Faces</PanelTitle>
        <Sel name="a" label="Face A" value={a} onChange={setA} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
        <div className="mt-3 space-y-3">
          <Sel name="b" label="Face B" value={b} onChange={setB} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <TextInput name="heading" label="Heading sample" value={heading} onChange={setHeading} />
          <SliderNum name="hs" label="Heading size" unit="px" value={headingSize} onChange={setHeadingSize} min={16} max={72} step={1} />
        </div>
        <ResBox>
          <Res name="xheight" label="x-height agreement" value={`${xHeightDelta === 0 ? "identical" : `Δ ${xHeightDelta} / 10`}`} />
          <Res name="shared" label="Shared axes" value={shared.join(", ") || "none"} />
          <Res name="divisive" label="Diverging axes" value={divisive.join(", ") || "none"} />
          <Res name="verdict" label="Harmony" value={harmonyVerdict} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Metric profiles</PanelTitle>
          <RefTable
            cols={["Metric", `A · ${a}`, `B · ${b}`, "Δ", "Consequence"]}
            rows={diffs.map((d) => [
              d.label,
              `▮`.repeat(d.a) || "·",
              `▮`.repeat(d.b) || "·",
              String(d.d),
              d.d === 0
                ? "identical — no separation on this axis"
                : d.d <= 2
                  ? "close enough to read as a system"
                  : d.d <= 4
                    ? "deliberate contrast"
                    : "strong divergence — check the pairing holds together",
            ])}
            minWidth={620}
            note={`Total divergence ${totalDiff} / 50 across ${AXES.length} axes.`}
          />
        </Panel>

        <Panel>
          <PanelTitle>Rendered pairing</PanelTitle>
          <div data-testid="harmony-preview" className="rounded-lg border border-border bg-background p-5">
            <h3 style={{ fontFamily: fa.stack, fontSize: `${hs}px`, lineHeight: 1.15, fontWeight: 700 }} className="text-foreground">
              {heading}
            </h3>
            <p style={{ fontFamily: fb.stack, fontSize: `${fmtTrim(hs * 0.53, 1)}px`, lineHeight: 1.6 }} className="mt-2 text-foreground/90">
              {body}
            </p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            When the x-heights differ, the body size is nudged until the lowercase bodies look equal — the visualiser gives
            the scaled size so the correction can be checked directly.
          </p>
        </Panel>
      </div>
    </CalcLayout>
  );
}
