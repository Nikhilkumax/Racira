"use client";

import { useMemo, useState } from "react";
import { CalcLayout, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "../easy/ui";

/**
 * Thread Fit Calculator — ISO 965-1 metric thread tolerance arithmetic.
 *
 * Basic profile (ISO 68-1):  d2 = d − 0.6495·P,  d1 = d − 1.0825·P
 * Grade-6 widths (ISO 965-1 formulae, µm):
 *   Td2(6) = 90·P^0.4·d_m^0.1   (d_m = geometric mean of the diameter range)
 *   Td(6)  = 180·P^(2/3) − 3.15/√P
 *   TD1(6) = 230·P^0.7          (P ≥ 1)  |  433·P − 190·P^1.22  (P < 1)
 * Grade multipliers — external pitch Td2: 4:0.63, 5:0.8, 6:1, 7:1.25, 8:1.6;
 * internal pitch TD2 (relative to Td2(6)): 4:0.85, 5:1.06, 6:1.32, 7:1.7, 8:2.12;
 * major Td and minor TD1: 4:0.63, 5:0.8, 6:1, 7:1.25, 8:1.6.
 * Fundamental deviations es (µm): h = 0; g per ISO 965-1 table;
 * f = −(30+11·P); e = −(50+11·P). Internal H: EI = 0.
 * Results are computed values; the published ISO 965-2 limits can differ by
 * a few µm from the raw formulae due to the standard's rounding.
 */
const PITCHES = [0.8, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

/** ISO 965-1 es(g) fundamental deviation table, µm (common pitch series). */
const ES_G: Record<number, number> = { 0.8: 20, 1: 26, 1.25: 28, 1.5: 32, 1.75: 34, 2: 38, 2.5: 42, 3: 48 };

const RANGES: [number, number][] = [
  [0.99, 1.4], [1.4, 2.8], [2.8, 5.6], [5.6, 11.2], [11.2, 22.4], [22.4, 45], [45, 90],
];
function rangeMean(d: number): number {
  const r = RANGES.find(([lo, hi]) => d > lo && d <= hi) ?? RANGES[RANGES.length - 1];
  return Math.sqrt(r[0] * r[1]);
}

const EXT_GRADE_F = { 4: 0.63, 5: 0.8, 6: 1, 7: 1.25, 8: 1.6 } as const;
const INT_GRADE_F = { 4: 0.85, 5: 1.06, 6: 1.32, 7: 1.7, 8: 2.12 } as const;

function esFor(pos: string, p: number): number {
  if (pos === "h") return 0;
  if (pos === "g") return ES_G[p] ?? 26;
  if (pos === "f") return 30 + 11 * p;
  return 50 + 11 * p; // e
}

export default function ThreadFitCalculator() {
  const [d, setD] = useState("12");
  const [pitch, setPitch] = useState("1.75");
  const [intClass, setIntClass] = useState("6H");
  const [extClass, setExtClass] = useState("6g");

  const out = useMemo(() => {
    const dv = parseFloat(d);
    const pv = parseFloat(pitch);
    if (!Number.isFinite(dv) || !Number.isFinite(pv) || dv <= 0 || pv <= 0) return null;

    const dm = rangeMean(dv);
    const d2 = dv - 0.6495 * pv;
    const d1 = dv - 1.0825 * pv;

    const intGrade = parseInt(intClass[0], 10);
    const extGrade = parseInt(extClass[0], 10);
    const extPos = extClass[1];

    const es = esFor(extPos, pv); // µm, positive magnitude below nominal

    const tD2_6 = 90 * Math.pow(pv, 0.4) * Math.pow(dm, 0.1); // µm
    const td2 = tD2_6 * EXT_GRADE_F[extGrade as keyof typeof EXT_GRADE_F];
    const td = (180 * Math.pow(pv, 2 / 3) - 3.15 / Math.sqrt(pv)) * EXT_GRADE_F[extGrade as keyof typeof EXT_GRADE_F];
    const tD2 = tD2_6 * INT_GRADE_F[intGrade as keyof typeof INT_GRADE_F];
    const tD1_6 = pv >= 1 ? 230 * Math.pow(pv, 0.7) : 433 * pv - 190 * Math.pow(pv, 1.22);
    const tD1 = tD1_6 * EXT_GRADE_F[intGrade as keyof typeof EXT_GRADE_F];

    const um = (n: number) => n / 1000;
    return {
      d2, d1,
      es,
      dMax: dv - um(es),
      dMin: dv - um(es) - um(td),
      d2Max: d2 - um(es),
      d2Min: d2 - um(es) - um(td2),
      D2Min: d2,
      D2Max: d2 + um(tD2),
      D1Min: d1,
      D1Max: d1 + um(tD1),
      clearMin: d2 - (d2 - um(es)),          // D2Min − d2Max
      clearMax: d2 + um(tD2) - (d2 - um(es) - um(td2)), // D2Max − d2Min
      td2, td, tD2, tD1,
    };
  }, [d, pitch, intClass, extClass]);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Thread</PanelTitle>
        <div className="space-y-3">
          <Num name="d" label="Nominal diameter d" unit="mm" value={d} onChange={setD} />
          <Sel
            name="pitch"
            label="Pitch P"
            value={pitch}
            onChange={setPitch}
            options={PITCHES.map((p) => ({ value: String(p), label: `${p} mm` }))}
          />
          <Sel
            name="int-class"
            label="Internal class (nut / tapped hole)"
            value={intClass}
            onChange={setIntClass}
            options={[4, 5, 6, 7, 8].map((g) => ({ value: `${g}H`, label: `${g}H` }))}
          />
          <Sel
            name="ext-class"
            label="External class (bolt / screw)"
            value={extClass}
            onChange={setExtClass}
            options={[4, 5, 6, 7, 8].flatMap((g) =>
              ["h", "g", "f", "e"].map((pos) => ({ value: `${g}${pos}`, label: `${g}${pos}` })),
            )}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Defaults are the commercial standard M12 × 1.75 with a 6H/6g fit. Basic pitch diameter
          d2 = d − 0.6495·P; basic minor diameter d1 = d − 1.0825·P.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result — limits in mm</PanelTitle>
        {out ? (
          <ResBox>
            <Res name="es" label="Allowance (es / EI)" value={out.es === 0 ? "0 (position h / H)" : `${out.es} µm`} />
            <Res name="d-ext" label="External major d" value={`${fmt(out.dMax)} – ${fmt(out.dMin)}`} />
            <Res name="d2-ext" label="External pitch d2" value={`${fmt(out.d2Max)} – ${fmt(out.d2Min)}`} />
            <Res name="d2-int" label="Internal pitch D2" value={`${fmt(out.D2Min)} – ${fmt(out.D2Max)}`} />
            <Res name="d1-int" label="Internal minor D1" value={`${fmt(out.D1Min)} – ${fmt(out.D1Max)}`} />
            <Res name="clear-min" label="Min clearance (pitch)" value={`${fmt(out.clearMin, 3)} mm`} />
            <Res name="clear-max" label="Max clearance (pitch)" value={`${fmt(out.clearMax, 3)} mm`} />
            <Res
              name="fit"
              label="Fit"
              value={out.clearMin >= 0 ? "Clearance fit" : "Interference"}
            />
            <Res name="widths" label="Tolerances Td2 / TD2 / Td / TD1" value={`${Math.round(out.td2)} / ${Math.round(out.tD2)} / ${Math.round(out.td)} / ${Math.round(out.tD1)} µm`} />
          </ResBox>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a valid nominal diameter and pitch.</p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Values are computed from the ISO 965-1 tolerance formulae. The published ISO 965-2
          limit tables may differ by a few micrometres due to the standard&apos;s rounding; check a
          handbook table when the number feeds a gauge design.
        </p>
      </Panel>
    </CalcLayout>
  );
}