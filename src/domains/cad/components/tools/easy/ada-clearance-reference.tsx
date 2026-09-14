"use client";

import { RefTable } from "./ui";

/**
 * ADA Clearance Reference — key 2010 ADA Standards clearances used when
 * laying out accessible paths and spaces. Minimums shown; verify against the
 * adopted standards and any state amendments.
 */

const ROUTES: [string, string, string][] = [
  ["Accessible route width", "36 in min", "Reduce to 32 in for ≤ 24 in length at an obstruction"],
  ["Passing space", "60 × 60 in", "Required every 200 ft on an accessible route"],
  ["Turning space", "60 in circle", "Or a T-turn within a 60 × 60 in space"],
  ["Door clear opening", "32 in min", "Measured with door open 90°; 36 in preferred"],
  ["Door maneuvering — front approach", "30 × 48 in clear", "Pull side adds 18 in (or 12 in with closer) latch-side clearance"],
  ["Door maneuvering — hinge side", "36 × 48 in clear (pull)", "Hinge-side latch clearance 18 in pull / 12 in push"],
  ["Threshold height", "½ in max", "¼ in vertical + ¼ in beveled permitted"],
  ["Ramp slope", "1:12 max (8.33%)", "Cross slope ≤ 1:48; landings at top/bottom and ≤ 30 in rise"],
  ["Ramp landing", "60 in long min", "At least as wide as the ramp"],
  ["Corridor / aisle clear width", "36 in min", "Check the local code for occupant-load egress widths"],
];

const FIXTURES: [string, string, string][] = [
  ["Wheelchair clear floor space", "30 × 48 in", "Positioned for forward or parallel approach to the element"],
  ["Forward reach", "15–48 in high", "Over obstructions up to 25 in deep, reach 44 in max"],
  ["Side reach", "15–48 in high", "Over obstruction ≤ 34 in high / 24 in deep"],
  ["Knee clearance", "27 in high min", "Under counters/sinks: 30 in wide, 17–25 in deep"],
  ["Counter / work surface height", "28–34 in", "With knee space; at least one accessible work surface per area"],
  ["Toilet stall (standard)", "60 in wide × 56–60 in deep", "Floor-mounted or wall-hung toilet, grab bars both sides"],
  ["Toilet centerline", "16–18 in from side wall", "Grab bar behind: 36 in min on rear wall"],
  ["Lavatory", "34 in max rim height", "Knee clearance 27 in under front apron"],
  ["Drinking fountain", "30 in spout max", "Forward approach knee/toe clearance; 36 in min width alcove"],
  ["Parking space (van)", "132 in wide min", "96 in wide for standard + 60 in aisle; total 16 ft 0 in for van"],
];

export default function AdaClearanceReference() {
  return (
    <div className="space-y-6">
      <RefTable
        title="Routes, doors & ramps (2010 ADA Standards)"
        cols={["Element", "Minimum", "Notes"]}
        rows={ROUTES.map((r) => r)}
      />
      <RefTable
        title="Fixtures & reach"
        cols={["Element", "Minimum", "Notes"]}
        rows={FIXTURES.map((r) => r)}
        note="Clearances shown are the ADA minimums for new construction. Alterations, historic buildings and state codes each have their own provisions — these numbers are the starting point, not the whole compliance story."
      />
    </div>
  );
}
