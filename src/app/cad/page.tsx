"use client";

import { CategorySearch } from "@/components/CategorySearch";
import Header from "@/components/Header";
import Link from "next/link";
import { categories, SEARCH_REGISTRY, allTools, CAD_SITE } from "@/domains/cad/registry";
import { onlyLive } from "@/lib/tools/liveToolFilters";
import { copyrightLine } from "@/lib/site-identity";
import { CategorySection } from "@/components/shared/CategorySection";

// The number the search box may honestly claim: live-gated (Soon tools excluded).
const LIVE_CAD_COUNT = onlyLive(allTools, "cad").length;

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="CAD" />
      <main>
        <Hero />
        <section className="racira-page-container pb-24 space-y-16">
          {categories.map((c) => (
            <CategorySection
              key={c.key}
              section={{ title: c.title, tools: c.tools as any }}
              basePath="/cad"
              domain="cad"
            />
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
          <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            Free CAD Tools —{" "}
            <span className="hero-gradient-text">Sketch, Draft & Measure</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Draft on a precision grid with snapping and live measurements, right in your browser. No signup required.
          </p>
          <CategorySearch
            categorySlug="cad"
            // LIVE-gated count (onlyLive), NOT the catalog total: the search
            // box must only ever claim what is actually searchable right now —
            // CategorySearch's isSearchable() hides "soon" entries, so a
            // catalog-count placeholder (119) would overpromise vs the 67
            // tools a user can really open. Marketing copy that describes the
            // catalog (meta description "119+", category badges) derives from
            // totalCount instead — the two numbers answer different questions
            // and are each locked to their own source by e2e tests.
            placeholder={
              LIVE_CAD_COUNT > 0
                ? `Search ${LIVE_CAD_COUNT} CAD tool${LIVE_CAD_COUNT === 1 ? "" : "s"}...`
                : "Search CAD tools..."
            }
            registry={SEARCH_REGISTRY}
          />
        </div>
      </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
        <p>{copyrightLine(CAD_SITE)}</p>
        <p>No signup · Runs in your browser</p>
      </div>
    </footer>
  );
}
