"use client";

import { Panel, PanelTitle, RefTable } from "./ui";

/**
 * Surface Roughness Ra Reference — typical Ra ranges per manufacturing process
 * and application guidance (ISO 4287 / ISO 1302).
 */

const PROCESS_ROWS: [string, string, string][] = [
  ["0.025–0.1 µm", "Lapping, honing (superfinish)", "Gauge surfaces, seal faces, bearing raceways"],
  ["0.05–0.2 µm", "Fine grinding, polishing", "Precision journals, hydraulic spools"],
  ["0.1–0.4 µm", "Grinding, reaming", "Bearing seats, O-ring grooves"],
  ["0.4–1.6 µm", "Fine turning / milling, honing", "General machine fits, sliding surfaces"],
  ["0.8–3.2 µm", "Turning, milling, drilling", "General machined parts, unmated surfaces"],
  ["1.6–6.3 µm", "Rough machining", "Clearance surfaces, non-functional faces"],
  ["3.2–12.5 µm", "Sawing, flame/plasma cutting", "Rough stock, weld prep"],
  ["6.3–25 µm", "Casting, forging, hot rolling", "As-cast/as-forged surfaces"],
];

const APP_ROWS: [string, string][] = [
  ["Dynamic O-ring gland (hydraulic)", "Ra 0.4 µm (groove side walls often 0.8)"],
  ["Rotating shaft seal lip track", "Ra 0.2–0.8 µm"],
  ["Plain bearing journal", "Ra 0.2–0.4 µm"],
  ["Gear tooth flanks", "Ra 0.8–1.6 µm"],
  ["Sliding guide ways", "Ra 0.4–0.8 µm"],
  ["Painted / coated surface", "Ra 3.2–6.3 µm (anchor for coating)"],
];

export default function SurfaceRoughnessRaReference() {
  return (
    <div className="space-y-5">
      <Panel>
        <div className="space-y-2 text-sm leading-relaxed text-foreground">
          <p>
            <strong>Ra</strong> (ISO 4287) is the arithmetic mean deviation of the assessed profile — the average
            distance of the profile from its centre line. It is the most common roughness parameter on drawings and
            is written with the ISO 1302 basic symbol plus a value, e.g.{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">Ra 0.8</code> or the check-mark symbol with 0.8.
          </p>
          <p className="text-xs text-muted-foreground">
            Ra is insensitive to scratches and waviness — if function depends on peaks (seals, wear), also consider
            Rz or Rmax, and always specify the sampling (cut-off) length with the callout. Typical rule of thumb:
            Ra ≈ 0.2–0.25 × Rz for turned surfaces.
          </p>
        </div>
      </Panel>
      <RefTable
        title="Ra ranges by process"
        search
        cols={["Ra range", "Processes that achieve it", "Typical use"]}
        rows={PROCESS_ROWS.map((r) => r)}
      />
      <RefTable
        title="Application guidance"
        search
        cols={["Application", "Typical Ra"]}
        rows={APP_ROWS.map((r) => r)}
      />
    </div>
  );
}
