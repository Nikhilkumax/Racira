"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, PenLine } from "lucide-react";
import { categories, totalToolCount } from "@/domains/writing/registry";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { WRITING_TOOL_COMPONENTS } from "@/domains/writing/components/tools/registry";

/**
 * A `live` flag is only truthful when the slug has a wired component, so the
 * index asks both questions. The writing reconcile gate enforces the pairing;
 * this keeps a card honest even if the flag is set before the component lands.
 */
const isWiredLiveTool = (tool: (typeof categories)[number]["tools"][number]) =>
  isLiveTool(tool, "writing") && Boolean(WRITING_TOOL_COMPONENTS[tool.slug]);

const LIVE_WRITING_COUNT = categories.flatMap((c) => c.tools).filter(isWiredLiveTool).length;

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
      <Header mode="category" categoryName="Writing" />

      <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            Free Writing Tools —{" "}
            <span className="hero-gradient-text">Grammar, Count & Format</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Enhance your writing with grammar checks, word counts, formatters, and text utilities. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder={LIVE_WRITING_COUNT > 0 ? `Search ${LIVE_WRITING_COUNT} writing tools...` : "Search writing tools..."}
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Writing Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
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
                {cat.tools.map((t) => {
                  // A live card requires both a live flag and a wired component,
                  // so it always links to a page that renders the real tool.
                  const isLive = isWiredLiveTool(t);
                  const cardBody = (
                    <>
                      {!isLive && (
                        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                          Soon
                        </span>
                      )}
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {t.icon ? <t.icon className="h-5 w-5" /> : <PenLine className="h-5 w-5" />}
                      </div>
                      <h3 className="font-semibold text-foreground leading-snug">
                        {t.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {t.description}
                      </p>
                    </>
                  );
                  return isLive ? (
                    <Link
                      key={t.slug}
                      href={`/writing/${t.slug}`}
                      className="tool-card group"
                    >
                      {cardBody}
                    </Link>
                  ) : (
                    <div
                      key={t.slug}
                      className="tool-card group relative cursor-default"
                    >
                      {cardBody}
                    </div>
                  );
                })}
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
