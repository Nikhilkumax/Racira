"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Search, AudioLines, Zap, ShieldCheck, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/audio/SiteFooter";
import { ToolCard } from "@/components/audio/ToolCard";
import { audioCategories, totalToolCount } from "@/data/audio/audioTools";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    return audioCategories
      .filter((cat) => activeCategory === "all" || cat.slug === activeCategory)
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter(
          (tool) =>
            normalizedQuery === "" ||
            tool.name.toLowerCase().includes(normalizedQuery) ||
            tool.description.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [normalizedQuery, activeCategory]);

  const resultCount = filteredCategories.reduce((sum, cat) => sum + cat.tools.length, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header mode="category" categoryName="Audio" />

      <main className="flex-1">
        {/* Hero */}
                <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              270+ Free Audio Tools —{" "}
              <span className="hero-gradient-text">Trim, Merge & Convert</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Edit, merge, trim, and convert audio files with professional-grade sound utilities. No signup required.
            </p>
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search 270+ audio tools..."
                  className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                  aria-label="Search Audio Tools"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </section>

        {/* Category chips */}
        <section id="categories" className="border-b border-border/70 bg-background/95">
          <div className="racira-page-container py-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <CategoryChip
                label="All tools"
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {audioCategories.map((cat) => (
                <CategoryChip
                  key={cat.slug}
                  label={cat.name}
                  active={activeCategory === cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Tool sections */}
        <section className="racira-page-container py-10">
          {normalizedQuery !== "" && (
            <p className="mb-6 text-sm text-muted-foreground">
              {resultCount} result{resultCount === 1 ? "" : "s"} for “{query}”
            </p>
          )}

          {filteredCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">No tools match your search.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((cat) => (
                <div key={cat.slug}>
                  <div className="mb-4 flex items-baseline justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{cat.name}</h2>
                    <span className="text-xs text-muted-foreground">{cat.tools.length} tools</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {cat.tools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
