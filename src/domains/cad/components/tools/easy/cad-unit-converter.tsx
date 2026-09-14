"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmtTrim } from "./ui";

const FACTORS_MM: Record<string, number> = {
  µm: 0.001,
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
};
const UNITS = Object.keys(FACTORS_MM);

/**
 * CAD Unit Converter — length conversion across the units a CAD model or
 * drawing actually mixes (µm, mm, cm, m, in, ft). mm is the pivot.
 */
export default function CadUnitConverter() {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState("in");
  const [to, setTo] = useState("mm");

  const v = parseFloat(value);
  const valid = Number.isFinite(v);
  const inMm = valid ? v * FACTORS_MM[from] : NaN;
  const out = valid ? inMm / FACTORS_MM[to] : NaN;
  const factor = FACTORS_MM[from] / FACTORS_MM[to];

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Conversion</PanelTitle>
        <FormGrid>
          <Num name="value" label="Value" value={value} onChange={setValue} />
          <div />
          <Sel
            name="from"
            label="From"
            value={from}
            onChange={setFrom}
            options={UNITS.map((u) => ({ value: u, label: u }))}
          />
          <Sel
            name="to"
            label="To"
            value={to}
            onChange={setTo}
            options={UNITS.map((u) => ({ value: u, label: u }))}
          />
        </FormGrid>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res
            name="value"
            label={`${fmtTrim(v, 4) || "—"} ${from} =`}
            value={valid ? `${fmtTrim(out, 4)} ${to}` : "—"}
          />
          <Res name="factor" label={`1 ${from} = … ${to}`} value={`${fmtTrim(factor, 6)} ${to}`} />
          <Res name="scale" label="mm per unit" value={`${fmtTrim(FACTORS_MM[from], 4)} mm`} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Exact factors: 1 in = 25.4 mm, 1 ft = 304.8 mm, 1 m = 1000 mm. CAD files that mix drawing units
          (imperial title block, metric model) are the usual source of 25.4× scaling errors.
        </p>
      </Panel>
    </CalcLayout>
  );
}
