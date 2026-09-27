"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, SliderNum, TextInput } from "../ui";
import { normalizeHex } from "../color";

/**
 * Neon Text Previewer — layered text-shadow glow on a dark tube. Glow layers
 * combine the halo (large blur, low alpha) with the hot core (small blur,
 * full colour) and a white inner highlight, which is what makes CSS neon read
 * as a lit tube rather than coloured blur.
 */
export default function NeonTextPreviewer() {
  const [text, setText] = useState("OPEN LATE");
  const [size, setSize] = useState("64");
  const [color, setColor] = useState("#22d3ee");
  const [intensity, setIntensity] = useState("1");
  const [bg, setBg] = useState("#05070d");

  const fontSize = parseFloat(size) || 64;
  const k = parseFloat(intensity) || 1;
  /** 8-digit hex with the glow alpha baked in (scaled by intensity). */
  const glow = (alpha: number) =>
    `${color}${Math.round(Math.min(1, alpha * k) * 255)
      .toString(16)
      .padStart(2, "0")}`;

  const layers = [
    `0 0 ${(4 * k).toFixed(1)}px #ffffff`,
    `0 0 ${(7 * k).toFixed(1)}px ${color}`,
    `0 0 ${(21 * k).toFixed(1)}px ${color}`,
    `0 0 ${(42 * k).toFixed(1)}px ${glow(0.9)}`,
    `0 0 ${(82 * k).toFixed(1)}px ${glow(0.7)}`,
    `0 0 ${(102 * k).toFixed(1)}px ${glow(0.6)}`,
  ];
  const shadow = layers.join(",\n    ");

  const css = [
    `.neon-text {`,
    `  color: #fff;`,
    `  text-shadow:\n    ${shadow};`,
    `}`,
  ].join("\n");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Tube</PanelTitle>
        <TextInput name="text" label="Text" value={text} onChange={setText} />
        <div className="mt-3 space-y-3">
          <SliderNum name="size" label="Font size" unit="px" value={size} onChange={setSize} min={24} max={140} step={1} />
          <SliderNum name="intensity" label="Glow intensity" value={intensity} onChange={setIntensity} min={0.2} max={2} step={0.05} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Glow color</span>
            <div className="flex gap-2">
              <input type="color" value={normalizeHex(color) ?? "#22d3ee"} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded-md border border-border bg-background" />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Background</span>
            <input type="color" value={normalizeHex(bg) ?? "#05070d"} onChange={(e) => setBg(e.target.value)} className="h-9 w-full cursor-pointer rounded-md border border-border bg-background" />
          </label>
        </div>
        <ResBox>
          <Res name="layers" label="Glow layers" value={String(layers.length)} />
          <Res name="halo" label="Outer glow radius" value={`${(102 * k).toFixed(0)}px`} />
          <Res name="contrast" label="Readability note" value="glow decorates; keep a solid core for legibility" />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-lg border border-border p-6" style={{ background: bg }}>
            <span
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "#fff",
                textShadow: shadow,
              }}
            >
              {text || "NEON"}
            </span>
          </div>
        </Panel>
        <CodeOut code={css} title="CSS" testid="neon-css" />
      </div>
    </CalcLayout>
  );
}
