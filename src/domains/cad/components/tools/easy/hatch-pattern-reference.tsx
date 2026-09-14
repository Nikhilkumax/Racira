"use client";

import { RefTable } from "./ui";

type Pattern = { name: string; std: string; use: string; lines: { ang: number; d: number }[] };

/** Each pattern is described by a set of parallel line families (angle + spacing). */
const PATTERNS: Pattern[] = [
  { name: "ANSI31", std: "ANSI Y14.2", use: "General purpose section lines (iron, general)", lines: [{ ang: 45, d: 8 }] },
  { name: "ANSI32", std: "ANSI Y14.2", use: "Steel", lines: [{ ang: 45, d: 8 }, { ang: -45, d: 16 }] },
  { name: "ANSI33", std: "ANSI Y14.2", use: "Brass, bronze, copper", lines: [{ ang: 45, d: 8 }, { ang: 45, d: 16 }] },
  { name: "ANSI34", std: "ANSI Y14.2", use: "Rubber, plastic, electrical insulation", lines: [{ ang: 45, d: 8 }, { ang: -45, d: 8 }] },
  { name: "ANSI35", std: "ANSI Y14.2", use: "Firebrick, refractory", lines: [{ ang: 0, d: 8 }, { ang: 90, d: 8 }] },
  { name: "ANSI37", std: "ANSI Y14.2", use: "Cork, felt, fabric", lines: [{ ang: 45, d: 4 }] },
  { name: "ANSI38", std: "ANSI Y14.2", use: "Marble, slate, glass", lines: [{ ang: 30, d: 8 }, { ang: -60, d: 8 }] },
  { name: "BRICK", std: "ISO / generic", use: "Brick or block masonry in elevation", lines: [{ ang: 0, d: 12 }, { ang: 90, d: 12 }] },
  { name: "CONCRETE", std: "ISO / generic", use: "Concrete in section", lines: [{ ang: 45, d: 8 }, { ang: -45, d: 8 }, { ang: 0, d: 24 }] },
  { name: "EARTH", std: "ISO / generic", use: "Earth / soil hatching", lines: [{ ang: 0, d: 7 }, { ang: 90, d: 7 }] },
  { name: "SAND", std: "ISO / generic", use: "Sand, gravel, aggregate", lines: [{ ang: 45, d: 4 }] },
  { name: "WOOD", std: "ISO / generic", use: "Wood across the grain (section)", lines: [{ ang: 0, d: 10 }, { ang: 90, d: 10 }] },
];

function Thumb({ lines }: { lines: Pattern["lines"] }) {
  // Build parallel families of diagonal lines inside a 56×24 box.
  const families = lines.map((l) => {
    const rad = (l.ang * Math.PI) / 180;
    const dir = { x: Math.cos(rad), y: Math.sin(rad) };
    // step spacing along the normal
    const nx = -dir.y, ny = dir.x;
    const segs: string[] = [];
    for (let off = -30; off <= 30; off += l.d) {
      // point on the center line
      const cx = 28 + nx * off;
      const cy = 12 + ny * off;
      // extend a long segment through the box
      const ax = cx - dir.x * 40, ay = cy - dir.y * 40;
      const bx = cx + dir.x * 40, by = cy + dir.y * 40;
      segs.push(`M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}`);
    }
    return segs.join(" ");
  });
  return (
    <svg width="56" height="24" viewBox="0 0 56 24" aria-hidden="true" className="rounded-sm border border-border bg-background">
      <path d={families.join(" ")} stroke="#475569" strokeWidth="1" />
    </svg>
  );
}

/**
 * Hatch Pattern Reference — common ANSI/ISO hatch patterns with live SVG
 * thumbnails, for section views and material callouts.
 */
export default function HatchPatternReference() {
  return (
    <RefTable
      title="Common hatch patterns"
      search
      cols={["Pattern", "Standard", "Typical use", "Sample"]}
      rows={PATTERNS.map((p) => [p.name, p.std, p.use, <Thumb key={p.name} lines={p.lines} />])}
      note="Pattern codes match the hatch names used in AutoCAD and most CAD packages, so a drawing exported with these names maps cleanly onto standard libraries."
    />
  );
}
