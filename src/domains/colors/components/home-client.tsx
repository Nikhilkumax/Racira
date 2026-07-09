"use client";
import { CategorySearch } from "@/components/CategorySearch";
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
    tools: TOOLS.filter((t) => (t as any).category === cat),
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
          <CategorySearch categorySlug="colors" placeholder="Search 450+ color tools..." registry={(TOOLS || []).map(t => ({ name: (t as any).name, description: (t as any).description || '', slug: (t as any).slug, href: (t as any).slug.startsWith('/') ? (t as any).slug : `/colors/tools/${(t as any).slug}`, category: (t as any).category, icon: (t as any).icon, isBuilt: (t as any).built !== false }))} />
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
