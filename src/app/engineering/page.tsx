"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { CategorySearch } from "@/components/CategorySearch";

import { ToolCard } from "@/domains/engineering/components/tool-card";
import { categories, tools, toolsByCategory, SEARCH_REGISTRY } from "@/domains/engineering/registry";

export default function Index() {
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  
  const filtered = toolsByCategory
      .filter((group) => activeCat === "all" || group.category.id === activeCat)
      .filter((group) => group.items.length > 0);

  const liveCount = tools.filter((t) => (t as any).built).length;

  return (
    <>
      <Header mode="category" categoryName="Engineering" />
      <main className="racira-page-container pb-24 pt-12 sm:px-6 sm:pt-16">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            130+ Free Engineering Tools —{" "}
            <span className="hero-gradient-text">Units, Forces & Materials</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Technical calculators for unit conversions, material properties, and engineering formulas. No signup required.
          </p>
          <CategorySearch categorySlug="engineering" placeholder="Search 138+ engineering tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <CategoryChip label="All" active={activeCat === "all"} onClick={() => setActiveCat("all")} />
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.name}
              active={activeCat === cat.id}
              onClick={() => setActiveCat(cat.id)}
            />
          ))}
        </div>

        <div className="mt-12 space-y-14">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No tools match your search.</p>
          )}
          {filtered.map((group) => (
            <section key={group.category.id}>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {group.category.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground/80">{group.category.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{group.items.length} tools</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.items.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-24 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          Racira Engineering · Built for engineers. {new Date().getFullYear()}.
        </footer>
      </main>
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
