"use client";
import { CategorySearch } from "@/components/CategorySearch";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { Search, ArrowRight, Aperture, Sparkles } from "lucide-react";
import { CATEGORIES, ALL_TOOLS, SEARCH_REGISTRY, type Tool } from "@/domains/photo/registry";


export default function Home() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    return ALL_TOOLS.filter(
      (t) => (t as any).name.toLowerCase().includes(term) || (t as any).description.toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Photo" />
      <main>
                <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="racira-page-container text-center">
            <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
              122 Free Photo Tools —{" "}
              <span className="hero-gradient-text">Filters, Retouch & Adjust</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Apply filters, adjust lighting, and retouch your photos right in the browser. No signup required.
            </p>
            <CategorySearch categorySlug="photo" placeholder="Search 122 photo tools..." registry={SEARCH_REGISTRY} />
          </div>
        </section>

        <div className="racira-page-container py-14">
          {filtered ? (
            <SearchResults results={filtered} />
          ) : (
            CATEGORIES.map((c) => (
              <section key={c.slug} className="mb-14">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {c.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground/80">{c.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.tools.length} tools</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {c.tools.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
      <footer className="border-t py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Racira Photography. Built for photographers.
      </footer>
    </div>
  );
}

function SearchResults({ results }: { results: typeof ALL_TOOLS }) {
  if (results.length === 0) {
    return <p className="py-20 text-center text-sm text-muted-foreground">No tools match your search.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {results.map((t) => (
        <ToolCard key={t.slug} tool={t} />
      ))}
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon as React.ComponentType<{ className?: string }>;
  const isLive = tool.status === "live";

  return (
    <Link
      href={`/photo/tool/${tool.slug}`}
      className="tool-card group relative"
    >
      {!isLive && (
        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      )}
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
    </Link>
  );
}
