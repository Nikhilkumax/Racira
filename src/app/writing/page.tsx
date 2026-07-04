"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, PenLine, Sparkles, ArrowRight } from "lucide-react";
import { categories, totalToolCount } from "@/domains/writing/registry";

export default function Index() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => ({
        ...c,
        tools: c.tools.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.tools.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PenLine className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight">
              <span className="text-primary">Racira</span>{" "}
              <span className="text-foreground">Writing</span>
            </span>
          </Link>
          <Link
            href="/tools/distraction-free-writing-editor"
            className="hidden items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:inline-flex"
          >
            Open editor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="px-5 pt-20 pb-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-primary-soft px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> {totalToolCount} writing tools, all in one place
          </div>
          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            All Writing Tools You Need —{" "}
            <span className="text-primary">Fast, Simple & Free</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Draft, edit, summarize, cite and create. {totalToolCount} free writing
            tools in your browser. No signup required.
          </p>

          <div className="mx-auto mt-10 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 138 writing tools…"
                className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="racira-page-container pb-24">
        {filtered.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            No tools match "{query}".
          </p>
        )}

        <div className="space-y-14">
          {filtered.map((cat) => (
            <section key={cat.name}>
              <div className="mb-5 flex items-end justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {cat.name}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {cat.tools.length} tools
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="tool-card group"
                  >
                    {!t.available && (
                      <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Soon
                      </span>
                    )}
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <PenLine className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {t.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {t.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/70 py-8 text-center text-sm text-muted-foreground">
        Built with care. {totalToolCount} writing tools, one home.
      </footer>
    </div>
  );
}
