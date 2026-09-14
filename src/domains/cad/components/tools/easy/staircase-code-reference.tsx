"use client";

import { RefTable } from "./ui";

/**
 * Staircase Code Reference — IRC vs IBC stair geometry rules side by side.
 * Verify the adopted edition; occupancy-specific width/egress rules apply.
 */

const ROWS: [string, string, string, string][] = [
  ["Maximum riser height", "7¾ in (197 mm)", "7 in (178 mm)", "IRC allows a steeper stair for dwellings"],
  ["Minimum tread depth", "10 in (254 mm)", "11 in (279 mm)", "IBC measures tread depth differently (nosing rules)"],
  ["Minimum stair width", "36 in (914 mm)", "44 in (1118 mm)", "IBC width is per occupant load / occupancy"],
  ["Headroom", "6 ft 8 in (2032 mm)", "6 ft 8 in (2032 mm)", "Measured vertically from the nosing line"],
  ["Handrail height", "34–38 in (864–965 mm)", "34–38 in (864–965 mm)", "Measured from stair nosing to top of rail"],
  ["Grip size / clearance", "1¼–2 in dia or equivalent", "same", "Finger clearance 1½ in behind the rail"],
  ["Landings", "Width = stair, ≥ 36 in long", "Width = stair", "Required top and bottom of every stair"],
  ["Landing spacing", "Every 12 ft of rise (max)", "Every 12 ft (max)", "IBC: intermediate landings per 1011.6"],
  ["Open risers", "≤ 4 in vertical opening", "not permitted (closed)", "Children's fall-through rule, IRC only"],
  ["Riser/tread uniformity", "Max 3/16 in variation", "Max 3/16 in variation", "Between the smallest and largest in the flight"],
];

export default function StaircaseCodeReference() {
  return (
    <RefTable
      title="Stair geometry — IRC (residential) vs IBC (commercial)"
      cols={["Rule", "IRC", "IBC", "Notes"]}
      rows={ROWS.map((r) => r)}
      note="Values are the model-code minimums. Egress stairs in high-occupancy buildings may need wider stairs, and every jurisdiction adopts specific editions with amendments — always verify against the local code before release."
    />
  );
}
