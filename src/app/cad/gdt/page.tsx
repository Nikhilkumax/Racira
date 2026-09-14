import { Metadata } from "next";
import Link from "next/link";
import {
  GDNT_CONCEPTS,
  GDNT_NOTATION,
  GDNT_SYMBOLS,
  glyph,
  gdtSymbolPath,
} from "@/domains/cad/components/tools/easy/gdnt-shared";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "GD&T Symbol Library — Every Geometric Tolerancing Symbol | Racira",
  description:
    "Plain-language GD&T library: the 14 geometric characteristic symbols with definitions, tolerance-zone rules and measurement notes, plus the modifiers, rules, datum concepts and general dimensioning notation behind them.",
  alternates: {
    canonical: "/cad/gdt",
  },
  openGraph: {
    title: "GD&T Symbol Library — Every Geometric Tolerancing Symbol",
    description:
      "Plain-language GD&T library: the 14 geometric characteristic symbols with definitions, tolerance-zone rules and measurement notes, plus the modifiers, rules, datum concepts and general dimensioning notation behind them.",
    type: "website",
  },
};

const CATEGORY_ORDER = ["Form", "Profile", "Orientation", "Location", "Runout"] as const;

/**
 * GD&T symbol library index (/cad/gdt) — non-tool reference content that
 * groups the 14 characteristic symbols by tolerance type and links to the
 * individual symbol pages (/cad/gdt/[symbol]). Data lives in gdnt-shared.tsx.
 */
export default function GdtLibraryIndex() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="CAD" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-16">
          <nav aria-label="breadcrumb" className="mb-6">
            <Link
              href="/cad"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span aria-hidden="true">←</span> CAD tools
            </Link>
          </nav>

          <header className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              GD&amp;T reference
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              GD&amp;T Symbol Library
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The fourteen geometric characteristic symbols of ASME Y14.5 / ISO 1101, grouped by
              tolerance type — plus the modifiers, rules, datum concepts, and general dimensioning
              notation behind them. Each page explains what the control does, how its tolerance
              zone works, how MMC/LMC modifiers apply, and how the feature is measured.
            </p>
          </header>

          <div className="mt-8 space-y-8">
            {CATEGORY_ORDER.map((cat) => {
              const rows = GDNT_SYMBOLS.filter((s) => s.category === cat);
              if (!rows.length) return null;
              return (
                <section key={cat}>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    {cat} tolerances
                  </h2>
                  {/* Same card / grid classes as the /cad homepage ToolCard + CategorySection. */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {rows.map((s) => (
                      <div
                        key={s.kind}
                        className="tool-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default"
                      >
                        <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {glyph(s.kind, "h-5 w-5")}
                        </div>
                        <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                          {s.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{s.meaning}</p>
                        <div className="mt-auto pt-3">
                          {s.guide ? (
                            <Link
                              href={gdtSymbolPath(s.kind)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Learn Symbol <span aria-hidden="true">→</span>
                            </Link>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              {s.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Modifiers, rules &amp; datums
              </h2>
              {/* Same card / grid classes as the symbol sections above. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {GDNT_CONCEPTS.map((c) => (
                  <div
                    key={c.kind}
                    className="tool-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default"
                  >
                    <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {glyph(c.kind, "h-5 w-5")}
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{c.meaning}</p>
                    <div className="mt-auto pt-3">
                      <Link
                        href={gdtSymbolPath(c.kind)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Learn More <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
                General dimensioning notation
              </h2>
              {/* Same card grid as the sections above; the tag splits the
                  dimension-type conventions from the size symbols. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {GDNT_NOTATION.map((n) => (
                  <div
                    key={n.kind}
                    className="tool-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-default"
                  >
                    <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {glyph(n.kind, "h-5 w-5")}
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                      {n.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{n.meaning}</p>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <Link
                        href={gdtSymbolPath(n.kind)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Learn More <span aria-hidden="true">→</span>
                      </Link>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {n.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
