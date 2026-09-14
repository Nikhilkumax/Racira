"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, RefTable, fmt } from "./ui";

/**
 * Wire Gauge Reference — AWG diameter, area and resistance from the defining
 * formula (d = 0.127 · 92^((36−n)/39) mm), plus NEC 75 °C copper ampacity for
 * the gauges the code tables actually cover.
 */
const NEC75: Record<string, number> = {
  "14": 20, "12": 25, "10": 35, "8": 50, "6": 65, "4": 85, "2": 115, "1": 130,
  "0": 150, "00": 175, "000": 200, "0000": 230,
};

const dMm = (n: number) => 0.127 * Math.pow(92, (36 - n) / 39);
const areaMm2 = (n: number) => (Math.PI / 4) * Math.pow(dMm(n), 2);
const areaCm = (n: number) => Math.pow(dMm(n) / 0.0254, 2) * 1000; // circular mils
const resPerKm = (n: number) => (0.017241 * 1000) / areaMm2(n); // Ω/km at 20 °C

const ampacity = (n: number): number | undefined => {
  if (!Number.isInteger(n) || n < 0 || n > 40) return undefined;
  return NEC75[String(n)];
};

export default function WireGaugeReference() {
  const [awg, setAwg] = useState("18");

  const n = parseFloat(awg);
  const valid = Number.isFinite(n) && n >= 0 && n <= 40;

  const rows = Array.from({ length: 27 }, (_, i) => 4 + i).map((g) => [
    String(g),
    fmt(dMm(g), 3),
    fmt(areaMm2(g), 2),
    fmt(resPerKm(g), 2),
    ampacity(g) !== undefined ? String(ampacity(g)) : "—",
  ]);

  return (
    <div className="space-y-5">
      <CalcLayout>
        <Panel>
          <PanelTitle>AWG calculator</PanelTitle>
          <FormGrid>
            <Num name="awg" label="AWG number" value={awg} onChange={setAwg} />
          </FormGrid>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Diameter formula: d = 0.127 · 92^((36 − AWG)/39) mm. Smaller AWG = thicker wire; each step of 3 doubles
            the cross-section (~2× current for the same rise), each step of 10 ×10 the area.
          </p>
        </Panel>
        <Panel>
          <PanelTitle>Result</PanelTitle>
          <ResBox>
            <Res name="d" label="Diameter" value={valid ? `${fmt(dMm(n), 3)} mm` : "—"} />
            <Res name="a" label="Cross-section" value={valid ? `${fmt(areaMm2(n), 2)} mm²` : "—"} />
            <Res name="cm" label="Area" value={valid ? `${fmt(areaCm(n), 0)} cmil` : "—"} />
            <Res name="r" label="Resistance @20 °C" value={valid ? `${fmt(resPerKm(n), 2)} Ω/km` : "—"} />
            <Res name="amp" label="NEC 75 °C copper" value={valid && ampacity(n) !== undefined ? `${ampacity(n)} A` : "not tabled"} />
          </ResBox>
        </Panel>
      </CalcLayout>
      <RefTable
        title="AWG table (computed) + NEC 75 °C copper ampacity"
        cols={["AWG", "Diameter (mm)", "Area (mm²)", "R (Ω/km)", "Ampacity (A)"]}
        rows={rows}
        note="Ampacity column is the NEC 310.16 75 °C column (copper) where tabled — smaller gauges (16–30) are sized by other articles/uses. Derate for bundling, ambient and terminations."
      />
    </div>
  );
}
