"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { categories, SEARCH_REGISTRY } from "@/domains/animator/registry";
import { onlyLive } from "@/lib/tools/liveToolFilters";
import { ANIMATOR_SITE } from "@/domains/animator/site";

const LIVE_ANIMATOR_COUNT = onlyLive(categories.flatMap((c) => c.tools), "animator").length;
import { CategorySection } from "@/components/shared/CategorySection";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              Free Animation Tools —{" "}
              <span className="hero-gradient-text">CSS, SVG & Keyframes</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Generate CSS animations, SVG paths, and keyframe sequences for your web projects. No signup required.
            </p>
            <CategorySearch categorySlug="animator" placeholder={LIVE_ANIMATOR_COUNT > 0 ? `Search ${LIVE_ANIMATOR_COUNT} animation tools...` : "Search animation tools..."} registry={SEARCH_REGISTRY} />
          </div>
        </section>

        <div className="racira-page-container space-y-14 pb-16">
          {categories.map((cat) => (
            <CategorySection
              key={cat.name}
              section={{
                title: cat.name,
                tools: cat.tools
              }}
              basePath="/animator"
              domain="animator"
            />
          ))}
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {ANIMATOR_SITE.copyrightName} — Free browser tools for animation workflows.
        </div>
      </footer>
    </div>
  );
}
