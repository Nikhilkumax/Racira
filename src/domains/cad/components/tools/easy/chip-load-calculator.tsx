"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmtTrim } from "./ui";

/** Typical chip-load ranges (mm/tooth) for common end-mill Ø × material. */
const CHIP_TABLE: Record<string, Record<string, [number, number]>> = {
  "3": { aluminum: [0.02, 0.04], steel: [0.015, 0.03], stainless: [0.01, 0.02], plastic: [0.02, 0.04] },
  "6": { aluminum: [0.04, 0.08], steel: [0.03, 0.06], stainless: [0.02, 0.04], plastic: [0.03, 0.06] },
  "10": { aluminum: [0.06, 0.12], steel: [0.05, 0.09], stainless: [0.03, 0.06], plastic: [0.05, 0.1] },
  "12": { aluminum: [0.08, 0.15], steel: [0.06, 0.11], stainless: [0.04, 0.07], plastic: [0.06, 0.12] },
};

const TARGET_KEYS: Record<string, string> = { aluminum: "aluminum", steel: "steel", stainless: "stainless", plastic: "plastic" };

/**
 * Chip Load Calculator — chip load per tooth fz = feed ÷ (rpm × flutes),
 * plus the derived metal-removal rate, checked against typical chip-load
 * ranges for common cutter sizes and materials.
 */
export default function ChipLoadCalculator() {
  const [feed, setFeed] = useState("600");
  const [rpm, setRpm] = useState("8000");
  const [flutes, setFlutes] = useState("2");
  const [dia, setDia] = useState("6");
  const [material, setMaterial] = useState("aluminum");
  const [ae, setAe] = useState("3");
  const [ap, setAp] = useState("6");

  const F = parseFloat(feed);
  const N = parseFloat(rpm);
  const Z = parseFloat(flutes);
  const AE = parseFloat(ae);
  const AP = parseFloat(ap);

  const valid = Number.isFinite(F) && Number.isFinite(N) && Number.isFinite(Z) && F > 0 && N > 0 && Z > 0;

  const fz = valid ? F / (N * Z) : NaN;
  const mrr = valid && Number.isFinite(AE) && Number.isFinite(AP) && AE > 0 && AP > 0 ? AE * AP * F : NaN;

  const [lo, hi] = (CHIP_TABLE[dia] && CHIP_TABLE[dia][TARGET_KEYS[material]]) || [NaN, NaN];
  const inRange = valid && Number.isFinite(lo) ? fz >= lo - 1e-9 && fz <= hi + 1e-9 : null;
  const status = inRange === null ? "—" : inRange ? "Within typical range ✓" : fz < lo ? "Below range — feed is conservative" : "Above range — risk of tool breakage";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Cutting conditions</PanelTitle>
        <FormGrid>
          <Num name="feed" label="Feed rate" unit="mm/min" value={feed} onChange={setFeed} />
          <Num name="rpm" label="Spindle speed" unit="rev/min" value={rpm} onChange={setRpm} />
          <Num name="flutes" label="Flutes (teeth)" value={flutes} onChange={setFlutes} />
          <div />
          <Sel
            name="dia"
            label="Tool Ø"
            value={dia}
            onChange={setDia}
            options={["3", "6", "10", "12"].map((d) => ({ value: d, label: `${d} mm` }))}
          />
          <Sel
            name="material"
            label="Material"
            value={material}
            onChange={setMaterial}
            options={Object.keys(TARGET_KEYS).map((m) => ({ value: m, label: m === "steel" ? "Steel" : m === "stainless" ? "Stainless" : m === "aluminum" ? "Aluminium" : "Plastic" }))}
          />
          <Num name="ae" label="Radial engagement ae" unit="mm" value={ae} onChange={setAe} />
          <Num name="ap" label="Axial depth ap" unit="mm" value={ap} onChange={setAp} />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          fz = feed ÷ (rpm × flutes). Most CAM feeds are set by choosing a target chip load and working
          backwards; this tool does the check in the direction that matters — is the programmed feed
          actually cutting the chip the tool was designed for?
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="fz" label="Chip load per tooth (fz)" value={valid ? `${fmtTrim(fz, 4)} mm/tooth` : "—"} />
          <Res name="range" label={`Typical range — Ø${dia} in ${material === "steel" ? "steel" : material === "stainless" ? "stainless" : material === "aluminum" ? "aluminium" : "plastic"}`} value={Number.isFinite(lo) ? `${fmtTrim(lo, 3)} – ${fmtTrim(hi, 3)} mm/tooth` : "—"} />
          <Res name="check" label="Status" value={status} />
          <Res name="mrr" label="Material removal rate" value={Number.isFinite(mrr) ? `${fmtTrim(mrr, 0)} mm³/min` : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The typical ranges assume a healthy, sharp carbide cutter in a rigid setup with good chip
          evacuation. Halve them for HSS, long-reach tooling or fragile parts.
        </p>
      </Panel>
    </CalcLayout>
  );
}
