"use client";

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
        <div className="py-16 text-center sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            All Color Tools You Need —{" "}
            <span className="bg-gradient-to-r from-primary to-[oklch(0.7_0.2_290)] bg-clip-text text-transparent">
              Fast, Simple &amp; Free
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Convert, pick, mix, extract and check colors. {TOOLS.length}+ free color tools in your browser. No signup required.
          </p>
        </div>
        {grouped.map(({ cat, tools }) => (
          <CategorySection key={cat} category={cat} tools={tools} />
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
