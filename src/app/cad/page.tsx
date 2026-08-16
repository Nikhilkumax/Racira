"use client";

import { CategorySearch } from "@/components/CategorySearch";
import Header from "@/components/Header";
import Link from "next/link";
import { categories, SEARCH_REGISTRY, Category } from "@/domains/cad/registry";
import { onlyLive } from "@/lib/tools/liveToolFilters";

const LIVE_CAD_COUNT = onlyLive(categories.flatMap((c) => c.tools), "cad").length;
import { CategorySection } from "@/components/shared/CategorySection";

// Removed inline icons

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
            <span className="hero-gradient-text">Viewers, DXF & Measure</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Essential utilities for viewing, measuring, and converting CAD and DXF files. No signup required.
          </p>
          <CategorySearch categorySlug="cad" placeholder={LIVE_CAD_COUNT > 0 ? `Search ${LIVE_CAD_COUNT} CAD tools...` : "Search CAD tools..."} registry={SEARCH_REGISTRY} />
        </div>
      </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Racira CAD. Built for engineers and designers.</p>
        <p>No signup · Runs in your browser</p>
      </div>
    </footer>
  );
}
