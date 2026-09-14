"use client";

import { RefTable } from "./ui";

/**
 * Tooling Library Browser — the common rotating cutting tools, their geometry,
 * what each is best at, and the situations that call for them.
 */

const ROWS: [string, string, string, string, string][] = [
  ["Square end mill", "2 flutes (alu) · 3–4 flutes (steel)", "Profiling, slotting, pocketing to square corners", "2-flute clears chips in aluminium; 4-flute is stiffer and gives better finish in steel", "Ø0.5–25 mm"],
  ["Ball nose end mill", "2–4 flutes", "3D surfacing, fillets, concave features", "Stepover ≈ 0.05–0.1 × Ø for smooth scallops", "Ø1–12 mm"],
  ["Corner-radius end mill", "3–5 flutes", "Pockets and profiles with blended corners", "Radius on the corner spreads cutting load and reduces chipping vs sharp corners", "Ø3–25 mm"],
  ["Roughing (corncob) end mill", "Serrated edges", "Heavy material removal", "Chips break into small segments — 30–50% faster removal at higher depth; leaves a rough wall", "Ø6–32 mm"],
  ["Face mill", "Inserted carbide", "Flat surfaces wider than the part", "Take the full width in one pass; wiper inserts give the flat finish", "Ø25–160 mm"],
  ["Drill (HSS)", "2 flutes", "General holes to H12–H13", "Spot first for accuracy; peck deep holes to clear chips", "Ø0.5–20 mm"],
  ["Drill (carbide)", "2–3 flutes", "Production holes, aluminium & cast iron", "Rigid machines only; needs high pressure coolant through the tool for deep holes", "Ø1–16 mm"],
  ["Indexable drill (U-drill)", "2 inserts", "Large holes fast", "Drills Ø12–50 mm at feed rates a twist drill can't reach; insert geometry sets hole tolerance", "Ø12–50 mm"],
  ["Spot / chamfer drill", "90° or 120° point", "Spotting holes, breaking edges, countersinks", "90° matches standard twist-drill points; 120° for carbide drills", "Ø3–20 mm"],
  ["Reamer", "6–12 flutes", "Holes to H7 tolerance (±0.01–0.02 mm)", "Leave 0.2–0.4 mm stock; run at ⅔ drill speed with constant feed — never dwell", "Ø1–32 mm"],
  ["Tap (spiral flute)", "Cutting tap", "Threading blind holes", "Spiral flute pulls chips out of blind holes; spiral point (gun) taps push them ahead in through holes", "M2–M24"],
  ["Slitting saw", "0.5–3 mm wide", "Parting, slots, deep thin grooves", "Side load is tiny; use a stiff arbor and coolant. Feed slowly — the saw is fragile in torsion", "Ø50–100 mm"],
];

export default function ToolingLibraryBrowser() {
  return (
    <RefTable
      title="Cutting tools"
      search
      cols={["Tool", "Geometry", "Best for", "Notes", "Common sizes"]}
      rows={ROWS.map((r) => r)}
      note="Tool geometry decides everything downstream: flute count is chosen by material (chip clearing vs stiffness), not by preference. When in doubt between a 3- and 4-flute cutter in steel, 4 flutes give better finish and longer edge life at the same feed rate."
    />
  );
}
