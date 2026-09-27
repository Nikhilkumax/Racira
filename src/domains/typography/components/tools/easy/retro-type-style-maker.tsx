"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

interface Era {
  name: string;
  family: string;
  palettes: string[][];
  treatment: { css: string; label: string };
  note: string;
}

const ERAS: Era[] = [
  {
    name: "1950s diner",
    family: "Bebas Neue",
    palettes: [["#e63946", "#f1faee", "#1d3557"], ["#f77f00", "#fcbf49", "#003049"]],
    treatment: { css: "text-shadow: 3px 3px 0 var(--accent);", label: "Hard offset shadow" },
    note: "Condensed caps with a hard two-colour offset — chrome and enamel signage.",
  },
  {
    name: "1970s warm",
    family: "Fraunces",
    palettes: [["#f4a261", "#e76f51", "#264653"], ["#e9c46a", "#f4a261", "#2a9d8f"]],
    treatment: { css: "letter-spacing: 0.02em; font-weight: 700;", label: "Soft rounded serif" },
    note: "Warm, slightly organic shapes with generous curves — the decade's analogue warmth.",
  },
  {
    name: "1980s neon",
    family: "Poppins",
    palettes: [["#ff006e", "#fb5607", "#8338ec"], ["#00f5d4", "#00bbf9", "#9b5de5"]],
    treatment: {
      css: "text-shadow: 0 0 6px currentColor, 0 0 18px currentColor, 0 0 36px currentColor;",
      label: "Multi-radius neon glow",
    },
    note: "Geometric sans with saturated cyan/magenta and a glow that bleeds into the background.",
  },
  {
    name: "1990s grunge",
    family: "Roboto Slab",
    palettes: [["#7f5a83", "#0d324d", "#d9d9d9"], ["#3d405b", "#81b29a", "#f2cc8f"]],
    treatment: { css: "text-shadow: 1px 1px 0 rgba(0,0,0,0.6); letter-spacing: -0.02em;", label: "Rough registration" },
    note: "Heavy slab caps with imperfect registration, as if printed on absorbent paper.",
  },
  {
    name: "Y2K chrome",
    family: "Space Grotesk",
    palettes: [["#b8c0ff", "#3d348b", "#7678ed"], ["#caf0f8", "#48cae4", "#023e8a"]],
    treatment: {
      css: "background: linear-gradient(180deg, #ffffff, var(--accent) 45%, #ffffff 55%, var(--ink)); -webkit-background-clip: text; color: transparent;",
      label: "Chrome gradient fill",
    },
    note: "A vertical light–dark–light ramp that reads as brushed metal.",
  },
];

/**
 * Retro Type Style Maker — decade presets that combine a face, a palette and a
 * CSS treatment, so the three decisions a retro look depends on move together
 * instead of being picked one at a time. The note under each preset names the
 * actual visual mechanism, which is what makes it reproducible rather than
 * nostalgic.
 */
export default function RetroTypeStyleMaker() {
  const [era, setEra] = useState(ERAS[2].name);
  const [text, setText] = useState("RETRO");
  const [size, setSize] = useState("72");
  const [paletteIdx, setPaletteIdx] = useState("0");
  const [intensity, setIntensity] = useState("1");

  const active = ERAS.find((e) => e.name === era) ?? ERAS[0];
  const font = FONTS.find((f) => f.name === active.family) ?? FONTS[2];
  const palette = active.palettes[Number(paletteIdx) % active.palettes.length];
  const px = Math.min(180, Math.max(24, parseFloat(size) || 72));
  const k = Math.min(3, Math.max(0.2, parseFloat(intensity) || 1));

  const css = `.retro {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  --accent: ${palette[0]};
  --ink: ${palette[2]};
  color: ${palette[2]};
  background: ${palette[1]};
  ${active.treatment.css.replace(/currentColor/g, palette[0])}
}`;

  const neon = active.name.includes("neon");
  const chrome = active.name.includes("chrome");
  const shadow = neon
    ? `0 0 ${6 * k}px ${palette[0]}, 0 0 ${18 * k}px ${palette[0]}, 0 0 ${36 * k}px ${palette[0]}`
    : active.name.includes("diner")
      ? `${3 * k}px ${3 * k}px 0 ${palette[0]}`
      : active.name.includes("grunge")
        ? `${1 * k}px ${1 * k}px 0 rgba(0,0,0,0.6)`
        : undefined;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Era preset</PanelTitle>
        <div className="space-y-3">
          <Sel name="era" label="Decade" value={era} onChange={setEra} options={ERAS.map((e) => ({ value: e.name, label: e.name }))} />
          <TextInput name="text" label="Text" value={text} onChange={setText} />
          <Sel
            name="palette"
            label="Palette"
            value={paletteIdx}
            onChange={setPaletteIdx}
            options={active.palettes.map((p, i) => ({ value: String(i), label: p.join(" · ") }))}
          />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={24} max={180} step={2} />
          <SliderNum name="k" label="Effect intensity" unit="×" value={intensity} onChange={setIntensity} min={0.2} max={3} step={0.1} />
        </div>
        <ResBox>
          <Res name="era" label="Face" value={`${font.name} (${font.kind})`} />
          <Res name="treatment" label="Treatment" value={active.treatment.label} />
          <Res name="palette" label="Palette" value={palette.join(" / ")} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="rounded-lg border border-border p-8" style={{ background: palette[1] }}>
            <p
              data-testid="retro-preview"
              className="break-words font-extrabold"
              style={{
                fontFamily: font.stack,
                fontSize: `${px}px`,
                lineHeight: 1.05,
                letterSpacing: active.name.includes("grunge") ? "-0.02em" : "0.02em",
                color: chrome ? "transparent" : palette[2],
                backgroundImage: chrome ? `linear-gradient(180deg, #ffffff, ${palette[0]} 45%, #ffffff 55%, ${palette[2]})` : undefined,
                WebkitBackgroundClip: chrome ? "text" : undefined,
                backgroundClip: chrome ? "text" : undefined,
                textShadow: chrome ? undefined : shadow,
              }}
            >
              {text || "RETRO"}
            </p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{active.note}</p>
        </Panel>
        <CodeOut code={css} testid="retro-css" />
      </div>
    </CalcLayout>
  );
}
