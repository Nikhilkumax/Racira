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
      <main className="racira-page-container pb-24 pt-16">
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

        <div className="mt-16 space-y-14">
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
