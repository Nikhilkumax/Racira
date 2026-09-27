"use client";

import { useState } from "react";
import { Btn, CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, SliderNum } from "../ui";
import { normalizeHex } from "../color";

/**
 * Text Shadow Builder — layered CSS text-shadow with a live preview and the
 * exact declaration for copy/paste. Layers stack top-first, the same order
 * the CSS is applied.
 */
interface Layer {
  id: number;
  x: number;
  y: number;
  blur: number;
  color: string;
}

const INITIAL: Layer[] = [
  { id: 1, x: 0, y: 2, blur: 4, color: "#0f172a" },
  { id: 2, x: 0, y: 6, blur: 18, color: "#0f172a55" },
];

export default function TextShadowBuilder() {
  const [layers, setLayers] = useState<Layer[]>(INITIAL);
  const [text, setText] = useState("Shadow play");
  const [size, setSize] = useState("48");
  const [weight, setWeight] = useState("700");
  const [bg, setBg] = useState("#f8fafc");
  const [fg, setFg] = useState("#111827");

  const shadow = layers
    .filter((l) => l.blur >= 0)
    .map((l) => `${l.x}px ${l.y}px ${l.blur}px ${l.color}`)
    .join(",\n    ");

  const css = [
    `.shadow-text {`,
    `  color: ${fg};`,
    typeof shadow === "string" && shadow ? `  text-shadow:\n    ${shadow};` : "  text-shadow: none;",
    `}`,
  ].join("\n");

  const update = (id: number, patch: Partial<Layer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Layers ({layers.length})</PanelTitle>
        <div className="space-y-4">
          {layers.map((l) => (
            <div key={l.id} className="rounded-xl border border-border bg-card/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {l.x}px {l.y}px {l.blur}px
                </span>
                <Btn kind="ghost" onClick={() => setLayers((ls) => ls.filter((x) => x.id !== l.id))}>
                  Remove
                </Btn>
              </div>
              <div className="space-y-2">
                <SliderNum name={`x-${l.id}`} label="Offset X" unit="px" value={String(l.x)} onChange={(v) => update(l.id, { x: parseFloat(v) || 0 })} min={-40} max={40} step={1} />
                <SliderNum name={`y-${l.id}`} label="Offset Y" unit="px" value={String(l.y)} onChange={(v) => update(l.id, { y: parseFloat(v) || 0 })} min={-40} max={40} step={1} />
                <SliderNum name={`blur-${l.id}`} label="Blur" unit="px" value={String(l.blur)} onChange={(v) => update(l.id, { blur: parseFloat(v) || 0 })} min={0} max={60} step={1} />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Color</span>
                  <input
                    type="color"
                    value={normalizeHex(l.color) ?? "#000000"}
                    onChange={(e) => update(l.id, { color: e.target.value })}
                    aria-label={`Layer ${l.id} color`}
                    className="h-9 w-10 cursor-pointer rounded-md border border-border bg-background"
                  />
                  <input
                    type="text"
                    value={l.color}
                    onChange={(e) => update(l.id, { color: e.target.value })}
                    aria-label={`Layer ${l.id} color value`}
                    className="w-32 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Btn
            kind="ghost"
            onClick={() => setLayers((ls) => [...ls, { id: Math.max(0, ...ls.map((x) => x.id)) + 1, x: 0, y: 1, blur: 2, color: "#0f172a" }])}
            testid="add-layer"
          >
            Add layer
          </Btn>
        </div>
        <ResBox>
          <Res name="layers" label="Layers" value={String(layers.length)} />
          <Res name="css-length" label="Declaration length" value={`${shadow.length} characters`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Text</span>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <SliderNum name="size" label="Font size" unit="px" value={size} onChange={setSize} min={16} max={96} step={1} />
          </div>
          <div
            className="mt-4 flex min-h-[140px] items-center justify-center rounded-lg border border-border p-6"
            style={{ background: bg }}
          >
            <span
              style={{
                fontSize: `${parseFloat(size) || 48}px`,
                fontWeight: parseFloat(weight) || 700,
                color: fg,
                textShadow: shadow || "none",
              }}
            >
              {text}
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Text color</span>
              <input type="color" value={normalizeHex(fg) ?? "#111827"} onChange={(e) => setFg(e.target.value)} className="h-9 w-10 rounded-md border border-border bg-background" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Background</span>
              <input type="color" value={normalizeHex(bg) ?? "#ffffff"} onChange={(e) => setBg(e.target.value)} className="h-9 w-10 rounded-md border border-border bg-background" />
            </label>
          </div>
        </Panel>
        <CodeOut code={css} title="CSS" testid="text-shadow-css" />
      </div>
    </CalcLayout>
  );
}
