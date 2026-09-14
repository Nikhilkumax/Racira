"use client";

import { RefTable } from "./ui";

/**
 * Ceiling Height Reference — common minimum ceiling-height rules in the model
 * codes (IRC residential, IBC commercial). Verify against the adopted edition;
 * exceptions for beams/ducts and sloped ceilings exist in every code.
 */

const ROWS: [string, string, string, string][] = [
  ["Habitable rooms (residential)", "7 ft 0 in", "IRC R305.1", "Living, sleeping, dining, kitchen — measured to the lowest ceiling point"],
  ["Hallways & corridors (residential)", "7 ft 0 in", "IRC R305.1", "Corridor obstruction exceptions apply"],
  ["Bathrooms / toilet rooms", "7 ft 0 in", "IRC R305.1", "Above required fixture clearance zones only"],
  ["Basements with habitable use", "7 ft 0 in", "IRC R305.1", "Under-floor spaces excluded"],
  ["Commercial habitable spaces", "7 ft 6 in", "IBC 1208.2", "Offices, classrooms, retail — corridors too"],
  ["Commercial corridors", "7 ft 6 in", "IBC 1208.2", "Exception: ceiling may slope; see code"],
  ["Under beams / ducts", "6 ft 4 in min", "IRC R305.1 exception", "Obstructions may project, but not below the minimum at any point"],
  ["Mechanical / equipment rooms", "per equipment", "—", "Set by access and clearances of the installed equipment"],
  ["Sloped ceilings", "avg ≥ min height", "IRC / IBC", "At least half the room at full height; the low side has a floor minimum"],
];

export default function CeilingHeightReference() {
  return (
    <RefTable
      title="Minimum ceiling heights"
      cols={["Space", "Minimum", "Source", "Notes"]}
      rows={ROWS.map((r) => r)}
      note="Heights are to finished ceiling / underside of the structural element, measured at the lowest point of the room. Ceiling height is separate from headroom rules at stairs, doors and under equipment — and the adopted code edition is the authority, not this summary."
    />
  );
}
