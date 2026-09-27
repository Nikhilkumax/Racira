"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, SliderNum, TextInput } from "../ui";
import { normalizeHex } from "../color";

/**
 * Outlined Text Generator — hollow/outlined lettering with CSS.
 * `-webkit-text-stroke` draws the outline; `paint-order: stroke fill` keeps the
 * stroke from eating into the glyph at thick widths (the Chrome/Safari/Firefox
 * behaviour that makes outlined headings actually look right).
 */
export default function OutlinedTextGenerator() {
  const [text, setText] = useState("OUTLINE");
  const [size, setSize] = useState("64");
  const [stroke, setStroke] = useState("2");
  const [strokeColor, setStrokeColor] = useState("#111827");
  const [fill, setFill] = useState("transparent");
  const [bg, setBg] = useState("#f8fafc");
  const [letterSpacing, setLetterSpacing] = useState("0.04");

  const fontSize = parseFloat(size) || 64;
  const strokePx = parseFloat(stroke) || 0;
  const css = [
    `.outlined-text {`,
    `  font-size: ${fontSize}px;`,
    `  letter-spacing: ${letterSpacing}em;`,
    `  color: ${fill === "transparent" ? "transparent" : fill};`,
    `  -webkit-text-stroke: ${strokePx}px ${strokeColor};`,
    `  paint-order: stroke fill;`,
    `}`,
  ].join("\n");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Outline</PanelTitle>
        <TextInput name="text" label="Text" value={text} onChange={setText} />
        <div className="mt-3 space-y-3">
          <SliderNum name="size" label="Font size" unit="px" value={size} onChange={setSize} min={24} max={160} step={1} />
          <SliderNum name="stroke" label="Stroke width" unit="px" value={stroke} onChange={setStroke} min={0.5} max={8} step={0.5} />
          <SliderNum name="letterSpacing" label="Letter spacing" unit="em" value={letterSpacing} onChange={setLetterSpacing} min={0} max={0.2} step={0.005} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Stroke color</span>
            <input type="color" value={normalizeHex(strokeColor) ?? "#111827"} onChange={(e) => setStrokeColor(e.target.value)} className="h-9 w-full cursor-pointer rounded-md border border-border bg-background" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Fill</span>
            <select
              value={fill}
              onChange={(e) => setFill(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="transparent">transparent (hollow)</option>
              <option value="#ffffff">white</option>
              <option value="#111827">near-black</option>
              <option value="#fbbf24">amber</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Background</span>
            <input type="color" value={normalizeHex(bg) ?? "#ffffff"} onChange={(e) => setBg(e.target.value)} className="h-9 w-full cursor-pointer rounded-md border border-border bg-background" />
          </label>
        </div>
        <ResBox>
          <Res name="stroke" label="Stroke at this size" value={`${strokePx}px (${((strokePx / fontSize) * 100).toFixed(2)}% of em)`} />
          <Res name="paint" label="Paint order" value="stroke then fill" />
          <Res name="support" label="Browser support" value="-webkit-text-stroke: all modern browsers" />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-lg border border-border p-6" style={{ background: bg }}>
            <span
              style={{
                fontSize: `${fontSize}px`,
                letterSpacing: `${letterSpacing}em`,
                color: fill === "transparent" ? "transparent" : fill,
                WebkitTextStroke: `${strokePx}px ${strokeColor}`,
                paintOrder: "stroke fill",
                fontWeight: 800,
              }}
            >
              {text || "OUTLINE"}
            </span>
          </div>
        </Panel>
        <CodeOut code={css} title="CSS" testid="outline-css" />
      </div>
    </CalcLayout>
  );
}
