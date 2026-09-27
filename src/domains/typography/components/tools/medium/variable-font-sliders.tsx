"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Radios, RefTable, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { DEFAULT_SAMPLE, FONTS } from "../fonts";

/** Axis ranges per family, as declared by the webfont request in the domain layout. */
const AXES: Record<string, { tag: string; name: string; min: number; max: number; step: number; def: number }[]> = {
  Inter: [{ tag: "wght", name: "Weight", min: 300, max: 700, step: 10, def: 400 }],
  Fraunces: [
    { tag: "wght", name: "Weight", min: 300, max: 700, step: 10, def: 400 },
    { tag: "opsz", name: "Optical size", min: 9, max: 144, step: 1, def: 14 },
    { tag: "SOFT", name: "Softness", min: 0, max: 100, step: 5, def: 0 },
  ],
  "Source Serif 4": [
    { tag: "wght", name: "Weight", min: 300, max: 700, step: 10, def: 400 },
    { tag: "opsz", name: "Optical size", min: 8, max: 60, step: 1, def: 12 },
  ],
  "DM Sans": [
    { tag: "wght", name: "Weight", min: 300, max: 700, step: 10, def: 400 },
    { tag: "opsz", name: "Optical size", min: 9, max: 40, step: 1, def: 14 },
  ],
  "JetBrains Mono": [{ tag: "wght", name: "Weight", min: 300, max: 700, step: 10, def: 400 }],
  Manrope: [{ tag: "wght", name: "Weight", min: 300, max: 700, step: 10, def: 400 }],
  Poppins: [{ tag: "wght", name: "Weight", min: 300, max: 700, step: 10, def: 400 }],
};

/**
 * Variable Font Sliders — drives the real axes of the variable families loaded
 * by the domain, one slider per axis, via font-variation-settings. Optical size
 * is the interesting axis: it changes the drawing of the face rather than its
 * weight, and the readout states the pairing with the actual type size.
 */
export default function VariableFontSliders() {
  const variable = FONTS.filter((f) => AXES[f.name]);
  const [fontName, setFontName] = useState("Fraunces");
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [size, setSize] = useState("48");
  const [values, setValues] = useState<Record<string, number>>({ wght: 400, opsz: 48, SOFT: 0 });
  const [mode, setMode] = useState("variation");

  const font = FONTS.find((f) => f.name === fontName) ?? variable[0];
  const axes = AXES[font.name] ?? AXES.Inter;
  const px = Math.min(160, Math.max(12, parseFloat(size) || 48));

  const settings = axes.map((a) => `"${a.tag}" ${values[a.tag] ?? a.def}`).join(", ");
  const css = `.variable-type {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  ${mode === "variation"
      ? `font-variation-settings: ${settings};`
      : `font-weight: ${values.wght ?? 400};${values.opsz ? `\n  font-optical-sizing: auto;` : ""}`}
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Variable axes</PanelTitle>
        <Sel
          name="font"
          label="Variable family"
          value={fontName}
          onChange={(v) => {
            setFontName(v);
            const next: Record<string, number> = {};
            for (const a of AXES[v] ?? AXES.Inter) next[a.tag] = a.def;
            setValues(next);
          }}
          options={variable.map((f) => ({ value: f.name, label: `${f.name} (${AXES[f.name].length} axis)` }))}
        />
        <div className="mt-3 space-y-3">
          <TextInput name="text" label="Sample text" value={text} onChange={setText} />
          <SliderNum name="size" label="Type size" unit="px" value={size} onChange={setSize} min={12} max={160} step={1} />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              CSS mode
            </span>
            <Radios
              name="mode"
              value={mode}
              onChange={setMode}
              ariaLabel="css mode"
              options={[
                { value: "variation", label: "font-variation-settings" },
                { value: "standard", label: "font-weight / optical-sizing" },
              ]}
            />
          </div>
          {axes.map((a) => (
            <SliderNum
              key={a.tag}
              name={`axis-${a.tag}`}
              label={`${a.name} (${a.tag})`}
              value={String(values[a.tag] ?? a.def)}
              onChange={(v) => setValues((s) => ({ ...s, [a.tag]: parseFloat(v) || 0 }))}
              min={a.min}
              max={a.max}
              step={a.step}
            />
          ))}
        </div>
        <ResBox>
          <Res name="count" label="Axes on this family" value={String(axes.length)} />
          <Res name="settings" label="Current settings" value={settings} />
          <Res name="opsz" label="Optical size vs type size" value={
            axes.some((a) => a.tag === "opsz")
              ? `${values.opsz ?? "-"} axis / ${(size)}px — ${Math.abs((values.opsz ?? 0) - px) < px * 0.25 ? "matched" : "mismatched"}`
              : "no opsz axis"
          }
          />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p
            data-testid="variable-preview"
            className="break-words text-foreground"
            style={{
              fontFamily: font.stack,
              fontSize: `${px}px`,
              lineHeight: 1.15,
              fontVariationSettings: settings,
              fontOpticalSizing: "auto",
            }}
          >
            {text || DEFAULT_SAMPLE}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Two ways to reach the same axis: font-variation-settings takes raw four-character tags and overrides everything,
            while the registered CSS properties (font-weight, font-optical-sizing) participate in inheritance and cascade.
            Prefer the registered properties except where no standard property exists for an axis.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Axis reference</PanelTitle>
          <RefTable
            cols={["Tag", "Name", "Range", "Registered CSS property"]}
            rows={axes.map((a) => [
              a.tag,
              a.name,
              `${a.min} – ${a.max}`,
              a.tag === "wght" ? "font-weight" : a.tag === "opsz" ? "font-optical-sizing" : a.tag === "wdth" ? "font-stretch" : a.tag === "ital" ? "font-style: italic" : "none — font-variation-settings only",
            ])}
            minWidth={520}
          />
        </Panel>
        <CodeOut code={css} testid="variable-css" />
      </div>
    </CalcLayout>
  );
}
