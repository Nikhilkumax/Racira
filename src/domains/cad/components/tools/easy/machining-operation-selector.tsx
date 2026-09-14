"use client";

import { useMemo, useState } from "react";
import { CalcLayout, FormGrid, Panel, PanelTitle, Res, ResBox, Sel } from "./ui";

type Step = { op: string; detail: string };

const TOOL_MAT: Record<string, string> = {
  aluminum: "Carbide 2-flute or polished HSS — climb mill; mist coolant optional",
  steel: "Carbide 3–4 flute, rigid setup — flood coolant",
  alloy: "Carbide 4-flute with fresh edge — climb mill, steady feed",
  stainless: "Carbide, climb mill with constant feed — never let the tool rub",
  castiron: "Carbide or CBN — dry or MQL; abrasive dust, extract chips",
  titanium: "Carbide, high-pressure coolant, low speed / high chip load",
  plastic: "2-flute polished carbide — mist coolant keeps chips from re-welding",
};

/** Plan the operation sequence for a feature + tolerance class. */
function plan(feature: string, tol: string): { title: string; steps: Step[]; finish: boolean } {
  const finish = tol !== "rough";
  switch (feature) {
    case "face":
      return {
        title: "Face milling",
        finish,
        steps: [
          { op: "Rough face", detail: "Face mill clearing 60–70% of the available depth, overlap 30–50% of cutter diameter." },
          ...(finish
            ? [{ op: "Finish face", detail: "Full-width finish pass with a wiper insert or light 0.1–0.3 mm depth cut for flatness and Ra." }]
            : []),
        ],
      };
    case "pocket":
      return {
        title: "Pocket milling",
        finish,
        steps: [
          { op: "Rough pocket", detail: "Square end mill with ramp or helical entry; radial engagement 40–50% of tool Ø; axial depth ≤ 1×Ø." },
          ...(finish
            ? [{ op: "Finish walls", detail: "0.1–0.3 mm radial finish pass around the wall, full depth in one climb pass for a clean corner." }]
            : []),
        ],
      };
    case "slot":
      return {
        title: "Slotting",
        finish,
        steps: [
          { op: "Rough slot", detail: "Square end mill at the slot width; axial engagement ≤ 0.5×Ø per pass; peck to clear chips." },
          ...(finish ? [{ op: "Finish pass", detail: "0.1–0.2 mm final pass on both walls, same direction (climb) for consistent width." }] : []),
        ],
      };
    case "through-hole":
      return {
        title: "Hole drilling (through)",
        finish,
        steps: [
          { op: "Spot", detail: "90° (HSS) or 120° (carbide) spot drill to start the hole on location." },
          { op: "Drill", detail: "Twist drill to final Ø through the part; peck below 3×Ø." },
          ...(finish ? [{ op: "Ream / interpolate", detail: "Ream Ø with 0.2–0.4 mm stock at ⅔ drill speed, or interpolate with an end mill for position accuracy." }] : []),
        ],
      };
    case "blind-hole":
      return {
        title: "Hole drilling (blind)",
        finish,
        steps: [
          { op: "Spot", detail: "Spot to locate, then twist drill to depth minus the drill-point allowance." },
          ...(finish ? [{ op: "Flat bottom", detail: "Interpolate the floor flat with an end mill (leave 0.2 mm, then clean up) — a twist drill leaves a cone." }] : []),
        ],
      };
    case "contour":
      return {
        title: "Profile / contour milling",
        finish,
        steps: [
          { op: "Rough profile", detail: "End mill around the profile at 50% radial engagement, leaving 0.3–0.5 mm stock." },
          ...(finish
            ? [{ op: "Finish profile", detail: "0.1–0.3 mm climb finish pass with G41/G42 cutter compensation active and the part measured after." }]
            : []),
        ],
      };
    default:
      return { title: "—", finish: false, steps: [] };
  }
}

/**
 * Machining Operation Selector — picks the operation sequence for a milled
 * feature given its geometry, material and tolerance class. Sequences are
 * conventional shop practice; feeds/speeds come from the cutting references.
 */
export default function MachiningOperationSelector() {
  const [feature, setFeature] = useState("pocket");
  const [material, setMaterial] = useState("aluminum");
  const [tol, setTol] = useState("general");

  const p = useMemo(() => plan(feature, tol), [feature, tol]);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Feature</PanelTitle>
        <FormGrid>
          <Sel
            name="feature"
            label="Feature type"
            value={feature}
            onChange={setFeature}
            options={[
              { value: "face", label: "Flat face / surface" },
              { value: "pocket", label: "Pocket (closed cavity)" },
              { value: "slot", label: "Slot / keyway" },
              { value: "through-hole", label: "Hole — through" },
              { value: "blind-hole", label: "Hole — blind" },
              { value: "contour", label: "External profile / contour" },
            ]}
          />
          <Sel
            name="material"
            label="Material"
            value={material}
            onChange={setMaterial}
            options={[
              { value: "aluminum", label: "Aluminium 6061" },
              { value: "steel", label: "Low-carbon steel" },
              { value: "alloy", label: "Alloy / tool steel (4140, O1)" },
              { value: "stainless", label: "Stainless 304" },
              { value: "castiron", label: "Cast iron" },
              { value: "titanium", label: "Titanium Ti-6Al-4V" },
              { value: "plastic", label: "Plastic (Delrin, nylon)" },
            ]}
          />
          <Sel
            name="tol"
            label="Tolerance class"
            value={tol}
            onChange={setTol}
            options={[
              { value: "rough", label: "Rough (±0.2 mm or looser)" },
              { value: "general", label: "General (±0.1 mm)" },
              { value: "tight", label: "Tight (±0.03 mm)" },
            ]}
          />
        </FormGrid>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Tolerance class decides whether a separate finish pass is added — roughing parameters stay the
          same because the finish pass, not the roughing pass, sets the final size.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Recommended sequence</PanelTitle>
        <ResBox>
          <Res name="op" label="Operation family" value={p.title} />
          <Res name="finish" label="Finish pass required" value={finishLabel(p.finish)} />
          <Res name="toolmat" label="Tooling for material" value={TOOL_MAT[material]} />
        </ResBox>
        <ol data-testid="steps" className="mt-4 space-y-2">
          {p.steps.map((s, i) => (
            <li key={i} className="rounded-lg border border-border bg-card/40 px-3 py-2">
              <span className="font-mono text-xs font-bold text-primary">{i + 1}.</span>{" "}
              <span className="text-xs font-semibold text-foreground">{s.op}</span>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </CalcLayout>
  );
}

function finishLabel(f: boolean): string {
  return f ? "Yes — separate finish pass added" : "No — single operation set";
}
