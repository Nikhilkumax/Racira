"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Sel, TextInput, fmtTrim } from "../ui";
import { DEFAULT_SAMPLE, FONTS, WEIGHTS } from "../fonts";

const DEFAULT_SIZES = "12, 14, 16, 18, 21, 24, 30, 36, 48, 60";

/**
 * Font Size Preview — a size ladder with unit conversion baked in. px is the
 * CSS authoring unit, rem is what browsers actually resolve against the root
 * font size, and pt is the print unit (1pt = 1/72in ≈ 1.333px at 96dpi).
 */
export default function FontSizePreview() {
  const [fontName, setFontName] = useState("Source Serif 4");
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [sizes, setSizes] = useState(DEFAULT_SIZES);
  const [root, setRoot] = useState("16");
  const [weight, setWeight] = useState("400");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const r = Math.max(4, parseFloat(root) || 16);
  const w = parseFloat(weight) || 400;
  const parsed = sizes
    .split(/[,\s]+/)
    .map((n) => parseFloat(n))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 300);

  const rows = parsed.map((px) => [
    `${fmtTrim(px, 2)}px`,
    `${fmtTrim(px / r, 4)}rem`,
    `${fmtTrim(px * 0.75, 3)}pt`,
    `${fmtTrim(px * 1.5, 2)}px`,
  ]);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Settings</PanelTitle>
        <Sel
          name="font"
          label="Font family"
          value={fontName}
          onChange={setFontName}
          options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
        />
        <div className="mt-3 space-y-3">
          <TextInput name="text" label="Sample text" value={text} onChange={setText} />
          <TextInput name="sizes" label="Sizes (px, comma-separated)" value={sizes} onChange={setSizes} />
          <TextInput name="root" label="Root font size" unit="px" value={root} onChange={setRoot} />
          <Sel
            name="weight"
            label="Weight"
            value={weight}
            onChange={setWeight}
            options={WEIGHTS.map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="space-y-3">
            {parsed.map((px) => (
              <div key={px} className="flex items-baseline gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="w-16 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{px}px</span>
                <span
                  className="min-w-0 flex-1 break-words text-foreground"
                  style={{ fontFamily: font.stack, fontSize: `${px}px`, fontWeight: w, lineHeight: 1.25 }}
                >
                  {text || DEFAULT_SAMPLE}
                </span>
              </div>
            ))}
            {parsed.length === 0 && <p className="text-sm text-muted-foreground">Enter at least one size.</p>}
          </div>
        </Panel>
        <Panel>
          <PanelTitle>Unit conversion</PanelTitle>
          <RefTable
            cols={["px", "rem", "pt", "1.5× line box"]}
            rows={rows}
            note={`rem assumes a ${fmtTrim(r, 2)}px root font size. pt is the CSS print unit (1pt = 1/72in).`}
            minWidth={320}
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
