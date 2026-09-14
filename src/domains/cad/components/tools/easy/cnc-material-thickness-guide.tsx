"use client";

import { useState } from "react";
import { Panel, PanelTitle, Sel } from "./ui";

type Row = [string, string, string, string];

const PROCESSES: Record<string, { label: string; rows: Row[]; note: string }> = {
  fiber: {
    label: "Fiber laser",
    rows: [
      ["Mild steel", "25 mm", "0.10–0.20 mm", "N₂ assist keeps edges clean; O₂ speeds thick cuts at the cost of an oxide edge"],
      ["Stainless steel", "20 mm", "0.10–0.20 mm", "N₂ at high pressure — dross below ~10 mm is minimal"],
      ["Aluminium", "12 mm", "0.15–0.25 mm", "Reflective at 1 µm — fibre only, keep focus in and watch back-reflection"],
      ["Brass / copper", "6 mm", "0.15–0.25 mm", "Brass and copper need a fibre source; CO₂ simply reflects"],
    ],
    note: "Fibre sources cut thin sheet fast and handle reflective metals. Practical sweet spot is ≤ 10 mm steel.",
  },
  co2: {
    label: "CO₂ laser",
    rows: [
      ["Mild steel", "20 mm", "0.15–0.25 mm", "Slower than fibre at thin gauges; still strong below 6 mm"],
      ["Acrylic", "30 mm", "0.05–0.15 mm", "The classic CO₂ material — flame-polished edges below ~10 mm"],
      ["Wood / plywood", "25 mm", "0.15–0.30 mm", "Veneer grade affects edge; keep the beam fast to limit char"],
      ["Aluminium", "3 mm", "0.20–0.30 mm", "CO₂ on aluminium is inefficient — use fibre or waterjet above 3 mm"],
    ],
    note: "10.6 µm wavelength suits organics (acrylic, wood) and thin steel; it is a poor match for aluminium and useless on copper.",
  },
  plasma: {
    label: "Plasma",
    rows: [
      ["Mild steel", "50 mm (150 mm HD)", "1.5–3.0 mm", "Best cost-per-cut above 20 mm; HD plasma holds ±0.5 mm"],
      ["Stainless", "40 mm", "1.5–3.0 mm", "Edge discoloration; fine features lose accuracy to the wide kerf"],
      ["Aluminium", "40 mm", "1.5–3.5 mm", "Needs a clean ground path — oxidised surfaces cut poorly"],
    ],
    note: "The wide kerf and HAZ rule plasma out for fine features, but for heavy plate it beats laser on cost per metre of cut.",
  },
  waterjet: {
    label: "Abrasive waterjet",
    rows: [
      ["Mild steel", "200 mm", "0.7–1.2 mm", "No HAZ — ideal for hardened or heat-sensitive plate"],
      ["Aluminium", "150 mm", "0.7–1.2 mm", "Thick sections taper slightly; tops are wider than bottoms"],
      ["Stainless", "200 mm", "0.7–1.2 mm", "Preferred above 25 mm where laser dross becomes a problem"],
      ["Stone / glass / tile", "100 mm", "0.7–1.2 mm", "Only practical process for many non-metals; edges need no rework"],
    ],
    note: "Abrasive waterjet cuts anything below a hardness ceiling — thickness limits are set by speed, not physics.",
  },
  router: {
    label: "CNC router",
    rows: [
      ["Aluminium sheet", "12 mm", "3–6 mm (tool Ø)", "Rigidity-limited; climb cut with 2-flute carbide, lubricate"],
      ["Plastics (sheet)", "30 mm", "3–6 mm (tool Ø)", "Watch melting — downcut spirals on top, small stepovers"],
      ["Wood / MDF / ply", "50 mm", "3–8 mm (tool Ø)", "The native router material — dust control decides finish quality"],
    ],
    note: "Routers cut thin, soft sheets. Kerf equals the tool diameter, so features are limited by tool Ø and machine rigidity.",
  },
  wireedm: {
    label: "Wire EDM",
    rows: [
      ["Any conductive steel", "300 mm", "0.25–0.35 mm", "Skim passes cut taper error to a few microns; ±0.005 mm achievable"],
      ["Aluminium", "150 mm", "0.25–0.35 mm", "Fine wire + skim passes for burr-free edges"],
      ["Carbide / tool steel", "250 mm", "0.25–0.35 mm", "The standard way to cut hardened tooling with no HAZ"],
    ],
    note: "Wire EDM has no cutting force, so it wins on thin-wall and hardened work — at a speed cost. Through-holes only.",
  },
};

/**
 * CNC Material Thickness Guide — practical thickness ceilings per cutting
 * process, with kerf and the note that actually decides which process to pick.
 */
export default function CncMaterialThicknessGuide() {
  const [process, setProcess] = useState("fiber");
  const p = PROCESSES[process];

  return (
    <Panel>
      <PanelTitle>Cutting process</PanelTitle>
      <div className="mb-4 max-w-xs">
        <Sel
          name="process"
          label="Process"
          value={process}
          onChange={setProcess}
          options={Object.entries(PROCESSES).map(([v, x]) => ({ value: v, label: x.label }))}
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Material", "Practical max thickness", "Kerf", "Notes"].map((c) => (
                <th key={c} className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.rows.map((r, ri) => (
              <tr key={ri} className="border-b border-border/50 last:border-0 odd:bg-card/30">
                {r.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 align-top text-xs text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.note}</p>
    </Panel>
  );
}
