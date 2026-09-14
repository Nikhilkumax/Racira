import { Fragment } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  GDNT_CONCEPTS,
  GDNT_NOTATION,
  GDNT_SYMBOLS,
  GuideText,
  gdtEntry,
  glyph,
  gdtSymbolPath,
} from "@/domains/cad/components/tools/easy/gdnt-shared";
import { GdntDiagram } from "@/domains/cad/components/tools/easy/gdnt-diagrams";
import Header from "@/components/Header";

type PageProps = {
  params: Promise<{ symbol: string }>;
};

/**
 * GD&T library — individual page (/cad/gdt/[slug]), serving BOTH content
 * types: the 14 characteristic symbols and the concept pages (modifiers,
 * rules, datums, the frame). Reference content, NOT a tool: it intentionally
 * lives outside the /cad/[slug] tool registry and is not counted by
 * cad-reconcile.mjs. The three-segment URL follows the existing non-tool
 * content precedent (/finance/blog/[slug], /finance/authors/[slug]); the
 * `gdt` host segment keeps slugs clear of the flat tool-slug namespace.
 *
 * Data source is the `guide` field on GdntSymbol / GdntConcept in
 * gdnt-shared.tsx — the combined lookup (gdtEntry) keeps symbols and
 * concepts on one route so browsing stays continuous between them.
 */
export async function generateStaticParams() {
  return [
    ...GDNT_SYMBOLS.filter((s) => s.guide).map((s) => ({ symbol: s.kind })),
    ...GDNT_CONCEPTS.map((c) => ({ symbol: c.kind })),
    ...GDNT_NOTATION.map((n) => ({ symbol: n.kind })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const found = gdtEntry(symbol);
  if (!found) return { title: "Not Found — CAD is fixed" };
  const { guide } = found;
  return {
    title: guide.seoTitle ?? `${guide.title} — CAD is fixed`,
    description: guide.summary,
    alternates: {
      canonical: gdtSymbolPath(symbol),
    },
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.summary,
      type: "article",
    },
  };
}

export default async function GdtSymbolPage({ params }: PageProps) {
  const { symbol } = await params;
  const found = gdtEntry(symbol);
  if (!found) notFound();
  const { type, entry, guide } = found;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header mode="category" categoryName="CAD" />
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-16">
          {/* Content column constrained for prose readability; page container
              itself matches the /cad homepage (max-w-7xl px-6). */}
          <div className="max-w-2xl">
          <nav aria-label="breadcrumb" className="mb-6">
            <Link
              href="/cad/gdt"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> GD&amp;T symbol library
            </Link>
          </nav>

          <article>
            <header className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border bg-card/40">
                {glyph(entry.kind)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {type === "symbol"
                    ? `GD&T symbol · ${entry.category} tolerance`
                    : type === "concept"
                      ? `GD&T concept · ${entry.tag}`
                      : `Dimensioning notation · ${entry.tag}`}
                </p>
                <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  {guide.title}
                </h1>
              </div>
            </header>

            {/* Guide content uses the platform's shared long-form typography
                (.seo-prose — h2/p/li/code/strong rules from globals.css), the
                same class shipped on CAD/PDF/Developers SEO content. Custom
                sizes are NOT used here; .seo-prose is consumed as-is. */}
            <div className="seo-prose mt-5">
              <p>{entry.meaning}</p>

              {/* Sections render as direct children of .seo-prose via Fragments
                  (no wrapper DOM node), matching how SeoContent consumes the
                  class — its h2 `mt-8 first:mt-0` rhythm only works that way. */}
              {guide.sections.map((section) => (
                <Fragment key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.text.map((paragraph, i) => (
                    <p key={i}>
                      <GuideText text={paragraph} />
                    </p>
                  ))}
                  {section.list && section.list.length > 0 && (
                    <ul className="mb-4 list-disc space-y-2 pl-6">
                      {section.list.map((item, i) => (
                        <li key={i}>
                          <GuideText text={item} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.diagram && <GdntDiagram diagram={section.diagram} />}
                </Fragment>
              ))}

              {guide.seeAlso && guide.seeAlso.length > 0 && (
                <div className="mt-8 border-t border-border/60 pt-4">
                  <p>
                    Related:{" "}
                    {guide.seeAlso.map((ref, i) => (
                      <span key={ref.href}>
                        {i > 0 && " · "}
                        <Link href={ref.href} className="font-medium text-primary hover:underline">
                          {ref.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </article>
          </div>
        </div>
      </main>
    </div>
  );
}
