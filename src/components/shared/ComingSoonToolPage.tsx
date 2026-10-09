import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import type { RelatedToolItem } from "@/lib/tools/soonRelated";

/**
 * Shared Coming Soon page for tool slugs whose registry status is not "live".
 *
 * Domain-agnostic: every domain-specific value (brand, labels, links, related
 * tools) is passed in as plain data, so nothing here imports a domain registry.
 * Navigation never dead-ends — the page always links back to the domain and to
 * the tool's category, plus a related row that falls back to other upcoming
 * tools when the domain has no live tools yet.
 */
export interface ComingSoonToolPageProps {
  toolName: string;
  toolDescription: string;
  /** Lucide icon component from the registry, when the entry has one. */
  icon?: React.ComponentType<{ className?: string }> | null;
  /** Domain brand string, e.g. "Racira Photography". */
  siteName: string;
  /** Human label for the domain, e.g. "Photography". */
  domainLabel: string;
  /** Domain landing route, e.g. "/photo". */
  domainHref: string;
  categoryName?: string;
  categoryHref?: string;
  relatedLive?: RelatedToolItem[];
  relatedSoon?: RelatedToolItem[];
}

export function ComingSoonToolPage({
  toolName,
  toolDescription,
  icon: Icon,
  siteName,
  domainLabel,
  domainHref,
  categoryName,
  categoryHref,
  relatedLive = [],
  relatedSoon = [],
}: ComingSoonToolPageProps) {
  const visibleLive = relatedLive.slice(0, 4);
  const visibleSoon = relatedSoon.slice(0, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="racira-page-container pt-8 pb-0">
          <nav aria-label="breadcrumb" className="flex items-center flex-wrap text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <Link href={domainHref} className="hover:text-foreground transition-colors">{domainLabel}</Link>
            {categoryName && categoryHref && (
              <>
                <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                <Link href={categoryHref} className="hover:text-foreground transition-colors">{categoryName}</Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground font-medium">{toolName}</span>
          </nav>
        </div>

        <section className="pt-8 pb-8 sm:pt-12 sm:pb-10">
          <div className="racira-page-container text-center max-w-2xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Coming Soon
            </div>
            {Icon && (
              <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <Icon className="h-8 w-8" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight text-foreground">
              {toolName}
            </h1>
            <p className="text-base text-muted-foreground mb-8">{toolDescription}</p>

            <div className="rounded-xl border border-border bg-card p-8 mb-8">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">This tool is under development</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We&apos;re working hard to bring you {toolName.toLowerCase()}. Check back soon — it&apos;s one of our
                next releases from {siteName}.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <Link
                  href={domainHref}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Browse all {domainLabel} tools
                </Link>
                {categoryName && categoryHref && (
                  <Link href={categoryHref} className="text-sm font-medium text-primary hover:underline">
                    More {categoryName} tools
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {visibleLive.length > 0 && (
          <section className="pb-12">
            <div className="racira-page-container">
              <h2 className="text-2xl font-bold mb-6">Similar {domainLabel} tools you can use now</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleLive.map((item) => (
                  <Link key={item.href} href={item.href} className="tool-card group hover:-translate-y-[3px]">
                    <h3 className="font-semibold text-foreground leading-snug">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{domainLabel}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {visibleSoon.length > 0 && (
          <section className="pb-16">
            <div className="racira-page-container">
              <h2 className="text-2xl font-bold mb-6">
                {categoryName ? `More ${categoryName} tools in the works` : `More ${domainLabel} tools in the works`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleSoon.map((item) => (
                  <Link key={item.href} href={item.href} className="tool-card group hover:-translate-y-[3px] relative">
                    <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Soon
                    </span>
                    <h3 className="font-semibold text-foreground leading-snug">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{categoryName ?? domainLabel}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
