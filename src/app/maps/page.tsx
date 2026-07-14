"use client";

import Header from "@/components/Header";
import { Search } from "lucide-react";

import { sections, totalTools, SEARCH_REGISTRY, type Tool } from "@/domains/maps/registry";
import { ToolCard } from "@/components/shared/ToolCard";
import { CategorySearch } from "@/components/CategorySearch";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header mode="category" categoryName="Maps & GIS" />

            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            160+ Free Map Tools —{" "}
            <span className="hero-gradient-text">Routes, Distance & Geo</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore geographical tools for route planning, distance measuring, and map coordinates. No signup required.
          </p>
          <CategorySearch categorySlug="maps" placeholder="Search 160+ map tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

      <main id="tools" className="racira-page-container pb-24">
        {sections.map((section) => (
          <section key={section.title} className="mb-14">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {section.title}{" "}
              <span className="ml-1 text-muted-foreground/60">({section.tools.length})</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.tools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} basePath="/maps/tool" />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer id="about" className="border-t border-border bg-card/40">
        <div className="racira-page-container py-10 text-sm text-muted-foreground">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="font-semibold text-foreground">Racira Maps & GIS</div>
              <p className="mt-1">Free browser-based Maps & GIS toolkit. No signup, no tracking.</p>
            </div>
            <div className="text-xs">© {new Date().getFullYear()} Racira. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
