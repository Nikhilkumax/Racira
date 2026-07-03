"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { Search, ArrowRight, Aperture, Sparkles } from "lucide-react";
import { CATEGORIES, ALL_TOOLS } from "@/lib/photo/tools";


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
      <Header mode="category" categoryName="Photo" />
      <main>
        <section className="border-b">
          <div className="racira-page-container py-20 text-center">
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
      className="tool-card group"
    >
      {!built && (
        <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      )}
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Aperture className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground leading-snug">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
    </Link>
  );
}
