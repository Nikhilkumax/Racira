"use client";
import { CategorySearch } from "@/components/CategorySearch";

import Link from "next/link";
import Header from "@/components/Header";
import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { CATEGORIES, TOTAL_TOOLS } from "@/data/productivity/tools";
import { CategorySection } from "@/components/productivity/CategorySection";

import { SiteFooter } from "@/components/productivity/SiteFooter";

export default function Index() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CATEGORIES;
    return CATEGORIES
      .map((c) => ({ ...c, tools: c.tools.filter((t) => (t as any).name.toLowerCase().includes(needle)) }))
      .filter((c) => c.tools.length > 0);
  }, [q]);

  return (
    <div className="min-h-screen">
      <Header mode="category" categoryName="Productivity" />

      {/* Hero */}
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            74+ Free Productivity Tools —{" "}
            <span className="hero-gradient-text">Timers, Planners & Trackers</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Boost your workflow with Pomodoro timers, planners, and task tracking utilities. No signup required.
          </p>
          <CategorySearch categorySlug="productivity" placeholder="Search 74+ productivity tools..." registry={(Array.isArray(CATEGORIES) ? CATEGORIES.flatMap((cat: any) => (cat.tools || []).map((t: any) => ({ name: (t as any).name, description: (t as any).description || '', slug: (t as any).slug, href: ((t as any).slug || '').startsWith('/') ? (t as any).slug : `/productivity/tools/${(t as any).slug}`, category: (cat as any).name || (cat as any).title || (cat as any).label || '', isBuilt: (t as any).built !== false }))) : [])} />
        </div>
      </section>

      {/* Search + list */}
      <section id="tools" className="racira-page-container pb-16 space-y-14">
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
