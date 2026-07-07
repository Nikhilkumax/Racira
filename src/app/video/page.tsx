import { Search } from "lucide-react";
﻿import { CATEGORY_ORDER, TOOLS, TOOLS_BY_CATEGORY } from "@/data/video/tools";
import { ToolCard } from "@/components/video/ToolCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Video — All-in-One Free Online Video Tools",
  description: "Convert, trim, compress, extract and edit videos with 150+ free online video tools. Runs in your browser — no signup, no upload.",
  openGraph: {
    title: "Racira Video — All-in-One Free Online Video Tools",
    description: "150+ free in-browser video tools: convert, trim, compress, extract frames and more. No signup required.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const total = TOOLS.length;
  return (
    <div className="racira-page-container">
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            4+ Free Video Tools —{" "}
            <span className="hero-gradient-text">Trim, Crop & Convert</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Basic video utilities to trim, crop, and convert formats without heavy software. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 4+ video tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Video Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-14 pb-16">
        {CATEGORY_ORDER.map((cat) => (
          <section key={cat}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {cat}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {TOOLS_BY_CATEGORY[cat].map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
