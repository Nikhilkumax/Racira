"use client";
import { Search } from "lucide-react";

import { SiteFooter } from "@/domains/colors/components/site-footer";
import { CategorySection } from "@/domains/colors/components/category-section";
import { TOOLS } from "@/domains/colors/registry";
import type { ToolCategory } from "@/domains/colors/registry/types";

export function HomeClient() {
  const order: ToolCategory[] = [
    "pickers", "palettes", "accessibility", "analysis", "manipulation",
    "gradients", "effects", "css", "designsys", "data", "fun", "theory",
  ];
  const grouped = order.map((cat) => ({
    cat,
    tools: TOOLS.filter((t) => t.category === cat),
  }));

  return (
    <>
      <main className="racira-page-container pb-10 sm:px-6 lg:px-8">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            450+ Free Color Tools —{" "}
            <span className="hero-gradient-text">Palettes, Gradients & Converts</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Extract palettes, generate gradients, and convert color spaces for your creative projects. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 450+ color tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Color Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>
        {grouped.map(({ cat, tools }) => (
          <CategorySection key={cat} category={cat} tools={tools} />
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
