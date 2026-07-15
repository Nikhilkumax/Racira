"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categories, allTools } from "@/domains/education/registry";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!query) return categories;
    return categories
      .map((c) => ({
        ...c,
        tools: c.tools.filter(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            t.desc.toLowerCase().includes(query),
        ),
      }))
      .filter((c) => c.tools.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Education" />

            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            142 Free Education Tools —{" "}
            <span className="hero-gradient-text">GPA, Grades & Study</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Academic calculators for GPA, grading, flashcards, and student study planning. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 142 education tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Education Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      <main id="tools" className="racira-page-container pb-24 space-y-12">
        {filteredCategories.length === 0 && (
          <p className="text-center text-muted-foreground">No tools match "{q}".</p>
        )}
        {filteredCategories.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cat.tools.map((t) => {
                const Icon = t.icon;
                return (
                  <Link
                    key={t.slug}
                    href={`/education/tool/${t.slug}`}
                    className="tool-card group"
                  >
                    {t.status !== "live" && (
                      <span className="absolute top-3 right-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Soon
                      </span>
                    )}
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {t.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {t.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Racira Education · {allTools.length} tools for learners and teachers
      </footer>
    </div>
  );
}
