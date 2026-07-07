import { Search } from "lucide-react";
﻿import { SiteFooter } from "@/domains/music/components/site-chrome";
import Header from "@/components/Header";
import { ToolCard } from "@/domains/music/components/tool-card";
import { categories, totalTools } from "@/domains/music/registry";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header mode="category" categoryName="Music" />
      <main className="flex-1">
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            30+ Free Music Tools —{" "}
            <span className="hero-gradient-text">BPM, Scales & Tuners</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Essential tools for musicians including BPM counters, scale references, and online tuners. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 30+ music tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Music Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

        <div className="mx-auto max-w-6xl space-y-14 px-4 pb-24 sm:px-6">
          {categories.map((cat) => (
            <section key={cat.name} aria-labelledby={`cat-${cat.name}`}>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2
                    id={`cat-${cat.name}`}
                    className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground/80">{cat.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{cat.tools.length} tools</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
