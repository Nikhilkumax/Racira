"use client";

import { useMemo, useState } from "react";
import { Search, AudioLines, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/audio/SiteHeader";
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
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {totalToolCount}+ audio tools in one place
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              All Audio Tools You Need
              <span className="block bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                Fast, Simple &amp; Free
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Convert, trim, record, clean, analyze and generate audio — all directly in your browser.
              No signups, no uploads, completely private.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 230+ audio tools…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Search audio tools"
              />
            </div>

            <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> 100% private &amp; browser-based
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" /> No installs required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AudioLines className="h-4 w-4 text-primary" /> {audioCategories.length} categories
              </span>
            </div>
          </div>
        </section>

        {/* Category chips */}
        <section id="categories" className="border-b border-border/70 bg-background/95">
          <div className="mx-auto max-w-6xl px-4 py-4">
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
        <section className="mx-auto max-w-6xl px-4 py-10">
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
