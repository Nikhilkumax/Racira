"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Radios, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS, WEIGHTS } from "../fonts";

const SAMPLE = "Rendering: hinting, smoothing and subpixel order";

/**
 * Font Rendering Preview — browsers expose only a few knobs over text
 * rasterisation: `text-rendering`, font smoothing (non-standard but real in
 * WebKit/Blink), and the foreground colour (subpixel antialiasing only
 * applies to opaque dark-on-light text). The tool renders the same string
 * under each setting and reports what the choice actually does in each engine.
 */
export default function FontRenderingPreview() {
  const [fontName, setFontName] = useState("Inter");
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState("28");
  const [mode, setMode] = useState("optimizeLegibility");
  const [weight, setWeight] = useState("500");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(96, Math.max(12, parseFloat(size) || 28));
  const w = parseFloat(weight) || 500;

  const modes: Record<string, { css: string; note: string }> = {
    auto: {
      css: "text-rendering: auto;",
      note: "Browser default: balances speed and shape fidelity; kerning on where the font provides it.",
    },
    optimizeLegibility: {
      css: "text-rendering: optimizeLegibility;",
      note: "Enables kerning and optional ligatures; historically a hint only, now mostly equal to auto.",
    },
    geometricPrecision: {
      css: "text-rendering: geometricPrecision;",
      note: "Scales glyph outlines without hinting, so text scales smoothly at any fractional size.",
    },
    speed: {
      css: "text-rendering: speed;",
      note: "Disables kerning and ligatures — the fastest, loosest setting. Rarely correct on the web.",
    },
  };

  const smoothing: Record<string, { css: string; cls: string }> = {
    antialiased: { css: "-webkit-font-smoothing: antialiased;", cls: "antialiased" },
    subpixel: { css: "-webkit-font-smoothing: auto;", cls: "" },
  };

  const code = `.rendering-demo {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  font-weight: ${w};
  ${modes[mode].css}
  ${smoothing.antialiased.css}
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Rendering settings</PanelTitle>
        <Sel
          name="font"
          label="Font family"
          value={fontName}
          onChange={setFontName}
          options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
        />
        <div className="mt-3 space-y-3">
          <TextInput name="text" label="Sample text" value={text} onChange={setText} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={96} step={1} />
          <Sel
            name="weight"
            label="Weight"
            value={weight}
            onChange={setWeight}
            options={WEIGHTS.map((v) => ({ value: String(v), label: String(v) }))}
          />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              text-rendering
            </span>
            <Radios
              name="mode"
              value={mode}
              onChange={setMode}
              ariaLabel="text-rendering value"
              options={Object.keys(modes).map((m) => ({ value: m, label: m }))}
            />
          </div>
        </div>
        <ResBox>
          <Res name="mode" label="text-rendering" value={mode} />
          <Res name="smoothing" label="Smoothing" value="grayscale (antialiased)" />
          <Res name="note" label="Effect" value={modes[mode].note.split(";")[0]} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Dark on light · antialiased</PanelTitle>
          <p
            data-testid="render-light"
            className="antialiased break-words text-foreground"
            style={{ fontFamily: font.stack, fontSize: `${px}px`, fontWeight: w, textRendering: mode as "auto" }}
          >
            {text || SAMPLE}
          </p>
        </Panel>
        <Panel>
          <PanelTitle>Light on dark (grayscale only)</PanelTitle>
          <div className="rounded-lg bg-neutral-900 p-4">
            <p
              className="antialiased break-words text-neutral-100"
              style={{ fontFamily: font.stack, fontSize: `${px}px`, fontWeight: w, textRendering: mode as "auto" }}
            >
              {text || SAMPLE}
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Subpixel antialiasing requires opaque dark text on a light background. Light-on-dark text is always rendered
            with grayscale antialiasing, which is why light type appears optically heavier on the same weight.
          </p>
        </Panel>
        <Panel>
          <PanelTitle>Small-size comparison</PanelTitle>
          {[11, 13, 15].map((s) => (
            <p
              key={s}
              className="antialiased break-words border-b border-border/40 py-2 text-foreground last:border-0"
              style={{ fontFamily: font.stack, fontSize: `${s}px`, fontWeight: w, textRendering: mode as "auto" }}
            >
              {s}px — {text || SAMPLE}
            </p>
          ))}
        </Panel>
        <CodeOut code={code} testid="rendering-css" />
      </div>
    </CalcLayout>
  );
}
