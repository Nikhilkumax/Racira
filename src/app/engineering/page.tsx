"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Search } from "lucide-react";

import { ToolCard } from "@/domains/engineering/components/tool-card";
import { categories, tools, toolsByCategory } from "@/domains/engineering/registry";

export default function Index() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return toolsByCategory
      .filter((group) => activeCat === "all" || group.category.id === activeCat)
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (tool) => !q || tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, activeCat]);

  const liveCount = tools.filter((t) => t.built).length;

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
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search 130+ engineering tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Engineering Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
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
