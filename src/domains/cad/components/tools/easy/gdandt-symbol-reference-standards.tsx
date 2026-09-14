"use client";

import Link from "next/link";
import { GDNT_SYMBOLS, GdntTable, glyph, gdtSymbolPath } from "./gdnt-shared";

/**
 * GD&T Symbol Reference (Standards) — the same symbol set as the Measurement
 * reference, but annotated with the tolerance-zone / datum rules from
 * ASME Y14.5-2018 and ISO 1101 that govern how each control is applied.
 * Symbols with a long-form entry (pilot: Position) link to their full
 * reference page under /cad/gdt, mirroring the Measurement browse tool.
 */
export default function GdandtSymbolReferenceStandards() {
  return (
    <div className="space-y-5">
      <p className="rounded-lg border border-border bg-card/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Zones and datum rules below follow ASME Y14.5-2018 (ISO 1101 uses the same symbols with some zone and
        modifier differences). “t” is the tolerance value in the feature control frame. MMC/LMC modifiers apply
        to size-related controls.
      </p>
      <GdntTable
        rows={GDNT_SYMBOLS.map((s) => [
          glyph(s.kind),
          <span key="n">
            {s.name} <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground">{s.category}</span>
          </span>,
          s.rule,
          s.guide ? (
            <Link
              href={gdtSymbolPath(s.kind)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              Learn Symbol <span aria-hidden="true">→</span>
            </Link>
          ) : null,
        ])}
      />
    </div>
  );
}
