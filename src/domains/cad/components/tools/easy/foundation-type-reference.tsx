"use client";

import { RefTable } from "./ui";

/**
 * Foundation Type Reference — foundation families, how they carry load and the
 * situations that favour each. Concept reference; geotechnical design always
 * follows the soil report and the governing code.
 */

const ROWS: [string, string, string, string][] = [
  ["Spread footing (isolated)", "Column load → bearing on soil at a shallow depth", "Isolated columns, good/competent soil, light-moderate loads", "Typically 1–3 m deep; economy falls fast as soil gets weak or loads get heavy"],
  ["Continuous (strip) footing", "Wall load → strip bearing", "Bearing walls, perimeter foundations, residential/commercial", "Cheap and simple; requires uniform soil"],
  ["Raft / mat foundation", "Whole building footprint bears on soil", "Weak soil, high loads, or heavy basement water pressure; differential settlement control", "Effectively one giant footing; common for basements in poor soil"],
  ["Pile foundation (driven)", "Load to deep competent strata via friction/end bearing", "Weak upper soils, heavy structures, scour risk (bridges)", "Driven concrete/steel/timber; noise & vibration constraints apply"],
  ["Bored pile / drilled pier", "Cast-in-place shaft to deep bearing", "Urban sites (low vibration), large column loads", "Shafts up to ~2–3 m Ø; necking risk in soft soils"],
  ["Caisson (open/box)", "Large dry enclosure sunk to bearing depth", "Bridges, deep basements, waterfront", "Expensive, heavy civil works — rarely for ordinary buildings"],
];

export default function FoundationTypeReference() {
  return (
    <RefTable
      title="Foundation types"
      search
      cols={["Type", "How it carries load", "Situation that suits it", "Notes"]}
      rows={ROWS.map((r) => r)}
      note="Selection is governed by: soil bearing capacity & settlement at the footing depth, groundwater, frost depth, seismic site class, and the column/wall loads. Shallow (footings/mat) is almost always tried first."
    />
  );
}
