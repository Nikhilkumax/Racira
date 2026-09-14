"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, RefTable, fmt } from "./ui";

/**
 * Wind Load Reference Tool — ASCE 7 velocity pressure for quick reference:
 *   qz = 0.00256 · Kz · Kzt · Kd · V²   (V in mph, q in psf)
 * Exposure/simplified: Kz = 1.0 (10 m, Exposure C), Kzt = Kd = 1.0 here.
 * Full design uses the code's exposure coefficients, gust factor and pressure
 * coefficients — this is the reference magnitude, not the design pressure.
 */

const TABLE = [90, 100, 110, 115, 120, 130, 140, 150].map((v) => [String(v), fmt(0.00256 * v * v, 1)]);

export default function WindLoadReferenceTool() {
  const [speed, setSpeed] = useState("115");

  const v = parseFloat(speed);
  const valid = Number.isFinite(v) && v > 0 && v <= 250;
  const q = valid ? 0.00256 * v * v : NaN;

  return (
    <div className="space-y-5">
      <CalcLayout>
        <Panel>
          <PanelTitle>Velocity pressure (qz = 0.00256·Kz·V²)</PanelTitle>
          <FormGrid>
            <Num name="speed" label="Basic wind speed V" unit="mph" value={speed} onChange={setSpeed} />
            <Sel
              name="kz"
              label="Height/exposure factor"
              value="1.0"
              onChange={() => undefined}
              options={[{ value: "1.0", label: "Kz = 1.0 (10 m, Exposure C) — simplified" }]}
            />
          </FormGrid>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Simplified reference only (Kz = Kzt = Kd = 1.0). Real design adds the exposure coefficient, topographic
            factor, gust effect factor and the building pressure coefficients, per ASCE 7 Chapter 26–30.
          </p>
        </Panel>
        <Panel>
          <PanelTitle>Result</PanelTitle>
          <ResBox>
            <Res name="q" label="Velocity pressure qz" value={valid ? `${fmt(q, 1)} psf` : "—"} />
            <Res name="note" label="Rule of thumb" value={valid ? "≈ 0.26 × V²/10000… use the formula" : "—"} />
          </ResBox>
        </Panel>
      </CalcLayout>
      <RefTable
        title="Quick reference — velocity pressure vs design wind speed"
        cols={["V (mph)", "qz (psf, simplified)"]}
        rows={TABLE}
      />
    </div>
  );
}
