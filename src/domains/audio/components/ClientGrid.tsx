"use client";

import React, { useState } from "react";
import { CategorySection } from "@/components/shared/CategorySection";
import { categories } from "@/domains/audio/registry";

export default function AudioClientGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = categories.filter((cat) => {
    if (activeCategory !== "all") {
      const normalizedName = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (normalizedName !== activeCategory) return false;
    }
    return true;
  }).map(cat => ({
    ...cat,
    tools: cat.tools.filter(tool => 
      normalizedQuery === "" || 
      tool.name.toLowerCase().includes(normalizedQuery) ||
      tool.description.toLowerCase().includes(normalizedQuery)
    )
  })).filter(cat => cat.tools.length > 0);

  return (
    <>
      <div className="racira-page-container mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter grid..."
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="Filter tools grid"
        />
      </div>

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
