"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Row, Sel, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

/**
 * @font-face Declaration Builder — a single declaration with the descriptors
 * that matter in production: `font-display`, `unicode-range` for subsetting
 * scope, and the `size-adjust` / `ascent-override` / `descent-override` trio
 * that metrics-matches a fallback so the swap does not shift layout. The
 * readout estimates the adjusted line box so the override is chosen by number.
 */
export default function FontFaceDeclarationBuilder() {
  const [family, setFamily] = useState("Racira Display");
  const [src, setSrc] = useState("/fonts/racira-display.woff2");
  const [format, setFormat] = useState("woff2");
  const [weight, setWeight] = useState("400 700");
  const [display, setDisplay] = useState("swap");
  const [sizeAdjust, setSizeAdjust] = useState("100");
  const [ascent, setAscent] = useState("100");
  const [descent, setDescent] = useState("25");
  const [unicodeRange, setUnicodeRange] = useState("");

  const sizeAdj = Math.min(200, Math.max(50, parseFloat(sizeAdjust) || 100));
  const asc = Math.min(200, Math.max(50, parseFloat(ascent) || 100));
  const desc = Math.min(100, Math.max(0, parseFloat(descent) || 25));
  const naturalBox = asc + desc; // in % of em, before size-adjust

  const css = `@font-face {
  font-family: "${family}";
  src: url("${src}") format("${format}");
  font-weight: ${weight};
  font-display: ${display};
  size-adjust: ${fmtTrim(sizeAdj, 2)}%;
  ascent-override: ${fmtTrim(asc, 2)}%;
  descent-override: ${fmtTrim(desc, 2)}%;${unicodeRange.trim() ? `\n  unicode-range: ${unicodeRange.trim()};` : ""}
}`;

  const fallbackCss = `/* metrics-matched fallback for the swap period */
@font-face {
  font-family: "${family} fallback";
  src: local("Arial"), local("Helvetica"), local("Liberation Sans");
  size-adjust: ${fmtTrim(sizeAdj, 2)}%;
  ascent-override: ${fmtTrim(asc, 2)}%;
  descent-override: ${fmtTrim(desc, 2)}%;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Descriptors</PanelTitle>
        <div className="space-y-3">
          <TextInput name="family" label="font-family" value={family} onChange={setFamily} />
          <TextInput name="src" label="src URL" value={src} onChange={setSrc} />
          <Sel
            name="format"
            label="format()"
            value={format}
            onChange={setFormat}
            options={[
              { value: "woff2", label: "woff2" },
              { value: "woff", label: "woff" },
              { value: "truetype", label: "truetype" },
              { value: "opentype", label: "opentype" },
            ]}
          />
          <TextInput name="weight" label="font-weight" value={weight} onChange={setWeight} placeholder="400 or 400 700" />
          <Sel
            name="display"
            label="font-display"
            value={display}
            onChange={setDisplay}
            options={["auto", "block", "swap", "fallback", "optional"].map((v) => ({ value: v, label: v }))}
          />
          <TextInput
            name="range"
            label="unicode-range (optional)"
            value={unicodeRange}
            onChange={setUnicodeRange}
            placeholder="U+0000-00FF, U+0131"
          />
        </div>
        <ResBox>
          <Res name="box" label="Overridden em box" value={`${fmtTrim(naturalBox, 2)}% of em`} />
          <Res
            name="normalized"
            label="Line-height 1.0 renders as"
            value={`${fmtTrim(((asc + desc) / 100) * 1, 3)}em before size-adjust`}
          />
          <Res name="matched" label="Adjusted for size-adjust" value={`${fmtTrim((naturalBox / 100) * (sizeAdj / 100), 3)}em`} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Metric overrides</PanelTitle>
        {[
          { label: "size-adjust", value: sizeAdjust, set: setSizeAdjust, min: 50, max: 200, unit: "%" },
          { label: "ascent-override", value: ascent, set: setAscent, min: 50, max: 200, unit: "%" },
          { label: "descent-override", value: descent, set: setDescent, min: 0, max: 100, unit: "%" },
        ].map((f) => (
          <Row key={f.label} label={`${f.label} (${f.unit})`} controlWidth="sm:w-72">
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={1}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="w-full accent-primary"
            />
            <div className="mt-1 text-right font-mono text-xs text-muted-foreground">{f.value}</div>
          </Row>
        ))}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The three overrides let a webfont adopt the metrics of the fallback face it replaces, so the swap shifts nothing.
          Reference values for common fallbacks: Arial ascent 90.5 / descent 21.2 · Georgia 91.7 / 21.9 · Segoe UI 107.9 / 26.8.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Available in this preview set:{" "}
          {FONTS.slice(0, 5)
            .map((f) => f.name)
            .join(", ")}
          .
        </p>
      </Panel>

      <div className="space-y-4 lg:col-span-2">
        <CodeOut code={css} title="@font-face" testid="face-css" />
        <CodeOut code={fallbackCss} title="Metrics-matched fallback" testid="fallback-css" />
      </div>
    </CalcLayout>
  );
}
