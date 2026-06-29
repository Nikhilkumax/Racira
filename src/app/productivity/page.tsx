"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { CATEGORIES, TOTAL_TOOLS } from "@/data/productivity/tools";
import { CategorySection } from "@/components/productivity/CategorySection";
import { SiteHeader } from "@/components/productivity/SiteHeader";
import { SiteFooter } from "@/components/productivity/SiteFooter";

export default function Index() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CATEGORIES;
    return CATEGORIES
      .map((c) => ({ ...c, tools: c.tools.filter((t) => t.name.toLowerCase().includes(needle)) }))
      .filter((c) => c.tools.length > 0);
  }, [q]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 50%), radial-gradient(circle at 80% 10%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 45%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {TOTAL_TOOLS} productivity tools · 1 live · {TOTAL_TOOLS - 1} coming soon
          </div>
          <h1 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tighter max-w-3xl">
            Tools that{" "}
            <span className="relative inline-block">
              <span className="relative z-10">protect</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 h-3 -z-0 bg-primary/60"
              />
            </span>{" "}
            your attention.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            Racira is a growing library of {TOTAL_TOOLS} free, no-login productivity tools — built for
            people who care about deep work, calm planning, and shipping the right things.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/tools/deep-work-session-planner"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
            >
              Open Deep Work Planner
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Browse all tools
            </a>
          </div>
        </div>
      </section>

      {/* Search + list */}
      <section id="tools" className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 space-y-14">
        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/85 backdrop-blur border-b border-border/60">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
               type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 69 tools…"
              className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {filtered.map((cat, i) => (
          <CategorySection key={cat.name} category={cat} index={i} />
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No tools match "{q}". Try a different search.
          </p>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
