"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Sel, SliderNum, TextInput, fmtTrim } from "../ui";

const RATIOS: { value: string; label: string }[] = [
  { value: "1.125", label: "1.125 — tight (dense UI)" },
  { value: "1.2", label: "1.200 — minor third" },
  { value: "1.25", label: "1.250 — major third (default)" },
  { value: "1.333", label: "1.333 — perfect fourth" },
  { value: "1.5", label: "1.500 — perfect fifth (editorial)" },
  { value: "1.618", label: "1.618 — golden ratio" },
];

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/**
 * Heading Scale Visualizer — builds an H1–H6 ladder from a base size and a
 * ratio, deciding each heading's size as base × ratio^(6−level) so H6 lands on
 * the base. The clamp output keeps the hierarchy readable on phones without a
 * second scale.
 */
export default function HeadingScaleVisualizer() {
  const [base, setBase] = useState("16");
  const [ratioSel, setRatioSel] = useState("1.25");
  const [text, setText] = useState("Section heading");
  const [clamp, setClamp] = useState("0.78");

  const b = Math.max(8, parseFloat(base) || 16);
  const ratio = parseFloat(ratioSel) || 1.25;
  const minFactor = Math.min(0.95, Math.max(0.5, parseFloat(clamp) || 0.78));

  const sizes = HEADINGS.map((h, i) => {
    const step = 5 - i; // h1 = +5, h6 = 0
    return { tag: h, px: b * ratio ** step, step };
  });

  const rows = sizes.map((s) => [
    s.tag,
    `base × ${fmtTrim(ratio ** s.step, 4)}`,
    `${fmtTrim(s.px, 2)}px`,
    `${fmtTrim(s.px / 16, 4)}rem`,
    `${fmtTrim(s.px * minFactor, 2)}px (mobile)`,
  ]);

  const css = sizes
    .map((s) => `${s.tag} { font-size: clamp(${fmtTrim((s.px * minFactor) / 16, 3)}rem, ${fmtTrim((s.px / 16) * 0.75, 3)}rem + 1.4vw, ${fmtTrim(s.px / 16, 4)}rem); }`)
    .join("\n");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Scale</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="base" label="Base (H6) size" unit="px" value={base} onChange={setBase} min={10} max={32} step={1} />
          <Sel name="ratio" label="Ratio" value={ratioSel} onChange={setRatioSel} options={RATIOS} />
          <SliderNum
            name="clamp"
            label="Mobile floor"
            unit="× base"
            value={clamp}
            onChange={setClamp}
            min={0.5}
            max={0.95}
            step={0.01}
          />
          <TextInput name="text" label="Sample text" value={text} onChange={setText} />
        </div>
        <RefTable
          cols={["Tag", "Multiplier", "Desktop", "rem", "Mobile floor"]}
          rows={rows}
          minWidth={420}
          note={`H6 is the base; each step up multiplies by the ratio. Mobile floor is ${fmtTrim(minFactor, 2)}× the desktop size.`}
        />
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Rendered ladder</PanelTitle>
          <div className="space-y-3">
            {sizes.map((s) => (
              <div key={s.tag} className="flex items-baseline gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="w-8 shrink-0 font-mono text-xs uppercase text-muted-foreground">{s.tag}</span>
                <span
                  className="min-w-0 flex-1 break-words font-semibold text-foreground"
                  style={{ fontSize: `${s.px}px`, lineHeight: 1.15 }}
                >
                  {text || "Heading"}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <CodeOut code={css} title="clamp() ladder" testid="heading-scale-css" />
      </div>
    </CalcLayout>
  );
}
