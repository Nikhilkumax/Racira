"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";

/**
 * CSS Variable Font Builder — assembles the three rules a variable font needs
 * in production: the @font-face with a weight range, a fallback face whose
 * metrics are close enough to survive the swap, and a usage rule that prefers
 * the registered properties (font-weight, font-stretch) over raw axis settings.
 * The fallback paragraph is previewed with the webfont disabled.
 */
export default function CssVariableFontBuilder() {
  const [family, setFamily] = useState("Racira Variable");
  const [url, setUrl] = useState("/fonts/racira-variable.woff2");
  const [range, setRange] = useState("300 800");
  const [fallback, setFallback] = useState("Arial");
  const [sizeAdjust, setSizeAdjust] = useState("100");
  const [weight, setWeight] = useState("500");
  const [stretch, setStretch] = useState("100");
  const [text, setText] = useState("Variable fonts: one file, a continuous range.");

  const adj = Math.min(150, Math.max(60, parseFloat(sizeAdjust) || 100));
  const w = Math.min(900, Math.max(100, parseFloat(weight) || 500));
  const st = Math.min(150, Math.max(50, parseFloat(stretch) || 100));

  const css = `@font-face {
  font-family: "${family}";
  src: url("${url}") format("woff2-variations");
  font-weight: ${range};
  font-stretch: 75% 125%;
  font-display: swap;
}

/* metrics-matched fallback for the swap period */
@font-face {
  font-family: "${family} fallback";
  src: local("${fallback}");
  size-adjust: ${adj}%;
}

:root {
  --font-variable: "${family}", "${family} fallback", system-ui, sans-serif;
}

.variable-type {
  font-family: var(--font-variable);
  font-weight: ${w};          /* drives the wght axis */
  font-stretch: ${st}%;       /* drives the wdth axis */
  font-optical-sizing: auto;  /* drives opsz if the font has it */
}`;

  const fallbackCss = `:root { --font-variable: "${fallback}", system-ui, sans-serif; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Variable font</PanelTitle>
        <div className="space-y-3">
          <TextInput name="family" label="Family name" value={family} onChange={setFamily} />
          <TextInput name="url" label="Font URL" value={url} onChange={setUrl} />
          <TextInput name="range" label="Weight range descriptor" value={range} onChange={setRange} placeholder="300 800" />
          <Sel
            name="fallback"
            label="Fallback face"
            value={fallback}
            onChange={setFallback}
            options={["Arial", "Helvetica", "Georgia", "Verdana", "Segoe UI", "system-ui"].map((f) => ({ value: f, label: f }))}
          />
          <SliderNum name="adjust" label="Fallback size-adjust" unit="%" value={sizeAdjust} onChange={setSizeAdjust} min={60} max={150} step={1} />
          <SliderNum name="weight" label="font-weight used" value={weight} onChange={setWeight} min={100} max={900} step={50} />
          <SliderNum name="stretch" label="font-stretch used" unit="%" value={stretch} onChange={setStretch} min={50} max={150} step={5} />
          <TextInput name="text" label="Sample" value={text} onChange={setText} />
        </div>
        <ResBox>
          <Res name="full" label="Weight range" value={range} />
          <Res name="adjust" label="size-adjust" value={`${adj}%`} />
          <Res name="requests" label="Requests" value="1 font file (variable) + optional preload" />
          <Res name="fallback" label="If the webfont fails" value={`${fallback} at ${adj}% size`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Rendering</PanelTitle>
          <p
            data-testid="variable-css-preview"
            style={{ fontFamily: `system-ui, ${fallback}, sans-serif`, fontSize: `${Math.round(28 * (adj / 100))}px`, fontWeight: w, fontStretch: `${st}%`, lineHeight: 1.3 }}
            className="text-foreground"
          >
            {text || "Sample"}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The preview uses the fallback face at the adjusted size, because that is the version most first-time visitors
            actually see. Match it to the webfont and the swap becomes invisible.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Enhancement ladder</PanelTitle>
          <RefTable
            cols={["Layer", "Rule", "What it adds"]}
            rows={[
              ["1 · Fallback", `font-family: ${fallback}, system-ui, sans-serif`, "always renders; no font request at all"],
              ["2 · Metrics match", `size-adjust: ${adj}%`, "removes the layout shift when the webfont lands"],
              ["3 · Variable face", `@font-face { font-weight: ${range} }`, "one file covers the whole weight range"],
              ["4 · Registered properties", `font-weight / font-stretch / optical-sizing`, "axes that inherit, cascade and animate"],
              ["5 · Raw axes", 'font-variation-settings: "GRAD" 0', "only for axes with no standard property"],
            ]}
            minWidth={620}
          />
        </Panel>

        <CodeOut code={css} title="Full CSS" testid="variable-css-full" />
        <CodeOut code={fallbackCss} title="No-JS / font-blocked fallback" testid="variable-css-fallback" />
      </div>
    </CalcLayout>
  );
}
