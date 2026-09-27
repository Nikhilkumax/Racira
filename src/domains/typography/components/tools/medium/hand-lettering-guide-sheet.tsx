"use client";

import { useState } from "react";
import { Btn, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

type GuideKind = "xheight" | "capheight" | "ascender" | "slant";

/**
 * Hand-Lettering Guide Sheet — generates the guide lines a lettering practice
 * sheet needs: baseline, x-height, cap-height, ascender and descender lines, plus
 * an optional slant guide. The proportions are expressed as ratios of the
 * x-height, which is how exemplars are specified, and the sheet prints at 100%.
 */
export default function HandLetteringGuideSheet() {
  const [word, setWord] = useState("Racira");
  const [kind, setKind] = useState<GuideKind>("xheight");
  const [xHeight, setXHeight] = useState("48");
  const [capRatio, setCapRatio] = useState("1.45");
  const [ascRatio, setAscRatio] = useState("1.6");
  const [descRatio, setDescRatio] = useState("0.75");
  const [slant, setSlant] = useState("12");
  const [rows, setRows] = useState("4");
  const [family, setFamily] = useState("Fraunces");

  const xh = Math.max(12, parseFloat(xHeight) || 48);
  const capR = Math.max(1, parseFloat(capRatio) || 1.45);
  const ascR = Math.max(capR, parseFloat(ascRatio) || 1.6);
  const descR = Math.max(0.2, parseFloat(descRatio) || 0.75);
  const sl = Math.min(45, Math.max(0, parseFloat(slant) || 12));
  const n = Math.min(8, Math.max(1, Math.round(parseFloat(rows) || 4)));

  const font = FONTS.find((f) => f.name === family) ?? FONTS[1];
  const rowHeight = xh * (ascR + descR) + 24;
  const sheetHeight = n * rowHeight + 24;
  const slantOffset = Math.tan((sl * Math.PI) / 180) * xh;

  const specs = [
    ["x-height", `${xh}px`, "the lowercase body — the primary unit everything else is measured against"],
    ["Cap height", `${(xh * capR).toFixed(0)}px`, `${capR.toFixed(2)}× x-height — capitals are usually 1.4–1.5× the x-height`],
    ["Ascender", `${(xh * ascR).toFixed(0)}px`, `${ascR.toFixed(2)}× x-height — b, d, h, k, l extend here`],
    ["Descender", `${(xh * descR).toFixed(0)}px`, `${descR.toFixed(2)}× x-height — g, j, p, q, y drop below the baseline`],
    ["Stroke angle", `${sl}°`, "the slant guide; keep it consistent while practising"],
    ["Total row", `${rowHeight.toFixed(0)}px`, "the vertical space each practice line needs"],
  ];

  return (
    <div className="space-y-4">
      <Panel className="print:hidden">
        <PanelTitle>Sheet settings</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput name="word" label="Practice word" value={word} onChange={setWord} />
          <Sel
            name="kind"
            label="Guide set"
            value={kind}
            onChange={(v) => setKind(v as GuideKind)}
            options={[
              { value: "xheight", label: "Full set (x-height, caps, ascender, descender)" },
              { value: "capheight", label: "Cap-height only" },
              { value: "ascender", label: "Ascender / descender focus" },
              { value: "slant", label: "Slant practice" },
            ]}
          />
          <Sel name="family" label="Reference face" value={family} onChange={setFamily} options={FONTS.filter((f) => f.kind !== "mono").map((f) => ({ value: f.name, label: f.name }))} />
          <SliderNum name="xh" label="x-height" unit="px" value={xHeight} onChange={setXHeight} min={12} max={120} step={2} />
          <SliderNum name="cap" label="Cap ÷ x-height" value={capRatio} onChange={setCapRatio} min={1} max={1.8} step={0.05} />
          <SliderNum name="asc" label="Ascender ÷ x-height" value={ascRatio} onChange={setAscRatio} min={1.1} max={2.2} step={0.05} />
          <SliderNum name="desc" label="Descender ÷ x-height" value={descRatio} onChange={setDescRatio} min={0.2} max={1.4} step={0.05} />
          <SliderNum name="slant" label="Slant" unit="deg" value={slant} onChange={setSlant} min={0} max={45} step={1} />
          <SliderNum name="rows" label="Practice rows" value={rows} onChange={setRows} min={1} max={8} step={1} />
        </div>
        <div className="mt-4 flex items-center gap-3 print:hidden">
          <Btn onClick={() => window.print()}>Print guide sheet</Btn>
          <span className="text-xs text-muted-foreground">Guide lines are light grey so practice strokes stay dominant.</span>
        </div>
        <ResBox>
          <Res name="row" label="Row height" value={`${rowHeight.toFixed(0)}px`} />
          <Res name="sheet" label="Sheet height" value={`${sheetHeight.toFixed(0)}px`} />
          <Res name="offset" label="Slant offset per x-height" value={`${slantOffset.toFixed(1)}px`} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Guide specifications</PanelTitle>
        <RefTable cols={["Line", "Value", "Notes"]} rows={specs} minWidth={560} />
      </Panel>

      <div
        data-testid="guide-sheet"
        className="rounded-xl border border-border bg-white p-4 shadow-sm"
        style={{ fontFamily: font.stack }}
      >
        {Array.from({ length: n }, (_, r) => (
          <div key={r} className="relative border-b border-neutral-200" style={{ height: `${rowHeight}px` }}>
            {/* guide lines, positioned from the baseline upward */}
            <div className="absolute left-0 right-0 border-t border-dashed border-sky-300" style={{ bottom: `${xh * descR + 12}px` }} />
            <div className="absolute left-0 right-0 border-t border-neutral-400" style={{ bottom: `${xh * 1 + xh * descR + 12 - xh}px` }} />
            {kind !== "capheight" && (
              <div className="absolute left-0 right-0 border-t border-dashed border-emerald-300" style={{ bottom: `${xh * descR + 12}px` }} />
            )}
            <div className="absolute left-0 right-0 border-t border-dashed border-rose-300" style={{ bottom: `${xh * ascR + xh * descR + 12}px` }} />
            <div className="absolute left-0 right-0 border-t border-dashed border-amber-300" style={{ bottom: "12px" }} />
            {sl > 0 && (
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-violet-300"
                style={{ left: `${40 + slantOffset}px`, transform: `skewX(-${sl}deg)`, transformOrigin: "bottom" }}
              />
            )}
            <span
              className="absolute left-4 text-neutral-800"
              style={{ bottom: `${xh * descR + 12}px`, fontSize: `${xh}px`, lineHeight: 1 }}
            >
              {word}
            </span>
          </div>
        ))}
        <p className="mt-2 text-[10px] text-neutral-500">
          baseline · x-height {xh}px · cap {(xh * capR).toFixed(0)}px · ascender {(xh * ascR).toFixed(0)}px · slant {sl}°
        </p>
      </div>
    </div>
  );
}
