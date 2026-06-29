"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Aperture, Sparkles } from "lucide-react";
import { CATEGORIES, ALL_TOOLS } from "@/lib/photo/tools";
import { SiteHeader } from "@/components/photo/SiteHeader";

export default function Home() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    return ALL_TOOLS.filter(
      (t) => t.name.toLowerCase().includes(term) || t.description.toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> 112 free photography tools
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
              Every photo tool you need —{" "}
              <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                fast, simple &amp; free
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Process RAW, grade color, plan landscapes, analyze EXIF and prepare prints.
              112 in-browser tools, no signup required.
            </p>
            <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border bg-card px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search 112 tools..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-14">
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
                    <ToolCard key={t.slug} slug={t.slug} name={t.name} description={t.description} built={t.built} />
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
        <ToolCard key={t.slug} slug={t.slug} name={t.name} description={t.description} built={t.built} />
      ))}
    </div>
  );
}

function ToolCard({ slug, name, description, built }: { slug: string; name: string; description: string; built?: boolean }) {
  return (
    <Link
      href={`/tool/${slug}`}
      className="group relative flex h-full flex-col rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-soft text-primary">
        <Aperture className="h-4 w-4" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{name}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        {built ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Ready
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Coming soon
          </span>
        )}
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}
