"use client";

import React, { useState } from "react";
import { CategorySection } from "@/components/shared/CategorySection";
import { categories } from "@/domains/audio/registry";

export default function AudioClientGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const filteredCategories = categories.filter((cat) => {
    if (activeCategory !== "all") {
      const normalizedName = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (normalizedName !== activeCategory) return false;
    }
    return true;
  });

  return (
    <>
      <div className="racira-page-container mb-12 flex flex-wrap items-center justify-center gap-2">
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
              basePath="/audio" 
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
