"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

interface AxisDef {
  tag: string;
  name: string;
  min: number;
  max: number;
  def: number;
  registered: string;
}

const REGISTRY: Record<string, AxisDef[]> = {
  Fraunces: [
    { tag: "wght", name: "Weight", min: 300, max: 700, def: 400, registered: "font-weight" },
    { tag: "opsz", name: "Optical size", min: 9, max: 144, def: 14, registered: "font-optical-sizing" },
  ],
  "Source Serif 4": [
    { tag: "wght", name: "Weight", min: 300, max: 700, def: 400, registered: "font-weight" },
    { tag: "opsz", name: "Optical size", min: 8, max: 60, def: 12, registered: "font-optical-sizing" },
  ],
  Inter: [{ tag: "wght", name: "Weight", min: 300, max: 700, def: 400, registered: "font-weight" }],
  "DM Sans": [
    { tag: "wght", name: "Weight", min: 300, max: 700, def: 400, registered: "font-weight" },
    { tag: "opsz", name: "Optical size", min: 9, max: 40, def: 14, registered: "font-optical-sizing" },
  ],
};

const ALL_AXES: AxisDef[] = [
  { tag: "wght", name: "Weight", min: 100, max: 900, def: 400, registered: "font-weight" },
  { tag: "wdth", name: "Width", min: 75, max: 125, def: 100, registered: "font-stretch" },
  { tag: "slnt", name: "Slant", min: -15, max: 0, def: 0, registered: "— (font-style: oblique <angle>)" },
  { tag: "ital", name: "Italic", min: 0, max: 1, def: 0, registered: "font-style: italic" },
  { tag: "opsz", name: "Optical size", min: 6, max: 144, def: 14, registered: "font-optical-sizing" },
  { tag: "GRAD", name: "Grade", min: -200, max: 150, def: 0, registered: "—" },
  { tag: "SOFT", name: "Softness", min: 0, max: 100, def: 0, registered: "—" },
  { tag: "WONK", name: "Wonk", min: 0, max: 1, def: 0, registered: "—" },
];

/**
 * Variable Font Axis Exporter — exports a variable font as a complete CSS
 * contract: the @font-face with a weight range, the axis tokens as custom
 * properties, and the per-axis rendering rules that use the registered CSS
 * property where one exists. The axis table states which axes can be driven by a
 * standard property, which is the difference between cascade-friendly CSS and a
 * pile of font-variation-settings overrides.
 */
export default function VariableFontAxisExporter() {
  const [fontName, setFontName] = useState("Fraunces");
  const [family, setFamily] = useState("Racira Variable");
  const [url, setUrl] = useState("/fonts/racira-variable.woff2");
  const [weightAxis, setWeightAxis] = useState("300 700");
  const [stretchAxis, setStretchAxis] = useState("");
  const [sample, setSample] = useState("One file, every weight");
  const [size, setSize] = useState("44");

  const known = REGISTRY[fontName];
  const axes = known ?? ALL_AXES.filter((a) => a.tag === "wght");
  const px = Math.min(120, Math.max(12, parseFloat(size) || 44));
  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[1];

  const descriptor = (axis: AxisDef) =>
    axis.tag === "wght" ? `font-weight: ${weightAxis};` : axis.tag === "wdth" ? `font-stretch: ${stretchAxis || "100%"};` : axis.tag === "slnt" ? "font-style: oblique 0deg 12deg;" : axis.tag === "ital" ? "font-style: italic;" : `font-variation-settings: "${axis.tag}" ${axis.def};`;

  const face = `@font-face {
  font-family: "${family}";
  src: url("${url}") format("woff2-variations");
  ${axes.map(descriptor).map((d) => d.replace(/^/, "  ")).join("\n  ")}
  font-display: swap;
}`;

  const tokens = `:root {
${axes.map((a) => `  --axis-${a.tag.toLowerCase()}: ${a.def}; /* ${a.name}: ${a.min} – ${a.max} */`).join("\n")}
}

/* Registered properties participate in inheritance and cascade */
.variable-weight  { font-weight: var(--axis-wght); }
.variable-optical { font-optical-sizing: auto; }${
    axes.some((a) => a.registered === "—")
      ? `\n.axis-custom {\n${axes
          .filter((a) => a.registered === "—")
          .map((a) => `  font-variation-settings: "${a.tag}" ${a.def};`)
          .join("\n")}\n}`
      : ""
  }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Export settings</PanelTitle>
        <Sel name="font" label="Reference family" value={fontName} onChange={setFontName} options={Object.keys(REGISTRY).map((f) => ({ value: f, label: f }))} />
        <div className="mt-3 space-y-3">
          <TextInput name="family" label="CSS family name" value={family} onChange={setFamily} />
          <TextInput name="url" label="Font URL" value={url} onChange={setUrl} />
          <TextInput name="wght" label="Weight range descriptor" value={weightAxis} onChange={setWeightAxis} placeholder="300 700" />
          <TextInput name="wdth" label="Width range descriptor (optional)" value={stretchAxis} onChange={setStretchAxis} placeholder="75% 125%" />
          <TextInput name="sample" label="Sample text" value={sample} onChange={setSample} />
          <SliderNum name="size" label="Sample size" unit="px" value={size} onChange={setSize} min={12} max={120} step={2} />
        </div>
        <ResBox>
          <Res name="axes" label="Exported axes" value={axes.map((a) => a.tag).join(", ")} />
          <Res name="registry" label="Registered-property axes" value={axes.filter((a) => !a.registered.startsWith("—")).map((a) => a.tag).join(", ") || "none"} />
          <Res name="custom" label="Custom-only axes" value={axes.filter((a) => a.registered.startsWith("—")).map((a) => a.tag).join(", ") || "none"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Axis reference</PanelTitle>
          <RefTable
            cols={["Tag", "Name", "Range", "Default", "Driven by", "Notes"]}
            rows={axes.map((a) => [
              a.tag,
              a.name,
              `${a.min} – ${a.max}`,
              String(a.def),
              a.registered,
              a.registered.startsWith("—")
                ? "reachable only through font-variation-settings; locks inheritance for that axis"
                : "prefer the registered property so the value cascades and animates",
            ])}
            minWidth={700}
          />
        </Panel>

        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p
            data-testid="axis-preview"
            style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: 1.2, fontWeight: 500, fontVariationSettings: axes.map((a) => `"${a.tag}" ${a.def}`).join(", ") }}
            className="text-foreground"
          >
            {sample || "Variable"}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The preview drives the catalogue family's own axes; the exported CSS describes any variable font, so replace the
            family name and URL with the real asset.
          </p>
        </Panel>

        <CodeOut code={face} title="@font-face (variable)" testid="axis-face-css" />
        <CodeOut code={tokens} title="Axis tokens" testid="axis-tokens-css" />
        <Panel>
          <PanelTitle>Gotchas worth knowing</PanelTitle>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>· A variable font is one file but the browser still instantiates a face per weight it renders; keep the number of weights used in one view modest.</li>
            <li>· <span className="font-mono">font-variation-settings</span> overrides everything for that axis, including inherit­ance — use it last, not first.</li>
            <li>· Animating <span className="font-mono">font-weight</span> is smooth; animating <span className="font-mono">font-variation-settings</span> is not interpolated the same way in every engine.</li>
            <li>· Subsetting a variable font keeps the axes you keep — dropping an axis from a subset is possible but irreversible without the original.</li>
          </ul>
        </Panel>
      </div>
    </CalcLayout>
  );
}
