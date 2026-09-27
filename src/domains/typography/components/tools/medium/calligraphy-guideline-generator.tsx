"use client";

import { useState } from "react";
import { Btn, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";

type Script = "italic" | "foundational" | "copperplate" | "uncial";

interface ScriptSpec {
  label: string;
  nibWidths: number;
  slant: number;
  xHeightMm: number;
  note: string;
}

/** Classic nib-width proportions for the four common broad-edge/calligraphic scripts. */
const SCRIPTS: Record<Script, ScriptSpec> = {
  italic: { label: "Italic (cancellaresca)", nibWidths: 5, slant: 8, xHeightMm: 6, note: "5 nib widths of x-height, a modest forward slant, generous ascenders." },
  foundational: { label: "Foundational hand", nibWidths: 4, slant: 0, xHeightMm: 5, note: "4 nib widths, upright, circular bowls — the teaching script." },
  copperplate: { label: "Copperplate (pointed pen)", nibWidths: 0, slant: 55, xHeightMm: 7, note: "Pointed nib: proportion comes from the pointed-stroke ratio, not nib widths; steep 55° slant." },
  uncial: { label: "Uncial", nibWidths: 5, slant: 0, xHeightMm: 7, note: "5 nib widths, upright, rounded majuscule forms with almost no ascenders." },
};

/**
 * Calligraphy Guideline Generator — builds the ruled sheet a calligrapher writes
 * on. The x-height is expressed in nib widths for broad-edge scripts (the way the
 * proportions are actually taught) and in millimetres for pointed-pen work, with
 * the slant, ascender and descender rules derived from the chosen script.
 */
export default function CalligraphyGuidelineGenerator() {
  const [script, setScript] = useState<Script>("italic");
  const [nib, setNib] = useState("2");
  const [xHeightMm, setXHeightMm] = useState("6");
  const [slant, setSlant] = useState("8");
  const [lines, setLines] = useState("6");
  const [copy, setCopy] = useState("abcdefghijklmnopqrstuvwxyz");

  const spec = SCRIPTS[script];
  const nibMm = Math.max(0.5, parseFloat(nib) || 2);
  const xh = Boolean(spec.nibWidths) ? Math.max(2, nibMm * spec.nibWidths) : Math.max(2, parseFloat(xHeightMm) || 6);
  const sl = Math.min(75, Math.max(0, parseFloat(slant) || spec.slant));
  const n = Math.min(10, Math.max(1, Math.round(parseFloat(lines) || 6)));

  const pxPerMm = 3.78; // ≈ 96dpi
  const xhPx = xh * pxPerMm;
  const ascPx = xhPx * 1.6;
  const descPx = xhPx * 0.7;
  const rowPx = ascPx + xhPx + descPx + 16;
  const slantOffset = Math.tan((sl * Math.PI) / 180) * xhPx;

  const specs = [
    ["x-height", `${fmtTrim(xh, 2)}mm`, Boolean(spec.nibWidths) ? `${spec.nibWidths} nib widths of a ${fmtTrim(nibMm, 1)}mm nib` : `${fmtTrim(xh, 1)}mm specified directly`],
    ["Ascender", `${fmtTrim(xh * 1.6, 2)}mm`, "≈ 1.6× x-height"],
    ["Descender", `${fmtTrim(xh * 0.7, 2)}mm`, "≈ 0.7× x-height"],
    ["Slant", `${sl}°`, spec.label.includes("pointed") ? "pointed-pen scripts need a steeper slant" : "broad-edge scripts sit near upright"],
    ["Nib width", `${fmtTrim(nibMm, 2)}mm`, "drives the x-height for broad-edge scripts"],
    ["Line spacing", `${fmtTrim(rowPx / pxPerMm, 2)}mm`, "ascender + x-height + descender plus a small gap"],
  ];

  return (
    <div className="space-y-4">
      <Panel className="print:hidden">
        <PanelTitle>Script & proportions</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <Sel
            name="script"
            label="Script"
            value={script}
            onChange={(v) => {
              setScript(v as Script);
              const s = SCRIPTS[v as Script];
              setSlant(String(s.slant));
              setXHeightMm(String(s.xHeightMm));
            }}
            options={Object.entries(SCRIPTS).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <SliderNum name="nib" label="Nib width" unit="mm" value={nib} onChange={setNib} min={0.5} max={8} step={0.25} />
          <SliderNum name="xh" label="x-height (pointed pen)" unit="mm" value={xHeightMm} onChange={setXHeightMm} min={2} max={20} step={0.5} />
          <SliderNum name="slant" label="Slant" unit="deg" value={slant} onChange={setSlant} min={0} max={75} step={1} />
          <SliderNum name="lines" label="Guide rows" value={lines} onChange={setLines} min={1} max={10} step={1} />
          <TextInput name="copy" label="Practice alphabet" value={copy} onChange={setCopy} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Btn onClick={() => window.print()}>Print guidelines</Btn>
          <span className="text-xs text-muted-foreground">{spec.note}</span>
        </div>
        <ResBox>
          <Res name="xh" label="x-height used" value={`${fmtTrim(xh, 2)}mm`} />
          <Res name="nib" label="Nib ratio" value={Boolean(spec.nibWidths) ? `${spec.nibWidths} × nib` : "pointed — not nib based" } />
          <Res name="slant" label="Slant offset" value={`${fmtTrim(slantOffset / pxPerMm, 2)}mm per x-height`} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Proportions</PanelTitle>
        <RefTable cols={["Measure", "Value", "Derivation"]} rows={specs} minWidth={560} />
      </Panel>

      <div data-testid="calligraphy-sheet" className="rounded-xl border border-border bg-white p-4 shadow-sm">
        {Array.from({ length: n }, (_, r) => (
          <div key={r} className="relative border-b border-neutral-100" style={{ height: `${rowPx}px` }}>
            <div className="absolute left-0 right-0 border-t border-neutral-400" style={{ bottom: `${descPx + 8}px` }} />
            <div className="absolute left-0 right-0 border-t border-dashed border-sky-300" style={{ bottom: `${descPx + 8 + xhPx}px` }} />
            <div className="absolute left-0 right-0 border-t border-dashed border-emerald-300" style={{ bottom: `${descPx + 8 + xhPx + ascPx * 0.62}px` }} />
            <div className="absolute left-0 right-0 border-t border-dashed border-rose-300" style={{ bottom: `${descPx + 8 + xhPx + ascPx}px` }} />
            {sl > 0 && (
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-violet-300"
                style={{ left: `${40 + slantOffset}px`, transform: `skewX(-${sl}deg)`, transformOrigin: "bottom" }}
              />
            )}
            <span className="absolute left-4 font-mono text-neutral-500" style={{ bottom: `${descPx + 8}px`, fontSize: `${xhPx * 0.55}px`, lineHeight: 1 }}>
              {copy}
            </span>
          </div>
        ))}
        <p className="mt-2 text-[10px] text-neutral-500">
          baseline solid · x-height and ascender dashed · slant {sl}° · x-height {fmtTrim(xh, 2)}mm · row {fmtTrim(rowPx / pxPerMm, 2)}mm
        </p>
      </div>
    </div>
  );
}
