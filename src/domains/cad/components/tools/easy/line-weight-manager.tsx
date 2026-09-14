"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Panel, PanelTitle, Res, ResBox, Sel, RefTable } from "./ui";

/** ISO 128 pen series (mm). Consecutive pens differ by √2 ≈ 1.41. */
const PENS = [0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1.0, 1.4, 2.0];

/** Largest series pen ≤ x. */
function snapDown(x: number): number {
  let best = PENS[0];
  for (const p of PENS) if (p <= x + 1e-9) best = p;
  return best;
}

/** Nearest series pen, clamped strictly between thin and thick. */
function snapMedium(x: number, thin: number): number {
  let best = PENS[PENS.length - 1];
  for (const p of PENS) if (Math.abs(p - x) < Math.abs(best - x)) best = p;
  if (best <= thin) best = PENS.find((p) => p > thin) ?? best;
  return best;
}

const W_OPTIONS = [0.35, 0.5, 0.7, 1.0];

/**
 * Line Weight Manager — assigns every standard line type a concrete pen width.
 * Two policies are offered: the plain 1:2 rule (thin = thick/2) and the
 * √2-series drafting-room practice that gives hidden lines a medium width.
 * Computed widths snap onto the ISO 128 pen series so the result maps cleanly
 * onto real CAD pen tables.
 */
export default function LineWeightManager() {
  const [policy, setPolicy] = useState("two");
  const [thick, setThick] = useState("0.7");

  const W = parseFloat(thick);
  const valid = Number.isFinite(W) && W > 0;
  const three = policy === "three";

  const thinRaw = W / 2;
  const medRaw = W / Math.sqrt(2);
  const thin = valid ? snapDown(thinRaw) : NaN;
  const medium = valid ? snapMedium(medRaw, thin) : NaN;
  const effThick = valid ? snapDown(W) : NaN;

  const pen = (group: "thick" | "medium" | "thin") =>
    group === "thick" ? effThick : group === "medium" ? (three ? medium : thin) : thin;

  const ROWS: [string, string, number][] = [
    ["Visible outline / edge", "thick", pen("thick")],
    ["Cutting-plane line", "thick", pen("thick")],
    ["Hidden line", three ? "medium" : "thin", three ? pen("medium") : pen("thin")],
    ["Center / symmetry line", "thin", pen("thin")],
    ["Dimension, extension & leader", "thin", pen("thin")],
    ["Section hatching", "thin", pen("thin")],
    ["Phantom (adjacent / alternate part)", "thin", pen("thin")],
    ["Long break line", "thin", pen("thin")],
  ];

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Pen policy</PanelTitle>
        <FormGrid>
          <Sel
            name="policy"
            label="Width policy"
            value={policy}
            onChange={setPolicy}
            options={[
              { value: "two", label: "Two widths — thin = thick ÷ 2 (ISO 128 / ASME Y14.2)" },
              { value: "three", label: "Three widths — √2 pen series (drafting-room practice)" },
            ]}
          />
          <Sel
            name="thick"
            label="Thick-line pen (mm)"
            value={thick}
            onChange={setThick}
            options={W_OPTIONS.map((w) => ({ value: String(w), label: `${w} mm` }))}
          />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          ISO 128 standardises the pen series 0.13 → 2.0 mm in √2 steps. Adjacent pens give a 1.4:1
          contrast that reads as “same family”; skipping a pen gives the crisp 2:1 contrast used to
          separate visible geometry from everything else. The 1:2 policy assigns every non-visible
          line the same thin pen; the √2 policy gives hidden lines a middle pen, which is common
          when drawings are plotted at reduced scale.
        </p>
      </Panel>
      <div className="space-y-4">
        <Panel>
          <PanelTitle>Assigned widths</PanelTitle>
          <ResBox>
            <Res name="thick" label="Thick pen (visible, cutting plane)" value={valid ? `${fmtPen(effThick)} mm` : "—"} />
            <Res name="medium" label="Medium pen (hidden — √2 policy)" value={valid ? (three ? `${fmtPen(medium)} mm` : "— (not used)") : "—"} />
            <Res name="thin" label="Thin pen (all remaining types)" value={valid ? `${fmtPen(thin)} mm` : "—"} />
          </ResBox>
        </Panel>
        <RefTable
          title="Line-type map"
          cols={["Line type", "Group", "Width"]}
          rows={ROWS.map(([name, grp, w]) => [name, grp, valid ? `${fmtPen(w)} mm` : "—"])}
          note={`Ratio thick:thin = ${valid ? ratio(effThick, thin) : "—"}${three && valid ? `, thick:medium = ${ratio(effThick, medium)}` : ""}. Colours stay out of the weight decision: a layer convention (Batch 1’s layer-naming tool) maps each layer to one of these three pens at plot time.`}
        />
      </div>
    </CalcLayout>
  );
}

function fmtPen(w: number): string {
  return String(parseFloat(w.toFixed(3)));
}

function ratio(a: number, b: number): string {
  if (!(a > 0 && b > 0)) return "—";
  return `≈${parseFloat((a / b).toFixed(1))}:1`;
}
