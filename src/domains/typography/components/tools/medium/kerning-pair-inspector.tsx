"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Res, ResBox, Row, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const DEFAULT_PAIRS = ["AV", "To", "Yo", "LT", "Wa", "P.", "F,", "rg", "11", "fr"];

/**
 * Kerning Pair Inspector — measures the difference between the shaped pair and
 * the sum of its glyphs. The browser applies the face's own kerning when it
 * shapes text, so measuring "AV" against "A" + "V" exposes the adjustment the
 * font actually applied — the same number a designer would read from a kerning
 * table, obtained from the real renderer.
 */
export default function KerningPairInspector() {
  const [fontName, setFontName] = useState("Fraunces");
  const [size, setSize] = useState("64");
  const [pair, setPair] = useState("AV");
  const [text, setText] = useState(DEFAULT_PAIRS.join(" "));

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[1];
  const px = Math.min(200, Math.max(12, parseFloat(size) || 64));

  const measure = (s: string) => {
    if (typeof document === "undefined") return 0;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return 0;
    ctx.font = `${px}px ${font.stack}`;
    return ctx.measureText(s).width;
  };

  const shaped = measure(pair);
  const parts = [...pair].map((ch) => measure(ch));
  const sum = parts.reduce((a, b) => a + b, 0);
  const delta = shaped - sum; // negative = kerning tightened the pair
  const per1000 = sum > 0 ? (delta / px) * 1000 : 0;

  const rows = [...new Set([...text.split(/\s+/).filter((p) => p.length > 1), pair])].slice(0, 12).map((p) => {
    const s = measure(p);
    const sumP = [...p].map((ch) => measure(ch)).reduce((a, b) => a + b, 0);
    const d = s - sumP;
    return [
      <span key="p" style={{ fontFamily: font.stack }} className="text-base">
        {p}
      </span>,
      `${s.toFixed(2)}px`,
      `${sumP.toFixed(2)}px`,
      `${d >= 0 ? "+" : ""}${d.toFixed(2)}px`,
      `${((d / px) * 1000).toFixed(0)} / 1000 em`,
      Math.abs(d / px) > 0.02 ? "visibly kerned" : Math.abs(d / px) > 0.005 ? "slightly adjusted" : "no kerning applied",
    ];
  });

  const css = `.kern-pair {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  font-kerning: normal;   /* required: none disables the pair adjustments below */
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Pair</PanelTitle>
        <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
        <div className="mt-3 space-y-3">
          <TextInput name="pair" label="Pair to inspect" value={pair} onChange={setPair} placeholder="AV" />
          <SliderNum name="size" label="Measurement size" unit="px" value={size} onChange={setSize} min={12} max={200} step={2} />
          <TextInput name="text" label="Pair list (space separated)" value={text} onChange={setText} />
          <Row label="font-kerning">
            <span className="text-xs text-muted-foreground">normal (kerning enabled — required for a true measurement)</span>
          </Row>
        </div>
        <ResBox>
          <Res name="shaped" label="Shaped width" value={`${shaped.toFixed(3)}px`} />
          <Res name="sum" label="Sum of glyph widths" value={`${sum.toFixed(3)}px`} />
          <Res name="delta" label="Kerning adjustment" value={`${delta >= 0 ? "+" : ""}${delta.toFixed(3)}px`} />
          <Res name="per1000" label="In em/1000 units" value={`${per1000.toFixed(0)}`} />
          <Res
            name="verdict"
            label="Reading"
            value={delta < -0.001 ? "tightened — the classic kerned pair" : delta > 0.001 ? "loosened — the font adds space here" : "no adjustment — either no kern data or the pair needs none"}
          />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Pair rendered</PanelTitle>
          <p data-testid="kern-preview" style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: 1.1, fontKerning: "normal" }} className="text-foreground">
            {pair}
            <span className="ml-6 text-muted-foreground" style={{ fontKerning: "none" }}>
              {pair}
            </span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Left: kerning enabled. Right: kerning disabled — any visible difference is the font's own pair adjustment.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Pair table</PanelTitle>
          <RefTable
            cols={["Pair", "Shaped", "Sum of parts", "Δ", "Em/1000", "Verdict"]}
            rows={rows}
            minWidth={620}
            note="Measurements come from the browser's shaping engine at the size above; the em/1000 column is the unit kerning tables are authored in."
          />
        </Panel>

        <Panel>
          <PanelTitle>Reading kern values</PanelTitle>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>· A negative Δ means the pair was tightened — the usual case for diagonals meeting verticals (AV, To).</li>
            <li>· −20 to −60 em/1000 is a normal kern; beyond −100 the pair is visually merged and often needs optical spacing instead.</li>
            <li>· A zero Δ does not prove the face lacks kern data: many pairs genuinely need no adjustment.</li>
            <li>· Tracking (letter-spacing) is added on top of kerning and will hide small adjustments — measure with tracking at 0.</li>
          </ul>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-card/40 p-3 text-xs">
            <code>{css}</code>
          </pre>
        </Panel>
      </div>
    </CalcLayout>
  );
}
