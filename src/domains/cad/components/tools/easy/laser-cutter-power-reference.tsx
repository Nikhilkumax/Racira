"use client";

import { useMemo, useState } from "react";
import { CalcLayout, FormGrid, Panel, PanelTitle, Res, ResBox, Sel, fmtTrim } from "./ui";

type SetRow = { t: number; kw: number; speed: number; kerf: number };

/**
 * Indicative laser cutting settings. Each material lists rows of
 * [thickness mm, machine power kW, cut speed m/min at that power, kerf mm].
 * Speeds are “best cut” — verify with a trial on the actual machine.
 */
const CO2: Record<string, SetRow[]> = {
  "Mild steel": [
    { t: 1.5, kw: 1, speed: 8, kerf: 0.12 },
    { t: 3, kw: 1.5, speed: 5, kerf: 0.15 },
    { t: 6, kw: 2, speed: 3, kerf: 0.2 },
    { t: 10, kw: 4, speed: 1.6, kerf: 0.25 },
    { t: 20, kw: 6, speed: 0.8, kerf: 0.3 },
  ],
  "Stainless steel": [
    { t: 1.5, kw: 1, speed: 7, kerf: 0.12 },
    { t: 3, kw: 1.5, speed: 4, kerf: 0.15 },
    { t: 6, kw: 2, speed: 2.4, kerf: 0.2 },
    { t: 10, kw: 4, speed: 1.2, kerf: 0.25 },
    { t: 20, kw: 6, speed: 0.6, kerf: 0.3 },
  ],
  Aluminium: [
    { t: 1.5, kw: 1, speed: 4, kerf: 0.15 },
    { t: 3, kw: 2, speed: 2, kerf: 0.2 },
    { t: 6, kw: 4, speed: 1, kerf: 0.25 },
  ],
  Acrylic: [
    { t: 3, kw: 0.12, speed: 0.8, kerf: 0.1 },
    { t: 6, kw: 0.15, speed: 0.5, kerf: 0.1 },
    { t: 10, kw: 0.2, speed: 0.3, kerf: 0.12 },
    { t: 20, kw: 0.4, speed: 0.12, kerf: 0.15 },
  ],
  "Wood / plywood": [
    { t: 3, kw: 0.15, speed: 1.2, kerf: 0.2 },
    { t: 6, kw: 0.2, speed: 0.7, kerf: 0.2 },
    { t: 10, kw: 0.3, speed: 0.4, kerf: 0.25 },
    { t: 18, kw: 0.5, speed: 0.2, kerf: 0.25 },
    { t: 25, kw: 0.8, speed: 0.1, kerf: 0.3 },
  ],
};

const FIBER: Record<string, SetRow[]> = {
  "Mild steel": [
    { t: 1.5, kw: 1, speed: 15, kerf: 0.1 },
    { t: 3, kw: 1.5, speed: 7, kerf: 0.12 },
    { t: 6, kw: 3, speed: 3.5, kerf: 0.18 },
    { t: 10, kw: 4, speed: 1.8, kerf: 0.22 },
    { t: 20, kw: 6, speed: 1, kerf: 0.3 },
  ],
  "Stainless steel": [
    { t: 1.5, kw: 1, speed: 12, kerf: 0.1 },
    { t: 3, kw: 1.5, speed: 5.5, kerf: 0.12 },
    { t: 6, kw: 3, speed: 2.8, kerf: 0.18 },
    { t: 10, kw: 4, speed: 1.5, kerf: 0.22 },
    { t: 20, kw: 6, speed: 0.8, kerf: 0.3 },
  ],
  Aluminium: [
    { t: 1.5, kw: 1, speed: 10, kerf: 0.12 },
    { t: 3, kw: 2, speed: 5, kerf: 0.15 },
    { t: 6, kw: 4, speed: 2.5, kerf: 0.2 },
    { t: 10, kw: 6, speed: 1.2, kerf: 0.25 },
    { t: 20, kw: 6, speed: 0.7, kerf: 0.3 },
  ],
  "Copper / brass": [
    { t: 1, kw: 1, speed: 8, kerf: 0.15 },
    { t: 2, kw: 1.5, speed: 4, kerf: 0.15 },
    { t: 3, kw: 2, speed: 2.5, kerf: 0.18 },
    { t: 6, kw: 4, speed: 1.2, kerf: 0.2 },
  ],
};

const MATERIALS = ["Mild steel", "Stainless steel", "Aluminium", "Acrylic", "Wood / plywood", "Copper / brass"];

/**
 * Laser Cutter Power Reference — picks an indicative machine power and cut
 * speed for a material and thickness on CO₂ or fibre lasers, with the kerf to
 * budget for in the CAD model.
 */
export default function LaserCutterPowerReference() {
  const [laser, setLaser] = useState("co2");
  const [material, setMaterial] = useState("Mild steel");
  const [thick, setThick] = useState("3");

  const table = laser === "co2" ? CO2 : FIBER;
  const rows = table[material];
  const row = rows?.find((r) => String(r.t) === thick) ?? null;

  const thicknessOptions = useMemo(() => (rows ?? []).map((r) => ({ value: String(r.t), label: `${r.t} mm` })), [rows]);

  const onLaserChange = (v: string) => {
    setLaser(v);
    const t = v === "co2" ? CO2 : FIBER;
    const avail = t[material] ?? [];
    if (avail.length && !avail.some((r) => String(r.t) === thick)) setThick(String(avail[0].t));
    if (!t[material]) setMaterial("Mild steel");
  };

  const onMaterialChange = (v: string) => {
    setMaterial(v);
    const avail = table[v] ?? [];
    if (avail.length && !avail.some((r) => String(r.t) === thick)) setThick(String(avail[0].t));
  };

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Laser & material</PanelTitle>
        <FormGrid>
          <Sel
            name="laser"
            label="Laser source"
            value={laser}
            onChange={onLaserChange}
            options={[
              { value: "co2", label: "CO₂ (10.6 µm)" },
              { value: "fiber", label: "Fibre (1.06 µm)" },
            ]}
          />
          <div />
          <Sel
            name="material"
            label="Material"
            value={material}
            onChange={onMaterialChange}
            options={MATERIALS.map((m) => ({
              value: m,
              label: `${m}${!table[m] ? " (not cut with this source)" : ""}`,
            }))}
          />
          <Sel
            name="thick"
            label="Thickness"
            value={thick}
            onChange={setThick}
            options={thicknessOptions}
          />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Values are indicative settings for a modern flatbed cutter at best-cut quality with nitrogen
          assist on metals. Real machines vary with optics, nozzle and gas pressure — always run a
          corner trial before nesting a full sheet.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Indicative settings</PanelTitle>
        {row ? (
          <ResBox>
            <Res name="power" label="Machine power" value={`${fmtTrim(row.kw, 2)} kW`} />
            <Res name="speed" label="Cut speed" value={`${fmtTrim(row.speed, 2)} m/min`} />
            <Res name="kerf" label="Kerf (budget in CAD)" value={`${fmtTrim(row.kerf, 3)} mm`} />
            <Res name="gas" label="Assist gas" value={material === "Acrylic" || material === "Wood / plywood" ? "Air / none" : "N₂ (clean edge)"} />
          </ResBox>
        ) : (
          <p className="text-sm text-muted-foreground">
            {material} is not cut with a {laser === "co2" ? "CO₂" : "fibre"} laser{laser === "co2" && material === "Copper / brass" ? " (copper and brass reflect the 10.6 µm beam)" : ""} — pick another material or switch sources.
          </p>
        )}
        {row && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {material} at {row.t} mm: expect to dial speed ±20% around {fmtTrim(row.speed, 2)} m/min on the
            machine. Kerf quoted at the top surface; the bottom edge can run ~30% narrower on thick plate.
          </p>
        )}
      </Panel>
    </CalcLayout>
  );
}
