"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, ACTIVE_SLUG, ALL_TOOLS } from "@/domains/flowchart/registry";
import { Search,  Workflow  } from "lucide-react";

export default function FlowchartHomePage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((c) => ({
      ...c,
      tools: c.tools.filter(
        (t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q),
      ),
    })).filter((c) => c.tools.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 110+ diagram tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Diagram Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
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
                  const active = t.slug === ACTIVE_SLUG;
                  return (
                    <Link
                      key={t.slug}
                      href={`/flowchart/tool/${t.slug}`}
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
                      <h3 className="font-semibold text-foreground leading-snug">{t.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.desc}</p>
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

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/flowchart" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-primary-foreground">
            <Workflow className="h-4 w-4" />
          </span>
          <span>
            <span className="text-brand">Racira</span> Diagrams
          </span>
        </Link>
        <nav className="text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">190 Tools</a>
        </nav>
      </div>
    </header>
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
