import { CategorySearch } from "@/components/CategorySearch";
import Link from "next/link";
import Header from "@/components/Header";
import { categories, SEARCH_REGISTRY } from "@/domains/typography/registry";
import { onlyLive, isLiveTool } from "@/lib/tools/liveToolFilters";
import { TYPOGRAPHY_SITE } from "@/domains/typography/site";

const LIVE_TYPO_COUNT = onlyLive(categories.flatMap((c) => c.tools), "typography").length;
import { SiteFooter } from "@/components/typography/site-header";
import { ArrowRight, Sparkles, Search } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: TYPOGRAPHY_SITE.title,
  description: "Font tools: font previewer, pairing, type scales, glyphs, CSS type and more.",
  openGraph: {
    title: TYPOGRAPHY_SITE.title,
    description: "Free font tools in your browser. No signup.",
  },
};

export default function Index() {
  const total = categories.reduce((n, c) => n + c.tools.length, 0);
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName={TYPOGRAPHY_SITE.shortName} />
      <main>
                <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              Free Font Tools —{" "}
              <span className="hero-gradient-text">Preview, Pair & Scale</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Find perfect font pairings, generate modular scales, and preview type instantly. No signup required.
            </p>
            <CategorySearch categorySlug="typography" placeholder={LIVE_TYPO_COUNT > 0 ? `Search ${LIVE_TYPO_COUNT} font tool${LIVE_TYPO_COUNT === 1 ? "" : "s"}...` : "Search font tools..."} registry={SEARCH_REGISTRY} />
          </div>
        </section>

        <section id="tools" className="racira-page-container pb-16 space-y-14">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {cat.name}
                </h2>
                <span className="text-xs text-muted-foreground">{cat.tools.length} tools</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((tool) => {
                  const Icon = (tool as any).icon as React.ComponentType<{ className?: string }>;
                  // Live = registry status is "live" AND a component is wired —
                  // soon cards are inert by design and never get a page.
                  const isLive = isLiveTool(tool, "typography");
                  const cardBody = (
                    <>
                      {!isLive && (
                        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      )}
                      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
                    </>
                  );
                  return isLive ? (
                    <Link
                      key={tool.slug}
                      href={`/typography/${tool.slug}`}
                      className="tool-card group hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)] relative"
                    >
                      {cardBody}
                    </Link>
                  ) : (
                    <div
                      key={tool.slug}
                      className="tool-card group hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)] relative cursor-default"
                    >
                      {cardBody}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
