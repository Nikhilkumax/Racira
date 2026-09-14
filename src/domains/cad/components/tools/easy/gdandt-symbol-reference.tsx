"use client";

import Link from "next/link";
import { GDNT_SYMBOLS, GdntTable, glyph, gdtSymbolPath } from "./gdnt-shared";

const CATEGORY_ORDER = ["Form", "Profile", "Orientation", "Location", "Runout"] as const;

/**
 * GD&T Symbol Reference — browse geometric tolerancing symbols grouped by
 * characteristic type, with a plain-language meaning for each. Every row uses
 * the compact grid style; symbols with a long-form entry (currently the True
 * Position pilot) additionally link to their full reference page under
 * /cad/gdt ("Learn Symbol →"). Zone/datum rules live in the (Standards) tool.
 */
export default function GdandtSymbolReference() {
  return (
    <div className="space-y-5">
      {CATEGORY_ORDER.map((cat) => {
        const rows = GDNT_SYMBOLS.filter((s) => s.category === cat);
        if (!rows.length) return null;
        return (
          <div key={cat}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {cat} tolerances
            </h2>
            <GdntTable
              rows={rows.map((s) => [
                glyph(s.kind),
                s.name,
                s.meaning,
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
      })}
    </div>
  );
}
