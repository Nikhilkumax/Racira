"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

interface StylePreset {
  name: string;
  family: string;
  css: string;
  note: string;
}

/** Six hand-lettering traditions expressed as CSS approximations. */
const PRESETS: StylePreset[] = [
  {
    name: "Brush script",
    family: "Fraunces",
    css: "font-style: italic; font-weight: 600; letter-spacing: 0.01em; transform: rotate(-1.5deg);",
    note: "Continuous thick–thin stroke with a slight bounce; approximated with an italic serif plus a hair of rotation.",
  },
  {
    name: "Sans marker",
    family: "Space Grotesk",
    css: "font-weight: 700; letter-spacing: -0.01em; text-shadow: 0.5px 0.5px 0 currentColor;",
    note: "Single-weight wide marker; the text-shadow fakes the ink bleed.",
  },
  {
    name: "Slab poster",
    family: "Roboto Slab",
    css: "font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em;",
    note: "Heavy slab caps, the wood-type tradition.",
  },
  {
    name: "Condensed display",
    family: "Bebas Neue",
    css: "font-weight: 400; letter-spacing: 0.01em;",
    note: "Narrow caps with uniform stroke: the poster and packaging default.",
  },
  {
    name: "Geometric monoline",
    family: "Poppins",
    css: "font-weight: 500; letter-spacing: 0.06em;",
    note: "Circles and straight lines, even stroke weight — the modern logo face.",
  },
  {
    name: "Ink pen",
    family: "Lora",
    css: "font-style: italic; font-weight: 400; letter-spacing: 0.005em;",
    note: "A true italic serif has the calligraphic entry and exit strokes of a pen.",
  },
];

/**
 * Lettering Style Previewer — previews the common hand-lettering traditions as
 * close CSS approximations, with the caveat stated in the panel: real
 * lettering has stroke modulation, bounce and irregular spacing that no font
 * reproduces. Use the presets to pick a direction, then letter it properly.
 */
export default function LetteringStylePreviewer() {
  const [preset, setPreset] = useState(PRESETS[0].name);
  const [text, setText] = useState("Hand lettered");
  const [size, setSize] = useState("64");
  const [tracking, setTracking] = useState("0");
  const [slant, setSlant] = useState("-1.5");

  const active = PRESETS.find((p) => p.name === preset) ?? PRESETS[0];
  const font = FONTS.find((f) => f.name === active.family) ?? FONTS[1];
  const px = Math.min(160, Math.max(18, parseFloat(size) || 64));
  const tr = Math.min(0.3, Math.max(-0.05, parseFloat(tracking) || 0));
  const rot = Math.min(6, Math.max(-6, parseFloat(slant) || 0));

  const css = `.lettering {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  letter-spacing: ${tr.toFixed(4)}em;
  transform: rotate(${rot.toFixed(2)}deg);
  ${active.css.replace(/;\s*$/, "")};
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Style</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="preset"
            label="Lettering tradition"
            value={preset}
            onChange={setPreset}
            options={PRESETS.map((p) => ({ value: p.name, label: p.name }))}
          />
          <TextInput name="text" label="Text" value={text} onChange={setText} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={18} max={160} step={2} />
          <SliderNum name="tracking" label="Tracking" unit="em" value={tracking} onChange={setTracking} min={-0.05} max={0.3} step={0.005} />
          <SliderNum name="slant" label="Baseline slant" unit="deg" value={slant} onChange={setSlant} min={-6} max={6} step={0.5} />
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p
            data-testid="lettering-preview"
            className="break-words text-foreground"
            style={{
              fontFamily: font.stack,
              fontSize: `${px}px`,
              letterSpacing: `${tr}em`,
              transform: `rotate(${rot}deg)`,
              fontStyle: active.css.includes("italic") ? "italic" : "normal",
              fontWeight: active.css.match(/font-weight:\s*(\d+)/)?.[1] ? Number(active.css.match(/font-weight:\s*(\d+)/)![1]) : 400,
              textTransform: active.css.includes("uppercase") ? "uppercase" : "none",
            }}
          >
            {text || "Hand lettered"}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{active.note}</p>
        </Panel>

        <Panel>
          <PanelTitle>What a font cannot fake</PanelTitle>
          <RefTable
            cols={["Lettering property", "Why CSS approximations fall short"]}
            rows={[
              ["Stroke modulation", "A real nib widens and narrows along the stroke; a font keeps one outline per glyph."],
              ["Bounce", "Hand lettering puts each letter on its own baseline; rotation on the whole word only tilts it."],
              ["Irregular spacing", "Manual lettering tightens and loosens per pair, which is the source of the hand-made feel."],
              ["Ink texture", "Bleed, dry brush and paper grain are raster effects, not outlines."],
              ["Ligature drawing", "Hand letterers design a connection per letter pair rather than reusing one glyph."],
            ]}
            minWidth={540}
          />
        </Panel>
        <CodeOut code={css} testid="lettering-css" />
      </div>
    </CalcLayout>
  );
}
