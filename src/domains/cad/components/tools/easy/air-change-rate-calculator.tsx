"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "./ui";

/**
 * Air Change Rate Calculator — ACH = airflow ÷ room volume (per hour).
 *   imperial: ACH = CFM × 60 ÷ V(ft³)
 *   metric:   ACH = m³/h ÷ V(m³)
 * Also reports the reverse: airflow needed for a target ACH.
 */
export default function AirChangeRateCalculator() {
  const [sys, setSys] = useState<"imp" | "si">("imp");
  const [cfm, setCfm] = useState("100");
  const [l, setL] = useState("10");
  const [w, setW] = useState("12");
  const [h, setH] = useState("8");
  const [target, setTarget] = useState("6");

  const imperial = sys === "imp";
  const flow = parseFloat(cfm); // CFM (imperial) or m³/h (metric)
  const len = parseFloat(l), wid = parseFloat(w), hei = parseFloat(h);
  const volM3 = !imperial ? len * wid * hei : NaN; // m³
  const volFt3 = imperial ? len * wid * hei : NaN; // ft³

  const validImp = imperial && Number.isFinite(flow) && Number.isFinite(volFt3) && volFt3 > 0;
  const validSi = !imperial && Number.isFinite(flow) && Number.isFinite(volM3) && volM3 > 0;
  const valid = validImp || validSi;

  const ach = imperial ? (validImp ? (flow * 60) / volFt3 : NaN) : validSi ? flow / volM3 : NaN;
  const minPerChange = valid && ach > 0 ? 60 / ach : NaN;

  const t = parseFloat(target);
  const needFlow = valid && Number.isFinite(t) && t > 0
    ? imperial
      ? (t * volFt3) / 60
      : t * volM3
    : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Room & ventilation</PanelTitle>
        <FormGrid>
          <Sel
            name="sys"
            label="Unit system"
            value={sys}
            onChange={(v) => setSys(v as "imp" | "si")}
            options={[
              { value: "imp", label: "Imperial — CFM / ft" },
              { value: "si", label: "Metric — m³/h / m" },
            ]}
          />
          <Num name="flow" label={imperial ? "Ventilation rate" : "Ventilation rate"} unit={imperial ? "CFM" : "m³/h"} value={cfm} onChange={setCfm} />
          <Num name="l" label="Length" unit={imperial ? "ft" : "m"} value={l} onChange={setL} />
          <Num name="w" label="Width" unit={imperial ? "ft" : "m"} value={w} onChange={setW} />
          <Num name="h" label="Height" unit={imperial ? "ft" : "m"} value={h} onChange={setH} />
          <Num name="target" label="Target ACH" unit="per h" value={target} onChange={setTarget} />
        </FormGrid>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res
            name="volume"
            label="Room volume"
            value={valid ? `${fmt(imperial ? volFt3 : volM3)} ${imperial ? "ft³" : "m³"}` : "—"}
          />
          <Res name="ach" label="Air changes per hour" value={valid ? `${fmt(ach, 2)} ACH` : "—"} />
          <Res name="interval" label="Time per air change" value={valid ? `${fmt(minPerChange)} min` : "—"} />
          <Res
            name="need"
            label={`Flow for ${fmt(t, 1) || "—"} ACH`}
            value={valid ? `${fmt(needFlow, 0)} ${imperial ? "CFM" : "m³/h"}` : "—"}
          />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Guidance: residences 0.35–1 ACH, bathrooms 8 ACH intermittent, kitchens 7.5 ACH, labs 6–15 ACH depending on
          hazard, cleanrooms 20–600 ACH.
        </p>
      </Panel>
    </CalcLayout>
  );
}
