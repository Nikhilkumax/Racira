"use client";

import { CategorySearch } from "@/components/CategorySearch";
import { CATEGORIES, SEARCH_REGISTRY } from "@/domains/3d/registry";
import { SiteShell } from "@/domains/3d/components/SiteShell";
import { CategorySection } from "@/components/shared/CategorySection";

export default function Index() {
  return (
    <SiteShell>
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            120+ Free 3D Tools —{" "}
            <span className="hero-gradient-text">Viewers, Converters & Models</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Browser-based 3D model viewers, format converters, and spatial utilities. No signup required.
          </p>
          <CategorySearch categorySlug="3d" placeholder="Search 120+ 3D tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

      <div className="racira-page-container space-y-14 pb-16">
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.key}
            section={cat}
            basePath="/3d/tool"
          />
        ))}
      </div>
    </SiteShell>
  );
}
