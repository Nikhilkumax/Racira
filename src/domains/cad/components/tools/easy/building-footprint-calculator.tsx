"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

/**
 * Building Footprint Calculator — rectangle footprint area, perimeter and
 * land-area conversions for early massing checks.
 */
export default function BuildingFootprintCalculator() {
  const [unit, setUnit] = useState("ft");
  const [width, setWidth] = useState("60");
  const [depth, setDepth] = useState("100");

  const w = parseFloat(width);
  const d = parseFloat(depth);
  const valid = Number.isFinite(w) && Number.isFinite(d) && w > 0 && d > 0;

  const area = valid ? w * d : NaN;
  const perim = valid ? 2 * (w + d) : NaN;

  const areaFt2 = unit === "ft" ? area : area * 10.7639;
  const areaM2 = unit === "m" ? area : area / 10.7639;
  const acres = areaFt2 / 43560;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Building rectangle</PanelTitle>
        <FormGrid>
          <Num name="width" label="Width" unit={unit} value={width} onChange={setWidth} />
          <Num name="depth" label="Depth" unit={unit} value={depth} onChange={setDepth} />
        </FormGrid>
        <div className="mt-3">
          <Sel name="unit" label="Input unit" value={unit} onChange={setUnit} options={[{ value: "ft", label: "Feet" }, { value: "m", label: "Meters" }]} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Footprint = ground-floor extent to the outside face of exterior walls (or drip line, per your
          jurisdiction's zoning definition). For massing studies only — real zoning area math follows the code's
          definition of gross floor area.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="area" label="Footprint area" value={valid ? `${fmt(areaFt2, 1)} ft² (${fmt(areaM2, 1)} m²)` : "—"} />
          <Res name="perim" label="Perimeter" value={valid ? `${fmt(perim, 1)} ${unit}` : "—"} />
          <Res name="acres" label="Land area" value={valid ? `${fmt(acres, 3)} acres (${fmt(areaM2, 1)} m²)` : "—"} />
          <Res name="hectare" label="Hectares" value={valid ? fmt(areaM2 / 10000, 4) : "—"} />
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}
