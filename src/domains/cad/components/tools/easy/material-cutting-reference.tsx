"use client";

import { RefTable } from "./ui";

/**
 * Material Cutting Reference — starting cutting parameters (milling) for common
 * materials. Speeds in metres per minute of surface speed; feeds per tooth.
 * Values are conservative starting points for HSS and carbide tooling with a
 * 3–6 mm diameter cutter — always start lower and work up.
 */

const ROWS: [string, string, string, string, string][] = [
  ["Low-carbon steel (1018/A36)", "Annealed", "HSS 25–35 · carbide 90–140", "0.05–0.13", "Climb mill; flood coolant. Carbide needs rigid setup and climb cutting to avoid edge chipping."],
  ["Alloy steel (4140)", "Annealed", "HSS 20–30 · carbide 70–110", "0.04–0.10", "Keep chip load steady — no dwell. Coolant recommended."],
  ["Tool steel (O1/A2/D2)", "Annealed", "HSS 18–25 · carbide 60–90", "0.04–0.08", "Run at the low end with new carbide. Watch for work hardening on D2."],
  ["Stainless steel (304)", "Annealed", "HSS 15–25 · carbide 50–90", "0.03–0.08", "Work-hardens fast: constant feed, sharp tool, never let it rub. Climb mill."],
  ["Aluminium (6061)", "T6", "HSS 120–200 · carbide 300–500", "0.05–0.12", "2-flute polished cutters clear chips best. No coolant needed but mist helps."],
  ["Aluminium casting (A356)", "As cast", "HSS 90–150 · carbide 250–400", "0.05–0.10", "Abrasive oxide skin — start at 75% speed on the first pass."],
  ["Brass (360)", "Free-cutting", "HSS 90–150 · carbide 250–450", "0.05–0.10", "Sharp rake to avoid grabbing. Dry or light oil."],
  ["Copper (C110)", "Annealed", "HSS 60–100 · carbide 180–300", "0.04–0.08", "Gummy — climb mill, sharp edges, keep feed up to avoid smearing."],
  ["Grey cast iron (G25/30)", "As cast", "HSS 40–60 · carbide 100–180", "0.08–0.15", "Chips are abrasive powder — dry cut with air blast or MQL; carbide lasts longest."],
  ["Titanium (Ti-6Al-4V)", "Annealed", "HSS 15–25 · carbide 40–80", "0.02–0.05", "Low speed, high feed-per-tooth, lots of coolant. Never dwell or rub."],
  ["Engineering plastics (Delrin, nylon)", "—", "HSS 100–200 · carbide 300–600", "0.03–0.08", "2-flute, polished flutes, mist coolant — heat melts the chip back onto the edge."],
  ["Hardwoods / plywood", "—", "HSS 150–300 · carbide 400–800", "0.05–0.13", "Sharp carbide mandatory for clean edges; dust extraction, climb mill for tear-out control."],
];

export default function MaterialCuttingReference() {
  return (
    <RefTable
      title="Starting cutting parameters — end milling"
      search
      cols={["Material", "Condition", "Surface speed (m/min)", "Feed per tooth (mm)", "Notes"]}
      rows={ROWS.map((r) => r)}
      note="These are starting points, not recommendations for a specific machine: real parameters depend on tool diameter, flute count, machine rigidity, toolholder run-out and coolant. Halve the speed for HSS at diameters under 3 mm and for long-reach tooling; if unsure, cut a test slot and listen to the tool."
    />
  );
}
