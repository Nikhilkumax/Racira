"use client";

import { RefTable } from "./ui";

/**
 * Material Selection Guide (mechanical) — quick-comparison table of common
 * engineering materials. Values are typical published figures for the most
 * common temper/condition; exact properties depend on temper, thickness and
 * standard, so verify against the material spec before design release.
 */

const ROWS: [string, string, string, string, string][] = [
  ["Aluminium 6061-T6", "2.70", "276 (Sy)", "69", "Excellent machinability; general structural, brackets, enclosures"],
  ["Aluminium 7075-T6", "2.81", "503 (Sy)", "72", "High strength-to-weight; aerospace, but poor weldability"],
  ["Steel A36", "7.85", "250 (Sy)", "200", "General structural shapes and plates; weldable"],
  ["Steel 1045 (as-rolled)", "7.85", "~450 (Sy)", "205", "Shafts, axles, gears when heat treated"],
  ["Steel 4140 (Q&T)", "7.85", "~655–1200 (Sy, by temper)", "205", "High-strength machine parts, shafts, tooling"],
  ["Stainless 304", "8.00", "215 (Sy)", "193", "Corrosion resistance, food/pharma; work-hardens when machined"],
  ["Stainless 316", "8.00", "290 (Sy)", "193", "Better chloride/pitting resistance than 304"],
  ["Titanium 6Al-4V (Ti-64)", "4.43", "880 (Sy)", "114", "Best strength/weight + corrosion; expensive, poor chip machining"],
  ["Brass C360 (free-cutting)", "8.50", "~205 (Sy)", "97", "Superb machinability; fittings, valve parts"],
  ["Copper C110", "8.94", "~70 (Sy)", "117", "Electrical conductivity; soft — work hardens"],
  ["Nylon 6/6 (dry)", "1.14", "~83 (tensile)", "2.8", "Bearings, gears, bushes; absorbs moisture (changes properties)"],
  ["Acetal (POM)", "1.41", "~62 (tensile)", "2.6", "Low friction, precise machined plastic parts"],
  ["ABS", "1.05", "~40 (tensile)", "2.3", "3D-print, housings; low heat resistance"],
  ["GFRP (glass-fibre laminate)", "~1.9", "~150–350 (tensile)", "~20–35", "Anisotropic — properties follow fibre direction"],
];

export default function MaterialSelectionGuideMechanical() {
  return (
    <RefTable
      title="Common engineering materials at a glance"
      search
      cols={["Material", "Density g/cm³", "Strength (MPa)", "E-modulus (GPa)", "Typical use / notes"]}
      rows={ROWS.map((r) => r)}
      note="Steel grades shown are representative. For load-bearing parts use the certified minimum properties of the exact specification (e.g. ASTM A36 vs A572-50 differ)."
    />
  );
}
