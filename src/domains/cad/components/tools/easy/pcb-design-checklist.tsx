"use client";

import { Checklist } from "./ui";

/**
 * PCB Design Checklist — common review items across schematic, layout and
 * manufacturing-readiness. Interactive checklist with progress.
 */
export default function PcbDesignChecklist() {
  return (
    <Checklist
      testid="pcb-checklist"
      groups={[
        {
          name: "Schematic",
          items: [
            "All nets connected — no unconnected pins or dangling labels",
            "Power rails labeled consistently (net names match layout)",
            "Decoupling caps placed on every IC power pin in schematic",
            "Polarity marked on all polarized parts (caps, diodes, LED)",
            "Pull-up / pull-down resistors sized and documented",
            "Fuse / protection on any input that can be miswired",
          ],
        },
        {
          name: "Stackup & clearances",
          items: [
            "Trace width sized for current (IPC-2221 check done)",
            "Clearance rules match the fab's minimums and your voltage",
            "Copper pour islands / orphaned copper removed or connected",
            "Thermal reliefs on pours connecting to through-hole pads",
            "Impedance-controlled nets match stackup (if high-speed)",
          ],
        },
        {
          name: "Assembly & DFM",
          items: [
            "Solder mask dams between fine-pitch pads (≥ fab minimum)",
            "Silkscreen does not overlap pads (ref-des readable after assembly)",
            "Fiducials present for stencil / pick-and-place (if applicable)",
            "Board outline, mounting holes and tooling notes on mechanical layer",
            "No text or copper under components that would short",
          ],
        },
        {
          name: "Release",
          items: [
            "BOM matches schematic reference designators exactly",
            "Gerbers + drill files pass the fab's online DFM check",
            "Readme: stackup, impedance notes, special instructions to fab",
            "Revision and date updated in title block",
          ],
        },
      ]}
    />
  );
}
