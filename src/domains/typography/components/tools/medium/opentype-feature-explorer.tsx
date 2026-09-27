"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

interface Feature {
  tag: string;
  name: string;
  property?: string;
  sample: string;
  likely: string[];
}

const FEATURES: Feature[] = [
  { tag: "kern", name: "Kerning", sample: "AVATAR To Yo", likely: ["all"] },
  { tag: "liga", name: "Standard ligatures", sample: "ffi fl fi field office", likely: ["all"] },
  { tag: "dlig", name: "Discretionary ligatures", property: "font-variant-ligatures: discretionary-ligatures", sample: "ct st Th ck", likely: ["Fraunces", "Playfair Display"] },
  { tag: "smcp", name: "Small caps", property: "font-variant-caps: small-caps", sample: "Small Caps Sample", likely: ["Source Serif 4", "Lora"] },
  { tag: "onum", name: "Old-style figures", property: "font-variant-numeric: oldstyle-nums", sample: "0123456789", likely: ["Fraunces", "Lora", "Source Serif 4"] },
  { tag: "tnum", name: "Tabular figures", property: "font-variant-numeric: tabular-nums", sample: "1111\n9999", likely: ["Inter", "JetBrains Mono"] },
  { tag: "frac", name: "Fractions", property: "font-variant-numeric: diagonal-fractions", sample: "1/2 3/4 5/8", likely: ["Lora", "Source Serif 4"] },
  { tag: "sups", name: "Superiors (superscript)", property: "font-variant-position: super", sample: "x2 + y3 = z4", likely: ["Source Serif 4"] },
  { tag: "salt", name: "Stylistic alternates", property: "font-variant-alternates: stylistic(1)", sample: "a g y R", likely: ["Inter", "Space Grotesk"] },
  { tag: "ss01", name: "Stylistic set 01", sample: "a g y", likely: ["Fraunces", "Inter"] },
  { tag: "ss02", name: "Stylistic set 02", sample: "1 0 l I", likely: ["Inter"] },
  { tag: "case", name: "Case-sensitive forms", sample: "(A) [B] {C} — DASH", likely: ["all"] },
];

/**
 * OpenType Feature Explorer — toggles the OpenType features that webfonts
 * actually ship and shows the sample line changing. Two things are stated
 * honestly: features are font-dependent (a face that lacks a feature ignores
 * the request silently), and the modern CSS properties are preferred over raw
 * font-feature-settings because they inherit and cascade properly.
 */
export default function OpenTypeFeatureExplorer() {
  const [fontName, setFontName] = useState("Fraunces");
  const [size, setSize] = useState("40");
  const [enabled, setEnabled] = useState<string[]>(["kern", "liga"]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState("raw");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[1];
  const px = Math.min(120, Math.max(12, parseFloat(size) || 40));
  const active = FEATURES.filter((f) => enabled.includes(f.tag));

  const settingsOff = FEATURES.map((f) => `"${f.tag}" ${enabled.includes(f.tag) ? 1 : 0}`).join(", ");

  const css = `.features {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  ${mode === "raw"
      ? `font-feature-settings: ${settingsOff};
  font-kerning: ${enabled.includes("kern") ? "normal" : "none"};
  font-variant-ligatures: ${enabled.includes("liga") ? "common-ligatures" : "none"};`
      : `font-kerning: ${enabled.includes("kern") ? "normal" : "none"};
  ${active.map((f) => f.property).filter(Boolean).map((p) => `${p};`).join("\n  ") || "/* no property-mapped features enabled */"}`}
}`;

  const toggle = (tag: string) => setEnabled((e) => (e.includes(tag) ? e.filter((x) => x !== tag) : [...e, tag]));
  const supported = (f: Feature) => f.likely.includes("all") || f.likely.includes(font.name);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Face & features</PanelTitle>
        <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
        <div className="mt-3 space-y-3">
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={120} step={2} />
          <Sel
            name="mode"
            label="CSS mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "raw", label: "font-feature-settings (raw tags)" },
              { value: "props", label: "font-variant-* properties" },
            ]}
          />
          <TextInput name="text" label="Custom sample (optional)" value={text} onChange={setText} placeholder="leave blank to use each feature's own sample" />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Features ({enabled.length} on)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FEATURES.map((f) => (
                <button
                  key={f.tag}
                  type="button"
                  onClick={() => toggle(f.tag)}
                  title={f.name}
                  className={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors ${
                    enabled.includes(f.tag) ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {f.tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResBox>
          <Res name="on" label="Enabled" value={active.map((f) => f.tag).join(" ") || "none"} />
          <Res name="likely" label="Likely present in this face" value={active.filter(supported).map((f) => f.tag).join(" ") || "none of the enabled tags"} />
          <Res name="unsupported" label="Probably ignored" value={active.filter((f) => !supported(f)).map((f) => f.tag).join(" ") || "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          A feature the font does not contain is silently ignored — there is no error and no warning, which is why the panel
          lists which tags this face plausibly ships.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Samples</PanelTitle>
          <div className="space-y-3" data-testid="feature-preview">
            {FEATURES.map((f) => (
              <div key={f.tag} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {f.tag} · {f.name}
                </span>
                <p
                  className="mt-0.5 break-words text-foreground"
                  style={{
                    fontFamily: font.stack,
                    fontSize: `${px}px`,
                    lineHeight: 1.3,
                    fontFeatureSettings: `"${f.tag}" ${enabled.includes(f.tag) ? 1 : 0}`,
                  }}
                >
                  {(text || f.sample).split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Feature reference</PanelTitle>
          <RefTable
            cols={["Tag", "Feature", "Registered property", "Likely in this face"]}
            rows={FEATURES.map((f) => [f.tag, f.name, f.property ?? "—", supported(f) ? "yes" : "unconfirmed"])}
            minWidth={620}
          />
        </Panel>
        <CodeOut code={css} title="Generated CSS" testid="features-css" />
      </div>
    </CalcLayout>
  );
}
