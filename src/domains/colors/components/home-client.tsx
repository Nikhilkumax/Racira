"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { CategorySection } from "@/components/shared/CategorySection";
import { TOOLS } from "@/domains/colors/registry";
import { onlyLive } from "@/lib/tools/liveToolFilters";
import { CATEGORY_META } from "@/domains/colors/registry/types";
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
  const liveColorCount = onlyLive(TOOLS, "colors").length;

  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              226 Free Color Tools —{" "}
              <span className="hero-gradient-text">Palettes, Gradients & Converts</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Extract palettes, generate gradients, and convert color spaces for your creative projects. No signup required.
            </p>
            <CategorySearch 
              categorySlug="colors" 
              placeholder={liveColorCount > 0 ? `Search ${liveColorCount} color tools...` : "Search color tools..."} 
              registry={TOOLS.map(t => ({ 
                name: t.name, 
                description: t.description, 
                slug: t.slug, 
                href: `/colors/${t.slug}`, 
                category: CATEGORY_META[t.category].label, 
                isBuilt: t.status === "live" 
              }))} 
            />
          </div>
        </section>

        <div className="racira-page-container space-y-14 pb-16">
          {grouped.map(({ cat, tools }) => {
            const meta = CATEGORY_META[cat];
            return (
              <CategorySection
                key={cat}
                section={{
                  title: meta.label,
                  tools: tools
                }}
                basePath="/colors"
                domain="colors"
              />
            );
          })}
        </div>
      </main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira Colors — Free browser tools for color workflows.
        </div>
      </footer>
    </div>
  );
}
