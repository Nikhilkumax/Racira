"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, RefTable, Res, ResBox, Sel, fmtTrim } from "../ui";

/**
 * Modular Scale Calculator — pure geometric type-scale math.
 *   size(step) = base × ratio^step
 * Steps run −N…+N so the base row is step 0. Ratio values are the classic
 * musical/modular ratios; a custom ratio is accepted for anything else.
 */
const RATIOS: { value: string; label: string }[] = [
  { value: "1.067", label: "1.067 — Minor second" },
  { value: "1.125", label: "1.125 — Major second" },
  { value: "1.2", label: "1.200 — Minor third" },
  { value: "1.25", label: "1.250 — Major third" },
  { value: "1.333", label: "1.333 — Perfect fourth" },
  { value: "1.414", label: "1.414 — Augmented fourth" },
  { value: "1.5", label: "1.500 — Perfect fifth" },
  { value: "1.618", label: "1.618 — Golden ratio" },
  { value: "2", label: "2.000 — Octave" },
  { value: "custom", label: "Custom ratio…" },
];

export default function ModularScaleCalculator() {
  const [base, setBase] = useState("16");
  const [unit, setUnit] = useState("px");
  const [ratioSel, setRatioSel] = useState("1.25");
  const [custom, setCustom] = useState("1.3");
  const [steps, setSteps] = useState("4");
  const [root, setRoot] = useState("16");

  const b = parseFloat(base);
  const ratio = parseFloat(ratioSel === "custom" ? custom : ratioSel);
  const n = Math.min(10, Math.max(1, Math.round(parseFloat(steps) || 4)));
  const r = parseFloat(root) || 16;
  const valid = Number.isFinite(b) && b > 0 && Number.isFinite(ratio) && ratio > 1;

  const rows = [];
  for (let i = n; i >= -n; i--) {
    const size = valid ? b * ratio ** i : NaN;
    const label = i === 0 ? "base" : i > 0 ? `+${i}` : `${i}`;
    rows.push([
      label,
      `×${fmtTrim(ratio ** i, 4)}`,
      valid ? `${fmtTrim(size, 3)} ${unit}` : "—",
      valid && unit === "px" ? `${fmtTrim(size / r, 4)} rem` : valid ? `${fmtTrim(size * r, 3)} px` : "—",
    ]);
  }

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Scale</PanelTitle>
        <FormGrid>
          <Num name="base" label="Base size" unit={unit} value={base} onChange={setBase} />
          <Sel name="unit" label="Base unit" value={unit} onChange={setUnit} options={[
            { value: "px", label: "px" },
            { value: "rem", label: "rem" },
            { value: "pt", label: "pt" },
          ]} />
          <Sel name="ratio" label="Ratio" value={ratioSel} onChange={setRatioSel} options={RATIOS} />
          {ratioSel === "custom" && <Num name="custom" label="Custom ratio" value={custom} onChange={setCustom} step={0.001} />}
          <Num name="steps" label="Steps up & down" unit="0–10" value={steps} onChange={setSteps} step={1} />
          <Num name="root" label="Root size (for px↔rem)" unit="px" value={root} onChange={setRoot} />
        </FormGrid>
        <ResBox>
          <Res name="ratio" label="Effective ratio" value={valid ? fmtTrim(ratio, 4) : "—"} />
          <Res name="range" label="Scale range" value={valid ? `${fmtTrim(b * ratio ** -n, 2)} – ${fmtTrim(b * ratio ** n, 2)} ${unit}` : "—"} />
          <Res name="ratio2" label="Five-step size increase" value={valid ? `${fmtTrim(ratio ** 5, 3)}×` : "—"} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Scale table</PanelTitle>
        <RefTable
          cols={["Step", "Multiplier", unit, unit === "px" ? "rem (root)" : "px (root)"]}
          rows={rows}
          note={`size = base × ratio^step. Step 0 is the base size. ${unit === "px" ? `rem assumes a ${fmtTrim(r, 2)}px root.` : `px assumes a ${fmtTrim(r, 2)}px root.`}`}
        />
      </Panel>
    </CalcLayout>
  );
}
