"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, TextInput } from "../ui";
import { DEFAULT_SAMPLE, FONTS } from "../fonts";

/**
 * Waterfall Font Preview — the same sample rendered down a size ladder, so
 * fit, weight and rhythm can be judged at every size in one screen. The size
 * list is editable (comma-separated) so the ladder can match a real scale.
 */
const DEFAULT_SIZES = "12, 14, 16, 20, 24, 32, 40, 56, 72, 96";

export default function WaterfallFontPreview() {
  const [fontName, setFontName] = useState("Inter");
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [sizes, setSizes] = useState(DEFAULT_SIZES);
  const [weight, setWeight] = useState("400");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const s = parseFloat(weight) || 400;
  const parsed = sizes
    .split(/[,\s]+/)
    .map((n) => parseFloat(n))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 300)
    .slice(0, 14);

  const css = [
    `.waterfall-${font.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")} {`,
    `  font-family: ${font.stack};`,
    ...parsed.map((size) => `  /* ${size}px */`),
    `}`,
  ].join("\n");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Specimen</PanelTitle>
        <Sel
          name="font"
          label="Font family"
          value={fontName}
          onChange={setFontName}
          options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
        />
        <div className="mt-3 space-y-3">
          <TextInput name="text" label="Sample text" value={text} onChange={setText} />
          <TextInput name="sizes" label="Size ladder (px, comma-separated)" value={sizes} onChange={setSizes} />
          <Sel
            name="weight"
            label="Weight"
            value={weight}
            onChange={setWeight}
            options={[300, 400, 500, 600, 700].map((w) => ({ value: String(w), label: String(w) }))}
          />
        </div>
        <ResBox>
          <Res name="count" label="Sizes rendered" value={String(parsed.length)} />
          <Res name="range" label="Range" value={parsed.length ? `${Math.min(...parsed)} – ${Math.max(...parsed)}px` : "—"} />
          <Res name="family" label="Family kind" value={font.kind} />
          <Res name="loader" label="Font loading" value="webfonts preloaded by this domain's layout" />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Waterfall</PanelTitle>
          <div className="space-y-4">
            {parsed.map((size) => (
              <div key={size} className="flex items-baseline gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="w-14 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{size}px</span>
                <span
                  className="min-w-0 flex-1 truncate text-foreground"
                  style={{ fontFamily: font.stack, fontSize: `${size}px`, fontWeight: s, lineHeight: 1.15 }}
                  title={text}
                >
                  {text || "Sample text"}
                </span>
              </div>
            ))}
            {parsed.length === 0 && <p className="text-sm text-muted-foreground">Enter at least one size.</p>}
          </div>
        </Panel>
        <CodeOut code={css} title="Reference" testid="waterfall-css" />
      </div>
    </CalcLayout>
  );
}
