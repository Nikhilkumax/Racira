"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmtTrim } from "../ui";

/**
 * Line Height Optimizer — a transparent leading heuristic.
 *
 *   raw = 1.2 + 4.8 / size          (16px → 1.50, 12px → 1.60, 32px → 1.35)
 *   + (charsPerLine − 65) / 100     (longer measure needs more leading)
 *   + 0.03 for serif, −0.03 for weight ≥ 600
 *   clamped to [1.05, 2.0]
 *
 * The model is guidance, not a standard: the point is that the number it
 * returns is derived and inspectable, and the preview shows the result.
 */
export default function LineHeightOptimizer() {
  const [size, setSize] = useState("16");
  const [lines, setLines] = useState("65");
  const [family, setFamily] = useState("sans");
  const [weight, setWeight] = useState("400");

  const s = parseFloat(size);
  const c = parseFloat(lines);
  const w = parseFloat(weight) || 400;
  const valid = Number.isFinite(s) && s > 0 && Number.isFinite(c) && c > 0;

  const raw = valid ? 1.2 + 4.8 / s + (c - 65) / 100 + (family === "serif" ? 0.03 : 0) + (w >= 600 ? -0.03 : 0) : NaN;
  const lh = valid ? Math.min(2, Math.max(1.05, raw)) : NaN;
  const lhPx = valid ? lh * s : NaN;

  const presets = [
    { label: "Compact UI / large headings", value: fmtTrim(lh - 0.1, 3) },
    { label: "Recommended", value: fmtTrim(lh, 3) },
    { label: "Airy editorial", value: fmtTrim(Math.min(2, lh + 0.15), 3) },
  ];

  const css =
    valid
      ? [
          `font-size: ${fmtTrim(s, 3)}px;`,
          `line-height: ${fmtTrim(lh, 4)}; /* ${fmtTrim(lhPx, 3)}px */`,
          "",
          "/* Large text (>24px or >18.66px bold) may drop to 1.1–1.3 */",
        ].join("\n")
      : "";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Text parameters</PanelTitle>
        <FormGrid>
          <Num name="size" label="Font size" unit="px" value={size} onChange={setSize} step={0.5} />
          <Num name="lines" label="Measure" unit="characters per line" value={lines} onChange={setLines} />
          <Sel
            name="family"
            label="Family"
            value={family}
            onChange={setFamily}
            options={[
              { value: "sans", label: "Sans-serif" },
              { value: "serif", label: "Serif" },
              { value: "mono", label: "Monospace" },
            ]}
          />
          <Sel
            name="weight"
            label="Weight"
            value={weight}
            onChange={setWeight}
            options={[300, 400, 500, 600, 700].map((x) => ({ value: String(x), label: String(x) }))}
          />
        </FormGrid>
        <ResBox>
          <Res name="lh" label="Recommended line-height" value={valid ? `${fmtTrim(lh, 3)} (${fmtTrim(lhPx, 2)}px)` : "—"} />
          <Res name="ideal" label="Ideal measure band" value="45–75 characters" />
          <Res name="measure" label="Your measure" value={valid ? (c < 45 ? "too short" : c > 75 ? "too long" : "in range") : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Formula shown in the code output is: 1.2 + 4.8/size + (measure − 65)/100 ± family/weight adjustment, clamped to
          1.05–2.0.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview at recommended leading</PanelTitle>
          <div
            className="rounded-lg border border-border bg-background p-4 text-foreground"
            style={{ fontSize: `${s}px`, lineHeight: lh, maxWidth: `${Math.max(20, c * 0.52)}em` }}
          >
            Type is a sequence of decisions about spacing: the size sets the tone, the line length sets the pace, and the
            leading decides how comfortably the eye travels from the end of one line to the start of the next.
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            {fmtTrim(s, 2)}px / {fmtTrim(lh, 3)} · measure ≈ {Math.round(c)}ch
          </p>
        </Panel>
        <CodeOut code={css || "/* enter a valid size */"} title="CSS" testid="line-height-css" />
        <div className="rounded-xl border border-border bg-card/40">
          <div className="border-b border-border/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Starting points
          </div>
          <div className="divide-y divide-border/60">
            {presets.map((p) => (
              <div key={p.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{p.label}</span>
                <span className="font-mono text-foreground">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CalcLayout>
  );
}
