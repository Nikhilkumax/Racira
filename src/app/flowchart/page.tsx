"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, ACTIVE_SLUG, ALL_TOOLS } from "@/lib/flowchart/tools-data";
import { Workflow } from "lucide-react";

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
        <section className="text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            All Diagram Tools You Need —{" "}
            <span className="bg-gradient-to-r from-[oklch(0.72_0.13_185)] to-[oklch(0.6_0.15_220)] bg-clip-text text-transparent">
              Visual, Simple &amp; Free
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground md:text-lg">
            Flowcharts, mind maps, UML, ER, architecture and more. {ALL_TOOLS.length} free
            diagramming tools in your browser. No signup required.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 190 tools…"
              className="w-full rounded-full border bg-card px-5 py-3 text-sm shadow-sm outline-none ring-brand/30 transition focus:ring-4"
            />
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
