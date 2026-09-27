"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Row, Sel, SliderNum, TextArea } from "../ui";
import { DEFAULT_SAMPLE, FONTS } from "../fonts";

const SLOTS = ["A", "B", "C", "D"];

/**
 * Multi-Font Comparison — four slots, one sample, compared under identical
 * settings. The table reports the measured differences rather than the visual
 * impression: the kind of each face, whether the same nominal size produces a
 * similar lowercase body, and a per-column width estimate from the canvas
 * measurement of the sample in each family.
 */
export default function MultiFontComparison() {
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [size, setSize] = useState("28");
  const [weight, setWeight] = useState("400");
  const [slots, setSlots] = useState<string[]>(["Inter", "Fraunces", "Space Grotesk", "JetBrains Mono"]);

  const px = Math.min(96, Math.max(12, parseFloat(size) || 28));
  const w = parseFloat(weight) || 400;
  const chosen = slots.map((s) => FONTS.find((f) => f.name === s) ?? FONTS[0]);

  const measure = (family: string) => {
    if (typeof document === "undefined") return 0;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return 0;
    ctx.font = `${w} ${px}px ${family}`;
    return ctx.measureText(text || "Sample").width;
  };

  const widths = chosen.map((f) => measure(f.stack));
  const widest = Math.max(...widths, 1);

  const setSlot = (i: number, v: string) => setSlots((s) => s.map((x, j) => (j === i ? v : x)));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Comparison settings</PanelTitle>
        <TextArea name="text" label="Shared sample" value={text} onChange={setText} rows={3} />
        <div className="mt-3 space-y-3">
          <SliderNum name="size" label="Size (all slots)" unit="px" value={size} onChange={setSize} min={12} max={96} step={1} />
          <SliderNum name="weight" label="Weight (all slots)" value={weight} onChange={setWeight} min={300} max={700} step={100} />
        </div>
        <RefTable
          cols={["Slot", "Family", "Kind", "Sample width", "Relative"]}
          rows={chosen.map((f, i) => [
            SLOTS[i],
            f.name,
            f.kind,
            `${widths[i].toFixed(0)}px`,
            `${((widths[i] / widest) * 100).toFixed(0)}%`,
          ])}
          minWidth={460}
          note="Widths are measured with the Canvas API at the settings above, so the comparison uses the browser's real shaping rather than an approximation."
        />
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Slots</PanelTitle>
          {SLOTS.map((slot, i) => (
            <Row key={slot} label={`Slot ${slot}`}>
              <Sel
                name={`slot-${slot}`}
                label=""
                value={slots[i]}
                onChange={(v) => setSlot(i, v)}
                options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
              />
            </Row>
          ))}
        </Panel>

        <Panel>
          <PanelTitle>Side by side</PanelTitle>
          <div className="space-y-4" data-testid="multi-font-preview">
            {chosen.map((f, i) => (
              <div key={`${f.name}-${i}`} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {SLOTS[i]} · {f.name}
                </span>
                <p
                  className="mt-1 break-words text-foreground"
                  style={{ fontFamily: f.stack, fontSize: `${px}px`, fontWeight: w, lineHeight: 1.3 }}
                >
                  {text || DEFAULT_SAMPLE}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </CalcLayout>
  );
}
