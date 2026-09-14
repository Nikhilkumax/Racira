"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel } from "./ui";

/** decimal places of the tolerance values (0.05 → 2). */
const decimals = (v: string): number => {
  const s = String(v);
  const i = s.indexOf(".");
  return i < 0 ? 0 : s.length - i - 1;
};

/**
 * Tolerance Notation Formatter — render unilateral/bilateral tolerances the way
 * a drawing should: aligned decimals, explicit signs, symmetrical auto ±.
 */
export default function ToleranceNotationFormatter() {
  const [unit, setUnit] = useState("mm");
  const [nominal, setNominal] = useState("25.4");
  const [plus, setPlus] = useState("0.05");
  const [minus, setMinus] = useState("0.05");

  const d = Math.max(decimals(plus), decimals(minus));
  const nominalN = parseFloat(nominal);
  const plusN = parseFloat(plus || "0");
  const minusN = parseFloat(minus || "0");
  const valid = Number.isFinite(nominalN) && Number.isFinite(plusN) && Number.isFinite(minusN);

  const sym = valid && Math.abs(plusN - minusN) < 1e-12;
  const maxD = valid ? Math.max(decimals(nominal), d) : 2;

  let text: string;
  if (!valid) text = "—";
  else if (sym) text = `${nominalN.toFixed(maxD)} ± ${plusN.toFixed(d)}`;
  else text = `${nominalN.toFixed(maxD)} +${plusN.toFixed(d)} -${minusN.toFixed(d)}`;

  const hi = valid ? nominalN + plusN : NaN;
  const lo = valid ? nominalN - minusN : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Dimensions</PanelTitle>
        <FormGrid>
          <Num name="nominal" label="Nominal size" unit={unit} value={nominal} onChange={setNominal} />
          <Sel
            name="unit"
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={["mm", "cm", "in"].map((u) => ({ value: u, label: u }))}
          />
          <Num name="plus" label="Plus tolerance" unit={unit} value={plus} onChange={setPlus} />
          <Num name="minus" label="Minus tolerance" unit={unit} value={minus} onChange={setMinus} />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Enter both tolerances as positive numbers. Equal values are collapsed to a single “±”; unequal values
          render as stacked-style “+ / −” notation with matching decimal places.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Dimension callout</PanelTitle>
        <p
          data-testid="res-callout"
          className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-lg font-semibold text-primary"
        >
          {text}
        </p>
        <div className="mt-4">
          <ResBox>
            <Res name="hi" label="Maximum size" value={valid ? `${fmtHi(hi, maxD)} ${unit}` : "—"} />
            <Res name="lo" label="Minimum size" value={valid ? `${fmtHi(lo, maxD)} ${unit}` : "—"} />
            <Res name="band" label="Total tolerance band" value={valid ? `${((plusN + minusN)).toFixed(Math.max(d, 3))} ${unit}` : "—"} />
          </ResBox>
        </div>
      </Panel>
    </CalcLayout>
  );
}

const fmtHi = (n: number, d: number) => (Number.isFinite(n) ? n.toFixed(d) : "—");
