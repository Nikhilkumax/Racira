"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

const MATERIALS: Record<string, number> = {
  "Music wire (ASTM A228)": 80000,
  "Oil-tempered (A229)": 79400,
  "Hard-drawn (A227)": 79400,
  "Chrome-vanadium": 79300,
  "Chrome-silicon": 79300,
  "302 stainless": 70000,
  "17-7 PH stainless": 74500,
  "Phosphor bronze": 45000,
  "Beryllium copper": 48000,
};

/**
 * Spring Rate Calculator — coil compression spring rate and deflection.
 *   k = G·d⁴ / (8·D³·n)      (G, d, D in consistent units; N/mm² & mm → N/mm)
 *   deflection x = F / k
 * Active coils n excludes the closed/ground ends (count total − 2 typically).
 */
export default function SpringRateCalculator() {
  const [mat, setMat] = useState("Music wire (ASTM A228)");
  const [g, setG] = useState(String(MATERIALS["Music wire (ASTM A228)"]));
  const [d, setD] = useState("2");
  const [Dm, setDm] = useState("20");
  const [n, setN] = useState("5");
  const [load, setLoad] = useState("20");

  const setMatSel = (name: string) => {
    setMat(name);
    if (MATERIALS[name]) setG(String(MATERIALS[name]));
  };

  const gv = parseFloat(g);
  const dv = parseFloat(d);
  const Dv = parseFloat(Dm);
  const nv = parseFloat(n);
  const f = parseFloat(load);
  const valid = [gv, dv, Dv, nv].every(Number.isFinite) && dv > 0 && Dv > 0 && nv > 0;

  const k = valid ? (gv * Math.pow(dv, 4)) / (8 * Math.pow(Dv, 3) * nv) : NaN;
  const defl = valid && Number.isFinite(f) ? f / k : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Coil geometry</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="material"
            label="Material"
            value={mat}
            onChange={setMatSel}
            options={Object.keys(MATERIALS).map((m) => ({ value: m, label: m }))}
          />
          <FormGrid>
            <Num name="g" label="Shear modulus G" unit="N/mm²" value={g} onChange={setG} />
            <Num name="d" label="Wire diameter d" unit="mm" value={d} onChange={setD} />
            <Num name="dm" label="Mean coil diameter D" unit="mm" value={Dm} onChange={setDm} />
            <Num name="n" label="Active coils n" value={n} onChange={setN} />
            <Num name="load" label="Applied load F" unit="N" value={load} onChange={setLoad} />
          </FormGrid>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Mean diameter D = outside diameter − d. Active coils ≈ total coils − 2 for squared-and-ground ends.
          Spring index should sit between 4 and 12 for manufacturability (D/d).
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="k" label="Spring rate k" value={valid ? `${fmt(k, 3)} N/mm` : "—"} />
          <Res name="defl" label="Deflection at F" value={valid && Number.isFinite(defl) ? `${fmt(defl, 2)} mm` : "—"} />
          <Res name="index" label="Spring index (D/d)" value={valid ? fmt(Dv / dv, 2) : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Rate only — strength check against the corrected shear stress (τ = Ks·8FD/πd³ with Wahl factor) is a
          separate fatigue/static analysis.
        </p>
      </Panel>
    </CalcLayout>
  );
}
