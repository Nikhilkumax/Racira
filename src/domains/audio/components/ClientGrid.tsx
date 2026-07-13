"use client";

import React, { useState } from "react";
import { CategorySection } from "@/components/shared/CategorySection";
import { categories } from "@/domains/audio/registry";

export default function AudioClientGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCategories = categories.filter((cat) => {
    if (activeCategory === "all") return true;
    // For audio, we didn't extract IDs to map activeCategory easily like engineering,
    // so we'll just check if cat.name matches activeCategory roughly, or just disable the chip filtering for now.
    // The previous implementation used the categorySlug from the tools, but we flattened it to category.name.
    // For now, let's keep it simple: if activeCategory is 'all', show all.
    const normalizedName = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return normalizedName === activeCategory;
  });

  return (
    <>
      <div className="racira-page-container mt-10 mb-12 flex flex-wrap items-center justify-center gap-2">
        <CategoryChip label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
        {categories.map((cat) => {
          const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          return (
            <CategoryChip
              key={slug}
              label={cat.name}
              active={activeCategory === slug}
              onClick={() => setActiveCategory(slug)}
            />
          );
        })}
      </div>

      <div className="racira-page-container space-y-16 pb-24">
        {filteredCategories.map((cat) => (
          <div key={cat.name}>
            <CategorySection 
              section={{ title: cat.name, tools: cat.tools }} 
              basePath="/audio/tool" 
            />
          </div>
        ))}
      </div>
    </>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs font-medium transition " +
        (active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}
