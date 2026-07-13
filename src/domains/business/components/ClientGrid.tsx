"use client";

import React, { useState } from "react";
import { CategorySection } from "@/components/shared/CategorySection";
import { categories } from "@/domains/business/registry";
import { inferIcon } from "@/components/shared/icon-map";

export default function BusinessClientGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const filteredCategories = categories.filter((cat) => {
    if (activeCategory !== "all") {
      if (cat.key !== activeCategory) return false;
    }
    return true;
  });

  return (
    <>
      <div className="racira-page-container mb-12 flex flex-wrap items-center justify-center gap-2">
        <CategoryChip label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
        {categories.map((cat) => (
          <CategoryChip
            key={cat.key}
            label={cat.label}
            active={activeCategory === cat.key}
            onClick={() => setActiveCategory(cat.key)}
          />
        ))}
      </div>

      <div className="racira-page-container space-y-16 pb-24">
        {filteredCategories.map((cat) => (
          <div key={cat.label}>
            <CategorySection 
              section={{ 
                title: cat.label, 
                tools: cat.tools.map(t => ({ 
                  ...t, 
                  icon: inferIcon(t.name, t.slug),
                  status: t.status === 'soon' ? 'coming_soon' : t.status 
                })) as any 
              }} 
              basePath="/business" 
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
