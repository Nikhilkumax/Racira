"use client";

import { useState } from "react";
import { Panel, PanelTitle, Sel } from "./ui";

/**
 * HVAC Equipment Selector Guide — pick the right equipment family for an
 * application, with the capacity ranges and the selection notes that matter
 * early in design.
 */

type Rec = { app: string; equipment: string; capacity: string; note: string };

const RECS: Rec[] = [
  {
    app: "Small office / retail (one zone)",
    equipment: "Packaged rooftop unit (RTU) or split system",
    capacity: "2–50 tons (7–175 kW)",
    note: "RTU for flat roofs and DX simplicity; split for small zones. Match EER/SEER to code minimums.",
  },
  {
    app: "Multi-zone commercial building",
    equipment: "VAV with central air handler (AHU) + chilled water, or VRF",
    capacity: "AHUs 5–100+ tons; VRF 1–60 tons",
    note: "Chilled-water VAV is the workhorse for >50,000 ft²; VRF suits retrofit & part-load diversity.",
  },
  {
    app: "Server room / data center",
    equipment: "CRAC (comfort) or CRAH (chilled water) unit",
    capacity: "5–100+ kW per rack row; watts/ft² 30–150+",
    note: "Sensible-only loads: 19–25 °C supply; humidity 20–80% RH per ASHRAE A1–A4 classes.",
  },
  {
    app: "Residential / apartment suite",
    equipment: "Ducted or ductless split heat pump",
    capacity: "1–5 tons (3.5–17 kW)",
    note: "Heat pump over AC in mild/cold climates; size per ACCA Manual J, not rule of thumb.",
  },
  {
    app: "Industrial plant / warehouse",
    equipment: "Make-up air unit (MUA) + destratification fans",
    capacity: "MUA 1,000–50,000 CFM",
    note: "Balance exhaust; gas/electric/steam heat; add evaporative cooling in dry climates.",
  },
  {
    app: "School / assembly hall",
    equipment: "Dedicated outdoor air system (DOAS) + terminal units",
    capacity: "DOAS sized to ventilation load only",
    note: "Ventilation code (ASHRAE 62.1) drives outdoor air; separate sensible conditioning at the zone.",
  },
  {
    app: "Restaurant kitchen",
    equipment: "Exhaust hood + tempered make-up air",
    capacity: "Hood exhaust 250–600 CFM per linear ft",
    note: "Type I hood over cooking; make-up air 80–100% of exhaust; keep 15–20% from ambient.",
  },
  {
    app: "Laboratory",
    equipment: "100% outdoor-air AHU with heat recovery",
    capacity: "6–15 ACH; pressurization to suit hazard class",
    note: "Always net negative vs corridors for fume-hood labs; energy recovery is effectively mandatory.",
  },
];

export default function HvacEquipmentSelectorGuide() {
  const [app, setApp] = useState(RECS[0].app);
  const rec = RECS.find((r) => r.app === app) ?? RECS[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <Panel>
        <PanelTitle>Application</PanelTitle>
        <Sel
          name="app"
          label="Building / zone type"
          value={app}
          onChange={setApp}
          options={RECS.map((r) => ({ value: r.app, label: r.app }))}
        />
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Early-stage concept only — final selection follows the load calculation (cooling/heating load, ventilation
          code, energy code), not the application alone.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Suggested equipment</PanelTitle>
        <p data-testid="res-equipment" className="text-base font-semibold text-primary">{rec.equipment}</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
            <dt className="text-muted-foreground">Typical capacity</dt>
            <dd data-testid="res-capacity" className="text-right font-mono text-xs">{rec.capacity}</dd>
          </div>
          <div>
            <dt className="mb-1 text-xs text-muted-foreground">Selection notes</dt>
            <dd data-testid="res-note" className="text-sm leading-relaxed text-foreground">{rec.note}</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
