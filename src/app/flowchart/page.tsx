"use client";

import { CategorySearch } from "@/components/CategorySearch";
import Header from "@/components/Header";
import { useMemo, useState } from "react";
import { CATEGORIES, ALL_TOOLS, SEARCH_REGISTRY } from "@/domains/flowchart/registry";
import { CategorySection } from "@/components/shared/CategorySection";

export default function FlowchartHomePage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((c) => ({
      ...c,
      tools: c.tools.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      ),
    })).filter((c) => c.tools.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Diagrams" />
      <main className="pb-24 pt-16">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            110+ Free Diagram Tools —{" "}
            <span className="hero-gradient-text">Flowcharts, Trees & Nodes</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Build flowcharts, mind maps, and node diagrams with our intuitive visual tools. No signup required.
          </p>
          <CategorySearch categorySlug="flowchart" placeholder="Search 110+ diagram tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 mb-6">
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

        <div className="mt-12 space-y-14">
          {filtered.map((cat) => (
            <CategorySection key={cat.title} section={cat} basePath="/flowchart/tool" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}



function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="racira-page-container py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Racira Diagrams &amp; Flowcharts · {ALL_TOOLS.length} free tools
      </div>
    </footer>
  );
}
