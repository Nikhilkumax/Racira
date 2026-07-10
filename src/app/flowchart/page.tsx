"use client";

import { CategorySearch } from "@/components/CategorySearch";
import Header from "@/components/Header";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, ACTIVE_SLUG, ALL_TOOLS, SEARCH_REGISTRY } from "@/domains/flowchart/registry";
import { Search,  Workflow  } from "lucide-react";

export default function FlowchartHomePage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((c) => ({
      ...c,
      tools: c.tools.filter(
        (t) => (t as any).name.toLowerCase().includes(q) || (t as any).desc.toLowerCase().includes(q),
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
            <section key={cat.name}>
              <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {cat.name}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((t) => {
                  const active = (t as any).slug === ACTIVE_SLUG;
                  return (
                    <Link
                      key={(t as any).slug}
                      href={`/flowchart/tool/${(t as any).slug}`}
                      className="tool-card group"
                    >
                      {!active && (
                        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      )}
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Workflow className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground leading-snug">{(t as any).name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{(t as any).desc}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
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
