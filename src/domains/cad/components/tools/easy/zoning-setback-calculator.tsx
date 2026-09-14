"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, fmt } from "./ui";

/**
 * Zoning Setback Calculator — given lot dimensions and the required front,
 * rear and side setbacks, find the buildable rectangle and coverage.
 * Corner lots / easements / lot-coverage caps must come from the zoning text.
 */
export default function ZoningSetbackCalculator() {
  const [lotW, setLotW] = useState("100");
  const [lotD, setLotD] = useState("150");
  const [front, setFront] = useState("20");
  const [rear, setRear] = useState("20");
  const [side, setSide] = useState("5");

  const lw = parseFloat(lotW);
  const ld = parseFloat(lotD);
  const f = parseFloat(front);
  const r = parseFloat(rear);
  const s = parseFloat(side);

  const valid = [lw, ld, f, r, s].every(Number.isFinite) && lw > 0 && ld > 0 && f >= 0 && r >= 0 && s >= 0;
  const buildW = valid ? lw - 2 * s : NaN;
  const buildD = valid ? ld - f - r : NaN;
  const feasible = valid && buildW > 0 && buildD > 0;
  const buildArea = feasible ? buildW * buildD : NaN;
  const lotArea = valid ? lw * ld : NaN;
  const coverage = feasible ? (buildArea / lotArea) * 100 : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Lot and setbacks</PanelTitle>
        <FormGrid>
          <Num name="lotW" label="Lot width" unit="ft" value={lotW} onChange={setLotW} />
          <Num name="lotD" label="Lot depth" unit="ft" value={lotD} onChange={setLotD} />
          <Num name="front" label="Front setback" unit="ft" value={front} onChange={setFront} />
          <Num name="rear" label="Rear setback" unit="ft" value={rear} onChange={setRear} />
          <Num name="side" label="Side setback (each)" unit="ft" value={side} onChange={setSide} />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Model: single rectangle centered between the side setbacks and inside front/rear lines. Corner lots, flag
          lots, easements, height/coverage caps and averaging provisions all come from the zoning ordinance — check
          the text, not just the minimum numbers.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Buildable envelope</PanelTitle>
        <ResBox>
          <Res name="bw" label="Buildable width" value={feasible ? `${fmt(buildW, 1)} ft` : valid ? "0 — setbacks overlap" : "—"} />
          <Res name="bd" label="Buildable depth" value={feasible ? `${fmt(buildD, 1)} ft` : valid ? "0 — setbacks overlap" : "—"} />
          <Res name="area" label="Max footprint area" value={feasible ? `${fmt(buildArea, 1)} ft²` : "—"} />
          <Res name="cov" label="Of lot area" value={feasible ? `${fmt(coverage, 1)} %` : "—"} />
        </ResBox>
        {!feasible && valid && (
          <p data-testid="infeasible" className="mt-2 text-xs font-medium text-destructive">
            Setbacks leave no buildable rectangle — check the lot width against side × 2 + minimum width, or depth against front + rear.
          </p>
        )}
      </Panel>
    </CalcLayout>
  );
}
