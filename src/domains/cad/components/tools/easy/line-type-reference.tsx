"use client";

import { RefTable } from "./ui";

type LineType = { name: string; aliases: string; use: string; dash: string; segs: number[] };

const TYPES: LineType[] = [
  { name: "Continuous", aliases: "Solid", use: "Visible outlines, edges of parts", dash: "—", segs: [] },
  { name: "Dashed", aliases: "Hidden (USA)", use: "Hidden edges and outlines", dash: "3–6 mm dashes", segs: [6, 3] },
  { name: "Center", aliases: "Centre (ISO)", use: "Centre lines, symmetry axes, pitch circles", dash: "long dash – short dash", segs: [10, 3, 2, 3] },
  { name: "Phantom", aliases: "", use: "Adjacent parts, alternative positions, repeated features", dash: "long dash – double short dash", segs: [10, 2.5, 2, 2.5, 2, 2.5] },
  { name: "Cutting plane", aliases: "Section", use: "Cutting plane lines in section views", dash: "long dash – dot – long dash", segs: [12, 3, 2, 3] },
  { name: "Dimension", aliases: "Extension/leader", use: "Dimension, extension and leader lines", dash: "—", segs: [] },
  { name: "Break", aliases: "Short break (ISO 128)", use: "Short breaks in long parts", dash: "thick zigzag", segs: [4, 2] },
];

function Sample({ segs }: { segs: number[] }) {
  if (segs.length === 0) return <div className="h-[3px] w-full rounded bg-foreground/70" />;
  return (
    <svg width="120" height="10" viewBox="0 0 120 10" aria-hidden="true" className="w-28">
      <line x1="0" y1="5" x2="120" y2="5" stroke="#475569" strokeWidth="1.6" strokeDasharray={segs.join(" ")} />
    </svg>
  );
}

/**
 * Line Type Reference — standard CAD line types, their dash patterns and
 * drawing uses (ISO 128 / ASME Y14.2 conventions).
 */
export default function LineTypeReference() {
  return (
    <RefTable
      title="Standard line types"
      search
      cols={["Line type", "Also called", "Typical use", "Dash pattern", "Sample"]}
      rows={TYPES.map((t) => [t.name, t.aliases || "—", t.use, t.dash, <Sample key={t.name} segs={t.segs} />])}
      note="Line weights: visible outlines are usually the thickest on a drawing; hidden, centre and dimension lines are thin. Assigning weights by line type (not by colour) is the core of the layer-convention approach."
    />
  );
}
