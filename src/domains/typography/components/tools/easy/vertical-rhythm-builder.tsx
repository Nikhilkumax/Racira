"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, SliderNum, fmtTrim } from "../ui";

interface Step {
  label: string;
  size: number;
  naturalBox: number;
  snappedBox: number;
  effectiveLeading: number;
  error: number;
}

/**
 * Vertical Rhythm Builder — a vertical rhythm is a single spacing unit (often
 * the body line box) that every vertical margin is a multiple of. This builder
 * snaps a modular scale's line boxes to that unit and reports the snap error,
 * so an off-grid size (21px × 1.5 = 31.5px) is visible before it quietly breaks
 * the rhythm down the page.
 */
export default function VerticalRhythmBuilder() {
  const [unit, setUnit] = useState("8");
  const [baseSize, setBaseSize] = useState("16");
  const [ratio, setRatio] = useState("1.25");
  const [leading, setLeading] = useState("1.5");
  const [steps, setSteps] = useState("5");

  const u = Math.max(2, parseFloat(unit) || 8);
  const b = Math.max(8, parseFloat(baseSize) || 16);
  const r = Math.max(1.05, parseFloat(ratio) || 1.25);
  const lh = Math.min(2.2, Math.max(1, parseFloat(leading) || 1.5));
  const n = Math.min(8, Math.max(2, Math.round(parseFloat(steps) || 5)));

  const ladder: Step[] = Array.from({ length: n }, (_, i) => {
    const step = n - 1 - i;
    const size = b * r ** step;
    const naturalBox = size * lh;
    const snappedBox = Math.max(1, Math.round(naturalBox / u)) * u;
    return {
      label: step === 0 ? "base" : `+${step}`,
      size,
      naturalBox,
      snappedBox,
      effectiveLeading: snappedBox / size,
      error: ((snappedBox - naturalBox) / naturalBox) * 100,
    };
  });

  const rows = ladder.map((s) => [
    s.label,
    `${fmtTrim(s.size, 2)}px`,
    `${fmtTrim(s.naturalBox, 2)}px`,
    `${s.snappedBox}px`,
    fmtTrim(s.effectiveLeading, 4),
    `${s.error > 0 ? "+" : ""}${fmtTrim(s.error, 2)}%`,
  ]);

  const css = ladder
    .map((s) => `/* ${s.label} → ${s.size.toFixed(2)}px in a ${s.snappedBox}px box */\n.type-step-${s.label.replace("+", "p").replace("base", "0")} {\n  font-size: ${(s.size / 16).toFixed(4)}rem;\n  line-height: ${s.effectiveLeading.toFixed(4)};\n}`)
    .join("\n\n");

  const worst = ladder.reduce((a, s) => (Math.abs(s.error) > Math.abs(a.error) ? s : a), ladder[0]);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Rhythm inputs</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="unit" label="Baseline unit" unit="px" value={unit} onChange={setUnit} min={2} max={32} step={1} />
          <SliderNum name="base" label="Body size" unit="px" value={baseSize} onChange={setBaseSize} min={12} max={24} step={1} />
          <SliderNum name="ratio" label="Scale ratio" value={ratio} onChange={setRatio} min={1.05} max={1.6} step={0.005} />
          <SliderNum name="leading" label="Body line height" unit="×" value={leading} onChange={setLeading} min={1} max={2} step={0.05} />
          <SliderNum name="steps" label="Steps" value={steps} onChange={setSteps} min={2} max={8} step={1} />
        </div>
        <RefTable
          cols={["Step", "Size", "Natural box", `Snapped (${fmtTrim(u, 0)}px)`, "Effective leading", "Snap error"]}
          rows={rows}
          minWidth={560}
          note={`Line boxes round to the nearest ${fmtTrim(u, 0)}px multiple. Errors under ~1.5% are effectively invisible; the worst in this ladder is ${fmtTrim(worst.error, 2)}%.`}
        />
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Grid preview</PanelTitle>
          <div
            className="overflow-hidden rounded-lg border border-border"
            style={{
              backgroundImage: `repeating-linear-gradient(to bottom, color-mix(in oklab, var(--muted-foreground) 14%, transparent) 0 1px, transparent 1px ${u}px)`,
            }}
          >
            {ladder.map((s) => (
              <p
                key={s.label}
                className="px-4 text-foreground"
                style={{
                  fontSize: `${s.size}px`,
                  lineHeight: s.effectiveLeading,
                  paddingTop: `${u / 2}px`,
                  paddingBottom: `${u / 2}px`,
                }}
              >
                {s.label} — {fmtTrim(s.size, 2)}px text in a {s.snappedBox}px line box.
              </p>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            The stripes are the {fmtTrim(u, 0)}px baseline unit; each line box's baselines should land on a stripe.
          </p>
        </Panel>
        <CodeOut code={css} title="Snapped leading" testid="rhythm-css" />
      </div>
    </CalcLayout>
  );
}
