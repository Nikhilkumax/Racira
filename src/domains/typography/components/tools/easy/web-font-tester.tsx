"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Radios, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { DEFAULT_SAMPLE, FONTS } from "../fonts";

const VARIANTS = [
  { value: "swap", label: "swap (fallback first, then swap)" },
  { value: "block", label: "block (invisible up to 3s)" },
  { value: "fallback", label: "fallback (100ms, then fallback)" },
  { value: "optional", label: "optional (skip on slow links)" },
];

/**
 * Web Font Tester — a webfont only exists on the page once the network answers.
 * This tool previews the two states a reader can actually see (fallback and
 * loaded) and reports the layout-shift cost of each `font-display` strategy,
 * so the choice is made on the real trade-off rather than on the loaded state
 * alone.
 */
export default function WebFontTester() {
  const [fontName, setFontName] = useState("Manrope");
  const [variant, setVariant] = useState("swap");
  const [text, setText] = useState(DEFAULT_SAMPLE);
  const [size, setSize] = useState("20");
  const [blocks, setBlocks] = useState("3");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(72, Math.max(10, parseFloat(size) || 20));
  const n = Math.min(20, Math.max(1, Math.round(parseFloat(blocks) || 3)));

  /* Fallback metrics are unknown without the real font file, so the estimate
     uses the conventional ±3–6% line-height delta between a webfont and a
     system fallback. */
  const shiftPct = variant === "swap" ? 4 : variant === "fallback" ? 1.5 : variant === "block" ? 0 : 4;

  const css = `@font-face {
  font-family: "${font.name}";
  src: url("/fonts/${font.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.woff2") format("woff2");
  font-display: ${variant};
  font-weight: 300 700;
}

.text-block { font-family: ${font.stack}; font-size: ${(px / 16).toFixed(4)}rem; }`;

  const verdict: Record<string, string> = {
    swap: "Text visible immediately; one layout shift when the webfont lands.",
    block: "No fallback shown; blank text up to 3s — avoid for body copy.",
    fallback: "100ms block then fallback forever; rarely shifts, but may never show the webfont.",
    optional: "Uses the webfont only if cached/fast; zero shift for returning visitors.",
  };

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Font & strategy</PanelTitle>
        <Sel
          name="font"
          label="Web font"
          value={fontName}
          onChange={setFontName}
          options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
        />
        <div className="mt-3 space-y-3">
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              font-display
            </span>
            <Radios name="variant" value={variant} onChange={setVariant} options={VARIANTS} ariaLabel="font-display strategy" />
          </div>
          <TextInput name="text" label="Sample text" value={text} onChange={setText} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={10} max={72} step={1} />
          <SliderNum name="blocks" label="Text blocks on screen" value={blocks} onChange={setBlocks} min={1} max={20} step={1} />
        </div>
        <ResBox>
          <Res name="strategy" label="Strategy" value={variant} />
          <Res name="shift" label="Estimated shift per block" value={`±${shiftPct}% line height`} />
          <Res name="cls" label="Total shift risk" value={`${(shiftPct * n).toFixed(1)}% across ${n} block(s)`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Before the webfont arrives (fallback)</PanelTitle>
          <p
            data-testid="fallback-state"
            style={{ fontFamily: "system-ui, 'Segoe UI', Arial, sans-serif", fontSize: `${px}px`, lineHeight: 1.5 }}
            className="text-foreground/80"
          >
            {text || DEFAULT_SAMPLE}
          </p>
        </Panel>
        <Panel>
          <PanelTitle>After the webfont arrives</PanelTitle>
          <p
            data-testid="loaded-state"
            style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: 1.5 }}
            className="text-foreground"
          >
            {text || DEFAULT_SAMPLE}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {verdict[variant]} Swap only works in your favour when the two faces have similar line-height metrics — otherwise
            the paragraph jumps by exactly the amount estimated above.
          </p>
          <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
            <li>· Preload the file used above the fold; defer the rest.</li>
            <li>· Subset to the characters a page actually uses.</li>
            <li>· Tune `size-adjust`, `ascent-override` and `descent-override` to match the fallback metrics.</li>
          </ul>
        </Panel>
        <CodeOut code={css} testid="webfont-css" />
      </div>
    </CalcLayout>
  );
}
