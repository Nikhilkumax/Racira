"use client";

import { useState } from "react";
import { Btn, CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Row, Sel, SliderNum, TextInput, fmtTrim } from "../ui";

interface Layer {
  x: number;
  y: number;
  blur: number;
  color: string;
}

const PRESETS: Record<string, Layer[]> = {
  "Soft lift": [{ x: 0, y: 2, blur: 6, color: "rgba(0,0,0,0.25)" }],
  "Hard offset": [{ x: 3, y: 3, blur: 0, color: "rgba(0,0,0,0.55)" }],
  "Long soft": [{ x: 0, y: 12, blur: 24, color: "rgba(0,0,0,0.18)" }],
  "Emboss (light above)": [
    { x: 0, y: -1, blur: 0, color: "rgba(255,255,255,0.75)" },
    { x: 0, y: 1, blur: 1, color: "rgba(0,0,0,0.35)" },
  ],
  "Neon haze": [
    { x: 0, y: 0, blur: 4, color: "rgba(236,72,153,0.9)" },
    { x: 0, y: 0, blur: 18, color: "rgba(236,72,153,0.5)" },
  ],
};

/**
 * Shadow Text Generator — text-shadow accepts a comma-separated list, and every
 * convincing shadow is a stack: a small hard layer for definition, a larger
 * soft layer for depth. Each layer's colour uses alpha so overlap never goes
 * solid, and the blur radius is reported relative to the type size so the
 * shadow scales with the text.
 */
export default function ShadowTextGenerator() {
  const [text, setText] = useState("Depth");
  const [size, setSize] = useState("72");
  const [preset, setPreset] = useState("Soft lift");
  const [layers, setLayers] = useState<Layer[]>(PRESETS["Soft lift"]);
  const [textColor, setTextColor] = useState("#111827");
  const [bg, setBg] = useState("#ffffff");

  const px = Math.min(200, Math.max(16, parseFloat(size) || 72));
  const shadow = layers.map((l) => `${l.x}px ${l.y}px ${l.blur}px ${l.color}`).join(", ");
  const css = `.shadow-text {
  color: ${textColor};
  background: ${bg};
  font-size: ${(px / 16).toFixed(4)}rem;
  text-shadow: ${shadow};
}`;

  const update = (i: number, patch: Partial<Layer>) =>
    setLayers((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const maxBlurRatio = Math.max(...layers.map((l) => l.blur)) / px;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Shadow layers</PanelTitle>
        <div className="space-y-3">
          <TextInput name="text" label="Text" value={text} onChange={setText} />
          <Sel
            name="preset"
            label="Preset"
            value={preset}
            onChange={(v) => {
              setPreset(v);
              setLayers(PRESETS[v] ?? PRESETS["Soft lift"]);
            }}
            options={Object.keys(PRESETS).map((k) => ({ value: k, label: k }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={16} max={200} step={2} />
            <Row label="Text colour" controlWidth="sm:w-full">
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-9 w-full rounded-lg border border-border" />
            </Row>
            <Row label="Background" controlWidth="sm:w-full">
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-full rounded-lg border border-border" />
            </Row>
          </div>
          <div className="flex gap-2">
            <Btn onClick={() => setLayers((ls) => [...ls, { x: 0, y: 4, blur: 12, color: "rgba(0,0,0,0.2)" }])}>Add layer</Btn>
            <Btn kind="ghost" onClick={() => setLayers((ls) => (ls.length > 1 ? ls.slice(0, -1) : ls))} disabled={layers.length <= 1}>
              Remove layer
            </Btn>
          </div>
        </div>
        <ResBox>
          <Res name="layers" label="Layers" value={String(layers.length)} />
          <Res name="blur" label="Largest blur ÷ size" value={`${fmtTrim(maxBlurRatio, 3)} — ${maxBlurRatio > 0.3 ? "very soft; may look fuzzy" : "scales with type"}`} />
          <Res name="scale" label="Scale rule" value="keep offsets in px and derive them from font-size for responsive shadows" />
        </ResBox>
        {layers.map((l, i) => (
          <div key={i} className="mt-3 rounded-lg border border-border p-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Layer {i + 1}</div>
            <div className="grid grid-cols-3 gap-3">
              <SliderNum name={`x-${i}`} label="X" unit="px" value={String(l.x)} onChange={(v) => update(i, { x: parseFloat(v) || 0 })} min={-40} max={40} step={1} />
              <SliderNum name={`y-${i}`} label="Y" unit="px" value={String(l.y)} onChange={(v) => update(i, { y: parseFloat(v) || 0 })} min={-40} max={40} step={1} />
              <SliderNum name={`b-${i}`} label="Blur" unit="px" value={String(l.blur)} onChange={(v) => update(i, { blur: parseFloat(v) || 0 })} min={0} max={60} step={1} />
            </div>
            <Row label="Colour" className="mt-2">
              <Sel
                name={`color-${i}`}
                label=""
                value={l.color}
                onChange={(v) => update(i, { color: v })}
                options={[
                  { value: "rgba(0,0,0,0.9)", label: "black 90%" },
                  { value: "rgba(0,0,0,0.55)", label: "black 55%" },
                  { value: "rgba(0,0,0,0.25)", label: "black 25%" },
                  { value: "rgba(0,0,0,0.12)", label: "black 12%" },
                  { value: "rgba(255,255,255,0.75)", label: "white 75%" },
                  { value: "rgba(236,72,153,0.9)", label: "accent 90%" },
                  { value: "rgba(236,72,153,0.5)", label: "accent 50%" },
                ]}
              />
            </Row>
          </div>
        ))}
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="rounded-lg border border-border p-6" style={{ background: bg }}>
            <p
              data-testid="shadow-preview"
              className="break-words font-semibold"
              style={{ color: textColor, fontSize: `${px}px`, lineHeight: 1.1, textShadow: shadow }}
            >
              {text || "Shadow"}
            </p>
          </div>
        </Panel>
        <CodeOut code={css} testid="shadow-css" />
      </div>
    </CalcLayout>
  );
}
