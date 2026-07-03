"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Search } from "lucide-react";

import { ToolCard } from "@/components/engineering/tool-card";
import { categories, tools, toolsByCategory } from "@/lib/engineering/tools";

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
        <section className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {tools.length} engineering tools · {liveCount} live
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            All Engineering Tools You Need —{" "}
            <span className="text-primary">Fast, Simple & Free</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Calculate, convert, and reference across 12 disciplines. 128 free engineering tools right in your browser. No signup required.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search 128 tools…"
              className="w-full bg-transparent py-1.5 text-sm focus:outline-none"
            />
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
