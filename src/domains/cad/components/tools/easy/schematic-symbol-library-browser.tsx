"use client";

import { RefTable } from "./ui";

/**
 * Schematic Symbol Library Browser — common schematic symbols with their
 * ANSI/IEC conventions and typical usage. Text-description reference; symbols
 * are sketched per standard when placing parts in a real schematic tool.
 */

const ROWS: [string, string, string][] = [
  ["Resistor", "Zigzag (ANSI) or rectangle (IEC)", "Value in Ω; use k/M prefixes in schematics"],
  ["Capacitor (non-polarized)", "Two parallel lines", "Value in pF/nF/µF; orientation-free"],
  ["Capacitor (polarized)", "Parallel lines + curved plate", "Positive lead to the straight plate; mind polarity"],
  ["Inductor", "Series of loops or bumps", "Value in µH/mH; core shown if ferrite/iron"],
  ["Diode", "Triangle pointing at a bar (cathode)", "Current flows triangle → bar; band on part = cathode"],
  ["LED", "Diode with two outward arrows", "Forward drop ~2–3.5 V — series resistor required"],
  ["Zener diode", "Diode with bent (Z) bar", "Operates in reverse breakdown for regulation"],
  ["Transistor NPN", "Circle with arrow out of emitter", "Arrow out = NPN; arrow in = PNP"],
  ["MOSFET", "3-terminal with channel gap", "N/P-channel; arrow direction differs; body diode shown"],
  ["Operational amplifier", "Triangle with + / − inputs", "Output at apex; supply pins often omitted"],
  ["AND / OR gate", "D-shape / curved input side", "ANSI rectangle with & / ≥1 inside is IEC style"],
  ["Inverter (NOT)", "Triangle with output bubble", "Bubble = inversion; also on any gate output"],
  ["Ground", "3 or 4 shrinking horizontal bars", "Signal/earth/chassis variants exist"],
  ["Fuse", "Rectangle with line through (or S curve)", "Rating in A; also shows voltage rating on print"],
  ["Switch (SPST)", "Two contacts + moving blade", "Normally-open shown; add labels for NC"],
  ["Transformer", "Two coupled inductor loops", "Dots mark polarity; ratio shown as turns/volts"],
  ["Crystal / oscillator", "Rectangle between two plates", "Frequency marked; load capacitance external"],
];

export default function SchematicSymbolLibraryBrowser() {
  return (
    <RefTable
      title="Common schematic symbols"
      search
      cols={["Symbol", "Sketched as", "Notes"]}
      rows={ROWS.map((r) => r)}
      note="Symbol style differs between ANSI/Y14 and IEC 60617 — pick one convention per drawing set and stay consistent. These are the reference conventions, not artwork to copy literally."
    />
  );
}
