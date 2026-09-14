"use client";

import { RefTable } from "./ui";

/**
 * Fastener Reference Library — metric coarse thread pitches (ISO 261/262),
 * metric property classes (ISO 898-1) and SAE grades (SAE J429), the three
 * lookups a CAD drawing office does most.
 */

const PITCH_ROWS: [string, string][] = [
  ["M3", "0.5"], ["M4", "0.7"], ["M5", "0.8"], ["M6", "1.0"], ["M8", "1.25"], ["M10", "1.5"],
  ["M12", "1.75"], ["M16", "2.0"], ["M20", "2.5"], ["M24", "3.0"], ["M30", "3.5"], ["M36", "4.0"],
];

const CLASS_ROWS: [string, string, string, string][] = [
  ["4.6", "240", "400", "Low-strength general / non-structural"],
  ["5.8", "400", "520", "General commercial fasteners"],
  ["8.8", "640", "800", "Standard structural high-strength (most common engineering choice)"],
  ["10.9", "900", "1040", "High-strength; automotive, critical joints"],
  ["12.9", "1080", "1220", "Maximum metric strength; hydrogen-embrittlement sensitive if plated"],
];

const SAE_ROWS: [string, string, string, string][] = [
  ["Grade 2", "~57 ksi (≤3/4\")", "74 ksi", "Low carbon; general use"],
  ["Grade 5", "92 ksi", "120 ksi", "Medium carbon Q&T — the everyday automotive/industrial grade"],
  ["Grade 8", "130 ksi", "150 ksi", "Medium carbon alloy Q&T — high strength applications"],
];

export default function FastenerReferenceLibrary() {
  return (
    <div className="space-y-6">
      <RefTable
        title="Metric coarse thread pitch (mm)"
        search
        cols={["Thread", "Pitch (mm)"]}
        rows={PITCH_ROWS.map((r) => r)}
      />
      <RefTable
        title="Metric property classes — ISO 898-1 (proof/yield · UTS)"
        search
        cols={["Class", "Yield strength (MPa)", "Tensile strength (MPa)", "Typical use"]}
        rows={CLASS_ROWS.map((r) => r)}
      />
      <RefTable
        title="SAE grades — J429 (imperial)"
        search
        cols={["Grade", "Yield strength", "Tensile strength", "Typical use"]}
        rows={SAE_ROWS.map((r) => r)}
      />
    </div>
  );
}
