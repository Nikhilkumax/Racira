"use client";

import { RefTable } from "./ui";

/**
 * Valve Type Reference — the common valve families, their flow behaviour and
 * the applications each one suits (concept selection; consult the project
 * specification for the final choice).
 */

const ROWS: [string, string, string, string][] = [
  ["Gate valve", "On/off (isolation)", "Low pressure drop when fully open; poor throttling", "Water, oil, gas mains; block valves"],
  ["Globe valve", "Throttling / regulation", "Good control at partial opening, higher drop", "Steam, control bypass, flow balancing"],
  ["Ball valve", "Quarter-turn on/off", "Near-zero drop, tight shut-off, fast action", "Isolation in most services incl. gas"],
  ["Butterfly valve", "Quarter-turn on/off / light throttling", "Compact, low cost at large sizes, modest drop", "Large water & HVAC mains"],
  ["Check valve (swing/lift/spring)", "Prevent reverse flow", "Auto-acting; swing = low drop, lift = higher", "Pump discharge, backflow prevention"],
  ["Needle valve", "Fine metering", "Very precise small-flow control", "Instrumentation, hydraulics, sampling"],
  ["Diaphragm valve", "On/off + throttling", "Fluid isolated from mechanism; good for slurries", "Corrosive, food, pharma, slurry duty"],
  ["Plug valve", "Quarter-turn on/off", "Straight-through port, tight shut-off", "Gas distribution, viscous fluids"],
  ["Pressure-reducing valve (PRV)", "Regulate downstream pressure", "Self-acting or piloted", "Steam/air/water reducing stations"],
  ["Relief / safety valve", "Pressure protection", "Opens at set pressure to protect system", "Boilers, pressure vessels, compressors"],
];

export default function ValveTypeReference() {
  return (
    <RefTable
      title="Valve types"
      search
      cols={["Valve", "Primary function", "Flow behaviour", "Typical application"]}
      rows={ROWS.map((r) => r)}
      note="Size valves for the pipe size and duty, not the other way round. Ball/butterfly are isolation valves — using them to throttle causes seat erosion and poor control; use globe, needle or diaphragm types when modulating."
    />
  );
}
